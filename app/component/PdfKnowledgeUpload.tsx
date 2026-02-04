"use client";

import { useState, useRef, useEffect } from "react";
import { getToken } from "@/lib/utils/auth";

interface PdfKnowledgeUploadProps {
    triggerUpload?: boolean;
    onUploadTriggered?: () => void;
}

export default function PdfKnowledgeUpload({ triggerUpload, onUploadTriggered }: PdfKnowledgeUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-trigger file dialog when prop changes
    useEffect(() => {
        if (triggerUpload && fileInputRef.current && !isUploading) {
            fileInputRef.current.click();
            if (onUploadTriggered) {
                onUploadTriggered();
            }
        }
    }, [triggerUpload, isUploading, onUploadTriggered]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setUploadStatus({
                type: "error",
                message: "Please upload a PDF file.",
            });
            return;
        }

        setIsUploading(true);
        setUploadStatus({ type: null, message: "" });

        try {
            const token = getToken();
            const formData = new FormData();
            formData.append("file", file);

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const response = await fetch(`${baseUrl}/ai/pdf-embedding`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Upload failed");
            }

            const data = await response.json();
            setUploadStatus({
                type: "success",
                message: `Successfully processed "${file.name}". extracted ${data.textLength} characters.`,
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error: any) {
            setUploadStatus({
                type: "error",
                message: error.message || "Failed to upload PDF knowledge.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Knowledge Base</h3>
                    <p className="text-sm text-gray-500">Upload PDF documents to train your AI assistant.</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
            </div>

            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 transition-colors hover:border-indigo-400 group">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept=".pdf"
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />

                <div className="flex flex-col items-center justify-center text-center">
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-indigo-600 font-medium">Processing your document...</p>
                            <p className="text-xs text-gray-400 mt-1">This might take a moment if the document is scanned.</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
                                <svg className="w-6 h-6 text-gray-500 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">PDF documents only</p>
                        </>
                    )}
                </div>
            </div>

            {uploadStatus.type && (
                <div className={`mt-4 p-3 rounded-lg flex items-start ${uploadStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    <div className="flex-shrink-0 mt-0.5 mr-3">
                        {uploadStatus.type === "success" ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <p className="text-sm">{uploadStatus.message}</p>
                </div>
            )}
        </div>
    );
}
