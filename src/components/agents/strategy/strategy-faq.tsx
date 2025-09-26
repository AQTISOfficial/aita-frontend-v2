import { FC, JSX } from "react";

interface StrategyFaqProps {
  step: number;
}

const steps: Record<number, { title: string; content: JSX.Element }> = {
  1: {
    title: "Trading Strategy",
    content: (
      <>
        Select the type of strategy you want to test:
        <ul className="!list-disc list-outside ml-4 my-3">
          <li>
            Momentum: Identifies assets with strong price acceleration, entering
            trades when momentum builds and exiting when it weakens.
          </li>
          <li>
            Trend-Following: Rides sustained market trends, entering in the
            direction of the trend and holding until signs of reversal.
          </li>
          <li>
            Breakout: Captures strong price movements when an asset breaks
            through key resistance or support levels, aiming to profit from
            volatility surges.
          </li>
        </ul>
        Choosing the right strategy ensures your trades align with market
        dynamics.
      </>
    ),
  },
  2: {
    title: "Market Bias",
    content: (
      <>
        Decide how your strategy executes trades:
        <ul className="!list-disc list-outside ml-4 my-3">
          <li>Long-Only: Buys assets expecting prices to rise.</li>
          <li>Short-Only: Sells assets expecting prices to drop.</li>
          <li>
            Both: Trades both long and short positions based on signals.
          </li>
        </ul>
        This setting defines whether your strategy focuses on buying, selling,
        or both to maximize opportunities in different market conditions.
      </>
    ),
  },
  3: {
    title: "Token",
    content: (
      <>
        Choose the cryptocurrency you want to backtest. Different tokens have
        unique characteristics, such as volatility, liquidity, and trading
        volume. Selecting the right asset ensures accurate performance
        evaluation.
      </>
    ),
  },
  4: {
    title: "Timeframe",
    content: (
      <>
        Pick the timeframe for your analysis:
        <ul className="!list-disc list-outside ml-4 my-3">
          <li>
            Short-term (e.g., 1-hour charts): Captures quick trades and rapid
            market movements.
          </li>
          <li>
            Medium-term (e.g., 4-hour charts): Balances between short-term and
            long-term analysis.
          </li>
          <li>
            Long-term (e.g., daily charts): Focuses on sustained trends and
            larger market shifts.
          </li>
        </ul>
        Selecting the right timeframe ensures your strategy matches your trading
        style.
        <br />
        Keep in mind that lower timeframes don’t guarantee higher profits.
      </>
    ),
  },
  5: {
    title: "Signal Detection Speed (Slow, Medium, Fast)",
    content: (
      <>
        Set how quickly your strategy identifies trading signals:
        <ul className="!list-disc list-outside ml-4 my-3">
          <li>
            Fast: Higher-risk, as it reacts quickly to market movements. This
            can capture early opportunities but may generate more false signals.
          </li>
          <li>
            Medium: A balanced approach that captures signals with moderate
            sensitivity.
          </li>
          <li>
            Slow: Lower-risk, as it filters out short-term noise and waits for
            stronger confirmations before acting.
          </li>
        </ul>
        Choosing the right speed helps align risk tolerance with trading
        objectives.
      </>
    ),
  },
  6: {
    title: "Strategy Exit Style (Slow, Medium, Fast)",
    content: (
      <>
        Decide how quickly your strategy closes trades:
        <ul className="!list-disc list-outside ml-4 my-3">
          <li>
            Fast: Lower-risk, as it locks in quick profits and minimizes
            exposure to market reversals.
          </li>
          <li>
            Medium: A balanced approach that allows trades to develop while
            managing risk.
          </li>
          <li>
            Slow: Higher-risk, as it keeps trades open longer, aiming for bigger
            gains but increasing exposure to market fluctuations.
          </li>
        </ul>
        Selecting the right exit style helps balance reward potential with risk
        management.
      </>
    ),
  },
  7: {
    title: "Risk Management",
    content: (
      <>
        Set up how your strategy handles risk through stop-losses, position
        sizing, and capital allocation. Proper risk management protects against
        unexpected losses and ensures long-term strategy performance.
      </>
    ),
  },
  8: {
    title: "Signal Ranking Method (Volume, Volatility, Momentum)",
    content: (
      <>
        Choose how signals are prioritized:
        <ul className="!list-disc list-outside ml-4 my-3">
          <li>Volume: Focuses on liquidity, favoring signals with higher trading activity.</li>
          <li>Volatility: Identifies assets with sharp price movements.</li>
          <li>
            Momentum: Prioritizes trends, following assets with sustained
            directional moves.
          </li>
        </ul>
        Selecting the right ranking method refines how signals are evaluated and
        executed.
      </>
    ),
  },
  9: {
    title: "Exchange",
    content: (
      <>
        Select the exchange where your strategy will trade.
        <br />
        Each exchange has different liquidity, fees, and features. Pick the one
        that fits your strategy best for smoother execution and better
        performance.
      </>
    ),
  },
};

const StrategyFaq: FC<StrategyFaqProps> = ({ step }) => {
  const currentStep = steps[step];
  if (!currentStep) return null;

  return (
    <div className="my-8 flex flex-col rounded-xl border border-neutral-700 p-6 bg-neutral-900">
      <div className="text-xl mb-4">{currentStep.title}</div>
      <div className="text-sm text-neutral-400">{currentStep.content}</div>
    </div>
  );
};

export default StrategyFaq;