# ADR 0004: Estandarización Monolingüe en Español (Remoción de i18n)

## Estado
**Aprobado**

## Fecha
2026-05-21

## Contexto
Originalmente, el sistema contemplaba una arquitectura internacionalizada con soporte bilingüe (Español e Inglés), implementado dinámicamente mediante `i18next` y middlewares de detección de lenguaje tanto en el servidor como en el cliente. 

Sin embargo, el despliegue comercial y la base inicial de usuarios del Services Marketplace Platform (SMP) están enfocados estrictamente en el mercado hispanohablante de América del Sur (específicamente Colombia, con soporte para departamentos y ciudades del país). Mantener esquemas bilingües e infraestructura de traducciones en tiempo de ejecución introdujo:
1. Complejidad en las respuestas del API y middlewares adicionales redundantes.
2. Bloat en el tamaño del bundle del frontend y dependencias adicionales (`react-i18next`, `i18next-http-middleware`, `i18next-fs-backend`, etc.).
3. Esfuerzo de mantenimiento duplicado al requerir que cada nueva validación sintáctica, mensaje de error o notificación del sistema tuviera archivos JSON de localización emparejados.
4. Complejidad y redundancia en el esquema de base de datos (`nameEs` / `nameEn` y `descriptionEs` / `descriptionEn` en categorías).

## Decisión
Desmantelar completamente la infraestructura dinámica de internacionalización (i18n) en todo el monorepo y **estandarizar la plataforma estrictamente en español**.

Esto implica:
1. Eliminar las dependencias de `i18next` en `package.json`, `server/package.json` y `client/package.json`.
2. Remover el middleware de traducción en el servidor y las carpetas `locales` que contenían los archivos JSON.
3. Hardcodear todos los mensajes de error del API, mensajes del sistema y notificaciones generadas en español.
4. Mapear de forma directa en los controladores los campos de localización de la base de datos (por ejemplo, tomar `nameEs` y mapearlo al atributo `name` esperado por el cliente) para asegurar compatibilidad de campos en la interfaz sin requerir la costosa alteración destructiva de la estructura de la base de datos existente.

## Consecuencias

### Positivas
- **Simplificación Extrema del Código:** Los controladores y middlewares son significativamente más limpios, comprensibles y fáciles de auditar.
- **Reducción del Bundle de Producción:** Se removieron múltiples paquetes del bundle de cliente React y dependencias del backend, optimizando el tiempo de construcción y el rendimiento del servidor.
- **Lógica de Validación Directa:** Los mensajes de error de los validadores sintácticos de Zod se definen directamente en español literal sin necesidad de mapeadores intermedios o llamadas dinámicas a métodos `.t()`.
- **Mantenimiento Ágil:** Los desarrolladores agregan nuevas funcionalidades con un único flujo de textos, evitando la necesidad de mantener sincronizados archivos de traducción.

### Negativas
- **Falta de Adaptabilidad Geográfica Inmediata:** Si en el futuro el negocio decide expandirse a mercados no hispanohablantes (como Estados Unidos o Brasil), será necesario volver a instrumentar la base de código con capas de traducción (i18n), aunque esta posibilidad comercial está fuera del roadmap estratégico a mediano plazo.
