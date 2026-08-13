import { createTransaction, setTransactionStatus, getTransactions } from '../mocks/handlers/transactions'
import { adjustBalance } from '../mocks/handlers/balances'
import { getAuthMode } from './auth'
import { getCurrentWallet, getWalletByUserId } from './wallets'
import { getCurrentBalances } from './balances'
import { convertCurrency } from './exchangeRates'
import { fetchApi } from './fetchApi'
import { notifyCurrentUser, notifyUser } from './notifications'
import { DepositLimitError } from './errors'
import { DEPOSIT_LIMITS, formatDepositLimit } from './limits'
import type { Transaction, TransactionStatus, TransactionType } from '../mocks/data/transactions'

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completada',
  failed: 'Fallida',
  cancelled: 'Cancelada',
  reversed: 'Revertida',
}

interface ApiTransactionMovement {
  direction: 'debit' | 'credit'
  concept: 'principal' | 'fee'
  currency: string
  amount: string
  balance_before: string
  balance_after: string
  created_at: string
}

interface ApiTransaction {
  id: string
  type: 'income' | 'purchase' | 'sale' | 'conversion' | 'transfer'
  status: string
  description: string | null
  created_at: string
  completed_at: string | null
  source_currency: string | null
  target_currency: string | null
  applied_rate: string | null
  rate_provider: string | null
  rate_fetched_at: string | null
  destination_wallet_id: string | null
  recipient_name: string | null
  funding_method: string | null
  movements: ApiTransactionMovement[]
}

interface ApiTransactionsResponse {
  transactions: ApiTransaction[]
  pagination: { limit: number; offset: number; returned: number }
}

function apiTypeToLocal(type: ApiTransaction['type']): TransactionType {
  switch (type) {
    case 'income':
      return 'deposit'
    case 'purchase':
    case 'sale':
    case 'conversion':
      return 'conversion'
    case 'transfer':
      return 'transfer'
  }
}

function mapApiTransaction(tx: ApiTransaction, currentWalletId?: string): Transaction {
  const principal =
    tx.movements.find((m) => m.concept === 'principal' && m.direction === 'credit') ??
    tx.movements.find((m) => m.concept === 'principal') ??
    tx.movements.find((m) => m.direction === 'credit') ??
    tx.movements[0]
  let direction: 'in' | 'out' | undefined
  if (tx.type === 'transfer') {
    direction = Boolean(currentWalletId) && tx.destination_wallet_id === currentWalletId ? 'in' : 'out'
  } else if (tx.type === 'income') {
    direction = 'in'
  } else {
    direction = principal ? (principal.direction === 'debit' ? 'out' : 'in') : undefined
  }
  return {
    id: tx.id,
    wallet_id: '',
    currency_code: principal?.currency ?? tx.target_currency ?? tx.source_currency ?? '',
    type: apiTypeToLocal(tx.type),
    amount: principal ? Number(principal.amount) : 0,
    description: tx.description ?? '',
    status: tx.status as TransactionStatus,
    created_at: tx.created_at,
    from_currency: tx.source_currency ?? undefined,
    to_currency: tx.target_currency ?? undefined,
    direction,
  }
}

async function getCurrentWalletId(): Promise<string | undefined> {
  const wallet = await getCurrentWallet()
  return wallet?.id
}

