"use client"

// Page: Create Agent
// ------------------
// Purpose: Full form flow for creating a new Agent.
// Notes:
// - Client Component: relies on wagmi hooks (wallet state, signing).
// - Implements form validation (name, ticker, description, image).
// - Handles S3 image upload via presigned URL from backend.
// - Uses wallet signature for authentication when calling the API.
// - On success, redirects to the agent success page.

import { useAccount, useSignMessage, useReadContract, useWriteContract } from "wagmi"
import { useQueryClient } from "@tanstack/react-query"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { normalizeForCheck, checkAgent } from "@/lib/helpers/agents"

import forbiddenWords from "@/lib/forbidden_words.json"
import { publicEnv } from "@/lib/env.public"
import { Button } from "@/components/ui/button"

import { erc20Abi } from "@/lib/abis/erc20Abi";
import { factoryAbi } from "@/lib/abis/factoryAbi"
import { sponsorAbi } from "@/lib/abis/sponsorAbi"

// API endpoints and asset base are injected via env vars.
const apiUrl = publicEnv.NEXT_PUBLIC_API_URL
const cloudfrontUrl = publicEnv.NEXT_PUBLIC_CLOUDFRONT_BASEURL
const agentFactoryAddress = publicEnv.NEXT_PUBLIC_AGENT_FACTORY as `0x${string}`;
const agentSponsorAddress = publicEnv.NEXT_PUBLIC_AGENT_SPONSOR as `0x${string}`;
const usdcAddress = publicEnv.NEXT_PUBLIC_USDC_ARBITRUM_ADDRESS as `0x${string}`;

const ERC20_ABI = erc20Abi;
const AgentFactoryABI = factoryAbi;
const AgentSponsorABI = sponsorAbi;

// Agent data shape
interface Agent {
  id: string
  name: string
  ticker: string
  description: string
  image: string
}

// Error mapping type
type FormErrors = Partial<Record<keyof Agent | "imageFile", string>>

