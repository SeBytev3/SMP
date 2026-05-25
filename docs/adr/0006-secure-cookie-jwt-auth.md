# ADR 0006: Almacenamiento Seguro de JWT en Cookies HTTP-only

## Estado
**Aprobado**

## Fecha
2026-05-21

## Contexto
El Services Marketplace Platform (SMP) utiliza JSON Web Tokens (JWT) para autorizar las solicitudes del cliente al backend. 

En muchas aplicaciones de una sola página (SPA), los desarrolladores almacenan el token JWT en el almacenamiento local del navegador (`localStorage` o `sessionStorage`) y lo adjuntan manualmente al encabezado `Authorization: Bearer <token>` en cada petición. Sin embargo, esta práctica expone directamente el token de autenticación a cualquier secuencia de comandos maliciosa que pueda ejecutarse en el navegador a través de ataques de Cross-Site Scripting (XSS). Si un atacante inyecta JavaScript, puede robar el token del almacenamiento local de inmediato y suplantar al usuario.

## Decisión
Almacenar los tokens JWT firmados generados por el servidor dentro de **cookies protegidas con los atributos HTTP-only, Secure y SameSite=Strict**.

El flujo funciona de la siguiente manera:
1. El backend, al autenticar exitosamente a un usuario (registro o inicio de sesión), genera un token firmado.
2. Este token se adjunta a la respuesta HTTP en la cabecera `Set-Cookie` con la configuración:
   - `httpOnly: true`: Bloquea cualquier intento de acceder a la cookie mediante código JavaScript (`document.cookie` no tendrá visibilidad sobre ella).
   - `secure: true`: La cookie solo se transmitirá a través de conexiones seguras y cifradas HTTPS (en desarrollo se permite HTTP únicamente si el destino es `localhost`).
   - `sameSite: 'strict'`: Restringe la cookie para que solo se envíe en solicitudes originadas en el propio dominio de la plataforma, bloqueando ataques de Cross-Site Request Forgery (CSRF) de origen cruzado.
3. El navegador del cliente React incluye automáticamente esta cookie en cada llamada subsiguiente al API de forma implícita.

## Consecuencias

### Positivas
- **Inmunidad frente a Robo de Sesión por XSS:** Al usar `httpOnly`, incluso si un atacante encuentra una vulnerabilidad de inyección de código JavaScript en la interfaz, le resultará imposible extraer el token JWT del usuario.
- **Defensa Robusta contra CSRF:** El atributo `sameSite: 'strict'` proporciona una protección nativa de alto nivel contra solicitudes maliciosas que intenten gatillar mutaciones de sesión desde páginas web externas.
- **Experiencia de Cliente Fluida:** La autenticación se maneja a nivel de protocolo por el navegador. El cliente React no necesita lógica compleja en JavaScript para almacenar, adjuntar o gestionar el token en el almacenamiento persistente, reduciendo la complejidad del código.

### Negativas
- **Configuración de CORS y Credenciales Estricta:** Requiere configurar explícitamente `credentials: 'include'` en todas las peticiones de Axios/Fetch en el frontend, y forzar que el backend tenga configurada la cabecera `Access-Control-Allow-Credentials: true` junto con orígenes explícitos (no comodín `*`).
- **Complejidad de Subdominios y Despliegues Cruzados:** Si el cliente y el servidor están desplegados en dominios base completamente diferentes (por ejemplo, `smp-app.com` y `smp-api.net`), se requerirá mayor configuración en la directiva SameSite (`sameSite: 'none'`), aunque en nuestra estructura monorepo local con Docker se mitiga al estar expuestos sobre el mismo host local.
