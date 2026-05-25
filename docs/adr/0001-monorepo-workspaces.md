# ADR 0001: Arquitectura Monorepo con Workspaces de npm

## Estado
**Aprobado**

## Fecha
2026-05-21

## Contexto
El sistema consta de un frontend (`client`) y un backend (`server`) que interactúan directamente a través de una API REST. Desarrollar y mantener estos dos entornos en repositorios separados introduce fricción:
1. Sincronización compleja de ramas durante el desarrollo de características full-stack.
2. Duplicidad en la definición de configuraciones de desarrollo (Linter, Prettier, TypeScript).
3. Mayor dificultad para que nuevos desarrolladores clonen, configuren e inicien el entorno local con una sola línea de comandos.

## Decisión
Implementar una estructura de **Monorepo** utilizando la característica de **Workspaces de npm** (definida en el `package.json` raíz).

Toda la base de código se consolidará bajo el siguiente esquema de carpetas:
- `/client`: Frontend desarrollado en React, TypeScript y Vite.
- `/server`: Backend desarrollado en Node.js, Express y Prisma.
- `package.json` raíz: Cooridna las dependencias comunes y los workspaces.

## Consecuencias

### Positivas
- **Workflow Unificado:** Es posible instalar dependencias para todo el monorepo ejecutando un único comando (`npm install`) en la raíz del proyecto.
- **Tipado Compartido:** Facilita la futura definición y compartición de contratos de API o interfaces TypeScript entre cliente y servidor.
- **Configuración de DevOps Simplificada:** Un único archivo `docker-compose.yml` en la raíz puede orquestar simultáneamente las imágenes de base de datos, backend y frontend.
- **Historial de Git Único:** Permite realizar atomic commits que abarquen simultáneamente cambios en el cliente y el servidor.

### Negativas
- **Mayor tamaño de clonación inicial:** Los desarrolladores deben descargar todo el repositorio, incluso si solo van a trabajar en uno de los dos servicios.
- **Cuidado con las dependencias cruzadas:** Es necesario cuidar que las dependencias de producción no se mezclen incorrectamente entre los entornos del cliente y del servidor.
