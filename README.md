# QuestAtlas

QuestAtlas is a Solana-week game access pass project for a player preparing a dungeon run and a creator/operator tuning the encounter map.

The app builds a generated dungeon route, previews the pass metadata/art, asks the connected wallet to mint an MPL Core asset on devnet, then verifies the created asset owner and route payload.

Live URL: https://questatlas093.colmena.dev

## Capabilities

- Route/map builder with deterministic dungeon seed, room path, hazards, loadout, and encounter pressure.
- Operator readiness console for danger, reward, route volatility, and access gate status.
- Generated metadata/art preview for the transferable Quest Atlas pass.
- Wallet-signed MPL Core devnet mint using wallet-ui, Solana Kit, and `@obrera/mpl-core-kit-lib`.
- Asset/signature verifier that fetches the minted asset and compares holder ownership plus route payload hash.

## Solana Notes

Minting is client-side only. The connected wallet signs as payer and authority, while the asset keypair is generated in the browser for the new MPL Core asset. There is no server-side mint signer.

The app intentionally does not depend on `@solana/web3.js`, `@solana/wallet-adapter-react`, Node `Buffer`, file package bypasses, or vendor dist imports.

## Development

```bash
bun install
bun run dev
```

Open `http://localhost:5173`.

## Validation

```bash
bun run check-types
bun run build
bun run lint
bun run proof
```

## Deployment

The included `Dockerfile`, `docker-compose.yml`, and `server.ts` serve the Vite static build on port `3000` for Dokploy.
