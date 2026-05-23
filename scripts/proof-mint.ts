import { airdropFactory, devnet, generateKeyPairSigner, lamports } from '@solana/kit'

import { executeMintQuestAtlasPass } from '../src/questatlas/data-access/execute-mint-questatlas-pass'
import { buildQuestRoute, createMetadataUri } from '../src/questatlas/data-access/questatlas-route'
import { createSolanaClient } from '../src/solana/data-access/create-solana-client'

const http = devnet(process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com')
const ws = devnet(process.env.SOLANA_WS_URL ?? 'wss://api.devnet.solana.com')
const client = createSolanaClient({ http, ws })
const payer = await generateKeyPairSigner()
const route = buildQuestRoute('proof-093', 7, 42)

console.log(`Temporary proof signer: ${payer.address}`)
console.log(`Route: ${route.id}`)

const uri = createMetadataUri(route, payer.address)
const preflightMetadataResponse = await fetch(uri)

if (
  !preflightMetadataResponse.ok ||
  !preflightMetadataResponse.headers.get('content-type')?.includes('application/json')
) {
  throw new Error(`Metadata preflight failed for ${uri}: HTTP ${preflightMetadataResponse.status}`)
}

const airdrop = airdropFactory({ rpc: client.rpc, rpcSubscriptions: client.rpcSubscriptions })
await airdrop({
  commitment: 'confirmed',
  lamports: lamports(1_000_000_000n),
  recipientAddress: payer.address,
})

const result = await executeMintQuestAtlasPass({
  client,
  route,
  transactionSigner: payer,
})
const metadataResponse = await fetch(result.uri)

if (!metadataResponse.ok) {
  throw new Error(`Minted metadata URI returned HTTP ${metadataResponse.status}`)
}

const metadata = await metadataResponse.json()
const imageResponse = await fetch(metadata.image)

if (!imageResponse.ok) {
  throw new Error(`Minted image URI returned HTTP ${imageResponse.status}`)
}

console.log(
  JSON.stringify(
    {
      assetAddress: result.assetAddress,
      imageStatus: imageResponse.status,
      metadataStatus: metadataResponse.status,
      routeHash: result.routeHash,
      signature: result.signature,
      uri: result.uri,
      uriLength: result.uri.length,
      verified: result.verified,
    },
    null,
    2,
  ),
)
