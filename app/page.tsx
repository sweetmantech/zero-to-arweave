"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("");
      setTransactionId(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      return;
    }

    try {
      setIsLoading(true);
      setUploadStatus(`Starting upload of ${selectedFile.name}...`);
      setTransactionId(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Send to our API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setTransactionId(result.id);
      setUploadStatus(
        `Upload successful! Transaction ID: ${result.id}\nFile: ${
          result.fileName
        }\nSize: ${(result.fileSize / 1024).toFixed(2)} KB`
      );
      console.log("Upload details:", result);

      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Choose a file to upload
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              dark:file:bg-blue-900 dark:file:text-blue-200
              hover:file:bg-blue-100 dark:hover:file:bg-blue-800
              cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={isLoading || !selectedFile}
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors ${
            isLoading || !selectedFile ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Uploading..." : "Upload to Arweave"}
        </button>

        {selectedFile && (
          <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-sm">
              Selected file: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        {uploadStatus && (
          <div className="w-full mt-4 p-4 rounded bg-gray-100 dark:bg-gray-800">
            <p className="text-sm whitespace-pre-wrap">{uploadStatus}</p>
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
    </div>
  );
}
