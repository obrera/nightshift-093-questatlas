import type { ReactNode } from 'react'

import { Dice5, Gauge, Route, SlidersHorizontal } from 'lucide-react'

import type { QuestRoute } from '@/questatlas/data-access/questatlas-route'

import { Button } from '@/core/ui/button'
import { Input } from '@/core/ui/input'
import { Slider } from '@/core/ui/slider'

export function QuestAtlasUiBuilder({
  difficulty,
  operatorBias,
  route,
  seed,
  setDifficulty,
  setOperatorBias,
  setSeed,
}: {
  difficulty: number
  operatorBias: number
  route: QuestRoute
  seed: string
  setDifficulty: (value: number) => void
  setOperatorBias: (value: number) => void
  setSeed: (value: string) => void
}) {
  return (
    <section className="border border-emerald-200/10 bg-[#0b1714] p-4 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-50">
            <Route className="size-5 text-amber-200" />
            Route Builder
          </h2>
          <p className="text-sm text-emerald-100/55">{route.title}</p>
        </div>
        <Button
          onClick={() =>
            setSeed(
              `run-${Math.floor(Math.random() * 9999)
                .toString()
                .padStart(4, '0')}`,
            )
          }
          size="icon"
          title="Roll route seed"
          variant="secondary"
        >
          <Dice5 />
        </Button>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="text-emerald-100/70">Run seed</span>
          <Input
            className="border-emerald-200/10 bg-black/20 text-emerald-50"
            onChange={(event) => setSeed(event.target.value)}
            value={seed}
          />
        </label>

        <TuningRow
          icon={<Gauge className="size-4" />}
          label="Dungeon difficulty"
          setValue={setDifficulty}
          value={difficulty}
        />
        <TuningRow
          icon={<SlidersHorizontal className="size-4" />}
          label="Operator encounter pressure"
          setValue={setOperatorBias}
          value={operatorBias}
        />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <RoutePill label="Entry" value={route.entry} />
          <RoutePill label="Boss" value={route.boss} />
          <RoutePill label="Class" value={route.className} />
          <RoutePill label="Rooms" value={route.nodes.length.toString()} />
        </div>
      </div>
    </section>
  )
}

function RoutePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-emerald-200/10 bg-emerald-300/5 p-3">
      <div className="text-[10px] text-emerald-100/45 uppercase">{label}</div>
      <div className="truncate text-sm font-medium text-emerald-50">{value}</div>
    </div>
  )
}

function TuningRow({
  icon,
  label,
  setValue,
  value,
}: {
  icon: ReactNode
  label: string
  setValue: (value: number) => void
  value: number
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm text-emerald-100/70">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="font-mono text-amber-100">{value}</span>
      </div>
      <Slider
        max={100}
        min={1}
        onValueChange={(nextValue) => setValue(Array.isArray(nextValue) ? (nextValue[0] ?? value) : nextValue)}
        step={1}
        value={[value]}
      />
    </div>
  )
}
