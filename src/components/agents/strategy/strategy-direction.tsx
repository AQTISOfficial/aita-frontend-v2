import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormChangeHandler } from "@/lib/types"

type StrategyDirectionProps = {
  formData: { direction: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategyDirection: React.FC<StrategyDirectionProps> = ({ formData, handleChange, error }) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.direction);

  const handleValueChange = (direction: string) => {
    setSelectedValue(direction);
    handleChange({ target: { name: "direction", value: direction } });
  };

  return (
    <Card className="flex flex-row items-center justify-center space-x-2 p-4">
      {/* Bullish */}
      <div
        onClick={() => handleValueChange("longonly")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl border transition-colors
          ${selectedValue === "longonly"
            ? "font-bold text-lime-300 bg-neutral-800 border border-lime-400"
            : "text-lime-500 hover:bg-neutral-800 border border-transparent"}`}
      >
        Bullish
      </div>

      {/* Both */}
      <div
        onClick={() => handleValueChange("both")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl border transition-colors
          ${selectedValue === "both"
            ? "font-bold text-neutral-100 bg-neutral-800 border border-neutral-400"
            : "text-neutral-300 hover:bg-neutral-800 border border-transparent"}`}
      >
        Both
      </div>

      {/* Bearish */}
      <div
        onClick={() => handleValueChange("shortonly")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl border transition-colors
          ${selectedValue === "shortonly"
            ? "font-bold text-red-400 bg-neutral-800 border border-red-400"
            : "text-red-500 hover:bg-neutral-800 border border-transparent"}`}
      >
        Bearish
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center w-full">
          {error}
        </p>
      )}
    </Card>
  );
};

export default StrategyDirection;
