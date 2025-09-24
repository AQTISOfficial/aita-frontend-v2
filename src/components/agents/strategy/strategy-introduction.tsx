import { Card } from "@/components/ui/card";

const StrategyIntroduction = () => {
  return (
    <Card className="mb-8 flex flex-col p-4" >
      <span className="text-xl mb-4">Welcome to our AITA Backtest Strategy!</span>
      <span className="text-sm text-neutral-300">This simulation lets you analyze historical market data to test various trading signals and refine your risk management approach. Use our framework to evaluate entry and exit points, adjust parameters, and discover trends from past crypto movements. Dive into a data-driven trading journey and optimize your strategy for future market opportunities.</span>
    </Card>
  );
};

export default StrategyIntroduction;