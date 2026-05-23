import { fetchAssetV1, getCreateV1Instruction } from '@obrera/mpl-core-kit-lib/generated'
import {
  appendTransactionMessageInstruction,
  compileTransactionMessage,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase58Decoder,
  getBase64Decoder,
  getBase64EncodedWireTransaction,
  getCompiledTransactionMessageEncoder,
  getSignatureFromTransaction,
  isSolanaError,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  signTransactionMessageWithSigners,
  SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING,
  type TransactionMessageBytesBase64,
  type TransactionSigner,
} from '@solana/kit'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import {
  createMetadataUri,
  createQuestAtlasMetadata,
  getRouteHash,
  type QuestAtlasMetadata,
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
  transactionSigner: TransactionSigner
}): Promise<MintQuestAtlasPassResult> {
  const asset = await generateKeyPairSigner()
  const metadata = createQuestAtlasMetadata(route, transactionSigner.address)
  const uri = createMetadataUri(route, transactionSigner.address)
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

  const signature = await sendMintTransaction(client, message)

  if (!signature) {
    throw new Error('Wallet submitted the mint transaction but did not return a signature.')
  }

  const confirmedAsset = await fetchAssetV1(client.rpc, asset.address, { commitment: 'confirmed' })
  const confirmedMetadata = await fetchQuestAtlasMetadata(confirmedAsset.data.uri)
  const metadataVerified =
    confirmedMetadata?.properties.route.id === route.id &&
    getRouteHash(confirmedMetadata.properties.route) === getRouteHash(route)

  return {
    assetAddress: asset.address,
    assetName: confirmedAsset.data.name,
    owner: confirmedAsset.data.owner,
    routeHash: getRouteHash(route),
    signature,
    uri: confirmedAsset.data.uri,
    verified:
      confirmedAsset.data.owner === transactionSigner.address && confirmedAsset.data.uri === uri && metadataVerified,
  }
}

async function confirmSignature(client: SolanaClient, signature: string) {
  type SignatureParam = Parameters<SolanaClient['rpc']['getSignatureStatuses']>[0][number]
  const signatureParam = signature as SignatureParam

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const { value } = await client.rpc.getSignatureStatuses([signatureParam], { searchTransactionHistory: true }).send()
    const status = value[0]

    if (status?.err) {
      throw new Error(`QuestAtlas mint transaction failed: ${JSON.stringify(status.err)}`)
    }

    if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`QuestAtlas mint transaction was not confirmed: ${signature}`)
}

async function fetchQuestAtlasMetadata(uri: string) {
  try {
    const response = await fetch(uri)
    if (!response.ok) {
      return null
    }

    return (await response.json()) as QuestAtlasMetadata
  } catch {
    return null
  }
}

async function sendMintTransaction(
  client: SolanaClient,
  message: Parameters<typeof signAndSendTransactionMessageWithSigners>[0],
) {
  try {
    const signatureBytes = await signAndSendTransactionMessageWithSigners(message)
    return getBase58Decoder().decode(signatureBytes)
  } catch (error) {
    if (!isSolanaError(error, SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING)) {
      throw error
    }

    const signedTransaction = await signTransactionMessageWithSigners(message)
    const signature = getSignatureFromTransaction(signedTransaction)
    await client.rpc
      .sendTransaction(getBase64EncodedWireTransaction(signedTransaction), {
        encoding: 'base64',
        preflightCommitment: 'confirmed',
      })
      .send()
    await confirmSignature(client, signature)
    return signature
  }
}
