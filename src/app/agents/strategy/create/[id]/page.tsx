"use client"

// Page: Create Strategy
// ----------------------
// Purpose: Render a create-strategy flow bound to a dynamic `id` param.
// Notes:
// - Must be a Client Component because we use wagmi hooks for wallet state.
// - In Next.js 15, route params are provided as a Promise, so React's `use()`
//   is used to unwrap them.
// - Access is gated: if the user is not connected, we show a prompt instead
//   of the strategy content.

import { use, useEffect, useState } from "react"
import { useAccount, useSignMessage } from "wagmi"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormChangeHandler } from "@/lib/types"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

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
type Errors = Partial<Record<FormField, string>>;

type AgentDetails = {
  id: string;
    ticker: string;
    name: string;
    created: number;
    description: string;
    ownerAddress: string;
    contractAddress: string;
    image: string;
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
  const { id } = use(params)           // unwrap dynamic route param
  const { address, isConnected } = useAccount() // wallet connection state
  const { signMessageAsync } = useSignMessage()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)  // current step in the multi-step form
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null)
  
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

  // Handle form data change
  const handleChange: FormChangeHandler = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({ ...prev, [name]: value }));

  setErrors((prevErrors) => ({
    ...prevErrors,
    [name]: value ? "" : "This field is required",
  }));
};


  // Navigate to next step
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

  // Navigate to previous step
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    console.log("Submitting formData:", formData);
    router.push("/agents"); // terug naar agents overview
  };

  useEffect(() => {
    if (!isConnected) {
      // Optionally, you could redirect to a connect wallet page here
      console.log("Please connect your wallet to proceed.")
      return
    }

    const fetchAgentDetails = async () => {
      // Fetch and display agent details if needed
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

  }, [isConnected])

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
            className="w-36 bg-white text-black"
          >
            Submit Strategy
          </Button>
        )}
      </div>
    </div>
  )
}
