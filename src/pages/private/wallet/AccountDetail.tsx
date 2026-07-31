import { useParams } from 'react-router-dom'

export default function AccountDetail() {
  const { currency } = useParams()
  return <h2>Cuenta {currency?.toUpperCase()}</h2>
}
