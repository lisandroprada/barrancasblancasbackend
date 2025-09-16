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
  "asignadoA": "60d5ec49f8c7a1001c8e4d5b"
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

Permite a un administrador o vendedor registrar una nueva interacción con un lead.

- **Método:** `POST`
- **URL:** `/leads/:id/activity`
- **Rol Requerido:** `admin`, `vendedor`
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "tipoActividad": "Llamada",
  "comentarios": "Se contactó al cliente, mostró interés en Lote 5.",
  "proximoPaso": "Enviar propuesta por email"
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
