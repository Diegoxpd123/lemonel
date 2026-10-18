export const config = {
  nombre: 'Lemonel',
  whatsapp: '51999999999',
  instagram: 'https://www.instagram.com/lemonel.pe',
  tiktok: 'https://www.tiktok.com/@lemonel.pe',
  web: 'lemonel.pe',
  moneda: 'S/',
  eventoMinimo: 10,
  diasAnticipacion: 7,
}

export const escalas = [
  { desde: 10, descuento: 0.1 },
  { desde: 30, descuento: 0.15 },
  { desde: 50, descuento: 0.2 },
  { desde: 100, descuento: 0.25 },
]

export const descuentoPara = (cantidad: number) => {
  let d = 0
  for (const e of escalas) if (cantidad >= e.desde) d = e.descuento
  return d
}
