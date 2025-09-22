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

Permite que un cliente potencial registre su interés a través de un formulario de contacto en el frontend.

-   **Comportamiento con Email Existente:** Si ya existe un `Lead` con el `email` proporcionado, el sistema **actualizará** el `Lead` existente con la nueva información de la solicitud (tipo de solicitud, mensaje, lotes de interés, fecha de visita preferida, etc.). Si el `Lead` existente ya está vinculado a un `User`, esa vinculación se mantendrá. Si no existe un `Lead` con ese `email`, se creará uno nuevo.
-   **Método:** `POST`
-   **URL:** `/leads/contact`
-   **Rol Requerido:** Ninguno (Público)
-   **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@example.com",
  "telefono": "+5491112345678",
  "tipoConsulta": "Interesado en lotes con vista al mar"
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto del lead recién creado.

### Opciones de Generación de Leads desde el Frontend (Estado Actual)

Actualmente, el frontend maneja diversas instancias donde un cliente puede expresar interés, todas ellas canalizadas a través del endpoint `POST /leads/contact` utilizando el campo `tipoConsulta` para describir la naturaleza de la solicitud.

1.  **Formulario de Contacto General:**
    - **Propósito:** Solicitud de información general sobre el proyecto.
    - **`tipoConsulta` ejemplo:** "Interesado en información general del loteo", "Consulta sobre el proyecto Barrancas Blancas".

2.  **Formulario de Solicitud de Cotización (Simple o Múltiple):**
    - **Propósito:** Pedir una cotización para uno o varios lotes específicos.
    - **`tipoConsulta` ejemplo:** "Solicitud de cotización para Lote A-1", "Cotización para Lotes B-3 y B-4", "Información sobre precios y financiación".

3.  **Formulario de Coordinación de Visita:**
    - **Propósito:** Agendar una visita al predio o a la oficina de ventas.
    - **`tipoConsulta` ejemplo:** "Coordinar visita para el 2025-10-20", "Interesado en visitar el Lote C-2".

4.  **Formulario de Solicitud de Información sobre Financiación:**
    - **Propósito:** Obtener detalles sobre las opciones de financiación disponibles.
    - **`tipoConsulta` ejemplo:** "Consulta sobre planes de financiación", "Opciones de pago para lotes".

---

### Propuesta de Mejora: Estructuración del `CreateLeadContactDto`

El enfoque actual de usar una cadena de texto genérica (`tipoConsulta`) para describir la solicitud del lead es flexible, pero dificulta la automatización y el procesamiento estructurado de los leads en el backend. Para mejorar la categorización, el seguimiento y la automatización de flujos de trabajo, se propone modificar el `CreateLeadContactDto` para incluir un campo `tipoSolicitud` tipado y campos condicionales específicos.

**Beneficios de esta propuesta:**

- **Datos Estructurados:** Facilita el procesamiento y la categorización automática de leads en el backend.
- **Automatización Mejorada:** Permite disparar flujos de trabajo específicos (ej. asignación a un vendedor especializado, pre-llenado de un calendario de visitas) basados en el tipo de solicitud.
- **Reportes y Análisis:** Mejora la capacidad de generar informes y analizar la efectividad de las diferentes fuentes y tipos de consultas.
- **Contrato API Claro:** Proporciona una interfaz más clara y robusta entre el frontend y el backend.

**Nuevo `CreateLeadContactDto` Propuesto para `POST /leads/contact`:**

```typescript
interface LoteIdentificador {
  manzana: number;
  lote: number;
}

interface CreateLeadContactDto {
  nombre: string;
  email: string;
  telefono: string;
  // Nuevo campo para el tipo de solicitud, con valores predefinidos
  tipoSolicitud:
    | 'informacion_general'
    | 'cotizacion_simple'
    | 'cotizacion_multiple'
    | 'coordinar_visita'
    | 'financiacion';
  // Valores posibles para tipoSolicitud: 'informacion_general', 'cotizacion_simple', 'cotizacion_multiple', 'coordinar_visita', 'financiacion'.
  // Campos condicionales basados en tipoSolicitud
  mensaje?: string; // Opcional: Para 'informacion_general', 'financiacion' o cualquier detalle adicional.
  lotesInteres?: LoteIdentificador[]; // CAMBIADO: Array de objetos { manzana: number, lote: number }
  fechaVisitaPreferida?: Date; // Opcional: Para 'coordinar_visita'.
}
```

