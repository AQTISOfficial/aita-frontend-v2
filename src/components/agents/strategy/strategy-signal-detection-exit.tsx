import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormChangeHandler } from "@/lib/types"

type StrategySignalDetectionExitProps = {
  formData: { signal_detection_exit: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategySignalDetectionExit: React.FC<StrategySignalDetectionExitProps> = ({
  formData,
  handleChange,
  error,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.signal_detection_exit);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    handleChange({ target: { name: "signal_detection_exit", value } });
  };

  return (
    <Card className="flex flex-row items-center justify-center space-x-2 p-4">
      {/* Slow */}
      <div
        onClick={() => handleValueChange("slow")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "slow"
            ? "text-lime-400 font-bold bg-neutral-800 border border-lime-400"
            : "text-lime-500 hover:bg-neutral-800 border border-transparent"}`}
      >
        Slow
      </div>

      {/* Medium */}
      <div
        onClick={() => handleValueChange("medium")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "medium"
            ? "font-bold text-neutral-100 bg-neutral-800 border border-neutral-400"
            : "text-neutral-300 hover:bg-neutral-800 border border-transparent"}`}
      >
        Medium
      </div>

      {/* Fast */}
      <div
        onClick={() => handleValueChange("fast")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "fast"
            ? "text-red-400 font-bold bg-neutral-800 border border-red-400"
            : "text-red-500 hover:bg-neutral-800 border border-transparent"}`}
      >
        Fast
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center w-full">{error}</p>
      )}
    </Card>
  );
};

export default StrategySignalDetectionExit;
