export interface Foto {
  src: string
  w: number
  h: number
  alt: string
}

export const galeria: Foto[] = [
  { src: '/fotos/g-01.webp', w: 900, h: 1125, alt: 'Cadenas doradas en capas con un saco negro' },
  { src: '/fotos/g-02.webp', w: 800, h: 1200, alt: 'Mujer sonriendo con varias pulseras de perlas' },
  { src: '/fotos/g-03.webp', w: 900, h: 1125, alt: 'Argollas doradas grandes en la oreja' },
  { src: '/fotos/g-04.webp', w: 900, h: 900, alt: 'Collares con corazón de nácar y perlas' },
  { src: '/fotos/g-05.webp', w: 900, h: 600, alt: 'Collar largo dorado sobre una blusa beige' },
  { src: '/fotos/g-06.webp', w: 800, h: 1200, alt: 'Collar y pulsera de perlas con vestido azul' },
  { src: '/fotos/g-07.webp', w: 900, h: 507, alt: 'Argolla grande dorada de perfil' },
  { src: '/fotos/g-08.webp', w: 800, h: 1200, alt: 'Collares de perlas y corazón sobre blazer blanco' },
  { src: '/fotos/g-09.webp', w: 800, h: 1200, alt: 'Reloj dorado cuadrado en la muñeca' },
  { src: '/fotos/g-10.webp', w: 900, h: 900, alt: 'Dije de perla barroca con blazer oscuro' },
  { src: '/fotos/g-11.webp', w: 800, h: 1200, alt: 'Argolla pequeña dorada con flores de cerezo' },
  { src: '/fotos/g-12.webp', w: 900, h: 557, alt: 'Collar con dije circular sobre fondo desenfocado' },
  { src: '/fotos/g-13.webp', w: 800, h: 1200, alt: 'Argollas pequeñas con brillos en la oreja' },
  { src: '/fotos/g-14.webp', w: 900, h: 987, alt: 'Pulsera de perlas con dije sobre un suéter rosado' },
  { src: '/fotos/g-15.webp', w: 900, h: 600, alt: 'Anillos y cadena dorada en un plato de mármol' },
  { src: '/fotos/g-16.webp', w: 900, h: 1200, alt: 'Collar delicado con corazón pequeño' },
  { src: '/fotos/g-17.webp', w: 900, h: 720, alt: 'Reloj, anillos y cadena dorada sobre fondo blanco' },
]


const productosFoto: Foto[] = [
  { src: '/fotos/collar-trebol.webp', w: 900, h: 1125, alt: 'Dije de trébol negro y dorado' },
  { src: '/fotos/pulsera-perlas.webp', w: 900, h: 1125, alt: 'Pulsera de perlas sobre un plato blanco' },
  { src: '/fotos/anillos-pareja.webp', w: 900, h: 1125, alt: 'Dos anillos dorados' },
  { src: '/fotos/collar-cruz.webp', w: 900, h: 1125, alt: 'Collar con cruz larga dorada' },
  { src: '/fotos/collar-medallon.webp', w: 900, h: 1125, alt: 'Collares con medallones de nácar' },
  { src: '/fotos/aretes-argolla.webp', w: 900, h: 1125, alt: 'Aretes de argolla trenzada' },
  { src: '/fotos/collar-corazon-oro.webp', w: 900, h: 1125, alt: 'Collar con corazón dorado' },
  { src: '/fotos/set-perlas.webp', w: 900, h: 1125, alt: 'Pulseras de perlas de río' },
  { src: '/fotos/reloj-cuadrado.webp', w: 900, h: 1125, alt: 'Reloj dorado cuadrado' },
  { src: '/fotos/aretes-flor.webp', w: 900, h: 1125, alt: 'Aretes de flor lila' },
]

export const collage = (desfase = 0): [Foto[], Foto[]] => {
  const pool = [...galeria, ...productosFoto]
  const n = pool.length
  const rot = Array.from({ length: n }, (_, i) => pool[(i + desfase) % n])
  return [rot.filter((_, i) => i % 2 === 0), rot.filter((_, i) => i % 2 === 1)]
}