**Ejemplos de Cuerpos de Solicitud con el DTO Propuesto:**

1.  **Solicitud de Información General:**

    ```json
    {
      "nombre": "Ana Gómez",
      "email": "ana.gomez@example.com",
      "telefono": "+5491112345678",
      "tipoSolicitud": "informacion_general",
      "mensaje": "Me gustaría recibir más detalles sobre el proyecto."
    }
    ```

2.  **Solicitud de Cotización Simple:**

    ```json
    {
      "nombre": "Carlos Ruiz",
      "email": "carlos.ruiz@example.com",
      "telefono": "+5491198765432",
      "tipoSolicitud": "cotizacion_simple",
      "lotesInteres": [{ "manzana": 1, "lote": 1 }] // CAMBIADO
    }
    ```

3.  **Solicitud de Cotización Múltiple:**

    ```json
    {
      "nombre": "Laura Fernández",
      "email": "laura.fernandez@example.com",
      "telefono": "+5491155554444",
      "tipoSolicitud": "cotizacion_multiple",
      "lotesInteres": [
        { "manzana": 2, "lote": 3 },
        { "manzana": 2, "lote": 4 }
      ], // CAMBIADO
      "mensaje": "Quisiera saber el precio de estos dos lotes y sus opciones de financiación."
    }
    ```

4.  **Coordinar Visita:**

    ```json
    {
      "nombre": "Pedro López",
      "email": "pedro.lopez@example.com",
      "telefono": "+5491122223333",
      "tipoSolicitud": "coordinar_visita",
      "fechaVisitaPreferida": "2025-10-25T15:00:00.000Z",
      "lotesInteres": [{ "manzana": 3, "lote": 2 }], // CAMBIADO
      "mensaje": "Me gustaría visitar el lote C-2 el viernes por la tarde."
    }
    ```

5.  **Solicitud de Financiación:**
    ```json
    {
      "nombre": "Sofía Martínez",
      "email": "sofia.martinez@example.com",
      "telefono": "+5491177778888",
      "tipoSolicitud": "financiacion",
      "mensaje": "Necesito información detallada sobre los planes de financiación disponibles."
    }
    ```

---

### Plan de Implementación

