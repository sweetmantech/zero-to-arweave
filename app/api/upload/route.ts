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
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    // Initialize authenticated Turbo client with the key from env
    const turbo = TurboFactory.authenticated({
      privateKey: ARWEAVE_KEY,
    });

    // Get the file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSize = fileBuffer.length;

    // Get upload costs
    const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({
      bytes: [fileSize],
    });

    // Create a file stream from the Buffer
    const fileStreamFactory = () => Readable.from(fileBuffer);

    // Upload the file with content type metadata
    const { id, dataCaches, fastFinalityIndexes } = await turbo.uploadFile({
      fileStreamFactory,
      fileSizeFactory: () => fileSize,
      dataItemOpts: {
        tags: [
          {
            name: "Content-Type",
            value: file.type || "application/octet-stream",
          },
          {
            name: "File-Name",
            value: file.name,
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      id,
      dataCaches,
      fastFinalityIndexes,
      cost: fileSizeCost,
      fileName: file.name,
      fileType: file.type,
      fileSize,
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
