"use client";

import { useState } from "react";

export default function Home() {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setUploadStatus("Starting upload...");
      setTransactionId(null);

      // Create a sample JSON file
      const jsonData = {
        message: "Hello Sweetman!",
        timestamp: new Date().toISOString(),
      };

      // Send to our API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setTransactionId(result.id);
      setUploadStatus(`Upload successful! Transaction ID: ${result.id}`);
      console.log("Upload details:", result);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Arweave File Upload</h1>

      <button
        onClick={handleUpload}
        disabled={isLoading}
        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Uploading..." : "Upload JSON to Arweave"}
      </button>

      {uploadStatus && (
        <div className="mt-4 p-4 rounded bg-gray-100 dark:bg-gray-800">
          <p className="text-sm">{uploadStatus}</p>
          {transactionId && (
            <div className="mt-2">
              <p className="text-sm font-semibold mb-1">View file:</p>
              <ul className="text-sm space-y-1">
                <li>
                  <a
                    href={`https://arweave.net/${transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    View on Arweave Gateway
                  </a>
                </li>
                <li>
                  <a
                    href={`https://viewblock.io/arweave/tx/${transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    View on Viewblock Explorer
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
