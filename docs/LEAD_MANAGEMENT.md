# Documentación del Módulo de Gestión de Leads

Este documento detalla los endpoints y el modelo de datos para la gestión de leads en el sistema Barrancas Blancas. Los leads representan clientes potenciales que han mostrado interés en los lotes.

## Modelo de Datos del Lead

A continuación se describe la estructura del objeto `Lead`.

```json
{
  "_id": "string",
  "nombre": "string",
  "email": "string",
  "telefono": "string",
  "fuente": "frontend" | "manual" | "otro",
  "estado": "Nuevo" | "En contacto" | "Calificado" | "Descartado",
  "fechaCreacion": "date",
  "asignadoA": "string (ID de Usuario)" | null,
  "user": "string (ID de Usuario)" | null
}
```

## Endpoints Públicos

### 1. Registrar Contacto (Crear Lead desde Frontend)

Permite que un cliente potencial registre su interés a través de un formulario de contacto en el frontend. Este endpoint crea un nuevo `Lead` con `fuente: 'frontend'` y `estado: 'Nuevo'`.

- **Método:** `POST`
- **URL:** `/leads/contact`
- **Rol Requerido:** Ninguno (Público)
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@example.com",
  "telefono": "+5491112345678",
  "tipoConsulta": "Interesado en lotes con vista al mar"
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto del lead recién creado.

## Endpoints de Gestión (Rol `admin` o `vendedor` requerido)

Todas las solicitudes a los endpoints de gestión deben incluir un token JWT válido en el encabezado de autorización. El usuario asociado al token debe tener el rol de `admin` o `vendedor`.

**Encabezado Requerido:**
`Authorization: Bearer <token>`

### 1. Crear un Nuevo Lead (Manual)

Permite a un administrador o vendedor crear un lead manualmente en el sistema.

- **Método:** `POST`
- **URL:** `/leads`
- **Rol Requerido:** `admin`, `vendedor`
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "nombre": "María García",
  "email": "maria.garcia@example.com",
  "telefono": "+5491187654321",
  "fuente": "manual",
  "estado": "En contacto",
  "asignadoA": "60d5ec49f8c7a1001c8e4d5a" // Opcional: ID del vendedor
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto del lead recién creado.

### 2. Obtener todos los Leads

Retorna un listado completo de todos los leads registrados en el sistema.

- **Método:** `GET`
- **URL:** `/leads`
- **Rol Requerido:** `admin`, `vendedor`
- **Respuesta Exitosa (200):** Devuelve un arreglo de objetos de lead.

### 3. Obtener un Lead por ID

Retorna la información detallada de un lead específico.

- **Método:** `GET`
- **URL:** `/leads/:id`
- **Rol Requerido:** `admin`, `vendedor`
- **Respuesta Exitosa (200):** Devuelve el objeto del lead solicitado.

### 4. Actualizar un Lead

Permite modificar la información de un lead existente. Todos los campos son opcionales.

- **Método:** `PATCH`
- **URL:** `/leads/:id`
- **Rol Requerido:** `admin`, `vendedor`
- **Cuerpo de la Solicitud (`application/json`):** Enviar solo los campos a modificar.

```json
{
  "estado": "Calificado",
  "asignadoA": "60d5ec49f8c7a1001c8e4d5b" // **Debe ser un _id de usuario válido (24 caracteres hexadecimales)**
}
```

Para desasignar un vendedor (quitar la asignación), enviar `null` para el campo `asignadoA`:

```json
{
  "asignadoA": null
}
```

- **Respuesta Exitosa (200):** Devuelve el objeto del lead actualizado.

### 5. Eliminar un Lead

Elimina un lead del sistema de forma permanente.

- **Método:** `DELETE`
- **URL:** `/leads/:id`
- **Rol Requerido:** `admin`
- **Respuesta Exitosa (200):** Devuelve el objeto del lead que fue eliminado.

### 6. Asignar Lead a Vendedor

Permite a un administrador asignar un lead a un vendedor específico.

