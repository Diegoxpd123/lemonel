import type { Tienda } from './tienda'

const base = () => (process.env.API_URL ?? import.meta.env.API_URL ?? 'http://localhost:50002').replace(/\/$/, '')

const VIDA = 15_000
let guardado: { hasta: number; datos: Tienda } | null = null
let pendiente: Promise<Tienda> | null = null

const traer = async (): Promise<Tienda> => {
  const control = new AbortController()
  const t = setTimeout(() => control.abort(), 6000)
  try {
    const res = await fetch(`${base()}/api/public/catalogo`, { signal: control.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`La API respondió ${res.status}`)
    return (await res.json()) as Tienda
  } finally {
    clearTimeout(t)
  }
}

export const getTienda = async (): Promise<Tienda> => {
  const ahora = Date.now()
  if (guardado && guardado.hasta > ahora) return guardado.datos
  if (!pendiente) {
    pendiente = traer()
      .then((datos) => {
        guardado = { hasta: Date.now() + VIDA, datos }
        return datos
      })
      .catch((e) => {
        if (guardado) {
          guardado.hasta = Date.now() + 5_000
          return guardado.datos
        }
        throw e
      })
      .finally(() => {
        pendiente = null
      })
  }
  return pendiente
}
