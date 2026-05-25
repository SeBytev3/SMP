# ADR 0002: Estilo Arquitectónico: Monolito por Capas

## Estado
**Aprobado**

## Fecha
2026-05-21

## Contexto
El sistema conecta tres actores principales (Clientes, Proveedores, Administradores) a través de diversos dominios (autenticación, búsquedas, solicitudes de servicio, mensajería, notificaciones y reseñas). 

Al seleccionar la arquitectura del backend, evaluamos el uso de una arquitectura basada en microservicios frente a un monolito. A pesar de que los microservicios ofrecen escalabilidad independiente por dominio, conllevan una complejidad de red sustancial, consistencia eventual en la base de datos y una sobrecarga operacional inviable para el tamaño del equipo y el estado actual de madurez del producto.

## Decisión
Diseñar el backend del sistema bajo un estilo arquitectónico de **Monolito por Capas** (Layered Monolith), asegurando una separación de responsabilidades limpia y modular dentro de una única unidad de ejecución.

Se estructuran las siguientes capas de desarrollo dentro del directorio `/server/src`:
1. **Rutas (Routes):** Exponen y enrutan los endpoints HTTP/REST.
2. **Middlewares:** Manejan la seguridad (JWT), validación sintáctica de datos (Zod), rate limiting y auditoría.
3. **Controladores (Controllers):** Orquestan el procesamiento de solicitudes HTTP, interactúan con la capa de servicios y estructuran las respuestas estándar.
4. **Servicios (Services):** Albergan la lógica de negocio pura, las reglas del sistema y los cálculos cuantitativos (por ejemplo, cálculo de reputación promedio de proveedores).
5. **Acceso a Datos (Prisma/DB):** Capa de abstracción de datos e interacción con el motor relacional PostgreSQL.

## Consecuencias

### Positivas
- **Velocidad de Iteración Extrema:** Todo el código reside en el mismo proceso del servidor, eliminando latencias de red internas y llamadas gRPC/HTTP entre microservicios.
- **Transacciones ACID Sencillas:** Al operar sobre un único motor relacional PostgreSQL, podemos garantizar consistencia inmediata en operaciones críticas (por ejemplo, completar una solicitud de servicio y forzar la exclusividad de su reseña asociada).
- **Despliegue y Mantenimiento de Bajo Costo:** Un único contenedor Docker aloja toda la lógica del backend, minimizando los costos de infraestructura de servidores en producción.
- **Fácil Transición a Microservicios:** La clara delimitación entre capas y dominios lógicos (Auth, Provider, Request, Review, Message, Notification) permitirá separar dominios específicos en servicios independientes más adelante con mínima fricción si la carga del sistema lo demanda.

### Negativas
- **Escalabilidad Global Acoplada:** Si el servicio de búsquedas de proveedores experimenta una alta demanda, todo el monolito (incluida la mensajería y la autenticación) debe ser escalado horizontalmente en conjunto.
- **Punto Único de Falla:** Un error crítico de memoria o bloqueo en cualquiera de los controladores afectará la disponibilidad completa de toda la plataforma de servicios.
