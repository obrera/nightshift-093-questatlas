import { FileJson2 } from 'lucide-react'

import { createQuestAtlasMetadata, getRouteHash, type QuestRoute } from '@/questatlas/data-access/questatlas-route'

export function QuestAtlasUiMetadata({ route }: { route: QuestRoute }) {
  const metadata = createQuestAtlasMetadata(route, 'connected-wallet')
  const preview = JSON.stringify(
    {
      attributes: metadata.attributes.slice(0, 6),
      name: metadata.name,
      routeHash: getRouteHash(route),
      symbol: metadata.symbol,
    },
    null,
    2,
  )

  return (
    <section className="border border-emerald-200/10 bg-[#0b1714] p-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-50">
        <FileJson2 className="size-5 text-amber-200" />
        Metadata Preview
      </h2>
      <pre className="max-h-56 overflow-auto border border-black/30 bg-black/30 p-3 text-xs leading-relaxed text-emerald-100/80">
        {preview}
      </pre>
    </section>
  )
}
