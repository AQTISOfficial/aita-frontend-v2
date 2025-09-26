"use client"

import { use, useEffect, useState } from "react"
import { useAccount, useSignMessage, useWriteContract, useConfig } from "wagmi"
import { waitForTransactionReceipt } from "wagmi/actions"
import { UserRejectedRequestError } from "viem"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import StrategyFaq from "@/components/agents/strategy/strategy-faq"

import { publicEnv } from "@/lib/env.public"
import { sponsorAbi } from "@/lib/abis/sponsorAbi"
import { FormChangeHandler } from "@/lib/types"

/**
   * The backtest details object contains the following properties:
   * 
   * Type: strategy.type
   * Direction: strategy.direction
   * Assets: strategy.assets
   * Timeframe: strategy.timeframe
   * Signal Detection Entry: strategy.signal_detection_entry
   * Signal Detection Exit: strategy.signal_detection_exit
   * Liquidity Filter: strategy.liquidity_filter
   * Risk Management: strategy.risk_management
   * Ranking Method: strategy.ranking_method
   * Exchanges: strategy.exchanges
   * Comet: strategy.comet (optional; available after creating a new strategy)
   * 
   * Review: review and submit form data
   */

import StrategyIntroduction from "@/components/agents/strategy/strategy-introduction"
import StrategyType from "@/components/agents/strategy/strategy-type"
import StrategyDirection from "@/components/agents/strategy/strategy-direction"
import StrategyAssets from "@/components/agents/strategy/strategy-assets"
import StrategyTimeframe from "@/components/agents/strategy/strategy-timeframe"
import StrategySignalDetectionEntry from "@/components/agents/strategy/strategy-signal-detection-entry"
import StrategySignalDetectionExit from "@/components/agents/strategy/strategy-signal-detection-exit"
import StrategyRiskManagement from "@/components/agents/strategy/strategy-risk-management"
import StrategyRankingMethod from "@/components/agents/strategy/strategy-ranking-method"
import StrategyExchanges from "@/components/agents/strategy/strategy-exchanges"
import StrategyReview from "@/components/agents/strategy/strategy-review"

const apiUrl = publicEnv.NEXT_PUBLIC_API_URL
const agentSponsorAddress = publicEnv.NEXT_PUBLIC_AGENT_SPONSOR as `0x${string}`;
const AgentSponsorABI = sponsorAbi;

type FormData = {
  type: string;
  direction: string;
  assets: string;
  timeframe: string;
  signal_detection_entry: string;
  signal_detection_exit: string;
  liquidity_filter: string;
  risk_management: string;
  ranking_method: string;
  exchange: string;
};

type FormField = keyof FormData;

type AgentDetails = {
  id: string;
  ticker: string;
  name: string;
  created: number;
  description: string;
  ownerAddress: string;
  contractAddress: string;
  image: string;
  backtestingPaid: boolean;
  strategy: {
    backtested?: {
      accumulatedReturns: number;
      CAGR: number;
      maxDrawdown: number;
    };
    timeframe: string;
    risk_management: string;
    ranking_method: string;
    direction: string;
    signal_detection_entry: string;
    signal_detection_exit: string;
    exchange: string;
    comet: string;
    assets: string;
    type: string;
  };
};

const steps = [
  "How it works",
  "What is the Trading Strategy of your Agent?",
  "What is your Agent's market bias?",
  "Which token will your Agent trade?",
  "Select on what timeframe Agent will trade",
  "What's the Agent's Signal Detection Speed?",
  "What is the Agent's Strategy Exit style?",
  "What is your Agent's Risk Management?",
  "What is your Agent's signal ranking method?",
  "Select preferred Exchange",
  "Review & Submit",
] as const;

