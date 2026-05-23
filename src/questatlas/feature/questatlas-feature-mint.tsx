import type { UiWalletAccount } from '@wallet-ui/react'
import type { ExplorerPath } from '@wallet-ui/react'

import { toast } from 'sonner'

import type { QuestRoute } from '@/questatlas/data-access/questatlas-route'
import type { SolanaClient } from '@/solana/data-access/solana-client'

import { useMintQuestAtlasPass } from '@/questatlas/data-access/use-mint-questatlas-pass'
import { QuestAtlasUiVerifier } from '@/questatlas/ui/questatlas-ui-verifier'
import { SolanaUiExplorerLink } from '@/solana/ui/solana-ui-explorer-link'

export function QuestAtlasFeatureMint({
  account,
  client,
  route,
  routeReadiness,
}: {
  account: UiWalletAccount
  client: SolanaClient
  route: QuestRoute
  routeReadiness: string
}) {
  const { error, isMinting, mintQuestAtlasPass, result } = useMintQuestAtlasPass({ account, client })

  return (
    <QuestAtlasUiVerifier
      error={error instanceof Error ? error.message : null}
      isMinting={isMinting}
      mintQuestAtlasPass={async () => {
        try {
          await mintQuestAtlasPass(route)
          toast.success('QuestAtlas pass minted and fetched from devnet.')
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          toast.error(message)
        }
      }}
      owner={account.address}
      result={result}
      route={route}
      routeReadiness={routeReadiness}
      signatureLink={
        result ? <SolanaUiExplorerLink label="Signature" path={`/tx/${result.signature}` as ExplorerPath} /> : null
      }
    />
  )
}
