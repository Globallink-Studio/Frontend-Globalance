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

export interface ChartPoint {
  month: string;
  ingresos: number;
  gastos: number;
  saldo: number;
}

export interface DashboardMock {
  metrics: Metric[];
  balances: WalletBalance[];
  chart: ChartPoint[];
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
    { month: "Ene", ingresos: 2800, gastos: 1900, saldo: 10500 },
    { month: "Feb", ingresos: 3200, gastos: 2100, saldo: 11600 },
    { month: "Mar", ingresos: 2900, gastos: 2300, saldo: 12200 },
    { month: "Abr", ingresos: 4100, gastos: 2500, saldo: 13800 },
    { month: "May", ingresos: 3600, gastos: 2600, saldo: 14800 },
    { month: "Jun", ingresos: 4700, gastos: 2800, saldo: 16700 },
    { month: "Jul", ingresos: 3840, gastos: 3000, saldo: 17540 },
  ],
  aiSummary:
    "Tu saldo creció un 12% este mes. Estás gastando 18% menos en transferencias y el ahorro en BTC va bien encaminado.",
};