1.  **Actualizar `docs/LEAD_MANAGEMENT.md`:** Incorporar las secciones anteriores sobre las opciones actuales del frontend y la propuesta del nuevo `CreateLeadContactDto`. (¡Ya realizado!)
2.  **Modificaciones en el Backend (Esquemático):**
    - **`src/lead/dto/create-lead.dto.ts`:**
      - Modificar la definición del DTO para el endpoint `POST /leads/contact` para incluir el campo `tipoSolicitud` (como un `enum` o unión de literales de cadena) y los campos condicionales (`mensaje`, `lotesInteres`, `fechaVisitaPreferida`) con sus decoradores de validación (`@IsOptional()`, `@IsArray()`, `@IsDateString()`, `@IsIn()`, `@IsNumber()`, `@ValidateNested()`).
      - Ejemplo de DTO actualizado:

        ```typescript
        import {
          IsString,
          IsEmail,
          IsPhoneNumber,
          IsOptional,
          IsArray,
          IsDateString,
          IsIn,
          IsNumber,
          ValidateNested,
        } from 'class-validator';
        import { Type } from 'class-transformer'; // Necesario para transformar Date

        class LoteIdentificador {
          // Nuevo DTO anidado
          @IsNumber()
          manzana: number;

          @IsNumber()
          lote: number;
        }

        export class CreateLeadContactDto {
          @IsString()
          nombre: string;

          @IsEmail()
          email: string;

          @IsPhoneNumber('AR') // Asumiendo números de teléfono de Argentina
          telefono: string;

          @IsIn([
            'informacion_general',
            'cotizacion_simple',
            'cotizacion_multiple',
            'coordinar_visita',
            'financiacion',
          ])
          tipoSolicitud:
            | 'informacion_general'
            | 'cotizacion_simple'
            | 'cotizacion_multiple'
            | 'coordinar_visita'
            | 'financiacion';

          @IsOptional()
          @IsString()
          mensaje?: string;

          @IsOptional()
          @IsArray()
          @ValidateNested({ each: true }) // Validar cada objeto en el array
          @Type(() => LoteIdentificador) // Transformar a LoteIdentificador
          lotesInteres?: LoteIdentificador[]; // CAMBIADO

          @IsOptional()
          @Type(() => Date) // Para asegurar que se transforme a objeto Date
          @IsDateString()
          fechaVisitaPreferida?: Date;
        }
        ```

    - **`src/lead/entities/lead.entity.ts`:**
      - Considerar añadir campos al esquema del `Lead` para almacenar de forma estructurada la información más relevante de la última solicitud, como `tipoUltimaSolicitud: string;` y `lotesDeInteres: { manzana: number, lote: number }[];`.
      - Añadir `userId: Types.ObjectId;` para vincular un `Lead` a un `User` una vez que el lead se registra como usuario.
    - **`src/lead/lead.service.ts`:**
      - Modificar el método que maneja `POST /leads/contact` para aceptar el nuevo `CreateLeadContactDto`.
      - **Manejo de Emails Existentes:**
        - Al recibir una solicitud, el backend **siempre creará un nuevo `Lead`** para no perder ninguna solicitud de información.
        - Antes de crear el `Lead`, se buscará un `User` existente con el `email` proporcionado.
        - Si se encuentra un `User` con ese `email`, el nuevo `Lead` se vinculará a ese `User` mediante el campo `user` (ID de usuario) en la entidad `Lead`. Esto permite mantener un historial de interacciones para usuarios registrados.
      - Implementar lógica para:
        - Establecer el `estado` inicial del lead de manera más específica (ej. "Nuevo - Cotización", "Nuevo - Visita") basándose en `tipoSolicitud`.
        - Almacenar `lotesInteres` y `fechaVisitaPreferida` en el objeto `Lead` si se considera pertinente.
        - Si `tipoSolicitud` es `'coordinar_visita'` y se proporciona `fechaVisitaPreferida`, crear automáticamente una `Actividad` de tipo `'Visita'` para este lead con la fecha programada.
        - Considerar la integración con un `CalendarService` para gestionar eventos de visita.
    - **`src/lead/lead.controller.ts`:**
      - Actualizar el decorador `@Body()` del endpoint `POST /leads/contact` para usar el nuevo `CreateLeadContactDto`.
    - **Integración con Registro de Usuario:**
      - En el servicio de autenticación (`src/auth/auth.service.ts` o `src/user/user.service.ts`), al registrar un nuevo usuario (`POST /auth/register`), buscar si existe un `Lead` con el mismo email. Si existe, vincularlo al nuevo usuario actualizando el campo `userId` del `Lead`. Si no existe, se podría crear un nuevo `Lead` con `fuente: 'registro_usuario'`.

3.  **Modificaciones en el Frontend (Esquemático):**
    - **Precarga de Datos:** Si el usuario está autenticado, los formularios de contacto deben precargar los campos `nombre`, `email` y `telefono` con los datos de la sesión del usuario.
    - Actualizar los formularios existentes (contacto general, cotización, visita, financiación) para construir y enviar el `CreateLeadContactDto` propuesto al endpoint `POST /leads/contact`.
    - Asegurar que el campo `tipoSolicitud` y los campos condicionales (`mensaje`, `lotesInteres`, `fechaVisitaPreferida`) se envíen correctamente según el formulario que se esté utilizando.
    - Para la selección de lotes, el componente de selección debe permitir elegir `manzana` y `lote` y construir el array de objetos `{ manzana: number, lote: number }` para `lotesInteres`.

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
    "roles": ["user"]
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

