# Documentación de Endpoints de Lotes (Gestión para Admin)

Esta documentación detalla los endpoints para la gestión ABM (Alta, Baja y Modificación) de lotes, diseñada para ser consumida por un dashboard de administración.

## Autenticación

Todas las solicitudes a los endpoints de gestión deben incluir un token JWT válido en el encabezado de autorización. El usuario asociado al token debe tener el rol de `admin`.

**Encabezado Requerido:**
`Authorization: Bearer <token>`

---

## Modelo de Datos del Lote

A continuación se describe la estructura del objeto `Lote`.

```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "manzana": "string",
  "lote": "string",
  "m2": "number",
  "metros_frente": "number",
  "caracteristicas": ["vista_al_mar" | "contra_frente" | "lateral"],
  "propietario": "FANE" | "HENRY" | "CAUTIO",
  "estadoProcesoVenta": "Disponible" | "En negociación" | "Reservado" | "Vendido",
  "featured": "boolean",
  "client": {
    "_id": "string",
    "name": "string",
    "email": "string"
    // ... otros campos del usuario
  } | null,
  "status": "disponible" | "reservado" | "vendido",
  "reservationDate": "date",
  "lastStatusModifiedAt": "date",
  "statusChangeLog": [
    {
      "status": "string",
      "changedBy": "string (ID de Usuario)",
      "changedAt": "date"
    }
  ]
}
```

**Nota sobre `client`:** El campo `client` será populado con el objeto completo del usuario cuando se consulten los lotes. Si no hay un cliente asociado, será `null`.

---

## Endpoints de Gestión (Rol `admin` requerido)

### 1. Crear un Nuevo Lote

Permite dar de alta un nuevo lote en el sistema.

- **Método:** `POST`
- **URL:** `/lote`
- **Rol Requerido:** `admin`
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "name": "Lote 1 - Manzana A",
  "description": "Lote con excelente ubicación cerca del área verde.",
  "price": 50000,
  "manzana": "A",
  "lote": "1",
  "m2": 300,
  "metros_frente": 10,
  "caracteristicas": ["vista_al_mar"],
  "propietario": "FANE",
  "estadoProcesoVenta": "Disponible",
  "featured": true,
  "clientId": "60d5ec49f8c7a1001c8e4d5a", // Opcional: ID del usuario cliente
  "status": "disponible"
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto del lote recién creado.

### 2. Obtener todos los Lotes

Retorna un listado completo de todos los lotes registrados en el sistema, con el campo `client` populado con los datos del usuario asociado.

- **Método:** `GET`
- **URL:** `/lote`
- **Rol Requerido:** `admin`
- **Respuesta Exitosa (200):** Devuelve un arreglo de objetos de lote.

### 3. Obtener un Lote por ID

Retorna la información detallada de un lote específico, con el campo `client` populado.

- **Método:** `GET`
- **URL:** `/lote/:id`
- **Rol Requerido:** `admin`
- **Respuesta Exitosa (200):** Devuelve el objeto del lote solicitado.

### 4. Actualizar un Lote

Permite modificar la información de un lote existente. Es el endpoint principal para cambiar el estado de un lote (ej. de `disponible` a `reservado`).

- **Método:** `PATCH`
- **URL:** `/lote/:id`
- **Rol Requerido:** `admin`
- **Cuerpo de la Solicitud (`application/json`):** Todos los campos son opcionales. Envía solo los campos que deseas modificar.

**Ejemplos:**

**1. Cambiar el estado y asignar un cliente:**
```json
{
  "status": "reservado",
  "clientId": "60d5ec49f8c7a1001c8e4d5b", // ID del usuario cliente
  "reservationDate": "2025-10-20T10:00:00.000Z"
}
```

**2. Actualizar características y metros cuadrados:**
```json
{
  "m2": 350,
  "metros_frente": 12,
  "caracteristicas": ["contra_frente"]
}
```

**3. Cambiar el propietario y marcar como destacado:**
```json
{
  "propietario": "HENRY",
  "featured": true
}
```

**4. Desvincular un cliente (establecer `clientId` a `null` o cadena vacía):**
```json
{
  "clientId": null
}
```

