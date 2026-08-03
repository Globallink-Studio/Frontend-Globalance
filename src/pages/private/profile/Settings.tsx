export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <div className="space-y-3">
        <button
          type="button"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium hover:bg-gray-50"
        >
          Cambiar contraseña
        </button>
        <button
          type="button"
          className="w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Eliminar cuenta
        </button>
      </div>
    </div>
  )
}
