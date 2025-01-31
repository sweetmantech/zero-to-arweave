import { TurboFactory } from "@ardrive/turbo-sdk";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";

if (!process.env.ARWEAVE_KEY) {
  throw new Error("ARWEAVE_KEY environment variable is not set");
}

// Parse the base64 encoded key
const ARWEAVE_KEY = JSON.parse(
  Buffer.from(
    process.env.ARWEAVE_KEY.replace("ARWEAVE_KEY=", ""),
    "base64"
  ).toString()
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Initialize authenticated Turbo client with the key from env
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
