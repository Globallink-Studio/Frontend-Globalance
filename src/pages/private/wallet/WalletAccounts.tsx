import { Link } from 'react-router-dom'

export default function WalletAccounts() {
  return (
    <div>
      <h2>Wallet / Cuentas</h2>
      <nav style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Link to="/dashboard/wallet/accounts/usd">USD</Link>
        <Link to="/dashboard/wallet/accounts/eur">EUR</Link>
        <Link to="/dashboard/wallet/accounts/ars">ARS</Link>
      </nav>
    </div>
  )
}
