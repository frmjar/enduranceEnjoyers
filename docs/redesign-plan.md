# Plan de Rediseño — Endurance Enjoyers

## Dirección: F1 / Motorsport Premium

Estilo inspirado en F1.com y motorsport.com:
- Fondos sólidos oscuros (sin glassmorphism)
- Tipografía condensada/bold
- Datos densos y estructurados
- Dual tone: naranja (acciones) + cyan (datos/info)
- Sin sombras glow excesivas
- Bordes sólidos y limpios

---

## 1. Paleta de Colores

### Superficies (más limpias, sin gradientes)
| Token | Actual | Nuevo | Uso |
|---|---|---|---|
| `racing-black` | `#151519` | `#0d0d0f` | Fondo principal, más oscuro |
| `racing-dark` | `#212127` | `#16161a` | Navbar, footer, secciones |
| `racing-surface` | `#2a2a31` | `#1e1e23` | Fondos alternos |
| `racing-elevated` | `#35353d` | `#26262c` | Inputs, badges |
| `racing-card` | `#404049` | `#1a1a1f` | Cards (fondo sólido) |

### Acentos
| Token | Actual | Nuevo | Uso |
|---|---|---|---|
| `accent-orange` | `#ff6b00` | `#ff4d00` | Acciones principales, CTAs |
| `accent-cyan` | `#00d4ff` | `#00c8ff` | Datos, info, badges secundarios |
| `accent-red` | `#ef4444` | `#e63946` | Errores, alertas |
| `accent-green` | `#22c55e` | `#2ec4b6` | Éxito |

### Bordes (más visibles)
| Token | Actual | Nuevo |
|---|---|---|
| `border-subtle` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.08)` |
| `border-default` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.12)` |

---

## 2. Tipografía

### Cambio: Inter (Google Fonts) como fuente principal
- Más legible, más moderna, mejor para datos densos
- Cargar via `fonts.googleapis.com` en Layout.astro

### Jerarquía actualizada
| Elemento | Clases | Cambio |
|---|---|---|
| h1 | `text-4xl md:text-5xl lg:text-6xl font-black tracking-tight` | Más grande, más bold |
| h2 | `text-2xl md:text-3xl font-bold tracking-tight` | Sin cambios mayores |
| h3 | `text-lg font-bold uppercase tracking-wide` | Uppercase para headlines de card |
| Labels | `text-xs font-semibold uppercase tracking-widest` | Más spacing |
| Body | `text-sm md:text-base leading-normal` | Un poco más compacto |

---

## 3. Navbar

### Cambios
- Fondo sólido `racing-dark` sin backdrop-blur
- Borde inferior `accent-cyan` en lugar de naranja (la nav es info, no acción)
- Links: uppercase, font-semibold, tracking-wide
- Hover: subrayado cyan sólido (sin gradiente)
- Logo siempre visible (no fade-in on scroll)
- Altura fija más compacta: `h-14 md:h-16`

---

## 4. Hero / Header

### Cambios
- Mantener imagen banner responsive
- Eliminar el patrón de secciones alternas con diagonal stripes
- Fondo sólido `racing-black` en todas las secciones (sin alternancia)
- Separadores entre secciones: línea sólida `border-subtle` horizontal

---

## 5. Cards de Calendario (CardCalendario)

### Nuevo diseño
```
┌─────────────────────────────┐
│ 20 JUN          S2026 W01   │  ← header: fecha grande + semana
├─────────────────────────────┤
│ GT Endurance Simucube Series│  ← título bold
│ Watkins Glenn               │  ← circuito en cyan
├─────────────────────────────┤
│ GT3        │ 3h      │ 0%  │  ← datos en grid, labels uppercase
│ COCHES     │ DURACIÓN│ LLUV│
├─────────────────────────────┤
│ 👥 Equipo    Semana 1       │  ← footer con badge + semana
└─────────────────────────────┘
```

- Fondo sólido `racing-card` (sin gradiente)
- Borde sólido `border-subtle`, hover `border-accent-cyan/40`
- Sin sombra glow en hover
- Hover: solo borde cyan + ligero translate-y
- Header con fondo `racing-elevated` (sin gradiente)
- Datos en grid limpio con separadores sutiles
- Circuito en color cyan

---

## 6. Cards Genéricas (Card)

### Nuevo diseño
- Fondo sólido `racing-card`
- Borde `border-subtle`, hover `border-accent-orange/30`
- Sin glassmorphism, sin backdrop-blur
- Hover: sin sombra glow, solo borde + translate-y
- Icon boxes: fondo `accent-orange/10`, borde `accent-orange/20`

---

## 7. Video Cards (VideoCard)

### Nuevo diseño
- Misma estructura que CardCalendario
- Thumbnail sin borde redondeado arriba (full width)
- Play button: fondo sólido `accent-orange`, sin animación scale
- Datos del canal en cyan
- Views y date en muted text

