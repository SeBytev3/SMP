# ADR 0007: Flujo del Ciclo de Vida del Proveedor Controlado por Estado

## Estado
**Aprobado**

## Fecha
2026-05-21

## Contexto
En un Services Marketplace Platform (SMP), la confianza entre los clientes y los proveedores de servicios (electricistas, fontaneros, cerrajeros) es el activo más valioso. Si cualquier usuario pudiera registrarse como proveedor y aparecer inmediatamente en la lista pública de búsquedas, la plataforma correría el riesgo de albergar perfiles falsos, profesionales no cualificados o contenido fraudulento, degradando la reputación general de la marca.

Por lo tanto, se requiere un mecanismo estricto de control de calidad administrado por personal del sistema para vetar a cada proveedor individual antes de permitirle ofrecer servicios en la plataforma.

## Decisión
Implementar un **Flujo del Ciclo de Vida del Perfil de Proveedor controlado por una Máquina de Estados Finita**, gestionado directamente por los administradores a través del panel de control.

Los estados definidos en el campo `status` del modelo `ProviderProfile` (base de datos relacional) son:
1. **`pending` (Pendiente):** Estado inicial cuando un usuario completa su registro de proveedor. El perfil no es visible para el público. Los administradores ven la solicitud en su lista de tareas pendientes.
2. **`approved` (Aprobado):** El administrador aprueba el perfil tras validar la descripción, experiencia y certificaciones. El proveedor pasa a ser completamente visible en las búsquedas y puede recibir nuevas solicitudes de servicio.
3. **`rejected` (Rechazado):** El administrador rechaza el perfil por información insuficiente o imágenes inválidas, ingresando un motivo de rechazo explícito. El perfil vuelve a ser privado. El proveedor recibe una notificación con el motivo, permitiéndole corregir sus datos y re-enviar la solicitud, lo cual cambia su estado de vuelta a `pending`.
4. **`deactivated` (Desactivado):** Estado asignado por un administrador de forma manual debido a infracciones de conducta o a petición del propio proveedor. Oculta inmediatamente al proveedor de los resultados de búsqueda y bloquea cualquier nueva solicitud de servicio entrante.

## Consecuencias

### Positivas
- **Filtro de Calidad y Confianza Máximo:** Asegura que el 100% de los proveedores visibles para los clientes han sido previamente verificados por un administrador humano de la plataforma.
- **Flujo de Resubisión Amigable:** En lugar de eliminar las cuentas rechazadas, el estado `rejected` permite a los proveedores editar su bio, adjuntar mejores fotos de portafolios o corregir notas de disponibilidad y volver a postularse, cerrando una brecha de experiencia de usuario frustrante.
- **Seguridad Dinámica:** La capa de búsqueda del backend filtra estrictamente consultas de proveedores cuyo estado no sea exactamente `approved`. Esto previene a nivel de base de datos la filtración accidental de perfiles en revisión o bloqueados.
- **Acciones Administrativas Reversibles:** El estado `deactivated` actúa como un borrado lógico (soft-delete), preservando todo el historial de reseñas pasadas, solicitudes completadas y mensajes en la base de datos para auditorías de cumplimiento, permitiendo revertir la acción si es necesario.

### Negativas
- **Carga de Trabajo Operativa:** Requiere que los administradores dediquen tiempo activo a revisar de forma manual cada registro inicial y cada resubisión, lo cual puede generar un cuello de botella si el volumen de registros aumenta de manera exponencial.
- **Latencia de Registro:** Los proveedores legítimos experimentan un tiempo de espera obligatorio antes de poder interactuar con clientes, lo cual podría desincentivar la captación inicial de profesionales si los tiempos de revisión administrativa son prolongados.
