export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <div className="space-y-3">
        <button
          type="button"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted"
        >
          Cambiar contraseña
        </button>
        <button
          type="button"
          className="w-full rounded-2xl border border-destructive/30 bg-card px-4 py-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Eliminar cuenta
        </button>
      </div>
    </div>
  )
}
