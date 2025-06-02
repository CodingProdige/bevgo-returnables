import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const returnLogsRef = collection(db, "logged_returns");

    // Query where customer_code is an empty string
    const emptyQuery = query(returnLogsRef, where("customer_code", "==", "null"));
    const nullQuery = query(returnLogsRef, where("customer_code", "==", null));

    const [emptySnap, nullSnap] = await Promise.all([
      getDocs(emptyQuery),
      getDocs(nullQuery),
    ]);

    const allDocs = [...emptySnap.docs, ...nullSnap.docs];
    const deletedDocIds = [];

    for (const docSnap of allDocs) {
      await deleteDoc(doc(returnLogsRef, docSnap.id));
      deletedDocIds.push(docSnap.id);
    }

    return NextResponse.json(
      {
        message: "Deleted return_logs with empty or null customer_code",
        deletedCount: deletedDocIds.length,
        deletedDocIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to delete return_logs:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
