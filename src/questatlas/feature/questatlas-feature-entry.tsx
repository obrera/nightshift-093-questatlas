import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  buildQuestRoute,
  buildQuestRouteFromParams,
  getRouteReadiness,
  parseQuestRouteParams,
} from '@/questatlas/data-access/questatlas-route'
import { QuestAtlasFeatureMint } from '@/questatlas/feature/questatlas-feature-mint'
import { QuestAtlasUiBuilder } from '@/questatlas/ui/questatlas-ui-builder'
import { QuestAtlasUiMap } from '@/questatlas/ui/questatlas-ui-map'
import { QuestAtlasUiMetadata } from '@/questatlas/ui/questatlas-ui-metadata'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { SolanaUiWalletGuard } from '@/solana/ui/solana-ui-wallet-guard'

export function Component() {
  return <QuestAtlasFeatureEntry />
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-emerald-200/10 bg-emerald-200/5 px-3 py-2">
      <div className="text-[10px] text-emerald-100/50 uppercase">{label}</div>
      <div className="text-lg font-semibold text-amber-100">{value}</div>
    </div>
  )
}

function QuestAtlasFeatureEntry() {
  const [searchParams] = useSearchParams()
  const initialRouteParams = useMemo(() => parseQuestRouteParams(searchParams), [searchParams])
  const [seed, setSeed] = useState(initialRouteParams?.s ?? 'run-093')
  const [difficulty, setDifficulty] = useState(initialRouteParams?.d ?? 7)
  const [operatorBias, setOperatorBias] = useState(initialRouteParams?.b ?? 42)
  const [usesCompactSeed, setUsesCompactSeed] = useState(Boolean(initialRouteParams))
  const route = useMemo(() => {
    if (usesCompactSeed) {
      return buildQuestRouteFromParams({ b: operatorBias, d: difficulty, s: seed })
    }

    return buildQuestRoute(seed, difficulty, operatorBias)
  }, [difficulty, operatorBias, seed, usesCompactSeed])
  const readiness = useMemo(() => getRouteReadiness(route), [route])
  const client = useSolanaClient()

  return (
    <div className="min-h-full bg-[#07100f] text-emerald-50">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold text-amber-200/70 uppercase">MPL Core route passport</p>
              <h1 className="mt-1 text-3xl font-semibold text-emerald-50 md:text-5xl">QuestAtlas</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric label="Danger" value={readiness.danger} />
              <Metric label="Reward" value={readiness.reward} />
              <Metric label="Gate" value={readiness.gate} />
            </div>
          </div>
          <QuestAtlasUiMap route={route} />
        </section>

        <aside className="grid min-w-0 content-start gap-4">
          <QuestAtlasUiBuilder
            difficulty={difficulty}
            operatorBias={operatorBias}
            route={route}
            seed={seed}
            setDifficulty={setDifficulty}
            setOperatorBias={setOperatorBias}
            setSeed={(value) => {
              setUsesCompactSeed(false)
              setSeed(value)
            }}
          />
          <QuestAtlasUiMetadata route={route} />
          <SolanaUiWalletGuard
            render={({ account }) => (
              <QuestAtlasFeatureMint account={account} client={client} route={route} routeReadiness={readiness.gate} />
            )}
          />
        </aside>
      </div>
    </div>
  )
}
