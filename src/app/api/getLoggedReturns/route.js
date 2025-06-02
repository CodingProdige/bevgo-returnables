import { db } from "@/lib/firebaseConfig"; // Firestore instance
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { orderNumber, companyCode, isAdmin } = await req.json();

    const loggedReturnsRef = collection(db, "logged_returns");
    let q;

    // ✅ Admin override - return all
    if (isAdmin === true) {
      q = query(loggedReturnsRef);
      console.log("🔐 Admin access: fetching all logged returns.");
    }

    // ✅ Both orderNumber and companyCode provided
    else if (orderNumber && companyCode) {
      q = query(
        loggedReturnsRef,
        where("orderNumber", "==", orderNumber),
        where("customer_code", "==", companyCode)
      );
    }

    // ✅ Only orderNumber provided
    else if (orderNumber) {
      q = query(loggedReturnsRef, where("orderNumber", "==", orderNumber));
    }

    // ✅ Only companyCode provided
    else if (companyCode) {
      q = query(loggedReturnsRef, where("customer_code", "==", companyCode));
    }

    // ❌ No filters or admin - return empty
    else {
      console.log("⚠️ No filters or admin access — returning empty result.");
      return NextResponse.json(
        { message: "No filters provided. Returning empty result.", loggedReturn: [] },
        { status: 200 }
      );
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ message: "No logged returns found", loggedReturn: [] }, { status: 200 });
    }

    const loggedReturn = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ loggedReturn }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching logged return:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
