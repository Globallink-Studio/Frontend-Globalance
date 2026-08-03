export interface Metric {
  label: string;
  amount: number;
  currency: string;
  change: number;
}

export interface WalletBalance {
  currency: string;
  name: string;
  amount: number;
  usdValue: number;
}

export interface ChartBar {
  month: string;
  income: number;
}

export interface DashboardMock {
  metrics: Metric[];
  balances: WalletBalance[];
  chart: ChartBar[];
  aiSummary: string;
}

export const dashboardMock: DashboardMock = {
  metrics: [
    { label: "Saldo Total", amount: 12480.5, currency: "USD", change: 12.5 },
    { label: "Ingresos del mes", amount: 3840.25, currency: "USD", change: 8.2 },
    { label: "Gastos del mes", amount: 2150.75, currency: "USD", change: -3.4 },
  ],
  balances: [
    { currency: "USD", name: "Dólar", amount: 5240.5, usdValue: 5240.5 },
    { currency: "EUR", name: "Euro", amount: 3120.75, usdValue: 3380.2 },
    { currency: "BTC", name: "Bitcoin", amount: 0.42, usdValue: 4128.6 },
    { currency: "ETH", name: "Ethereum", amount: 1.85, usdValue: 6150.8 },
  ],
  chart: [
    { month: "Ene", income: 2800 },
    { month: "Feb", income: 3200 },
    { month: "Mar", income: 2900 },
    { month: "Abr", income: 4100 },
    { month: "May", income: 3600 },
    { month: "Jun", income: 4700 },
    { month: "Jul", income: 3840 },
  ],
  aiSummary:
    "Tu saldo creció un 12% este mes. Estás gastando 18% menos en transferencias y el ahorro en BTC va bien encaminado.",
};
