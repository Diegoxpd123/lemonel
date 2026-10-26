import type { APIRoute } from 'astro'

export const prerender = false

const base = () => (process.env.API_URL ?? import.meta.env.API_URL ?? 'http://localhost:50002').replace(/\/$/, '')

const respuesta = (cuerpo: string, status: number) =>
  new Response(cuerpo, { status, headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-store' } })

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const cuerpo = await request.text()
  if (cuerpo.length > 30_000) return respuesta(JSON.stringify({ error: 'El pedido es demasiado grande' }), 413)
  let ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  if (!ip) {
    try {
      ip = clientAddress
    } catch {
      ip = 'desconocida'
    }
  }
  try {
    const res = await fetch(`${base()}/api/public/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: cuerpo,
      signal: AbortSignal.timeout(8000),
    })
    return respuesta(await res.text(), res.status)
  } catch {
    return respuesta(JSON.stringify({ error: 'No pudimos registrar tu pedido en este momento' }), 502)
  }
}
