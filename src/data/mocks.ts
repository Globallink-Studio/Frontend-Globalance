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

export interface PreviewCurrency {
  code: string;
  name: string;
  amount: number;
  ratio: number;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface LandingMock {
  totalBalance: string;
  currencies: PreviewCurrency[];
  stats: Stat[];
  features: Feature[];
}

export const landingMock: LandingMock = {
  totalBalance: "USD 12.480,50",
  currencies: [
    { code: "USD", name: "Dólar estadounidense", amount: 5240.5, ratio: 85 },
    { code: "EUR", name: "Euro", amount: 3120.75, ratio: 60 },
    { code: "ARS", name: "Peso argentino", amount: 185000, ratio: 40 },
  ],
  stats: [
    { value: "3+", label: "Monedas soportadas" },
    { value: "0,2%", label: "Costo de conversión" },
    { value: "12k", label: "Usuarios activos" },
  ],
  features: [
    {
      title: "Multi-moneda",
      description: "Gestioná USD, EUR, BTC y más desde una sola billetera, sin cuentas separadas.",
    },
    {
      title: "Compra y venta",
      description: "Comprá o vendé monedas usando otra de tu balance, con tasas de cambio reales.",
    },
    {
      title: "Intercambio",
      description: "Convertí de una moneda a otra dentro de tu misma cuenta al instante.",
    },
  ],
};

export const dashboardMock: DashboardMock = {
  metrics: [
    { label: "Saldo Total", amount: 12480.5, currency: "USD", change: 12.5 },
    { label: "Ingresos del mes", amount: 3840.25, currency: "USD", change: 8.2 },
    { label: "Gastos del mes", amount: 2150.75, currency: "USD", change: -3.4 },
  ],
  balances: [
    { currency: "USD", name: "Dólar", amount: 5240.5, usdValue: 5240.5 },
    { currency: "EUR", name: "Euro", amount: 3120.75, usdValue: 3380.2 },
    { currency: "ARS", name: "Peso argentino", amount: 185000, usdValue: 151 },
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
