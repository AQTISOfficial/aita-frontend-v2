export type FormField =
  | "type"
  | "direction"
  | "assets"
  | "timeframe"
  | "signal_detection_entry"
  | "signal_detection_exit"
  | "liquidity_filter"
  | "risk_management"
  | "ranking_method"
  | "exchange";

export type FormChangeEvent =
  | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  | { target: { name: FormField; value: string } };

export type FormChangeHandler = (e: FormChangeEvent) => void;