export default function CreateAgentPage() {
  // --- Form state ---
  const [name, setName] = useState<Agent["name"]>("")
  const [ticker, setTicker] = useState<Agent["ticker"]>("")
  const [description, setDescription] = useState<Agent["description"]>("")

  // --- File upload state ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [presignedUrlImageId, setPresignedUrlImageId] = useState<string | null>(null)

  // --- Request lifecycle ---
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [agentId, setAgentId] = useState<string | null>(null)

  // Router redirect
  const router = useRouter()

  // Wallet + signing hooks
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { writeContractAsync, isPending } = useWriteContract();
  const queryClient = useQueryClient();

  // Utility: clear error for a given field
  const clearFieldError = (field: keyof Agent | "imageFile") => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      delete newErrors[field]
      return newErrors
    })
  }

  // --- Validation ---
  const containsForbiddenWord = (text: string) => {
    const normalized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    return forbiddenWords.some((word) => normalized.includes(word))
  }

  const validateForm = () => {
    const validationErrors: FormErrors = {}

    // Name
    if (!name.trim()) {
      validationErrors.name = "Agent name is required."
    } else if (name.length > 25) {
      validationErrors.name = "Agent name must be less than 25 characters."
    } else if (containsForbiddenWord(name)) {
      validationErrors.name = "Agent name contains inappropriate content."
    }

    // Ticker
    if (!ticker.trim() || !/^\$?[A-Z]{1,6}$/i.test(ticker)) {
      validationErrors.ticker = "Ticker must be 1-6 uppercase letters"
    } else if (containsForbiddenWord(ticker)) {
      validationErrors.ticker = "Ticker contains inappropriate content."
    }

    // Description
    if (!description.trim()) {
      validationErrors.description = "Description is required."
    } else if (description.length > 255) {
      validationErrors.description = "Description must be less than 255 characters."
    } else if (containsForbiddenWord(description)) {
      validationErrors.description = "Description contains inappropriate content."
    }

    // Image
    if (!imageFile) {
      validationErrors.imageFile = "An image is required."
    }

    const isValid = Object.keys(validationErrors).length === 0
    setErrors(validationErrors)
    return isValid
  }

  // --- Image upload flow ---
  const uploadImage = async (file: File, arrayBuffer: ArrayBuffer) => {
    setUploading(true)
    try {
      const response = await fetch(`${apiUrl}/presigned-url`, { method: "GET" })
      if (!response.ok) throw new Error("Failed to fetch presigned URL")

      const { url: presignedUrl, imageId } = (await response.json()) as {
        url: string
        imageId: string
      }

      setPresignedUrlImageId(imageId)

      const uploadResp = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: arrayBuffer,
      })

      if (!uploadResp.ok) throw new Error("Failed to upload image to S3")
    } catch (err) {
      console.error("Error during image upload:", err)
      setErrors((prev) => ({
        ...prev,
        imageFile: "Failed to upload image. Please try again.",
      }))
    } finally {
      setUploading(false)
    }
  }

  // --- Dropzone setup ---
  const onDrop = useCallback((acceptedFiles: File[], _fileRejections: FileRejection[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setError(null)
      clearFieldError("imageFile")

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "File size exceeds 5MB. Please upload a smaller file.",
        }))
        setImageFile(null)
        return
      }

      const reader = new FileReader()
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result
        if (arrayBuffer instanceof ArrayBuffer) {
          await uploadImage(file, arrayBuffer)
        }
      }
      reader.readAsArrayBuffer(file)
      setImageFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  })

  
  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // voorkom dubbel submits en submit tijdens upload of pending tx
    if (loading || uploading || isPending) return;
    setLoading(true);

    try {
      if (!isConnected || !address) {
        setError("Please connect your wallet to proceed.");
        return;
      }

      // lokale validatie eerst
      const isValid = validateForm();
      if (!isValid) return;

      // vereis dat de upload echt rond is en we een imageId hebben
      if (!presignedUrlImageId) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "Image is not uploaded yet. Please upload and try again.",
        }));
        return;
      }

      // normaliseer input voor de API en on-chain
      const { name: nameForCheck, ticker: tickerForCheck } = normalizeForCheck(name, ticker);

      // uniqueness check op submit
      const exists = await checkAgent(nameForCheck, tickerForCheck);
      if (exists) {
        setErrors((prev) => ({
          ...prev,
          name: "Agent with this name and ticker already exists.",
          ticker: "Agent with this name and ticker already exists.",
        }));
        return;
      }

      // wallet signature cachen
      const localStorageKey = `signature-${address.toLowerCase()}`;
      let signature = localStorage.getItem(localStorageKey);
      if (!signature) {
        const messageToSign = `Welcome to AITA!\n\nVerify your address: ${address.toLowerCase()}`;
        signature = await signMessageAsync({ message: messageToSign });
        if (!signature) throw new Error("Failed to sign message");
        localStorage.setItem(localStorageKey, signature);
      }

      // backend DB create
      let finalAgentId = agentId;
      if (!finalAgentId) {
        const params = {
          name: nameForCheck,
          ticker: tickerForCheck,
          description,
          imageId: presignedUrlImageId,
        };

        const createAgentResp = await fetch(`${apiUrl}/token`, {
          method: "POST",
          headers: {
            Authorization: `${address.toLowerCase()}-${signature}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!createAgentResp.ok) {
          // Check for 409 Conflict
          if (createAgentResp.status === 409) {
            setErrors((prev) => ({
              ...prev,
              name: "Agent already exists.",
              ticker: "Agent already exists.",
            }));
            return;
          }
          throw new Error("Error creating agent in DB");
        }

        const data = (await createAgentResp.json()) as { id: string };
        finalAgentId = data.id;
        setAgentId(finalAgentId);
      }

      // On-chain create via sponsor
      await writeContractAsync({
        address: agentSponsorAddress,
        abi: AgentSponsorABI,
        functionName: "createAgentForUser",
        args: [nameForCheck, tickerForCheck],
      });

      router.push(`/agents/create/success/${finalAgentId}`);
    } catch (err) {
      console.error("Error during form submission:", err);
      setError("An error occurred while submitting the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // Update state + clear errors on change
  const handleFieldChange = (field: keyof Agent, value: string) => {
    clearFieldError(field)
    switch (field) {
      case "name":
        setName(value)
        break
      case "ticker":
        setTicker(value)
        break
      case "description":
        setDescription(value)
        break
    }
  }

  // --- Guard ---
  if (!isConnected) {
    return (
      <div>
        <h1>Create Agent</h1>
        <p>Please connect your wallet to create an agent.</p>
      </div>
    )
  }

  // --- Render ---
  return (
    <div className="px-4">
      <div className="text-center text-sm text-neutral-300 mb-4">Create new Agent</div>
      <div className="text-center text-xl text-neutral-100 mb-4">
        Let&apos;s get to know your AI Agent
      </div>
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
                className={`p-2 border rounded-md w-full uppercase ${errors.ticker ? "border-red-400" : ""
                  }`}
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
                className={`w-full border rounded-md p-2 min-h-32 ${errors.description ? "border-red-400" : ""
                  }`}
                placeholder="Tell the world about your AI Agent..."
              />
              {errors.description && <p className="text-red-300 text-sm">{errors.description}</p>}
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
                      <Image
                        src={`${cloudfrontUrl}/${presignedUrlImageId}`}
                        alt={name}
                        width={48}
                        height={48}
                        className="rounded-xl aspect-square shadow-md mb-2"
                        loading="lazy"
                      />
                    )}
                    <span>Selected: {imageFile.name.slice(0, 10)}...</span>
                    {uploading && <span>Uploading...</span>}
                  </div>
                ) : (
                  <div className="text-sm flex items-center justify-center flex-col min-h-32">
                    <div className="font-bold text-white">Upload new image (max. 5mb)</div>
                    <div>
                      <span className="text-white underline">Choose image</span> or drag here
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
              {errors.imageFile && <p className="text-red-300 text-sm">{errors.imageFile}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading || uploading || isPending} className="w-full lg:w-auto">
              {loading ? "Submitting..." : "Create Agent"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {error && <div className="text-red-300 text-center my-2">{error}</div>}
    </div>
  )
}