---

## 8. Galería

### Cambios
- Cards sin sombra glow en hover
- Borde sólido en hover: `accent-cyan/40`
- Modal: fondo `racing-black/98` sin blur
- Botones de nav: fondo sólido `racing-elevated`
- Sin glassmorphism en modal

---

## 9. Sección de Contacto

### Cambios
- Formulario: fondo sólido `racing-card`, borde `border-subtle`
- Inputs: fondo `racing-elevated`, borde `border-default`
- Focus ring: `accent-cyan` (no naranja — el form es data entry)
- Requisitos: borde `accent-orange/20` (mantener)
- Social: borde `accent-cyan/20` (cambiar de blue a cyan)

---

## 10. Footer

### Cambios
- Fondo sólido `racing-dark` (sin checkered pattern)
- Links: hover `accent-cyan`
- Separador: línea sólida `border-subtle` (sin gradiente)
- Copyright: texto muted más pequeño

---

## 11. Botones

### Nuevo estilo
- Primary: fondo sólido `accent-orange`, texto `racing-black`, font-bold, uppercase
- Hover: `accent-orange-light`, sin translate-y excesivo
- Secondary: fondo transparente, borde `accent-cyan`, texto `accent-cyan`
- Hover secondary: fondo `accent-cyan/10`
- Sin gradientes en botones

---

## 12. Badges / Tags

### Nuevo estilo
- Orange badge: fondo `accent-orange/15`, borde `accent-orange/30`, texto `accent-orange`
- Cyan badge: fondo `accent-cyan/15`, borde `accent-cyan/30`, texto `accent-cyan`
- Font: `text-xs font-bold uppercase tracking-wider`
- Border-radius: `rounded-md` (menos redondeado)

---

## 13. Animaciones

### Eliminar
- `glow-pulse`
- `shimmer`
- `float`
- `border-flow`
- `speed-lines`
- `checkered-scroll`
- Sombras glow en hover
- `glass-card` y `glass-card-glow`

### Mantener
- `fade-in-up` (scroll reveal)
- Transiciones de hover (translate-y, border-color)
- Focus rings

---

## 14. Separadores entre secciones

### Nuevo
- Línea sólida 1px `border-subtle` horizontal (sin gradiente naranja)
- Alternar fondos: `racing-black` / `racing-dark` (sin stripes)
- Eliminar los `::after` pseudo-elements con gradientes naranjas

---

## Archivos a modificar

| Archivo | Cambios |
|---|---|
| `src/styles/global.css` | Paleta, eliminar glassmorphism, animaciones, shadows, dividers |
| `src/components/Layaut.astro` | Cargar fuente Inter |
| `src/components/navegacion/NavbarPc.astro` | Fondo sólido, borde cyan, links uppercase |
| `src/components/navegacion/NavbarMovil.astro` | Fondo sólido, links uppercase |
| `src/components/HeaderExtended.astro` | Sin cambios (banner se mantiene) |
| `src/components/TeamDescription.astro` | Limpiar, sin glow |
| `src/components/SectionTitle.astro` | Línea sólida cyan en lugar de gradiente naranja |
| `src/components/CardCalendario.astro` | Nuevo diseño de card |
| `src/components/Card.astro` | Fondo sólido, sin glass |
| `src/components/VideoCard.astro` | Fondo sólido, datos cyan |
| `src/components/Galeria.astro` | Sin sombras, borde cyan hover |
| `src/components/NovedadesLogros.astro` | Adaptar a nuevos estilos |
| `src/components/Calendario.astro` | Secciones limpias |
| `src/components/Contacto.astro` | Form inputs cyan focus |
| `src/components/contacto/Formulario.astro` | Fondo sólido, focus cyan |
| `src/components/contacto/Requisitos.astro` | Borde orange |
| `src/components/contacto/Social.astro` | Cambiar blue a cyan |
| `src/components/Footer.astro` | Sin checkered, línea sólida |
| `src/pages/calendario.astro` | Adaptar a nuevos estilos |
| `src/styles/calendario.css` | Simplificar |

---

## Orden de ejecución

1. `global.css` — Nueva paleta + eliminar glass/glow/animations
2. `Layout.astro` — Cargar Inter
3. `SectionTitle.astro` — Línea cyan
4. `CardCalendario.astro` — Nuevo diseño
5. `Card.astro` — Fondo sólido
6. `VideoCard.astro` — Fondo sólido + cyan
7. `NavbarPc.astro` + `NavbarMovil.astro` —/navbar limpio
8. `Footer.astro` — Simplificar
9. `Galeria.astro` — Sin sombras
10. `Contacto` components — Focus cyan
11. `Calendario.astro` + `calendario.astro` — Adaptar
12. `NovedadesLogros.astro` — Adaptar
13. `TeamDescription.astro` — Limpiar
