const port = Number(process.env.PORT ?? 3000)
const distRoot = new URL('./dist/', import.meta.url)

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    headers: { 'cache-control': 'no-store', ...init?.headers },
    status: init?.status,
  })
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

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return json({ ok: true, project: 'QuestAtlas 093' })
    }

    return serveStatic(url.pathname)
  },
  port,
})

console.log(`QuestAtlas 093 server listening on ${port}`)
