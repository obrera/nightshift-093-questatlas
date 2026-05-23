export interface QuestAtlasMetadata {
  attributes: Array<{ trait_type: string; value: number | string }>
  description: string
  external_url: string
  image: string
  name: string
  properties: {
    category: string
    files: Array<{ type: string; uri: string }>
    route: QuestRoute
  }
  symbol: string
}

export interface QuestNode {
  danger: number
  id: string
  reward: number
  room: string
  x: number
  y: number
}

export interface QuestRoute {
  boss: string
  className: string
  difficulty: number
  entry: string
  generatedAt: string
  hazards: string[]
  id: string
  loadout: string[]
  nodes: QuestNode[]
  operatorBias: number
  title: string
}

const ENTRIES = ['Silt Gate', 'Glass Warrens', 'Obsidian Lift', 'Moss Foundry']
const BOSSES = ['Ash Cartographer', 'Mirror Warden', 'Gilded Maw', 'Null Lantern']
const CLASSES = ['Runeblade', 'Cipher Scout', 'Ward Engineer', 'Relic Medic']
const ROOMS = ['Gate', 'Shrine', 'Vault', 'Forge', 'Crypt', 'Bridge', 'Library', 'Bastion', 'Nest']
const HAZARDS = ['cursed fog', 'mana shear', 'collapsing stairs', 'echo patrols', 'lava vents', 'sigil locks']
const LOADOUT = ['sun key', 'ward chalk', 'phase rope', 'ember tonic', 'drift compass', 'seal hammer']

export function buildQuestRoute(seed: string, difficulty: number, operatorBias: number): QuestRoute {
  const random = seededRandom(seed + difficulty + operatorBias)
  const nodeCount = 7 + Math.round(difficulty / 3)
  const routeSeed = Math.abs(hashNumber(`${seed}:${difficulty}:${operatorBias}`))
    .toString(36)
    .toUpperCase()

  const nodes = Array.from({ length: nodeCount }, (_, index): QuestNode => {
    const room = ROOMS[Math.floor(random() * ROOMS.length)] ?? 'Vault'
    const dangerBase = Math.round(difficulty * 7 + operatorBias * 0.35 + random() * 28)
    const rewardBase = Math.round(35 + difficulty * 6 + random() * 42 - operatorBias * 0.2)

    return {
      danger: clamp(dangerBase, 10, 98),
      id: `${index + 1}`,
      reward: clamp(rewardBase, 12, 99),
      room,
      x: Math.round(8 + (index / Math.max(nodeCount - 1, 1)) * 84 + (random() - 0.5) * 8),
      y: Math.round(18 + random() * 64),
    }
  })

  const hazards = pickMany(HAZARDS, random, 3)
  const loadout = pickMany(LOADOUT, random, 3)
  const entry = pickOne(ENTRIES, random)
  const boss = pickOne(BOSSES, random)
  const className = pickOne(CLASSES, random)

  return {
    boss,
    className,
    difficulty,
    entry,
    generatedAt: new Date().toISOString(),
    hazards,
    id: `QA-${routeSeed.slice(0, 8)}`,
    loadout,
    nodes,
    operatorBias,
    title: `${entry} to ${boss}`,
  }
}

export function createMetadataUri(metadata: QuestAtlasMetadata) {
  return `data:application/json;utf8,${encodeURIComponent(JSON.stringify(metadata))}`
}

export function createQuestAtlasMetadata(route: QuestRoute, owner: string): QuestAtlasMetadata {
  const image = createRouteSvgDataUri(route)

  return {
    attributes: [
      { trait_type: 'Route ID', value: route.id },
      { trait_type: 'Entry', value: route.entry },
      { trait_type: 'Boss', value: route.boss },
      { trait_type: 'Difficulty', value: route.difficulty },
      { trait_type: 'Operator Bias', value: route.operatorBias },
      { trait_type: 'Rooms', value: route.nodes.length },
      { trait_type: 'Holder', value: owner },
    ],
    description:
      'A wallet-signed MPL Core Quest Atlas pass. Ownership verifies access and provenance for this generated dungeon route payload.',
    external_url: 'https://questatlas093.colmena.dev',
    image,
    name: `QuestAtlas Pass ${route.id}`,
    properties: {
      category: 'game-access-pass',
      files: [{ type: 'image/svg+xml', uri: image }],
      route,
    },
    symbol: 'QATL',
  }
}

export function decodeMetadataUri(uri: string): null | QuestAtlasMetadata {
  if (!uri.startsWith('data:application/json;utf8,')) {
    return null
  }

  try {
    return JSON.parse(decodeURIComponent(uri.replace('data:application/json;utf8,', ''))) as QuestAtlasMetadata
  } catch {
    return null
  }
}

export function getRouteHash(route: QuestRoute) {
  const stable = JSON.stringify({
    boss: route.boss,
    className: route.className,
    difficulty: route.difficulty,
    entry: route.entry,
    hazards: route.hazards,
    id: route.id,
    loadout: route.loadout,
    nodes: route.nodes,
    operatorBias: route.operatorBias,
    title: route.title,
  })

  return Math.abs(hashNumber(stable)).toString(36).toUpperCase().padStart(8, '0')
}

export function getRouteReadiness(route: QuestRoute) {
  const danger = Math.round(route.nodes.reduce((sum, node) => sum + node.danger, 0) / route.nodes.length)
  const reward = Math.round(route.nodes.reduce((sum, node) => sum + node.reward, 0) / route.nodes.length)
  const volatility = Math.abs(danger - reward)

  return {
    danger,
    gate: danger < 84 && volatility < 45 ? 'Ready' : 'Tune',
    reward,
    volatility,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createRouteSvgDataUri(route: QuestRoute) {
  const lines = route.nodes
    .slice(1)
    .map((node, index) => {
      const previous = route.nodes[index]
      return `<line x1="${previous?.x}" y1="${previous?.y}" x2="${node.x}" y2="${node.y}" stroke="#f5c86b" stroke-width="2.2" stroke-linecap="round" />`
    })
    .join('')
  const points = route.nodes
    .map(
      (node) =>
        `<circle cx="${node.x}" cy="${node.y}" r="${4 + node.danger / 28}" fill="#102d29" stroke="#8ff0c3" stroke-width="2" /><text x="${node.x}" y="${node.y + 1.5}" text-anchor="middle" font-size="4" fill="#f8f1d0">${node.id}</text>`,
    )
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#07100f"/><path d="M4 80 C25 60 25 25 48 36 S74 55 96 18" fill="none" stroke="#14443f" stroke-width="16" opacity=".8"/><g>${lines}${points}</g><text x="6" y="92" font-size="6" fill="#f5c86b" font-family="monospace">${route.id}</text></svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function hashNumber(input: string) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash
}

function pickMany(values: string[], random: () => number, count: number) {
  return [...values].sort(() => random() - 0.5).slice(0, count)
}

function pickOne(values: string[], random: () => number) {
  return values[Math.floor(random() * values.length)] ?? values[0] ?? 'Unknown'
}

function seededRandom(seed: string) {
  let state = Math.abs(hashNumber(seed)) || 1

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}