- **Notificaciones:** Se recomienda implementar un sistema de notificaciones internas para alertar a los vendedores cuando se les asigna un nuevo lead o cuando llega una nueva consulta. Para el registro simplificado, se debería notificar al nuevo usuario su contraseña temporal (ej. por correo electrónico o SMS).
- **Validación:** Asegurar que las validaciones de datos sean robustas en el backend para todos los campos del lead.
- **Generación de Documentos:** La generación de los documentos PDF (propuestas y boletos de compra) es una tarea que requiere una librería específica de NestJS (ej. `pdfmake`, `puppeteer` para HTML a PDF) y su implementación detallada está pendiente. Actualmente, los endpoints devuelven URLs de documentos placeholder.

## Consideraciones para el Backend y Frontend en la Gestión de Actividades

### Backend

La implementación en el backend requerirá las siguientes modificaciones:

1.  **`src/lead/dto/create-activity.dto.ts`:**
    - Definir un `enum ActivityType` con los nuevos tipos de actividad.
    - Añadir los campos opcionales (`numeroContacto`, `asuntoEmail`, `destinatarioEmail`, `fechaProgramada`, `ubicacion`, `nombreDocumento`, `urlDocumento`, `fechaVencimientoTarea`, `responsableTareaId`) con sus respectivos decoradores de `class-validator` (`@IsOptional()`, `@IsString()`, `@IsDateString()`, etc.).
2.  **`src/lead/entities/activity.entity.ts`:**
    - Actualizar la entidad `Activity` para incluir los nuevos campos opcionales, asegurándose de que sean del tipo de dato correcto (ej. `Date` para fechas, `ObjectId` para referencias a usuarios/leads).
    - Añadir un campo `registradoPor: Types.ObjectId` para registrar el usuario que creó la actividad.
3.  **`src/lead/lead.service.ts` (o `src/lead/activity.service.ts` si se crea uno):**
    - Implementar lógica condicional dentro del método de creación de actividad para procesar los campos específicos según el `tipoActividad`.
    - **Integración de Calendario:** Para `Visita`, `Reunión` y `Llamada` con `fechaProgramada`, se deberá:
      - Crear un `CalendarService` que se encargue de interactuar con una nueva entidad `CalendarEvent`.
      - La entidad `CalendarEvent` almacenará los detalles del evento (título, descripción, fecha/hora, ubicación, leadId, assignedToUserId).
      - El `LeadService` invocará al `CalendarService` para crear el evento.
    - **Gestión de Tareas:** Para `Tarea Interna`, se podría:
      - Crear un `TaskService` y una entidad `Task` para gestionar estas tareas, incluyendo fecha de vencimiento y responsable.
      - El `LeadService` invocará al `TaskService` para crear la tarea.
    - Asegurar que la validación de datos se realice correctamente antes de persistir la actividad.

### Frontend

La interfaz de usuario para la creación de actividades deberá adaptarse para permitir la selección del tipo de actividad y la entrada de datos condicionales:

1.  **Selector de Tipo de Actividad:** Implementar un `select` o `radio buttons` para que el usuario elija el `tipoActividad` (Llamada, Email, Visita, Reunión, WhatsApp/Mensaje, Tarea Interna, Documentación Enviada, Otro).
2.  **Campos Condicionales:** Basado en la selección del `tipoActividad`, el frontend deberá mostrar u ocultar dinámicamente los campos de entrada relevantes:
    - **Llamada:** Mostrar `numeroContacto`, `fechaProgramada`.
    - **Email:** Mostrar `asuntoEmail`, `destinatarioEmail`.
    - **Visita/Reunión:** Mostrar `fechaProgramada`, `ubicacion`.
    - **Tarea Interna:** Mostrar `fechaVencimientoTarea`, `responsableTareaId` (posiblemente un selector de usuarios).
    - **Documentación Enviada:** Mostrar `nombreDocumento`, `urlDocumento`.
    - **Otro:** Solo mostrar `comentarios` (que debería ser obligatorio en este caso).
3.  **Validación en Frontend:** Implementar validaciones en el lado del cliente para guiar al usuario y asegurar que los datos enviados al backend sean correctos.
4.  **Envío de Datos:** El frontend deberá construir el objeto `CreateActivityDto` dinámicamente, incluyendo solo los campos relevantes para el `tipoActividad` seleccionado, y enviarlo al endpoint `/leads/:id/activity`.
