# ADR 0003: Base de Datos Relacional con Prisma ORM

## Estado
**Aprobado**

## Fecha
2026-05-21

## Contexto
El sistema gestiona múltiples entidades altamente interconectadas:
- Un **Usuario** puede tener un único **Perfil de Proveedor** (si su rol es proveedor).
- Un **Cliente** y un **Proveedor** están asociados a través de múltiples **Solicitudes de Servicio**.
- Cada **Solicitud de Servicio** puede tener exactamente una **Reseña** cuantitativa y cualitativa única asociada a ella.
- Las **Conversaciones y Mensajes** de chat en la plataforma se vinculan directamente a los usuarios participantes y opcionalmente a una solicitud de servicio contextual.

Para garantizar la consistencia, integridad de los datos y evitar registros huérfanos, es vital contar con un motor de persistencia robusto y herramientas que proporcionen tipado estático seguro durante el desarrollo.

## Decisión
1. Utilizar **PostgreSQL** como motor de base de datos relacional primario.
2. Utilizar **Prisma ORM** como la capa de persistencia, generación de esquemas, mapeo objeto-relacional y gestor de migraciones.

## Consecuencias

### Positivas
- **Integridad Referencial Garantizada:** PostgreSQL gestiona a nivel nativo claves foráneas, restricciones de unicidad (como la combinación única de `request_id` en las reseñas) y eliminaciones en cascada.
- **Tipado Seguro de Extremo a Extremo (Type-Safe ORM):** Prisma autogenera tipos TypeScript basados en el archivo de esquema `schema.prisma`. Esto asegura que cualquier consulta a la base de datos devuelva objetos tipados de forma exacta, eliminando errores en tiempo de ejecución.
- **Migraciones Automatizadas y Versionadas:** Prisma Migrate genera archivos SQL deterministas que se guardan en el repositorio Git, garantizando que el esquema de base de datos en desarrollo, pruebas locales y producción sea siempre el mismo.
- **Seeding Consistente:** Permite inicializar y poblar la base de datos de manera uniforme tanto en desarrollo como en la suite de pruebas.

### Negativas
- **Curva de Aprendizaje de Prisma:** Algunas consultas de agregación complejas o de optimización muy específica pueden requerir el uso de consultas SQL crudas (`$queryRaw`) si las limitaciones conceptuales del query builder de Prisma se vuelven un obstáculo.
- **Sobrecarga de Generación de Clientes:** Cada cambio de esquema requiere volver a generar el cliente de Prisma localmente (`prisma generate`), lo cual es un paso necesario en los pipelines de build.
