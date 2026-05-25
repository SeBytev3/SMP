# ADR 0005: Despliegue con Cero Intervención usando Docker Compose

## Estado
**Aprobado**

## Fecha
2026-05-21

## Contexto
Establecer un entorno de desarrollo o staging local suele acarrear problemas debido a discrepancias en las versiones de Node.js, gestores de paquetes (npm/yarn/pnpm), configuraciones locales de bases de datos relacionales o dependencias del sistema operativo del host. 

Para mitigar el riesgo de "funciona en mi máquina" y garantizar una experiencia de integración continua sólida, el proyecto debe admitir un arranque instantáneo e idéntico en cualquier máquina o servidor con un único comando unificado, sin requerir instalaciones previas más allá de Docker.

## Decisión
Mandatorizar una arquitectura de despliegue y desarrollo local basada en **Docker y Docker Compose** que funcione bajo la premisa de **Cero Intervención del Entorno Host**.

Esto se logra mediante:
1. Un archivo `docker-compose.yml` en la raíz del proyecto que orquesta de forma autónoma tres servicios clave:
   - `services-marketplace-db`: Base de datos PostgreSQL con volumen persistente.
   - `services-marketplace-backend`: Servicio de Node.js 24 (usando `node:24-alpine`) que expone el servidor API.
   - `services-marketplace-client`: Servidor de desarrollo/producción de React y Vite.
2. Contenerizar la base de código de manera silenciosa (`--loglevel error`) para evitar contaminación en los logs del host y mantener un nivel de señal alto.
3. El uso estricto de Corepack para fijar y forzar la versión exacta y estable de npm (`11.15.0`) y Node.js en todas las capas del Dockerfile.

## Consecuencias

### Positivas
- **Onboarding de Desarrolladores Instantáneo:** Un nuevo desarrollador en el equipo puede tener todo el ecosistema (BD + Backend + Frontend) corriendo localmente en cuestión de minutos ejecutando únicamente `docker-compose up --build -d`.
- **Aislamiento Total del Host:** No se requiere instalar Node.js ni PostgreSQL en el sistema operativo del host. Toda la compilación y ejecución de servicios ocurre dentro de contenedores aislados y reproducibles de Linux Alpine.
- **Entornos Idénticos:** El comportamiento del sistema en las máquinas locales de los desarrolladores es idéntico al comportamiento en el servidor de pruebas o producción, reduciendo bugs por diferencias de configuración.
- **Gestión Sencilla de Dependencias de Docker:** Evita conflictos de puertos e inicializaciones de bases de datos huérfanas en el sistema host.

### Negativas
- **Consumo Adicional de Recursos:** Ejecutar Docker en sistemas como macOS o Windows (a través de WSL2 / Hyper-V) requiere una reserva considerable de memoria RAM y CPU del host.
- **Acceso a Comandos Internos Indirecto:** Para ejecutar comandos específicos dentro del servidor (por ejemplo, aplicar una migración o ejecutar pruebas manuales), es necesario interactuar con el contenedor a través de comandos como `docker exec` (por ejemplo, `docker exec -it services-marketplace-backend npx prisma db seed`).
