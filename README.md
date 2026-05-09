# Endurance Enjoyers

Sitio informativo de iRacing para Endurance Enjoyers, mantenido sin login, sin perfiles y sin panel interno.

## Modelo de contenido

- Las fotos se actualizan en Cloudinary.
- Los textos se actualizan con un nuevo despliegue.
- Si una fuente de contenido no está disponible, la UI muestra estados vacíos explícitos en lugar de romperse.

## Fuentes principales

- Galería: Cloudinary
- Novedades: Cloudinary + YouTube
- Calendario: Google Sheets
- Contacto: formulario público sin autenticación

## Comandos

```sh
npm run dev
npm run build
npm run preview
```

## Estructura

- `src/pages/index.astro` compone el recorrido principal.
- `src/components/*` contiene secciones y bloques reutilizables.
- `src/pages/api/*` expone las fuentes de contenido públicas.
