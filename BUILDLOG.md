# QuestAtlas Build Log

## Model Metadata

- Agent: Codex implementation coding agent
- Model family: GPT-5
- Repository: `nightshift-093-questatlas`
- Live domain target: `https://questatlas093.colmena.dev`

## UTC Log

- `2026-05-23T01:01:00Z` - Confirmed repository root and empty create-seed target state.
- `2026-05-23T01:03:00Z` - Verified live `create-seed@1.7.0` registry includes `bun-react-vite-solana-kit`.
- `2026-05-23T01:04:00Z` - Generated a fresh neutral `bun-react-vite-solana-kit` scaffold with Bun and moved it into the repo root.
- `2026-05-23T01:05:00Z` - Added published dependency `@obrera/mpl-core-kit-lib@0.0.3`.
- `2026-05-23T01:07:00Z` - Implemented QuestAtlas route builder, encounter/loadout tuning, map-first UI, metadata/art preview, wallet-signed MPL Core mint, and verifier console.
- `2026-05-23T01:09:58Z` - Replaced scaffold README with QuestAtlas-specific documentation and recorded validation/deployment plan.
- `2026-05-23T01:12:00Z` - Local validation passed: `bun run check-types`, `bun run lint`, `bun run build`, and production server smoke checks for `/atlas` and `/health`.
- `2026-05-23T01:13:39Z` - Created Dokploy project `questatlas093`, compose app `UcfXl6xPHqDbsTecLJGdT`, and HTTPS domain `questatlas093.colmena.dev`.
- `2026-05-23T01:14:58Z` - Verified live HTTPS checks: `https://questatlas093.colmena.dev/health` returned HTTP 200 with `{"ok":true,"project":"QuestAtlas 093"}` and `/atlas` returned HTTP 200.
- `2026-05-23T01:24:02Z` - Pushed `fix: serve short questatlas metadata uri` to replace the MPL Core URI payload with a first-party HTTPS metadata URL and add `/api/questatlas/metadata` plus `/api/questatlas/image`.
- `2026-05-23T01:27:35Z` - Pushed `fix: include metadata helpers in image` after finding the Docker runtime image needed the shared route helper copied beside `server.ts`.
- `2026-05-23T01:33:00Z` - Local validation passed: `bun run check-types`, `bun run lint`, `bun run build`, local production server checks for `/health`, `/atlas`, metadata JSON, and SVG image, plus `docker build -t questatlas093-local .` and a local Docker metadata smoke check.
- `2026-05-23T01:34:00Z` - Live deployment blocker: `https://questatlas093.colmena.dev/health` and `/atlas` return HTTP 200, but the new metadata and image routes still return the old `text/html` SPA fallback instead of JSON/SVG after polling. Dokploy CLI redeploy lookup also failed with HTTP 400 for compose id `UcfXl6xPHqDbsTecLJGdT`.
- `2026-05-23T01:35:00Z` - Proof mint blocked before minting. `bun run proof` generated temporary devnet signer `4mzK83Mp5db9NRugbDTBiWcB1UeFt349CWGREy3FpQf3`, preflighted `https://questatlas093.colmena.dev/api/questatlas/metadata?b=42&d=7&s=h796gc&o=4mzK83Mp5db9NRugbDTBiWcB1UeFt349CWGREy3FpQf3`, and refused to mint because the live endpoint returned HTTP 200 with HTML rather than JSON. No proof asset or transaction signature was produced.
- `2026-05-23T09:57:11Z` - Rebuilt and recreated the Dokploy compose container `questatlas093-bubap0-app-1` from the current repo while preserving Dokploy's generated Traefik labels. Live `/api/questatlas/metadata?b=42&d=7&s=h796gc&o=test-owner` now returns HTTP 200 `application/json`, and `/api/questatlas/image?b=42&d=7&s=h796gc` returns HTTP 200 `image/svg+xml`.
- `2026-05-23T10:01:00Z` - Updated the proof path to support an existing funded devnet keypair and to submit locally signed proof transactions through Solana RPC when the signer is not a wallet-provided transaction-sending signer.
- `2026-05-23T10:09:00Z` - Final deployed-source proof passed. `PROOF_KEYPAIR_PATH=/home/obrera/projects/pubkey-link/tools/tokens/keypair/alice-keypair.json bun run proof` minted and verified MPL Core asset `8SCkLfVri7Zm61VMNqK2tmQuxLza7mu6WYWmFHCz2tYi` on devnet with transaction `55rSH5b6FaMkcWrwiiTXqvJDrukWEybGYDXMQh7WmAYcwJ2GkRa7Q8qJbuywMHjuSWCZFvbRHam3z1ftxfakqeP4`. The decoded asset name is `QuestAtlas Pass QA-6N8R9M`, owner and update authority are `ALiC98dw6j47Skrxje3zBN4jTA11w67JRjQRBeZH3BRG`, metadata URI is `https://questatlas093.colmena.dev/api/questatlas/metadata?b=42&d=7&s=h796gc&o=ALiC98dw6j47Skrxje3zBN4jTA11w67JRjQRBeZH3BRG`, metadata JSON has 7 attributes, and media `https://questatlas093.colmena.dev/api/questatlas/image?b=42&d=7&s=h796gc` returns HTTP 200 `image/svg+xml`.

## Mint Path

The product-critical mint action is wallet-signed in the browser. `getCreateV1Instruction` from `@obrera/mpl-core-kit-lib/generated` creates the MPL Core instruction; wallet-ui provides the transaction signer for payer and authority; Solana Kit signs and sends the transaction with the connected wallet.

If the connected wallet declines signing, lacks devnet SOL, or cannot sign the generated transaction, the app reports the exact wallet/RPC error and does not fake success.
