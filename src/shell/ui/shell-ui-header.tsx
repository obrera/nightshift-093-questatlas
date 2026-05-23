import { Link, NavLink } from 'react-router'

import { cn } from '@/core/util/utils'
import { SolanaUiClusterDropdown } from '@/solana/ui/solana-ui-cluster-dropdown'
import { SolanaUiWalletDialog } from '@/solana/ui/solana-ui-wallet-dialog'

export interface HeaderLink {
  label: string
  to: string
}
export function ShellUiHeader({ links }: { links: HeaderLink[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-cyan-200/10 bg-[#07100f]/90 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
          <Link className="font-heading text-xl font-semibold text-emerald-100" to="/">
            QuestAtlas
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-4">
            {links.map((link) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'border-b-2 border-transparent px-1 py-2 text-sm font-medium transition-colors',
                    isActive ? 'border-amber-300 text-amber-100' : 'text-emerald-100/60 hover:text-emerald-50',
                  )
                }
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SolanaUiWalletDialog />
          <SolanaUiClusterDropdown />
        </div>
      </div>
    </header>
  )
}
