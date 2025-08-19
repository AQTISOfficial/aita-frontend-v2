"use client";

import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import forbiddenWords from "@/lib/forbidden_words.json";

import { publicEnv } from "@/lib/env.public";
import { Button } from "@/components/ui/button";

const apiUrl = publicEnv.NEXT_PUBLIC_API_URL;
const cloudfrontUrl = publicEnv.NEXT_PUBLIC_CLOUDFRONT_BASEURL;

interface Agent {
    id: string;
    name: string;
    ticker: string;
    description: string;
    image: string;
}

type FormErrors = Partial<Record<keyof Agent | "imageFile", string>>;

export default function CreateAgentPage() {
    // State
    const [name, setName] = useState<Agent["name"]>("");
    const [ticker, setTicker] = useState<Agent["ticker"]>("");
    const [description, setDescription] = useState<Agent["description"]>("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [presignedUrlImageId, setPresignedUrlImageId] = useState<string | null>(null);
    const [agentId, setAgentId] = useState<string | null>(null);

    // Router
    const router = useRouter();

    // Wagmi
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const clearFieldError = (field: keyof Agent | "imageFile") => {
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Validate form
    const containsForbiddenWord = (text: string) => {
        const normalized = text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        return forbiddenWords.some((word) => normalized.includes(word));
    };

    const validateForm = () => {
        const validationErrors: FormErrors = {};

        // Agent name
        if (!name.trim()) {
            validationErrors.name = "Agent name is required.";
        } else if (name.length > 25) {
            validationErrors.name = "Agent name must be less than 25 characters.";
        } else if (containsForbiddenWord(name)) {
            validationErrors.name = "Agent name contains inappropriate content.";
        }

        // Ticker
        if (!ticker.trim() || !/^\$?[A-Z]{1,6}$/i.test(ticker)) {
            validationErrors.ticker = "Ticker must be 1-6 uppercase letters";
        } else if (containsForbiddenWord(ticker)) {
            validationErrors.ticker = "Ticker contains inappropriate content.";
        }

        // Description
        if (!description.trim()) {
            validationErrors.description = "Description is required.";
        } else if (description.length > 255) {
            validationErrors.description = "Description must be less than 255 characters.";
        } else if (containsForbiddenWord(description)) {
            validationErrors.description = "Description contains inappropriate content.";
        }

        // Image
        if (!imageFile) {
            validationErrors.imageFile = "An image is required.";
        }

        const isValid = Object.keys(validationErrors).length === 0;
        setErrors(validationErrors);
        return isValid;
    };

    // Upload image
    const uploadImage = async (file: File, arrayBuffer: ArrayBuffer) => {
        setUploading(true);
        try {
            const response = await fetch(`${apiUrl}/presigned-url`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch presigned URL");

            const { url: presignedUrl, imageId } = (await response.json()) as {
                url: string;
                imageId: string;
            };
            setPresignedUrlImageId(imageId);
            console.log("Presigned URL:", presignedUrl);
            const uploadResp = await fetch(presignedUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                },
                body: arrayBuffer,
            });

            if (!uploadResp.ok) throw new Error("Failed to upload image to S3");
        } catch (err) {
            console.error("Error during image upload:", err);
            setErrors((prev) => ({
                ...prev,
                imageFile: "Failed to upload image. Please try again.",
            }));
        } finally {
            setUploading(false);
        }
    };

    // Handle file drop
    const onDrop = useCallback(
        (acceptedFiles: File[], _fileRejections: FileRejection[]) => {
            if (acceptedFiles && acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setError(null);
                clearFieldError("imageFile");

                if (file.size > 5 * 1024 * 1024) {
                    setErrors((prev) => ({
                        ...prev,
                        imageFile: "File size exceeds 5MB. Please upload a smaller file.",
                    }));
                    setImageFile(null);
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event: ProgressEvent<FileReader>) => {
                    const arrayBuffer = event.target?.result;
                    if (arrayBuffer instanceof ArrayBuffer) {
                        await uploadImage(file, arrayBuffer);
                    }
                };
                reader.readAsArrayBuffer(file);
                setImageFile(file);
            }
        },
        []
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { "image/*": [] },
    });

    // Form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!isConnected || !address) {
            setError("Please connect your wallet to proceed.");
            setLoading(false);
            return;
        }

        const isValid = validateForm();
        if (!isValid) {
            setLoading(false);
            return;
        }

        try {
            // Sign message
            const localStorageKey = `signature-${address.toLowerCase()}`;
            let signature = localStorage.getItem(localStorageKey);

            if (!signature) {
                const messageToSign = `Welcome to AITA!\n\nVerify your address: ${address.toLowerCase()}`;
                signature = await signMessageAsync({ message: messageToSign });

                if (!signature) throw new Error("Failed to sign message");
                localStorage.setItem(localStorageKey, signature);
            }

            let finalAgentId = agentId;

            if (!finalAgentId) {
                const params = { name, ticker, description, imageId: presignedUrlImageId };

                const createAgentResp = await fetch(`${apiUrl}/token`, {
                    method: "POST",
                    headers: {
                        Authorization: `${address.toLowerCase()}-${signature}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(params),
                });
                if (!createAgentResp.ok) throw new Error("Error creating agent in DB");
                const data = (await createAgentResp.json()) as { id: string };
                finalAgentId = data.id;
                setAgentId(finalAgentId);
            }

            router.push(`/agents/create/success/${finalAgentId}`);
        } catch (err) {
            console.error("Error during form submission:", err);
            setError("An error occurred while submitting the form. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (field: keyof Agent, value: string) => {
        clearFieldError(field);

        switch (field) {
            case "name":
                setName(value);
                break;
            case "ticker":
                setTicker(value);
                break;
            case "description":
                setDescription(value);
                break;
        }
    };

    if (!isConnected) {
        return (
            <div>
                <h1>Create Agent</h1>
                <p>Please connect your wallet to create an agent.</p>
            </div>
        );
    }

    return (
        <div className="px-4">
            <div className="text-center text-sm text-neutral-300 mb-4">Create new Agent</div>
            <div className="text-center text-xl text-neutral-100 mb-4">Let's get to know your AI Agent</div>
            <form onSubmit={handleSubmit}>
                <Card className="px-4 py-6 w-full lg:w-1/2 mx-auto">
                    <CardContent>
                        {/* Name */}
                        <div className="mb-4">
                            <label htmlFor="agentName" className="block font-medium my-2">
                                Name
                            </label>
                            <input
                                id="agentName"
                                type="text"
                                value={name}
                                maxLength={25}
                                autoComplete="off"
                                onChange={(e) => handleFieldChange("name", e.target.value)}
                                className={`p-2 border rounded-md w-full ${errors.name ? "border-red-400" : ""}`}
                                placeholder="Agent name"
                            />
                            {errors.name && <p className="text-red-300 text-sm">{errors.name}</p>}
                        </div>

                        {/* Ticker */}
                        <div className="mb-4">
                            <label htmlFor="ticker" className="block font-medium my-2">
                                Ticker
                            </label>
                            <input
                                id="ticker"
                                type="text"
                                value={ticker}
                                maxLength={6}
                                autoComplete="off"
                                onChange={(e) => handleFieldChange("ticker", e.target.value.toUpperCase())}
                                className={`p-2 border rounded-md w-full uppercase ${errors.ticker ? "border-red-400" : ""}`}
                                placeholder="Ticker (f.e. AITA)"
                            />
                            {errors.ticker && <p className="text-red-300 text-sm">{errors.ticker}</p>}
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label htmlFor="description" className="block font-medium my-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                autoComplete="off"
                                maxLength={255}
                                onChange={(e) => handleFieldChange("description", e.target.value)}
                                className={`w-full border rounded-md p-2 min-h-32 ${errors.description ? "border-red-400" : ""}`}
                                placeholder="Tell the world about your AI Agent..."
                            />
                            {errors.description && (
                                <p className="text-red-300 text-sm">{errors.description}</p>
                            )}
                        </div>

                        {/* Image upload */}
                        <div className="mb-4">
                            <label htmlFor="drop-image" className="block font-medium my-2">
                                Upload Image
                            </label>
                            <div
                                {...getRootProps()}
                                className={`border border-dashed rounded-xl p-4 text-center min-h-32 ${isDragActive ? "bg-neutral-900" : "bg-neutral-800"
                                    } ${errors.imageFile ? "border-red-400" : "border-gray-300"}`}
                            >
                                <input id="drop-image" {...getInputProps()} />
                                {imageFile ? (
                                    <div className="text-blue-300 flex flex-col items-center justify-center min-h-32">
                                        {presignedUrlImageId && !uploading && (
                                            <div>
                                                <Image
                                                    src={`${cloudfrontUrl}/${presignedUrlImageId}`}
                                                    alt={name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-xl aspect-square shadow-md mb-2"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <span>Selected: {imageFile.name.slice(0, 10)}...</span>
                                        {uploading && <span>Uploading...</span>}
                                    </div>
                                ) : (
                                    <div className="text-sm flex items-center justify-center flex-col min-h-32">
                                        <div className="font-bold text-white">
                                            Upload new image (max. 5mb)
                                        </div>
                                        <div>
                                            <span className="text-white underline">Choose image</span>{" "}
                                            <span>or drag here</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {imageFile && !uploading && (
                                <span
                                    className="mt-1 flex flex-row justify-end items-center text-sm cursor-pointer"
                                    onClick={() => setImageFile(null)}
                                >
                                    Remove file
                                </span>
                            )}
                            {errors.imageFile && (
                                <p className="text-red-300 text-sm">{errors.imageFile}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Create Agent"}
                        </Button>
                    </CardFooter>
                </Card>


            </form>

            {error && <div className="text-red-300 text-center my-2">{error}</div>}
        </div>
    );
}
