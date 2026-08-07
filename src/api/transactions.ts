import { createTransaction, setTransactionStatus, getTransactions } from '../mocks/handlers/transactions'
import { adjustBalance } from '../mocks/handlers/balances'
import { getAuthMode } from './auth'
import { getCurrentWallet, getWalletByUserId } from './wallets'
import { getCurrentBalances } from './balances'
import { convertCurrency } from './exchangeRates'
import type { Transaction, TransactionStatus, TransactionType } from '../mocks/data/transactions'

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completada',
  failed: 'Fallida',
  cancelled: 'Cancelada',
  reversed: 'Revertida',
}

async function getCurrentWalletTransactions(): Promise<Transaction[]> {
  if (getAuthMode() !== 'mock') return []
  const wallet = await getCurrentWallet()
  if (!wallet) return []
  const all = await getTransactions()
  return all
    .filter((t) => t.wallet_id === wallet.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const all = await getCurrentWalletTransactions()
  return all.slice(0, limit)
}

export async function getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  const all = await getCurrentWalletTransactions()
  return all.filter((t) => t.type === type)
}

export async function getTransactionsByCurrency(currencyCode: string): Promise<Transaction[]> {
  const all = await getCurrentWalletTransactions()
  return all.filter((t) => t.currency_code === currencyCode)
}

export async function createTransfer(input: {
  recipient: string
  recipientUserId: string
  currencyCode: string
  amount: number
  concept?: string
}): Promise<Transaction> {
  const wallet = await getCurrentWallet()
  if (!wallet) throw new Error('No hay wallet activa')
  if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0')

  const balances = await getCurrentBalances()
  const current = balances.find((b) => b.currency_code === input.currencyCode)
  if (!current) throw new Error('La moneda no tiene saldo')
  if (input.amount > current.amount) throw new Error('Saldo insuficiente')

  const tx = await createTransaction({
    wallet_id: wallet.id,
    currency_code: input.currencyCode,
    type: 'transfer',
    amount: input.amount,
    description: `Transferencia a ${input.recipient}`,
    status: 'pending',
    concept: input.concept,
  })
  await adjustBalance(wallet.id, input.currencyCode, -input.amount)

  const recipientWallet = await getWalletByUserId(input.recipientUserId)
  if (recipientWallet && recipientWallet.status === 'active') {
    await adjustBalance(recipientWallet.id, input.currencyCode, input.amount)
    const recipientTx = await createTransaction({
      wallet_id: recipientWallet.id,
      currency_code: input.currencyCode,
      type: 'transfer',
      amount: input.amount,
      description: 'Transferencia recibida',
      status: 'pending',
    })
    setTimeout(async () => {
      await setTransactionStatus(tx.id, 'completed')
      await setTransactionStatus(recipientTx.id, 'completed')
    }, 1500)
  } else {
    setTimeout(async () => {
      await setTransactionStatus(tx.id, 'completed')
    }, 1500)
  }
  return tx
}

export async function createConversion(input: {
  fromCurrency: string
  toCurrency: string
  amount: number
}): Promise<Transaction> {
  const wallet = await getCurrentWallet()
  if (!wallet) throw new Error('No hay wallet activa')
  if (input.fromCurrency === input.toCurrency) throw new Error('La moneda de origen y destino deben ser distintas')
  if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0')

  const balances = await getCurrentBalances()
  const source = balances.find((b) => b.currency_code === input.fromCurrency)
  if (!source) throw new Error('La moneda de origen no tiene saldo')
  if (input.amount > source.amount) throw new Error('Saldo insuficiente')

  const result = await convertCurrency(input.fromCurrency, input.toCurrency, input.amount)
  if (result <= 0) throw new Error('No se pudo calcular la conversión')

  const tx = await createTransaction({
    wallet_id: wallet.id,
    currency_code: input.toCurrency,
    type: 'conversion',
    amount: result,
    description: `Conversión desde ${input.fromCurrency}`,
    status: 'processing',
  })
  await adjustBalance(wallet.id, input.fromCurrency, -input.amount)
  await adjustBalance(wallet.id, input.toCurrency, result)
  const done = await setTransactionStatus(tx.id, 'completed')
  return done ?? tx
}
