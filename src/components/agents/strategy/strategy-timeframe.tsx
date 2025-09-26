import { useState } from "react";
import { FormChangeHandler } from "@/lib/types"

type StrategyTimeframeProps = {
  formData: { timeframe: string; assets: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategyTimeframe: React.FC<StrategyTimeframeProps> = ({ formData, handleChange, error }) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.timeframe);

  const handleValueChange = (timeframe: string) => {
    setSelectedValue(timeframe);
    handleChange({ target: { name: "timeframe", value: timeframe } });
  };

  return (
    <>
      {/* Selected asset label */}
      <div className="flex items-center justify-center mb-2 font-bold capitalize p-2">
        {formData.assets.replaceAll("_", " ")}
      </div>

      {/* Timeframe options */}
      <div className="flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-0 text-neutral-400 text-center mt-2 rounded-xl bg-neutral-800 text-sm">
          {/* Disabled for now */}
          <div className="px-4 py-3 w-14 rounded-xl opacity-50 cursor-not-allowed">1H</div>
          <div className="px-4 py-3 w-14 rounded-xl opacity-50 cursor-not-allowed">4H</div>

          {/* Active */}
          <div
            className={`px-4 py-3 w-14 cursor-pointer rounded-xl ${
              selectedValue === "1d"
                ? "bg-gradient-to-b from-neutral-700 to-neutral-750 text-white font-bold"
                : "hover:bg-neutral-700"
            }`}
            onClick={() => handleValueChange("1d")}
          >
            1D
          </div>
        </div>
        <div className="my-2 text-neutral-400 text-sm">
          (1H and 4H will be available in the future)
        </div>

        {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
      </div>
    </>
  );
};

export default StrategyTimeframe;
