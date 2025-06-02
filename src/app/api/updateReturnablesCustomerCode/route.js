import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { oldCompanyCode, newCompanyCode } = await req.json();

    if (!oldCompanyCode || !newCompanyCode) {
      return NextResponse.json(
        { error: "Both oldCompanyCode and newCompanyCode are required." },
        { status: 400 }
      );
    }

    const colRef = collection(db, "logged_returns");
    const q = query(colRef, where("customer_code", "==", oldCompanyCode));
    const snapshot = await getDocs(q);

    const updatedDocs = [];

    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(colRef, docSnap.id), {
        customer_code: newCompanyCode,
      });
      updatedDocs.push(docSnap.id);
    }

    return NextResponse.json(
      {
        message: "Returnables customer_code updated successfully",
        updatedCount: updatedDocs.length,
        updatedDocs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to update returnables customer_code:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
