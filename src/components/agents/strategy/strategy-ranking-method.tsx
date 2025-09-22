import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormChangeHandler } from "@/lib/types"

type StrategyRankingMethodProps = {
  formData: { ranking_method: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategyRankingMethod: React.FC<StrategyRankingMethodProps> = ({
  formData,
  handleChange,
  error,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.ranking_method);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    handleChange({ target: { name: "ranking_method", value } });
  };

  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-3 gap-2 text-neutral-400 text-center mt-2 rounded-xl bg-neutral-800 text-sm w-full">
        {/* Volume */}
        <div
          className={`px-4 py-3 cursor-pointer rounded-xl transition-colors ${
            selectedValue === "volume"
              ? "bg-gradient-to-b from-neutral-700 to-neutral-750 text-white font-bold"
              : "hover:bg-neutral-700"
          }`}
          onClick={() => handleValueChange("volume")}
        >
          Volume
        </div>

        {/* Volatility */}
        <div
          className={`px-4 py-3 cursor-pointer rounded-xl transition-colors ${
            selectedValue === "volatility"
              ? "bg-gradient-to-b from-neutral-700 to-neutral-750 text-white font-bold"
              : "hover:bg-neutral-700"
          }`}
          onClick={() => handleValueChange("volatility")}
        >
          Volatility
        </div>

        {/* Momentum */}
        <div
          className={`px-4 py-3 cursor-pointer rounded-xl transition-colors ${
            selectedValue === "momentum"
              ? "bg-gradient-to-b from-neutral-700 to-neutral-750 text-white font-bold"
              : "hover:bg-neutral-700"
          }`}
          onClick={() => handleValueChange("momentum")}
        >
          Momentum
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </Card>
  );
};

export default StrategyRankingMethod;
