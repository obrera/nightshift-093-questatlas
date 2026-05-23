import type { ReactNode } from 'react'

import { Crosshair, KeyRound, ShieldAlert, Sparkles } from 'lucide-react'

import type { QuestRoute } from '@/questatlas/data-access/questatlas-route'

export function QuestAtlasUiMap({ route }: { route: QuestRoute }) {
  const path = route.nodes.map((node) => `${node.x},${node.y}`).join(' ')

  return (
    <div className="relative min-h-[620px] overflow-hidden border border-emerald-200/10 bg-[#0b1714] shadow-2xl shadow-black/30">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(143,240,195,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(143,240,195,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <svg aria-label="Generated dungeon route map" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        <path d="M2 78 C20 58 25 31 47 36 S75 58 98 18" fill="none" stroke="#123d38" strokeWidth="18" />
        <polyline
          fill="none"
          points={path}
          stroke="#f5c86b"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
        {route.nodes.map((node, index) => (
          <g key={`${node.id}-${node.room}`}>
            <circle
              className="drop-shadow-[0_0_10px_rgba(143,240,195,0.45)]"
              cx={node.x}
              cy={node.y}
              fill={index === route.nodes.length - 1 ? '#7f1d1d' : '#102d29'}
              r={2.4 + node.danger / 40}
              stroke={index === route.nodes.length - 1 ? '#f5c86b' : '#8ff0c3'}
              strokeWidth="0.8"
            />
            <text fill="#f8f1d0" fontSize="2.6" textAnchor="middle" x={node.x} y={node.y + 0.9}>
              {node.id}
            </text>
          </g>
        ))}
      </svg>

      <div className="relative z-10 flex h-full min-h-[620px] flex-col justify-between p-4 sm:p-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 border border-amber-200/20 bg-black/30 px-3 py-2 text-xs text-amber-100 uppercase">
            <Crosshair className="size-4" />
            {route.id}
          </div>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold text-emerald-50 md:text-5xl">{route.title}</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MapPanel icon={<ShieldAlert />} label="Hazards" values={route.hazards} />
          <MapPanel icon={<KeyRound />} label="Loadout" values={route.loadout} />
          <MapPanel icon={<Sparkles />} label="Run Class" values={[route.className, route.entry, route.boss]} />
        </div>
      </div>
    </div>
  )
}

function MapPanel({ icon, label, values }: { icon: ReactNode; label: string; values: string[] }) {
  return (
    <div className="border border-emerald-100/10 bg-black/35 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-100">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            className="border border-emerald-100/10 bg-emerald-200/10 px-2 py-1 text-xs text-emerald-50"
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  )
}
