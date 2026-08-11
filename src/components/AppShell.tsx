import type { ReactNode } from 'react'

interface AppShellProps {
  title?: string
  subtitle?: string
  aside?: ReactNode
  children: ReactNode
}

export function AppShell({ title, subtitle, aside, children }: AppShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      {title && (
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </header>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
        {aside && <aside className="flex min-w-0 flex-col gap-5">{aside}</aside>}
      </div>
    </div>
  )
}

type CardTint = 'lilac' | 'sky' | 'mint' | 'peach' | 'blush'

interface CardProps {
  tint?: CardTint
  className?: string
  children: ReactNode
}

export function Card({ tint, className, children }: CardProps) {
  const tintClass = tint ? ` tint-${tint}` : ''
  const extra = className ? ` ${className}` : ''
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-soft${tintClass}${extra}`}>
      {children}
    </div>
  )
}

interface SectionTitleProps {
  action?: ReactNode
  children: ReactNode
}

export function SectionTitle({ action, children }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h3 className="text-base font-bold tracking-tight">{children}</h3>
      {action}
    </div>
  )
}
