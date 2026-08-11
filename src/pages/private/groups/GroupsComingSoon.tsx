import { Plus, Users, Sparkles, Clock } from 'lucide-react'
import { AppShell, Card, SectionTitle } from '../../../components/AppShell'

const miembros: Array<[string, string, string, boolean]> = [
  ['Lucía M.', 'LM', '+ US$ 320,00', true],
  ['Diego R.', 'DR', '− US$ 145,00', false],
  ['Sara P.', 'SP', '− US$ 175,00', false],
]

const gastos: Array<[string, string, string, string]> = [
  ['Servidor y dominio', 'Lucía pagó', 'US$ 240,00', '3 personas'],
  ['Licencia Figma Org', 'Sara pagó', 'US$ 135,00', '3 personas'],
  ['Coworking julio', 'Diego pagó', 'US$ 180,00', '2 personas'],
  ['Publicidad campaña', 'Lucía pagó', 'US$ 420,00', '3 personas'],
]

function ComingSoonOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 grid place-items-center px-4 lg:left-[15.5rem]">
      <div className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl glass lift p-8 text-center shadow-soft">
        <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 [background:radial-gradient(120%_120%_at_50%_0%,color-mix(in_oklab,var(--pastel-lilac)_55%,transparent),transparent_60%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <span className="relative grid size-16 place-items-center rounded-2xl iridescent shadow-soft">
            <Users className="size-7 on-iridescent" />
            <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full glass">
              <Clock className="size-3.5 text-primary" />
            </span>
          </span>
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> En desarrollo
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Próximamente</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              El modo grupal te permitirá dividir gastos, liquidar deudas y gestionar proyectos
              compartidos con otros freelancers. ¡Estamos puliendo los últimos detalles!
            </p>
          </div>
          <div className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-center">
            <p className="text-sm font-medium">Crear y administrar grupos</p>
            <p className="truncate text-xs text-muted-foreground">
              Resumen, participantes, balances e historial
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-xl btn-iridescent py-2.5 text-sm font-semibold"
          >
            Avísame cuando esté listo
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GroupsComingSoon() {
  return (
    <AppShell
      aside={
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm opacity-60">
            <Card tint="blush">
              <SectionTitle>Balance del grupo</SectionTitle>
              <ul className="space-y-3">
                {miembros.map(([n, ini, saldo, positivo]) => (
                  <li key={n} className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full iridescent text-xs font-bold shadow-soft">
                      {ini}
                    </span>
                    <span className="flex-1 text-sm">{n}</span>
                    <span
                      className={`text-sm font-semibold ${positivo ? 'text-[color:var(--success)]' : 'text-muted-foreground'}`}
                    >
                      {saldo}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-xl btn-iridescent py-2.5 text-sm font-semibold">
                Liquidar saldos
              </button>
            </Card>
            <Card tint="sky">
              <SectionTitle>Otros grupos</SectionTitle>
              <ul className="space-y-2 text-sm">
                {['Viaje conferencia Berlín', 'Cliente compartido — Vela', 'Oficina Buenos Aires'].map(
                  (g) => (
                    <li key={g} className="rounded-xl border border-border bg-surface px-3 py-2.5">
                      {g}
                    </li>
                  ),
                )}
              </ul>
            </Card>
          </div>
        </div>
      }
    >
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-60">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl iridescent shadow-soft">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Estudio Nómade</p>
                  <p className="text-sm text-muted-foreground">3 miembros · 12 gastos este mes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Gasto total</p>
                <p className="text-2xl font-semibold tracking-tight">US$ 975,00</p>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle
              action={
                <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs">
                  <Plus className="size-3" /> Añadir gasto
                </button>
              }
            >
              Gastos compartidos
            </SectionTitle>
            <ul className="divide-y divide-border">
              {gastos.map(([concepto, quien, monto, split]) => (
                <li key={concepto} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{concepto}</p>
                    <p className="text-xs text-muted-foreground">{quien}</p>
                  </div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    {split}
                  </span>
                  <span className="text-sm font-semibold">{monto}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <ComingSoonOverlay />
      </div>
    </AppShell>
  )
}
