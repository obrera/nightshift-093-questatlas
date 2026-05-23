import { useMutation } from '@tanstack/react-query'
import { type UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'

import type { QuestRoute } from '@/questatlas/data-access/questatlas-route'
import type { SolanaClient } from '@/solana/data-access/solana-client'

import { executeMintQuestAtlasPass } from '@/questatlas/data-access/execute-mint-questatlas-pass'

export function useMintQuestAtlasPass({ account, client }: { account: UiWalletAccount; client: SolanaClient }) {
  const transactionSigner = useWalletUiSigner({ account })
  const { data, error, isPending, mutateAsync, reset } = useMutation({
    mutationFn: (route: QuestRoute) => executeMintQuestAtlasPass({ client, route, transactionSigner }),
  })

  return {
    error,
    isMinting: isPending,
    mintQuestAtlasPass: mutateAsync,
    resetMint: reset,
    result: data,
  }
}