async function getCurrentWalletTransactions(): Promise<Transaction[]> {
  if (getAuthMode() === 'mock') {
    const wallet = await getCurrentWallet()
    if (!wallet) return []
    const all = await getTransactions()
    return all
      .filter((t) => t.wallet_id === wallet.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
  const [walletId, resp] = await Promise.all([
    getCurrentWalletId(),
    fetchApi<ApiTransactionsResponse>('/transactions?limit=100'),
  ])
  return resp.transactions.map((t) => mapApiTransaction(t, walletId))
}

export async function getCurrentTransactions(): Promise<Transaction[]> {
  return getCurrentWalletTransactions()
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  if (getAuthMode() === 'mock') {
    const all = await getCurrentWalletTransactions()
    return all.slice(0, limit)
  }
  const safeLimit = Math.min(Math.max(limit, 1), 100)
  const [walletId, resp] = await Promise.all([
    getCurrentWalletId(),
    fetchApi<ApiTransactionsResponse>(`/transactions?limit=${safeLimit}`),
  ])
  return resp.transactions.map((t) => mapApiTransaction(t, walletId))
}

export async function getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  if (getAuthMode() === 'mock') {
    const all = await getCurrentWalletTransactions()
    return all.filter((t) => t.type === type)
  }
  const all = await getCurrentTransactions()
  return all.filter((t) => t.type === type)
}

export async function getTransactionsByCurrency(currencyCode: string): Promise<Transaction[]> {
  if (getAuthMode() === 'mock') {
    const all = await getCurrentWalletTransactions()
    return all.filter((t) => t.currency_code === currencyCode)
  }
  const all = await getCurrentTransactions()
  return all.filter((t) => t.currency_code === currencyCode)
}

export async function createTransfer(input: {
  recipient: string
  recipientUserId: string
  currencyCode: string
  amount: number
  concept?: string
  destinationAlias?: string
  destinationType?: 'alias' | 'accountNumber'
}): Promise<Transaction> {
  if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0')

  if (getAuthMode() === 'firebase') {
    if (!input.destinationAlias) throw new Error('Se necesita el alias del destinatario')
    const resp = await fetchApi<ApiTransferResponse>('/transactions/transfers/internal', {
      method: 'POST',
      body: {
        currency: input.currencyCode,
        amount: String(input.amount),
        destinationType: input.destinationType ?? 'alias',
        destinationValue: input.destinationAlias,
      },
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    const tx = resp.transaction
    const wallet = await getCurrentWallet()
    await notifyCurrentUser(
      'Transferencia enviada',
      `Enviaste ${input.amount} ${input.currencyCode} a ${tx.destination_alias}.`,
      'transfer',
      '/dashboard/transactions',
    )
    return {
      id: tx.transaction_id,
      wallet_id: wallet?.id ?? '',
      currency_code: tx.currency,
      type: 'transfer',
      amount: Number(tx.amount),
      description: `Transferencia a ${tx.destination_alias}`,
      status: tx.status as TransactionStatus,
      created_at: tx.created_at,
      direction: 'out',
    }
  }

  const wallet = await getCurrentWallet()
  if (!wallet) throw new Error('No hay billetera activa')
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
    direction: 'out',
  })
  await adjustBalance(wallet.id, input.currencyCode, -input.amount)
  await notifyCurrentUser(
    'Transferencia enviada',
    `Enviaste ${input.amount} ${input.currencyCode} a ${input.recipient}.`,
    'transfer',
    '/dashboard/transactions',
  )

  const recipientWallet = await getWalletByUserId(input.recipientUserId)
  if (recipientWallet && recipientWallet.status === 'active') {
    await adjustBalance(recipientWallet.id, input.currencyCode, input.amount)
    const recipientTx = await createTransaction({
      wallet_id: recipientWallet.id,
      currency_code: input.currencyCode,
      type: 'transfer',
      amount: input.amount,
      description: `Transferencia recibida de ${wallet.alias}`,
      status: 'pending',
      direction: 'in',
    })
    await notifyUser(
      input.recipientUserId,
      'Transferencia recibida',
      `Recibiste ${input.amount} ${input.currencyCode} de ${wallet.alias}.`,
      'transfer',
      '/dashboard/transactions',
    )
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

export async function createDeposit(input: {
  currencyCode: string
  amount: number
  methodName?: string
}): Promise<Transaction> {
  if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0')
  const depositLimit = DEPOSIT_LIMITS[input.currencyCode]
  if (depositLimit !== undefined && input.amount > depositLimit) {
    throw new DepositLimitError(
      `Estás excediendo el límite máximo de dinero de esta moneda, el cual es ${formatDepositLimit(input.currencyCode)}`,
    )
  }

  if (getAuthMode() === 'firebase') {
    const resp = await fetchApi<ApiIncomeResponse>('/transactions/income', {
      method: 'POST',
      body: {
        currency: input.currencyCode,
        amount: String(input.amount),
      },
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    const tx = resp.transaction
    const wallet = await getCurrentWallet()
    await notifyCurrentUser(
      'Depósito acreditado',
      `Tu depósito de ${input.amount} ${input.currencyCode} fue acreditado en tu cuenta.`,
      'deposit',
      '/dashboard/transactions',
    )
    return {
      id: tx.transaction_id,
      wallet_id: wallet?.id ?? '',
      currency_code: tx.currency,
      type: 'deposit',
      amount: Number(tx.amount),
      description: input.methodName ? `Depósito desde ${input.methodName}` : 'Depósito de dinero',
      status: tx.status as TransactionStatus,
      created_at: tx.created_at,
    }
  }

  const wallet = await getCurrentWallet()
  if (!wallet) throw new Error('No hay billetera activa')
  if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0')

  const tx = await createTransaction({
    wallet_id: wallet.id,
    currency_code: input.currencyCode,
    type: 'deposit',
    amount: input.amount,
    description: input.methodName ? `Depósito desde ${input.methodName}` : 'Depósito de dinero',
    status: 'completed',
  })
  await adjustBalance(wallet.id, input.currencyCode, input.amount)
  await notifyCurrentUser(
    'Depósito acreditado',
    `Tu depósito de ${input.amount} ${input.currencyCode} fue acreditado en tu cuenta.`,
    'deposit',
    '/dashboard/transactions',
  )
  return tx
}

export async function createMoneyRequest(input: {
  recipient: string
  recipientUserId: string
  currencyCode: string
  amount: number
  concept?: string
  payerEmail?: string
  payerAlias?: string
  payerAccountNumber?: string
}): Promise<Transaction> {
  if (!input.recipient) throw new Error('Indica a quién quieres cobrarle')
  if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0')

  if (getAuthMode() === 'firebase') {
    const hasPayer = Boolean(input.payerEmail || input.payerAlias || input.payerAccountNumber)
    if (!hasPayer) throw new Error('Se necesita el correo, alias o número de cuenta del pagador')
    const resp = await fetchApi<ApiPaymentRequestResponse>('/payment-requests', {
      method: 'POST',
      body: {
        ...(input.payerEmail ? { payerEmail: input.payerEmail } : {}),
        ...(input.payerAlias ? { payerAlias: input.payerAlias } : {}),
        ...(input.payerAccountNumber ? { payerAccountNumber: input.payerAccountNumber } : {}),
        currency: input.currencyCode,
        amount: String(input.amount),
      },
    })
    const pr = resp.paymentRequest
    await notifyCurrentUser(
      'Solicitud de dinero enviada',
      `Solicitaste ${input.amount} ${input.currencyCode} a ${pr.payer_email}.`,
      'request',
      '/dashboard/transactions',
    )
    return {
      id: pr.id,
      wallet_id: '',
      currency_code: pr.currency_code,
      type: 'request',
      amount: Number(pr.amount),
      description: `Solicitud de cobro a ${pr.payer_email}`,
      status: pr.status as TransactionStatus,
      created_at: pr.created_at,
    }
  }

  const wallet = await getCurrentWallet()
  if (!wallet) throw new Error('No hay billetera activa')

  const tx = await createTransaction({
    wallet_id: wallet.id,
    currency_code: input.currencyCode,
    type: 'request',
    amount: input.amount,
    description: `Solicitud de cobro a ${input.recipient}`,
    status: 'pending',
    concept: input.concept,
  })
  await notifyCurrentUser(
    'Solicitud de dinero enviada',
    `Solicitaste ${input.amount} ${input.currencyCode} a ${input.recipient}.`,
    'request',
    '/dashboard/transactions',
  )
  return tx
}

interface ApiIncomeTransaction {
  transaction_id: string
  status: string
  currency: string
  amount: string
  balance_before: string
  balance_after: string
  created_at: string
}

interface ApiIncomeResponse {
  message: string
  transaction: ApiIncomeTransaction
}

interface ApiTransferTransaction {
  transaction_id: string
  status: string
  destination_wallet_id: string
  destination_alias: string
  currency: string
  amount: string
  source_balance_after: string
  destination_balance_after: string
  created_at: string
}

interface ApiTransferResponse {
  message: string
  transaction: ApiTransferTransaction
}

interface ApiPaymentRequest {
  id: string
  payment_token: string
  requester_user_id: string
  payer_user_id: string
  payer_email: string
  currency_code: string
  amount: string
  status: string
  paid_transaction_id: string | null
  created_at: string
  updated_at: string
  expires_at: string
  paid_at: string | null
  cancelled_at: string | null
  requester_email?: string
}

interface ApiPaymentRequestResponse {
  message: string
  paymentRequest: ApiPaymentRequest
}

interface ApiExchangeTransaction {
  transaction_id: string
  type: 'purchase' | 'sale' | 'conversion'
  status: string
  description: string | null
  created_at: string
  completed_at: string | null
  source_currency: string
  target_currency: string
  source_amount: string
  target_amount: string
  applied_rate: string
  rate_provider: string
  rate_fetched_at: string
  source_balance_after: string
  target_balance_after: string
}

interface ApiExchangeResponse {
  message: string
  transaction: ApiExchangeTransaction
}

export async function createConversion(input: {
  fromCurrency: string
  toCurrency: string
  amount: number
}): Promise<Transaction> {
  if (input.fromCurrency === input.toCurrency) throw new Error('La moneda de origen y destino deben ser distintas')
  if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0')

  if (getAuthMode() === 'firebase') {
    const resp = await fetchApi<ApiExchangeResponse>('/transactions/exchange', {
      method: 'POST',
      body: {
        sourceCurrency: input.fromCurrency,
        targetCurrency: input.toCurrency,
        sourceAmount: String(input.amount),
      },
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    const tx = resp.transaction
    const wallet = await getCurrentWallet()
    await notifyCurrentUser(
      'Conversión completada',
      `Convertiste ${input.amount} ${input.fromCurrency} a ${tx.target_amount} ${input.toCurrency}.`,
      'conversion',
      '/dashboard/transactions',
    )
    return {
      id: tx.transaction_id,
      wallet_id: wallet?.id ?? '',
      currency_code: tx.target_currency,
      type: 'conversion',
      amount: Number(tx.target_amount),
      description: tx.description ?? `Conversión desde ${tx.source_currency}`,
      status: tx.status as TransactionStatus,
      created_at: tx.created_at,
      from_currency: tx.source_currency,
      to_currency: tx.target_currency,
    }
  }

  const wallet = await getCurrentWallet()
  if (!wallet) throw new Error('No hay billetera activa')

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
    from_currency: input.fromCurrency,
    to_currency: input.toCurrency,
  })
  await adjustBalance(wallet.id, input.fromCurrency, -input.amount)
  await adjustBalance(wallet.id, input.toCurrency, result)
  const done = await setTransactionStatus(tx.id, 'completed')
  await notifyCurrentUser(
    'Conversión completada',
    `Convertiste ${input.amount} ${input.fromCurrency} a ${result.toFixed(2)} ${input.toCurrency}.`,
    'conversion',
    '/dashboard/transactions',
  )
  return done ?? tx
}
