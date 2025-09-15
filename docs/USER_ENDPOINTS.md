# Documentación de Endpoints de Usuario (v2)

Esta documentación describe los endpoints para gestionar usuarios en el sistema.

## Autenticación

Todas las solicitudes a estos endpoints deben incluir un token JWT en el encabezado de autorización:

`Authorization: Bearer <token>`

## Modelo de Datos del Usuario

```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "roles": ["string"],
  "createdAt": "date",
  "updatedAt": "date",
  "profileComplete": "boolean",
  "phone": "string",
  "dni": "string",
  "birthDate": "date",
  "address": "string",
  "city": "string",
  "province": "string",
  "zipCode": "string",
  "occupation": "string",
  "monthlyIncome": "string",
  "investmentExperience": "string",
  "preferredContactMethod": "string",
  "interestedLotSize": "string",
  "budget": "string",
  "timeline": "string",
  "documents": [
    {
      "_id": "string",
      "name": "string",
      "type": "string",
      "url": "string",
      "uploadedAt": "date"
    }
  ]
}
```

---

## Endpoints

### 1. Crear Usuario

Crea un nuevo usuario. **Rol Requerido:** `admin`.

- **Método:** `POST`
- **URL:** `/user`
- **Cuerpo de la Solicitud (`application/json`):**

```json
{
  "name": "Nombre del Usuario",
  "email": "usuario@example.com",
  "password": "unaContraseñaSegura"
}
```

- **Respuesta Exitosa (201):** Devuelve el objeto de usuario recién creado (sin los campos de perfil extendido).

```json
{
  "_id": "60d5ecb8b4850b4f8c5a3a21",
  "name": "Nombre del Usuario",
  "email": "usuario@example.com",
  "roles": ["user"],
  "profileComplete": false,
  "documents": [],
  "createdAt": "2025-09-13T10:00:00.000Z",
  "updatedAt": "2025-09-13T10:00:00.000Z"
}
```

### 2. Obtener todos los Usuarios

Retorna un arreglo con todos los usuarios. **Rol Requerido:** `admin`.

- **Método:** `GET`
- **URL:** `/user`
- **Respuesta Exitosa (200):** Devuelve un arreglo de objetos de usuario completos.

### 3. Obtener un Usuario por ID

Retorna un usuario específico. **Rol Requerido:** `admin`.

- **Método:** `GET`
- **URL:** `/user/:id`
- **Respuesta Exitosa (200):** Devuelve el objeto de usuario completo.

### 4. Actualizar un Usuario (Completar Perfil)

Actualiza los datos de un usuario. Se pueden enviar solo los campos que se desean modificar. **Rol Requerido:** `admin` (o el propio usuario, si se implementa esa lógica).

- **Método:** `PATCH`
- **URL:** `/user/:id`
- **Cuerpo de la Solicitud (`application/json`):** Todos los campos son opcionales.

```json
{
  "name": "Nombre Actualizado",
  "phone": "1122334455",
  "dni": "12345678",
  "birthDate": "1990-01-15T00:00:00.000Z",
  "address": "Calle Falsa 123",
  "city": "Springfield",
  "province": "Provincia Falsa",
  "zipCode": "B1234",
  "occupation": "Desarrollador",
  "monthlyIncome": "5000-7000 USD",
  "investmentExperience": "intermediate",
  "preferredContactMethod": "whatsapp",
  "interestedLotSize": "medium",
  "budget": "50000-100000 USD",
  "timeline": "6months"
}
```

- **Respuesta Exitosa (200):** Devuelve el objeto de usuario actualizado. El campo `profileComplete` se recalculará automáticamente en el backend.

### 5. Eliminar un Usuario

Elimina un usuario. **Rol Requerido:** `admin`.

- **Método:** `DELETE`
- **URL:** `/user/:id`
- **Respuesta Exitosa (200):** Devuelve el objeto del usuario que fue eliminado.

---

## Gestión de Documentos (Sugerencia de Implementación)

Para manejar la subida de archivos, el frontend debe seguir estos pasos:

### Paso 1: Obtener una URL de subida firmada

El frontend debe solicitar al backend una URL segura para subir el archivo directamente a un servicio de almacenamiento (ej. AWS S3).

- **Endpoint Sugerido:** `POST /user/upload-url`
- **Rol Requerido:** `admin` (o el propio usuario)
- **Cuerpo de la Solicitud:**

```json
{
  "fileName": "dni_frente.jpg",
  "fileType": "image/jpeg"
}
```

- **Respuesta del Backend:**

```json
{
  "uploadUrl": "https://storage.service.com/url-firmada-para-subir-...",
  "fileUrl": "https://storage.service.com/path/al/archivo/dni_frente.jpg"
}
```

### Paso 2: Subir el archivo

El frontend utiliza la `uploadUrl` recibida para subir el archivo directamente al servicio de almacenamiento con una petición `PUT`.

### Paso 3: Actualizar el perfil del usuario

Una vez que la subida del paso 2 es exitosa, el frontend debe notificar al backend actualizando el perfil del usuario con la información del nuevo documento.

- **Método:** `PATCH`
- **URL:** `/user/:id`
- **Cuerpo de la Solicitud:** Se utiliza el endpoint de actualización de usuario, añadiendo el nuevo documento al arreglo `documents`.

```json
{
  "documents": [
    // ...documentos existentes
    {
      "name": "dni_frente.jpg",
      "type": "dni",
      "url": "https://storage.service.com/path/al/archivo/dni_frente.jpg"
    }
  ]
}
```