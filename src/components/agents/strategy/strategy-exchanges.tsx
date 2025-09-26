import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormChangeHandler } from "@/lib/types"

type StrategyExchangesProps = {
  formData: { exchange: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategyExchanges: React.FC<StrategyExchangesProps> = ({
  formData,
  handleChange,
  error,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.exchange);

  const handleValueChange = (exchange: string) => {
    setSelectedValue(exchange);
    handleChange({ target: { name: "exchange", value: exchange } });
  };

  return (
    <div className="flex flex-row items-center justify-center space-x-2 p-4">
      {/* Binance */}
      <div
        onClick={() => handleValueChange("binance")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "binance"
            ? "text-yellow-600 font-bold bg-neutral-800 border border-yellow-600"
            : "text-neutral-300 hover:bg-neutral-800 border border-transparent"}`}
      >
        Binance
      </div>

      {/* Bybit */}
      <div
        onClick={() => handleValueChange("bybit")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "bybit"
            ? "text-orange-500 font-bold bg-neutral-800 border border-orange-600"
            : "text-neutral-300 hover:bg-neutral-800 border border-transparent"}`}
      >
        Bybit
      </div>

      {/* Hyperliquid */}
      <div
        onClick={() => handleValueChange("hyperliquid")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "hyperliquid"
            ? "text-teal-500 font-bold bg-neutral-800 border border-teal-500"
            : "text-neutral-300 hover:bg-neutral-800 border border-transparent"}`}
      >
        Hyperliquid
      </div>

      {/* {error && (
        <p className="text-red-500 text-sm mt-2 text-center w-full">{error}</p>
      )} */}
    </div>
  );
};

export default StrategyExchanges;
