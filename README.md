# RSS Reader

Agregador de fuentes RSS: suscríbete a varios feeds y consulta sus publicaciones desde una única interfaz, con actualización automática y vista previa en modal.

## Estado del proyecto

[![Hexlet tests and linter status](https://github.com/CodeNovaGZ/fullstack-javascript-project-137/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/CodeNovaGZ/fullstack-javascript-project-137/actions)
[![Node.js CI](https://github.com/CodeNovaGZ/fullstack-javascript-project-137/actions/workflows/node.js.yml/badge.svg)](https://github.com/CodeNovaGZ/fullstack-javascript-project-137/actions/workflows/node.js.yml)
[![Maintainability](https://qlty.sh/gh/CodeNovaGZ/projects/fullstack-javascript-project-137/maintainability.svg)](https://qlty.sh/gh/CodeNovaGZ/projects/fullstack-javascript-project-137)
[![Deploy](https://img.shields.io/badge/desplegado-vercel-000000?logo=vercel)](https://agregador-rss.vercel.app/)

## Demo

Accede a la aplicación desplegada: [agregador-rss.vercel.app](https://agregador-rss.vercel.app/)

## Funcionalidades

- Agregar fuentes RSS por URL con validación y control de duplicados.
- Actualización automática de las fuentes cada 5 segundos.
- Publicaciones nuevas en negrita y ya leídas en estilo normal.
- Vista previa de cada publicación en un modal con título, descripción y enlace "Leer completo".
- Mensajes de éxito y error internacionalizados en la interfaz.
- Internacionalización: español por defecto, con soporte en inglés.

## Stack tecnológico

| Herramienta | Uso |
| --- | --- |
| JavaScript | Lenguaje principal |
| Vite | Bundler y servidor de desarrollo |
| Bootstrap 5 | Estilos e interfaz, modales |
| Valtio | Estado reactivo |
| i18next | Internacionalización |
| Axios | Peticiones HTTP |
| Yup | Validación de formularios |

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (ver `.nvmrc`).
- npm (incluido con Node.js).

## Instalación y uso

```bash
npm install
npm run dev
```

El entorno de desarrollo estará disponible en `http://localhost:5173/`.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Previsualiza la versión de producción |
| `npm run lint` | Ejecuta el linter (ESLint) |
| `npm test` | Ejecuta los tests |

## Despliegue

La aplicación está desplegada en Vercel: [agregador-rss.vercel.app](https://agregador-rss.vercel.app/)

## Licencia

MIT