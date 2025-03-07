import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const returnsRef = collection(db, "logged_returns");
    const snapshot = await getDocs(returnsRef);

    // Extract document data
    const loggedReturns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ loggedReturns }, { status: 200 });

  } catch (error) {
    console.error("Error fetching logged returns:", error);
    return NextResponse.json({ error: "Failed to fetch logged returns" }, { status: 500 });
  }
}