const requiredFields: (FormField | "")[] = [
  "",
  "type",
  "direction",
  "assets",
  "timeframe",
  "signal_detection_entry",
  "signal_detection_exit",
  "risk_management",
  "ranking_method",
  "exchange",
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { writeContractAsync, isPending } = useWriteContract();
  const config = useConfig();

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    type: "",
    direction: "",
    assets: "",
    timeframe: "1d",
    signal_detection_entry: "",
    signal_detection_exit: "",
    liquidity_filter: "no",
    risk_management: "",
    ranking_method: "",
    exchange: ""
  });

  const handleChange: FormChangeHandler = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : "This field is required",
    }));
  };


  const nextStep = () => {
    const fieldName = requiredFields[step]

    if (fieldName) {
      const value = formData[fieldName as keyof FormData]
      const isEmpty = Array.isArray(value) ? value.length === 0 : !value

      if (isEmpty) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "This field is required",
        }))
        return
      }
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setErrors({ submit: "Please connect your wallet to submit." })
      return
    }
    if (!agentDetails?.contractAddress) {
      toast.error("Agent details not loaded yet.")
      return
    }

    setSubmitting(true)
    try {

      const params = {
        "tokenId": id,
        "strategy": {
          "type": formData.type,
          "signal_detection_entry": formData.signal_detection_entry,
          "signal_detection_exit": formData.signal_detection_exit,
          "direction": formData.direction,
          "timeframe": formData.timeframe,
          "risk_management": formData.risk_management,
          "assets": formData.assets,
          "ranking_method": formData.ranking_method,
          "liquidity_filter": formData.liquidity_filter,
          "exchange": formData.exchange
        }
      }

      const localStorageKey = `signature-${address.toLowerCase()}`
      let signature = localStorage.getItem(localStorageKey)
      if (!signature) {
        const messageToSign = `Welcome to AITA!\n\nVerify your address: ${address.toLowerCase()}`
        signature = await signMessageAsync({ message: messageToSign })
        if (!signature) throw new Error("Failed to sign message")
        localStorage.setItem(localStorageKey, signature)
      }


      if (!agentDetails.backtestingPaid) {
        const hash = await writeContractAsync({
          address: agentSponsorAddress,
          abi: AgentSponsorABI,
          functionName: 'purchaseBacktestingForUser',
          args: [agentDetails.contractAddress as `0x${string}`],
        })
        setTxHash(hash)

        const receipt = await waitForTransactionReceipt(config, { hash })
        if (receipt.status !== 'success') {
          throw new Error("Transaction reverted")
        }
      }
      const createBacktestResp = await fetch(`${apiUrl}/strategy/create`, {
        method: 'POST',
        headers: {
          'Authorization': `${address.toLowerCase()}-${signature}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      if (!createBacktestResp.ok) {
        throw new Error('Error creating backtest in DB')
      }

      toast.success('Strategy submitted successfully!')
      setFinalizing(true)
    } catch (err) {
      if (err instanceof UserRejectedRequestError) {
        toast.error('User rejected the transaction')
      } else {
        console.error('Submission error:', err)
        toast.error('Error submitting strategy. Please retry.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isConnected) {
      return
    }

    const fetchAgentDetails = async () => {
      const res = await fetch(`/api/agents/details`, {
        method: "POST",
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      setAgentDetails(data)
    }

    if (isConnected) {
      fetchAgentDetails()
    }

  }, [id, isConnected])

  if (!isConnected) {
    return (
      <div>
        <h1>Create Strategy</h1>
        <p>Please connect your wallet to create a strategy.</p>
      </div>
    )
  }

  const stepComponents = [
    <StrategyIntroduction key={0} />,
    <StrategyType formData={formData} handleChange={handleChange} error={errors.type} key={1} />,
    <StrategyDirection formData={formData} handleChange={handleChange} error={errors.direction} key={2} />,
    <StrategyAssets formData={formData} handleChange={handleChange} error={errors.assets} key={3} />,
    <StrategyTimeframe formData={formData} handleChange={handleChange} error={errors.timeframe} key={4} />,
    <StrategySignalDetectionEntry formData={formData} handleChange={handleChange} error={errors.signal_detection_entry} key={5} />,
    <StrategySignalDetectionExit formData={formData} handleChange={handleChange} error={errors.signal_detection_exit} key={6} />,
    <StrategyRiskManagement formData={formData} handleChange={handleChange} error={errors.risk_management} key={7} />,
    <StrategyRankingMethod formData={formData} handleChange={handleChange} error={errors.ranking_method} key={8} />,
    <StrategyExchanges formData={formData} handleChange={handleChange} error={errors.exchange} key={9} />,
    <StrategyReview formData={formData} details={agentDetails} key={10} />,
  ];

  return (
    <div className="min-h-[100svh] flex flex-col items-center p-4">
      {/* Step Header */}
      <div className="text-center text-sm text-neutral-400 mb-2">
        Step {step + 1} of {steps.length}
      </div>
      <div className="text-center text-xl font-bold mb-4">{steps[step]}</div>

      {/* Step Content with Motion */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full max-w-2xl"
      >
        {stepComponents[step]}
      </motion.div>

      {/* Error Message */}
      {errors[requiredFields[step] as FormField] && (
        <div className="text-red-500 text-center mt-2">
          {errors[requiredFields[step] as FormField]}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {!finalizing ? (
          <>
            {step > 0 && (
              <Button
                onClick={prevStep}
                className="w-24 hover:bg-neutral-800"
                variant="outline"
              >
                Previous
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={nextStep} className="w-24 bg-white text-black">
                {step === 0 ? "Start" : "Next"}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || isPending}
                className="w-36 bg-white text-black disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {(() => {
                  if (submitting) {
                    if (!agentDetails?.backtestingPaid) {
                      return txHash ? 'Finalizing...' : 'Confirm in wallet'
                    }
                    return 'Finalizing...'
                  }
                  return 'Submit Strategy'
                })()}
              </Button>
            )}
          </>) : (
          <div className="flex flex-col items-center gap-4">
            <span className="text-teal-400">Your strategy is being created. This may take a few moments.</span>
            <Button className="w-36 bg-white text-black"
              onClick={() => router.push('/agents')}
            >
              Go to Agents List
            </Button>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="w-full max-w-2xl">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="mt-6"
        >
          <StrategyFaq step={step} />
        </motion.div>

      </div>
    </div>
  )
}
