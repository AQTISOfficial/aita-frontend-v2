type KeyLabels = {
  [key: string]: string;
};

type ValueLabels = {
  [key: string]: {
    [value: string]: string;
  };
};

type ValueColorClasses = {
  [key: string]: {
    [value: string]: string;
  };
};

export const keyLabels: KeyLabels = {
  type: "Strategy",
  direction: "Market Bias",
  assets: "Token",
  timeframe: "Timeframe",
  signal_detection_entry: "Signal Detection Speed",
  signal_detection_exit: "Strategy Exit Style",
  liquidity_filter: "Liquidity Filter",
  risk_management: "Risk Management",
  ranking_method: "Signal Ranking Method",
  exchange: "Exchange"
};

export const valueLabels: ValueLabels = {
  type: {
    momentum: "Momentum",
    trend: "Trend Following",
    breakout: "Breakout Strategy"
  },
  direction: {
    longonly: "Bullish",
    shortonly: "Bearish",
    both: "Both"
  },
  timeframe: {
    "1d": "1D",
    "1h": "1H",
    "4h": "4H",
    "1w": "1W"
  },
  signal_detection_entry: {
    fast: "Fast Entry",
    slow: "Slow Entry",
    medium: "Medium Entry"
  },
  signal_detection_exit: {
    fast: "Fast Signal Detection",
    slow: "Slow Signal Detection",
    medium: "Medium Signal Detection"
  },
  liquidity_filter: {
    top100: "Top 100",
    top50: "Top 50",
    top10: "Top 10",
    no: "No Liquidity"
  },
  risk_management: {
    Aggressive: "Aggressive Risk Management",
    Medium: "Medium Risk Management",
    Conservative: "Conservative Risk Management"
  },
  ranking_method: {
    momentum: "Momentum Signal Ranking",
    volatility: "Volatility Signal Ranking",
    volume: "Volume Signal Ranking"
  }
};

export const valueColorClasses: ValueColorClasses = {
  direction: {
    longonly: "text-teal-500",
    shortonly: "text-red-400",
    both: "text-neutral-400"
  },
  signal_detection_entry: {
    fast: "text-teal-500",
    slow: "text-red-400",
    medium: "text-neutral-500"
  },
  signal_detection_exit: {
    fast: "text-teal-500",
    slow: "text-red-400",
    medium: "text-neutral-500"
  },
  risk_management: {
    Aggressive: "text-red-400",
    Medium: "text-neutral-500",
    Conservative: "text-teal-500"
  }
};