- **Respuesta Exitosa (200):** Devuelve el objeto del lote actualizado.
- **Nota Importante:** Al cambiar el campo `status`, el sistema registrará automáticamente quién (`changedBy`) y cuándo (`changedAt`) realizó el cambio en el historial `statusChangeLog`.

### 5. Eliminar un Lote

Elimina un lote del sistema de forma permanente.

- **Método:** `DELETE`
- **URL:** `/lote/:id`
- **Rol Requerido:** `admin`
- **Respuesta Exitosa (200):** Devuelve el objeto del lote que fue eliminado.

---

## Endpoints Públicos

### Obtener Lotes Disponibles

Este endpoint es público y no requiere autenticación. Está pensado para ser consumido por la web o app pública para mostrar los lotes que están a la venta. El campo `client` también será populado.

- **Método:** `GET`
- **URL:** `/lote/available`
- **Rol Requerido:** Ninguno (Público)
- **Respuesta Exitosa (200):** Devuelve un arreglo con los lotes cuyo estado es `disponible`.

### Obtener Lotes Destacados

Este endpoint es público y no requiere autenticación. Retorna una lista de hasta 6 lotes marcados como `featured: true` y con `status: disponible`. Está diseñado para ser consumido por el frontend para mostrar lotes destacados en la página principal o secciones relevantes.

- **Método:** `GET`
- **URL:** `/lote/featured`
- **Rol Requerido:** Ninguno (Público)
- **Respuesta Exitosa (200):** Devuelve un arreglo de hasta 6 objetos de lote, con el campo `client` populado. Cada objeto de lote incluirá los campos `lote`, `manzana`, `price`, `m2` y `caracteristicas`.

### Obtener Todos los Lotes (Público para Representación Frontend)

Este endpoint es público y no requiere autenticación. Está diseñado específicamente para que el frontend pueda representar visualmente todos los lotes (vendidos, reservados, disponibles) en un mapa o diseño general. Excluye información sensible como el `propietario` y el `client`.

- **Método:** `GET`
- **URL:** `/lote/public-all`
- **Rol Requerido:** Ninguno (Público)
- **Respuesta Exitosa (200):** Devuelve un objeto con dos propiedades:
    - `lots`: Un arreglo de objetos de lote. Cada objeto de lote **no incluirá** los campos `propietario` ni `client`.
    - `metadata`: Un objeto que contiene información agregada por `manzana`, indicando la cantidad de lotes en cada estado (`disponible`, `reservado`, `vendido`).

**Ejemplo de Respuesta:**
```json
{
  "lots": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "manzana": "string",
      "lote": "string",
      "m2": "number",
      "metros_frente": "number",
      "caracteristicas": ["vista_al_mar" | "contra_frente" | "lateral"],
      "featured": "boolean",
      "status": "disponible" | "reservado" | "vendido",
      "reservationDate": "date",
      "lastStatusModifiedAt": "date",
      "statusChangeLog": []
    }
    // ... más lotes
  ],
  "metadata": {
    "A": {
      "disponible": 5,
      "reservado": 2,
      "vendido": 3
    },
    "B": {
      "disponible": 10,
      "reservado": 0,
      "vendido": 1
    }
  }
}
```

---

## Consideraciones Adicionales y Sugerencias

1.  **Vinculación con Clientes:** El campo `client` ahora es una referencia directa al `_id` de un usuario en la colección de `users`. Esto permite:
    -   Tener un historial más robusto de asignaciones.
    -   Evitar inconsistencias en los nombres de los clientes.
    -   Acceder fácilmente al perfil completo del cliente asociado a un lote.

2.  **Historial de Cambios (`statusChangeLog`):** Este arreglo es una herramienta poderosa para auditoría. El dashboard de admin puede utilizarlo para mostrar un historial detallado de cómo ha cambiado el estado de un lote a lo largo del tiempo y qué administrador realizó cada cambio.

3.  **Búsqueda y Filtrado:** Para un dashboard avanzado, sería útil expandir el endpoint `GET /lote` para que acepte parámetros de consulta (query params) que permitan filtrar por `status`, `manzana`, etc. Ejemplo: `GET /lote?status=reservado&manzana=A`.
