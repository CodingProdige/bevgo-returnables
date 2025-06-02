import { db } from "@/lib/firebaseConfig"; // Firestore instance
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

const RETURNABLES_API_URL = "https://pricing.bevgo.co.za/api/getReturnables";

export async function POST(req) {
  try {
    const { orderLogId } = await req.json();

    if (!orderLogId) {
      return NextResponse.json({ error: "Missing orderLogId" }, { status: 400 });
    }

    console.log(`📌 Fetching logged return for Order Log ID: ${orderLogId}`);

    // ✅ Fetch the logged return document
    const loggedReturnRef = doc(db, "logged_returns", orderLogId);
    const loggedReturnSnap = await getDoc(loggedReturnRef);

    if (!loggedReturnSnap.exists()) {
      return NextResponse.json({ error: "Logged return not found" }, { status: 404 });
    }

    const loggedReturnData = loggedReturnSnap.data();
    console.log("✅ Logged return fetched successfully.");

    // ✅ Fetch returnable items data
    console.log("⏳ Fetching returnable items data...");
    const returnablesResponse = await fetch(RETURNABLES_API_URL);
    if (!returnablesResponse.ok) {
      throw new Error("Failed to fetch returnable items");
    }
    const returnablesData = await returnablesResponse.json();
    console.log("✅ Returnable items data fetched successfully.");

    // ✅ Flatten returnables data into separate arrays
    const partialReturnables = returnablesData["Crates Only / Partial Crate"];
    const fullReturnables = returnablesData["Crate With Bottles"];

    // ✅ Define mappings for matching keys to returnables
    const returnableKeys = Object.keys(loggedReturnData).filter(key =>
      key.startsWith("full_") || key.startsWith("partial_")
    );

    const matchedReturnables = returnableKeys.map(key => {
      const quantity = loggedReturnData[key]; // Get quantity
      if (quantity <= 0) return null; // Skip if no returns

      // Extract type and size from key (e.g., "full_200ml" -> "full", "200ml")
      const typeMatch = key.match(/(full|partial)_(\d+ml)/);
      if (!typeMatch) return null;
      const [, returnType, size] = typeMatch; // Extracted type (full/partial) & size (e.g., "200ml")

      // Match with correct returnables list
      const returnablesList = returnType === "full" ? fullReturnables : partialReturnables;

      // Find matching returnable item
      const matchedItem = returnablesList.find(item =>
        item.product_size.toLowerCase() === size.toLowerCase()
      );

      if (!matchedItem) {
        console.warn(`⚠️ No matching returnable item found for key: ${key}`);
        return null;
      }

      return {
        key, // e.g., "full_500ml"
        returnType, // "full" or "partial"
        quantity,
        ...matchedItem // Merge returnable item data
      };
    }).filter(item => item !== null); // Remove nulls

    console.log("✅ Matched returnables:", matchedReturnables);

    // ✅ Update Firestore with matched returnable data
    await updateDoc(loggedReturnRef, { matchedReturnables });

    console.log("📤 Logged return updated with returnable metadata.");

    return NextResponse.json({
      message: "Logged return updated successfully",
      matchedReturnables
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error matching logged returns:", error.message);
    return NextResponse.json({ error: "Failed to match logged returns", details: error.message }, { status: 500 });
  }
}
