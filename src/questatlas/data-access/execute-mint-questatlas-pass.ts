import { fetchAssetV1, getCreateV1Instruction } from '@obrera/mpl-core-kit-lib/generated'
import {
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  compileTransactionMessage,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase58Decoder,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from '@solana/kit'
import { type useWalletUiSigner } from '@wallet-ui/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import {
  createMetadataUri,
  createQuestAtlasMetadata,
  getRouteHash,
  type QuestRoute,
} from '@/questatlas/data-access/questatlas-route'

export interface MintQuestAtlasPassResult {
  assetAddress: string
  assetName: string
  owner: string
  routeHash: string
  signature: string
  uri: string
  verified: boolean
}

export async function executeMintQuestAtlasPass({
  client,
  route,
  transactionSigner,
}: {
  client: SolanaClient
  route: QuestRoute
  transactionSigner: ReturnType<typeof useWalletUiSigner>
}): Promise<MintQuestAtlasPassResult> {
  const asset = await generateKeyPairSigner()
  const metadata = createQuestAtlasMetadata(route, transactionSigner.address)
  const uri = createMetadataUri(metadata)
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
  const instruction = getCreateV1Instruction({
    asset,
    authority: transactionSigner,
    name: metadata.name,
    owner: transactionSigner.address,
    payer: transactionSigner,
    updateAuthority: transactionSigner.address,
    uri,
  })
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (transactionMessage) => setTransactionMessageFeePayerSigner(transactionSigner, transactionMessage),
    (transactionMessage) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transactionMessage),
    (transactionMessage) => appendTransactionMessageInstruction(instruction, transactionMessage),
  )

  assertIsTransactionMessageWithSingleSendingSigner(message)

  const encodedMessage = getCompiledTransactionMessageEncoder().encode(compileTransactionMessage(message))
  const [{ value: balance }, { value: fee }] = await Promise.all([
    client.rpc.getBalance(transactionSigner.address, { commitment: 'confirmed' }).send(),
    client.rpc
      .getFeeForMessage(getBase64Decoder().decode(encodedMessage) as TransactionMessageBytesBase64, {
        commitment: 'confirmed',
      })
      .send(),
  ])

  if (fee === null) {
    throw new Error('Unable to estimate the MPL Core mint fee. Try again with a fresh blockhash.')
  }

  if (balance < fee) {
    throw new Error('Not enough devnet SOL to pay for the wallet-signed QuestAtlas pass mint.')
  }

  const signatureBytes = await signAndSendTransactionMessageWithSigners(message)
  const signature = getBase58Decoder().decode(signatureBytes)

  if (!signature) {
    throw new Error('Wallet submitted the mint transaction but did not return a signature.')
  }

  const confirmedAsset = await fetchAssetV1(client.rpc, asset.address, { commitment: 'confirmed' })

  return {
    assetAddress: asset.address,
    assetName: confirmedAsset.data.name,
    owner: confirmedAsset.data.owner,
    routeHash: getRouteHash(route),
    signature,
    uri: confirmedAsset.data.uri,
    verified: confirmedAsset.data.owner === transactionSigner.address && confirmedAsset.data.uri === uri,
  }
}
