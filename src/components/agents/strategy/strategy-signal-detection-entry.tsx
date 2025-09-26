import { useState } from "react";
import { FormChangeHandler } from "@/lib/types"

type StrategySignalDetectionEntryProps = {
  formData: { signal_detection_entry: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategySignalDetectionEntry: React.FC<StrategySignalDetectionEntryProps> = ({
  formData,
  handleChange,
  error,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.signal_detection_entry);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    handleChange({ target: { name: "signal_detection_entry", value } });
  };

  return (
    <div className="flex flex-row items-center justify-center space-x-2 p-4">
      {/* Slow */}
      <div
        onClick={() => handleValueChange("slow")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors 
          ${selectedValue === "slow"
            ? "text-teal-400 font-bold bg-neutral-800 border border-teal-400"
            : "text-teal-500 hover:bg-neutral-800 border border-neutral-700"}`}
      >
        Slow
      </div>

      {/* Medium */}
      <div
        onClick={() => handleValueChange("medium")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "medium"
            ? "font-bold text-neutral-100 bg-neutral-800 border border-neutral-400"
            : "text-neutral-300 hover:bg-neutral-800 border border-neutral-700"}`}
      >
        Medium
      </div>

      {/* Fast */}
      <div
        onClick={() => handleValueChange("fast")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "fast"
            ? "text-red-400 font-bold bg-neutral-800 border border-red-400"
            : "text-red-500 hover:bg-neutral-800 border border-neutral-700"}`}
      >
        Fast
      </div>

      {/* {error && (
        <p className="text-red-500 text-sm mt-2 text-center w-full">{error}</p>
      )} */}
    </div>
  );
};

export default StrategySignalDetectionEntry;
