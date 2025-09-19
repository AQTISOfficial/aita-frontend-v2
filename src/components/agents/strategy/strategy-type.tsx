import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormChangeHandler } from "@/lib/types"

type StrategyTypeProps = {
  formData: { type: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategyType: React.FC<StrategyTypeProps> = ({ formData, handleChange, error }) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.type);

  const handleValueChange = (type: string) => {
    setSelectedValue(type);
    handleChange({ target: { name: "type", value: type } });
  };

  return (
    <Card className="flex flex-col space-y-3">
      {/* Momentum */}
      <div
        onClick={() => handleValueChange("momentum")}
        className={`relative h-32 p-0 rounded-2xl cursor-pointer border overflow-hidden ${
          selectedValue === "momentum"
            ? "bg-neutral-800 text-white border-neutral-500"
            : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700"
        }`}
      >
        <div className="flex flex-col justify-center h-full px-4 py-2 w-1/2 bg-neutral-900 z-10">
          <span className="text-xl font-bold grow p-4">Momentum</span>
          <span className="text-neutral-400 text-sm px-4 pb-2">
            Capitalize on strong trends with consistent movement.
          </span>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/candles_momentum.png')] bg-cover bg-right bg-no-repeat" />
          <div className="absolute top-0 left-0 w-3/4 h-full bg-gradient-to-l from-transparent to-neutral-900" />
        </div>
      </div>

      {/* Breakout */}
      <div
        onClick={() => handleValueChange("breakout")}
        className={`relative h-32 p-0 rounded-2xl cursor-pointer border overflow-hidden ${
          selectedValue === "breakout"
            ? "bg-neutral-800 text-white border-neutral-500"
            : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700"
        }`}
      >
        <div className="flex flex-col justify-center h-full px-4 py-2 w-1/2 bg-neutral-900 z-10">
          <span className="text-xl font-bold grow p-4">Breakout</span>
          <span className="text-neutral-400 text-sm px-4 pb-2">
            Capitalize on sudden price breakouts.
          </span>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/candles_breakout.png')] bg-cover bg-right bg-no-repeat" />
          <div className="absolute top-0 left-0 w-3/4 h-full bg-gradient-to-l from-transparent to-neutral-900" />
        </div>
      </div>

      {/* Trend Following */}
      <div
        onClick={() => handleValueChange("trend")}
        className={`relative h-32 p-0 rounded-2xl cursor-pointer border overflow-hidden ${
          selectedValue === "trend"
            ? "bg-neutral-800 text-white border-neutral-500"
            : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700"
        }`}
      >
        <div className="flex flex-col justify-center h-full px-4 py-2 w-1/2 bg-neutral-900 z-10">
          <span className="text-xl font-bold grow p-4">Trend Following</span>
          <span className="text-neutral-400 text-sm px-4 pb-2">
            Capitalize on swings from clear long-term trends.
          </span>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/candles_trendfollowing.png')] bg-cover bg-right bg-no-repeat" />
          <div className="absolute top-0 left-0 w-3/4 h-full bg-gradient-to-l from-transparent to-neutral-900" />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </Card>
  );
};

export default StrategyType;
