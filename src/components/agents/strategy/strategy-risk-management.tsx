import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormChangeHandler } from "@/lib/types"

type StrategyRiskManagementProps = {
  formData: { risk_management: string };
  handleChange: FormChangeHandler;
  error?: string;
};

const StrategyRiskManagement: React.FC<StrategyRiskManagementProps> = ({
  formData,
  handleChange,
  error,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(formData.risk_management);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    handleChange({ target: { name: "risk_management", value } });
  };

  return (
    <Card className="flex flex-row items-center justify-center space-x-2 p-4">
      {/* Conservative */}
      <div
        onClick={() => handleValueChange("Conservative")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "Conservative"
            ? "text-lime-300 font-bold bg-neutral-800 border border-lime-400"
            : "text-lime-500 hover:bg-neutral-800 border border-transparent"}`}
      >
        Conservative
      </div>

      {/* Medium */}
      <div
        onClick={() => handleValueChange("Medium")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "Medium"
            ? "font-bold text-neutral-100 bg-neutral-800 border border-neutral-400"
            : "text-neutral-300 hover:bg-neutral-800 border border-transparent"}`}
      >
        Medium
      </div>

      {/* Aggressive */}
      <div
        onClick={() => handleValueChange("Aggressive")}
        className={`flex w-32 h-12 cursor-pointer items-center justify-center rounded-xl transition-colors
          ${selectedValue === "Aggressive"
            ? "text-red-400 font-bold bg-neutral-800 border border-red-400"
            : "text-red-500 hover:bg-neutral-800 border border-transparent"}`}
      >
        Aggressive
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center w-full">{error}</p>
      )}
    </Card>
  );
};

export default StrategyRiskManagement;
