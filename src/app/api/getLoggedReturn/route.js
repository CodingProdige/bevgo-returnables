import { db } from "@/lib/firebaseConfig"; // Firestore instance
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { orderNumber } = await req.json();

    console.log(`📌 Fetching logged returns ${orderNumber ? `for Order Number: ${orderNumber}` : "for all orders"}`);

    // ✅ Reference to the logged_returns collection
    const loggedReturnsRef = collection(db, "logged_returns");

    // ✅ Define the query based on whether orderNumber is provided
    const loggedReturnsQuery = orderNumber
      ? query(loggedReturnsRef, where("orderNumber", "==", orderNumber))
      : query(loggedReturnsRef); // Fetch all if no orderNumber is provided

    const querySnapshot = await getDocs(loggedReturnsQuery);

    if (querySnapshot.empty) {
      console.log(`❌ No logged returns found ${orderNumber ? `for Order Number: ${orderNumber}` : "in the database"}`);
      return NextResponse.json(
        { error: orderNumber ? "No logged return found for this orderNumber" : "No logged returns found" },
        { status: 404 }
      );
    }

    // ✅ Extract logged return data
    const loggedReturns = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Successfully fetched ${loggedReturns.length} logged returns ${orderNumber ? `for Order Number: ${orderNumber}` : "for all orders"}`);

    return NextResponse.json({ loggedReturns }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching logged returns:", error.message);
    return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
  }
}