- **Método:** `PATCH`
- **URL:** `/leads/:id/assign`
- **Rol Requerido:** `admin`
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "vendedorId": "60d5ec49f8c7a1001c8e4d5a"
}
```

- **Respuesta Exitosa (200):** Devuelve el objeto del lead actualizado.

### 7. Registrar Lead como Usuario

Permite a un administrador registrar un lead existente como un nuevo usuario en el sistema. Se generará una contraseña temporal para el nuevo usuario.

- **Método:** `POST`
- **URL:** `/leads/:id/register-user`
- **Rol Requerido:** `admin`
- **Respuesta Exitosa (201):** Devuelve el objeto del usuario recién creado y la contraseña temporal.

```json
{
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "roles": ["user"],
    // ... otros campos del usuario
  },
  "temporaryPassword": "string"
}
```

### 8. Registrar Actividad para un Lead

Permite a un administrador o vendedor registrar una nueva interacción con un lead. Se han ampliado los tipos de actividad y se han añadido campos condicionales para una mayor granularidad.

- **Método:** `POST`
- **URL:** `/leads/:id/activity`
- **Rol Requerido:** `admin`, `vendedor`
- **Cuerpo de la Solicitud (`application/json`):**

El `tipoActividad` ahora puede ser uno de los siguientes: `Llamada`, `Email`, `Visita`, `Reunión`, `WhatsApp/Mensaje`, `Tarea Interna`, `Documentación Enviada`, `Otro`.

El cuerpo de la solicitud puede incluir campos adicionales dependiendo del `tipoActividad` seleccionado:

```json
{
  "tipoActividad": "Llamada",
  "comentarios": "Se contactó al cliente, mostró interés en Lote 5.",
  "proximoPaso": "Enviar propuesta por email",
  "numeroContacto": "+5491112345678", // Opcional, para Llamada
  "fechaProgramada": "2025-10-20T10:00:00.000Z" // Opcional, para Llamada, Visita, Reunión
}
```

```json
{
  "tipoActividad": "Email",
  "comentarios": "Se envió información sobre los lotes disponibles.",
  "asuntoEmail": "Información Lotes Barrancas Blancas", // Opcional, para Email
  "destinatarioEmail": "cliente@example.com" // Opcional, para Email
}
```

```json
{
  "tipoActividad": "Visita",
  "comentarios": "Visita programada al terreno.",
  "fechaProgramada": "2025-10-25T14:30:00.000Z", // Opcional, para Visita, Reunión
  "ubicacion": "Oficina de Ventas / Lote 12" // Opcional, para Visita, Reunión
}
```

```json
{
  "tipoActividad": "Tarea Interna",
  "comentarios": "Investigar historial de compras del cliente.",
  "fechaVencimientoTarea": "2025-10-18T17:00:00.000Z", // Opcional, para Tarea Interna
  "responsableTareaId": "60d5ec49f8c7a1001c8e4d5c" // Opcional, para Tarea Interna
}
```

```json
{
  "tipoActividad": "Documentación Enviada",
  "comentarios": "Se envió el brochure de lotes premium.",
  "nombreDocumento": "Brochure Lotes Premium", // Opcional, para Documentación Enviada
  "urlDocumento": "https://example.com/brochure.pdf" // Opcional, para Documentación Enviada
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto de la actividad recién creada.


### 9. Obtener Historial de Actividades de un Lead

Retorna todas las actividades registradas para un lead específico.

- **Método:** `GET`
- **URL:** `/leads/:id/activity`
- **Rol Requerido:** `admin`, `vendedor`
- **Respuesta Exitosa (200):** Devuelve un arreglo de objetos de actividad.

### 10. Generar Propuesta para un Lead y Lote

Permite a un administrador o vendedor generar una propuesta formal para un lead y un lote específico. Esto generará un documento (PDF) y lo asociará a la propuesta.

- **Método:** `POST`
- **URL:** `/leads/:id/proposal`
- **Rol Requerido:** `admin`, `vendedor`
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "loteId": "string",
  "montoTotal": 150000,
  "condicionesPago": "30% de anticipo, 12 cuotas fijas",
  "fechaExpiracion": "2025-10-30T23:59:59.000Z"
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto de la propuesta recién creada, incluyendo la URL del documento generado.

### 11. Generar Boleto de Compra para un Lead y Lote

Permite a un administrador o vendedor generar un boleto de compra formal para un lead y un lote específico. Esto generará un documento (PDF) y lo asociará al boleto de compra.

- **Método:** `POST`
- **URL:** `/leads/:id/purchase-ticket`
- **Rol Requerido:** `admin`, `vendedor`
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "loteId": "string",
  "montoFinal": 145000,
  "condicionesFinales": "Pago total al contado, entrega inmediata"
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto del boleto de compra recién creado, incluyendo la URL del documento generado.

## Consideraciones Adicionales

*   **Notificaciones:** Se recomienda implementar un sistema de notificaciones internas para alertar a los vendedores cuando se les asigna un nuevo lead o cuando llega una nueva consulta. Para el registro simplificado, se debería notificar al nuevo usuario su contraseña temporal (ej. por correo electrónico o SMS).
*   **Validación:** Asegurar que las validaciones de datos sean robustas en el backend para todos los campos del lead.
*   **Generación de Documentos:** La generación de los documentos PDF (propuestas y boletos de compra) es una tarea que requiere una librería específica de NestJS (ej. `pdfmake`, `puppeteer` para HTML a PDF) y su implementación detallada está pendiente. Actualmente, los endpoints devuelven URLs de documentos placeholder.

## Consideraciones para el Backend y Frontend en la Gestión de Actividades

### Backend

La implementación en el backend requerirá las siguientes modificaciones:

1.  **`src/lead/dto/create-activity.dto.ts`:**
    *   Definir un `enum ActivityType` con los nuevos tipos de actividad.
    *   Añadir los campos opcionales (`numeroContacto`, `asuntoEmail`, `destinatarioEmail`, `fechaProgramada`, `ubicacion`, `nombreDocumento`, `urlDocumento`, `fechaVencimientoTarea`, `responsableTareaId`) con sus respectivos decoradores de `class-validator` (`@IsOptional()`, `@IsString()`, `@IsDateString()`, etc.).
2.  **`src/lead/entities/activity.entity.ts`:**
    *   Actualizar la entidad `Activity` para incluir los nuevos campos opcionales, asegurándose de que sean del tipo de dato correcto (ej. `Date` para fechas, `ObjectId` para referencias a usuarios/leads).
    *   Añadir un campo `registradoPor: Types.ObjectId` para registrar el usuario que creó la actividad.
3.  **`src/lead/lead.service.ts` (o `src/lead/activity.service.ts` si se crea uno):**
    *   Implementar lógica condicional dentro del método de creación de actividad para procesar los campos específicos según el `tipoActividad`.
    *   **Integración de Calendario:** Para `Visita`, `Reunión` y `Llamada` con `fechaProgramada`, se deberá:
        *   Crear un `CalendarService` que se encargue de interactuar con una nueva entidad `CalendarEvent`.
        *   La entidad `CalendarEvent` almacenará los detalles del evento (título, descripción, fecha/hora, ubicación, leadId, assignedToUserId).
        *   El `LeadService` invocará al `CalendarService` para crear el evento.
    *   **Gestión de Tareas:** Para `Tarea Interna`, se podría:
        *   Crear un `TaskService` y una entidad `Task` para gestionar estas tareas, incluyendo fecha de vencimiento y responsable.
        *   El `LeadService` invocará al `TaskService` para crear la tarea.
    *   Asegurar que la validación de datos se realice correctamente antes de persistir la actividad.

### Frontend

La interfaz de usuario para la creación de actividades deberá adaptarse para permitir la selección del tipo de actividad y la entrada de datos condicionales:

1.  **Selector de Tipo de Actividad:** Implementar un `select` o `radio buttons` para que el usuario elija el `tipoActividad` (Llamada, Email, Visita, Reunión, WhatsApp/Mensaje, Tarea Interna, Documentación Enviada, Otro).
2.  **Campos Condicionales:** Basado en la selección del `tipoActividad`, el frontend deberá mostrar u ocultar dinámicamente los campos de entrada relevantes:
    *   **Llamada:** Mostrar `numeroContacto`, `fechaProgramada`.
    *   **Email:** Mostrar `asuntoEmail`, `destinatarioEmail`.
    *   **Visita/Reunión:** Mostrar `fechaProgramada`, `ubicacion`.
    *   **Tarea Interna:** Mostrar `fechaVencimientoTarea`, `responsableTareaId` (posiblemente un selector de usuarios).
    *   **Documentación Enviada:** Mostrar `nombreDocumento`, `urlDocumento`.
    *   **Otro:** Solo mostrar `comentarios` (que debería ser obligatorio en este caso).
3.  **Validación en Frontend:** Implementar validaciones en el lado del cliente para guiar al usuario y asegurar que los datos enviados al backend sean correctos.
4.  **Envío de Datos:** El frontend deberá construir el objeto `CreateActivityDto` dinámicamente, incluyendo solo los campos relevantes para el `tipoActividad` seleccionado, y enviarlo al endpoint `/leads/:id/activity`.
