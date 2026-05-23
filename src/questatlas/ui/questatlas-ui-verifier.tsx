import type { ReactNode } from 'react'

import { BadgeCheck, CircleAlert, Fingerprint, Loader2, WalletCards } from 'lucide-react'

import type { MintQuestAtlasPassResult } from '@/questatlas/data-access/execute-mint-questatlas-pass'

import { Button } from '@/core/ui/button'
import { decodeMetadataUri, getRouteHash, type QuestRoute } from '@/questatlas/data-access/questatlas-route'

export function QuestAtlasUiVerifier({
  error,
  isMinting,
  mintQuestAtlasPass,
  owner,
  result,
  route,
  routeReadiness,
  signatureLink,
}: {
  error: null | string
  isMinting: boolean
  mintQuestAtlasPass: () => Promise<void>
  owner: string
  result?: MintQuestAtlasPassResult
  route: QuestRoute
  routeReadiness: string
  signatureLink: ReactNode
}) {
  const decoded = result ? decodeMetadataUri(result.uri) : null
  const routeHash = getRouteHash(route)
  const payloadMatches = decoded?.properties.route.id === route.id && result?.routeHash === routeHash

  return (
    <section className="border border-amber-200/20 bg-[#15170b] p-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-50">
        <WalletCards className="size-5 text-amber-200" />
        Wallet-Signed Mint
      </h2>

      <div className="grid gap-3 text-sm">
        <StatusLine icon={<Fingerprint />} label="Connected holder" value={shorten(owner)} />
        <StatusLine icon={<BadgeCheck />} label="Route hash" value={routeHash} />
        <StatusLine icon={<CircleAlert />} label="Operator gate" value={routeReadiness} />
      </div>

      <Button
        className="mt-4 w-full bg-amber-300 text-stone-950 hover:bg-amber-200"
        disabled={isMinting}
        onClick={() => void mintQuestAtlasPass()}
      >
        {isMinting ? <Loader2 className="animate-spin" /> : <WalletCards />}
        Mint MPL Core Quest Atlas Pass
      </Button>

      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}

      {result ? (
        <div className="mt-4 grid gap-2 border border-emerald-200/10 bg-black/25 p-3 text-sm">
          <StatusLine icon={<BadgeCheck />} label="Asset" value={shorten(result.assetAddress)} />
          <StatusLine icon={<BadgeCheck />} label="Owner verified" value={result.verified ? 'yes' : 'no'} />
          <StatusLine icon={<BadgeCheck />} label="Payload verified" value={payloadMatches ? 'yes' : 'no'} />
          <div className="text-amber-100">{signatureLink}</div>
        </div>
      ) : null}
    </section>
  )
}

function shorten(value: string) {
  if (value.length <= 14) {
    return value
  }

  return `${value.slice(0, 6)}...${value.slice(-6)}`
}

function StatusLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border border-white/5 bg-black/20 px-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-emerald-100/65">
        {icon}
        {label}
      </span>
      <span className="truncate font-mono text-emerald-50">{value}</span>
    </div>
  )
}
