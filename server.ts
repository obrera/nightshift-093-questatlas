import {
  buildQuestRouteFromParams,
  createQuestAtlasMetadata,
  createQuestAtlasSvg,
  parseQuestRouteParams,
} from './src/questatlas/data-access/questatlas-route'

const port = Number(process.env.PORT ?? 3000)
const distRoot = new URL('./dist/', import.meta.url)

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=300',
      ...init?.headers,
    },
    status: init?.status,
  })
}

function routeFromUrl(url: URL) {
  const params = parseQuestRouteParams(url.searchParams)

  if (!params) {
    return null
  }

  return buildQuestRouteFromParams(params)
}

async function serveStatic(pathname: string) {
  if (pathname.includes('..')) {
    return new Response('Bad request', { status: 400 })
  }

  const filePath = pathname === '/' ? 'index.html' : pathname.slice(1)
  const file = Bun.file(new URL(filePath, distRoot))

  if (await file.exists()) {
    return new Response(file)
  }

  return new Response(Bun.file(new URL('index.html', distRoot)))
}

function svg(data: string) {
  return new Response(data, {
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=300',
      'content-type': 'image/svg+xml; charset=utf-8',
    },
  })
}

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return json({ ok: true, project: 'QuestAtlas 093' })
    }

    if (url.pathname === '/api/questatlas/metadata') {
      const route = routeFromUrl(url)

      if (!route) {
        return json({ error: 'Invalid QuestAtlas route query.' }, { status: 400 })
      }

      return json(createQuestAtlasMetadata(route, url.searchParams.get('o') ?? 'unknown-holder'))
    }

    if (url.pathname === '/api/questatlas/image') {
      const route = routeFromUrl(url)

      if (!route) {
        return json({ error: 'Invalid QuestAtlas route query.' }, { status: 400 })
      }

      return svg(createQuestAtlasSvg(route))
    }

    return serveStatic(url.pathname)
  },
  port,
})

console.log(`QuestAtlas 093 server listening on ${port}`)
