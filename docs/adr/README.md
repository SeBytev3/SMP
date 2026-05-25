# Architectural Decision Records (ADR) — SMP

Este directorio contiene los Registros de Decisiones de Arquitectura (ADR, por sus siglas en inglés) para la **Plataforma de Servicios (Services Marketplace Platform - SMP)**. Cada registro detalla una decisión técnica clave tomada a lo largo del desarrollo, su contexto y sus consecuencias.

## Índice de Decisiones

| ID | Título | Estado | Fecha |
|---|---|---|---|
| [ADR-0001](0001-monorepo-workspaces.md) | Arquitectura Monorepo con Workspaces de npm | **Aprobado** | 2026-05-21 |
| [ADR-0002](0002-layered-monolith.md) | Estilo Arquitectónico: Monolito por Capas | **Aprobado** | 2026-05-21 |
| [ADR-0003](0003-relational-database-prisma.md) | Base de Datos Relacional con Prisma ORM | **Aprobado** | 2026-05-21 |
| [ADR-0004](0004-spanish-monolingual-standard.md) | Estandarización Monolingüe en Español (Remoción de i18n) | **Aprobado** | 2026-05-21 |
| [ADR-0005](0005-zero-intervention-docker-deployment.md) | Despliegue con Cero Intervención usando Docker Compose | **Aprobado** | 2026-05-21 |
| [ADR-0006](0006-secure-cookie-jwt-auth.md) | Almacenamiento Seguro de JWT en Cookies HTTP-only | **Aprobado** | 2026-05-21 |
| [ADR-0007](0007-stateful-provider-moderation.md) | Flujo del Ciclo de Vida del Proveedor Controlado por Estado | **Aprobado** | 2026-05-21 |

---

*Para más detalles sobre los objetivos iniciales y el alcance del sistema, consulte el documento principal de especificaciones [SPEC.md](../../plans/0000-services-marketplace/SPEC.md).*
