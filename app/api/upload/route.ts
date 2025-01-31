import { TurboFactory } from "@ardrive/turbo-sdk";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import fs from "fs";
import path from "path";

// Read the Arweave keyfile
const keyfilePath = path.join(
  process.cwd(),
  "arweave-keyfile-Safs38bZgIVFBIIqyP2uwKFBZ-C6bOrm9APgm-Sv7rU.json"
);
const ARWEAVE_KEY = JSON.parse(fs.readFileSync(keyfilePath, "utf-8"));

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Initialize authenticated Turbo client with the actual keyfile
    const turbo = TurboFactory.authenticated({
      privateKey: ARWEAVE_KEY,
    });

    // Convert the JSON data to a Buffer
    const jsonBuffer = Buffer.from(JSON.stringify(data));
    const fileSize = jsonBuffer.length;

    // Get upload costs
    const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({
      bytes: [fileSize],
    });

    // Create a file stream from the Buffer
    const fileStreamFactory = () => Readable.from(jsonBuffer);

    // Upload the file
    const { id, dataCaches, fastFinalityIndexes } = await turbo.uploadFile({
      fileStreamFactory,
      fileSizeFactory: () => fileSize,
    });

    return NextResponse.json({
      success: true,
      id,
      dataCaches,
      fastFinalityIndexes,
      cost: fileSizeCost,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
