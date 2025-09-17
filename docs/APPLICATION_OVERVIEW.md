# Visión General de la Aplicación Barrancas Blancas Backend

## 1. Introducción

Este documento describe la arquitectura, el stack tecnológico y las funcionalidades principales del backend para el proyecto de loteo "Barrancas Blancas". El sistema está diseñado para servir a dos interfaces de usuario principales:

*   Un **Dashboard de Administración**: Para la gestión completa de usuarios y lotes por parte del personal autorizado.
*   Un **Frontend Público**: Para mostrar información relevante de los lotes a los potenciales clientes (disponibilidad, características, etc.).

## 2. Stack Tecnológico

El backend de Barrancas Blancas está construido sobre las siguientes tecnologías:

*   **Framework:** [NestJS](https://nestjs.com/) (v10.x)
    *   Un framework progresivo de Node.js para construir aplicaciones del lado del servidor eficientes y escalables.
*   **Lenguaje de Programación:** [TypeScript](https://www.typescriptlang.org/)
    *   Un superconjunto tipado de JavaScript que mejora la calidad y mantenibilidad del código.
*   **Base de Datos:** [MongoDB](https://www.mongodb.com/)
    *   Una base de datos NoSQL orientada a documentos, utilizada por su flexibilidad y escalabilidad.
*   **ODM (Object Data Modeling):** [Mongoose](https://mongoosejs.com/)
    *   Una biblioteca de modelado de objetos de MongoDB para Node.js, que proporciona una solución basada en esquemas para modelar los datos de la aplicación.
*   **Autenticación:** [Passport.js](http://www.passportjs.org/) con estrategia JWT (JSON Web Tokens)
    *   Middleware de autenticación para Node.js, utilizado para proteger las rutas de la API.
*   **Gestor de Paquetes:** [pnpm](https://pnpm.io/)
    *   Un gestor de paquetes rápido y eficiente en espacio en disco.

## 3. Arquitectura

La aplicación sigue una arquitectura de microservicios (o modular) basada en los principios de NestJS, con módulos bien definidos para cada dominio de negocio (autenticación, usuarios, lotes). Expone una API RESTful para la comunicación con los frontends.

## 4. Módulos y Funcionalidades

A continuación se detallan los módulos principales y el estado de sus funcionalidades:

### 4.1 Módulo de Autenticación (`auth`)

*   **Propósito:** Gestionar el proceso de inicio de sesión y la validación de la identidad de los usuarios.
*   **Estado:** **Funcional**
*   **Funcionalidades Clave:**
    *   Inicio de sesión de usuarios (generación de JWT).
    *   Protección de rutas mediante `JwtAuthGuard` y `RolesGuard`.
    *   Definición de roles (`admin`, `user`) y decoradores `@Roles()` y `@Public()`.

### 4.2 Módulo de Usuarios (`user`)

*   **Propósito:** Administrar la información de los usuarios del sistema, incluyendo sus perfiles detallados.
*   **Estado:** **Funcional**
*   **Funcionalidades Clave:**
    *   Creación de usuarios (solo por administradores).
    *   Consulta de todos los usuarios (solo por administradores).
    *   Consulta de un usuario específico por ID (solo por administradores).
    *   Actualización de datos de usuario (incluyendo campos de perfil extendido).
    *   Eliminación de usuarios (solo por administradores).
*   **Funcionalidades Pendientes/Sugeridas:**
    *   Implementación completa de la gestión de documentos (subida y asociación de archivos).
    *   Lógica para que un usuario pueda actualizar su propio perfil (actualmente solo administradores pueden hacerlo a través del endpoint general de actualización).

### 4.3 Módulo de Lotes (`lote`)

*   **Propósito:** Gestionar la información de los lotes del proyecto, incluyendo sus características, estado y asignación a clientes.
*   **Estado:** **Funcional**
*   **Funcionalidades Clave (para Dashboard de Administración - Requiere `admin` role):**
    *   Creación de nuevos lotes.
    *   Consulta de todos los lotes (con posibilidad de población de datos de cliente).
    *   Consulta de un lote específico por ID (con población de datos de cliente).
    *   Actualización de datos de lotes (incluyendo estado, características, propietario y asignación de cliente).
    *   Eliminación de lotes.
    *   Registro de historial de cambios de estado (`statusChangeLog`).
*   **Funcionalidades Clave (para Frontend Público - No requiere autenticación):**
    *   Consulta de lotes disponibles (`/lote/available`).
    *   Consulta de lotes destacados (hasta 6 lotes, `/lote/featured`).
    *   Consulta de todos los lotes con metadata para representación visual en el frontend (`/lote/public-all`). Este endpoint excluye `propietario` y `client` y proporciona un resumen de estados por `manzana`.

### 4.4 Módulo de Leads (`lead`)

*   **Propósito:** Gestionar clientes potenciales que han mostrado interés en los lotes, y su seguimiento.
*   **Estado:** **En Desarrollo (Fase 2 - CRM y Seguimiento de Ventas)**
*   **Funcionalidades Clave (para Frontend Público - No requiere autenticación):**
    *   Registro de contacto (`POST /leads/contact`): Permite a los usuarios enviar formularios de contacto, creando un nuevo lead.
*   **Funcionalidades Clave (para Dashboard de Administración - Requiere `admin` o `vendedor` role):**
    *   Creación manual de leads.
    *   Consulta de todos los leads.
    *   Consulta de un lead específico por ID.
    *   Actualización de leads (ej. cambiar estado, asignar a vendedor).
    *   Eliminación de leads.
    *   Registro de lead como usuario (`POST /leads/:id/register-user`): Crea un usuario a partir de un lead existente.
    *   Registro de actividad para un lead (`POST /leads/:id/activity`): Permite registrar interacciones con el lead.
    *   Consulta de historial de actividades de un lead (`GET /leads/:id/activity`).
    *   Generación de propuesta para un lead y lote (`POST /leads/:id/proposal`).
    *   Generación de boleto de compra para un lead y lote (`POST /leads/:id/purchase-ticket`).

## 5. Interacción con Frontends

*   **Dashboard de Administración:** Se conecta al backend para realizar todas las operaciones CRUD sobre usuarios, lotes y ahora también **leads** (incluyendo la gestión de actividades, propuestas y boletos de compra), utilizando los endpoints protegidos por autenticación JWT y roles de `admin` (o `vendedor` para leads).
*   **Frontend Público:** Consume los endpoints públicos del módulo de lotes para mostrar información relevante a los visitantes sin necesidad de autenticación. Ahora también puede **registrar contactos** a través del nuevo endpoint público del módulo de leads.

## 6. Próximos Pasos y Funcionalidades Pendientes

*   **Módulo de Leads:** Continuar con la Fase 2 (CRM y Seguimiento de Ventas - Implementación de la generación de documentos PDF).
*   **Gestión de Documentos:** Completar la implementación de la subida, almacenamiento y asociación de documentos a los perfiles de usuario.
*   **Búsqueda y Filtrado Avanzado:** Expandir los endpoints de listado de lotes y usuarios para incluir opciones de búsqueda y filtrado más robustas (ej. por rango de precios, características, etc.).
*   **Notificaciones:** Implementar un sistema de notificaciones (ej. por correo electrónico) para eventos importantes (cambios de estado de lote, nuevas reservas, etc.).
*   **Módulo de Reservas/Transacciones:** Desarrollar un módulo específico para gestionar el proceso de reserva y venta de lotes de forma más estructurada.
*   **Optimización de Consultas:** Revisar y optimizar las consultas a la base de datos para asegurar un rendimiento óptimo a medida que crece el volumen de datos.
*   **Integración con Módulo Lotes:** Ampliar el módulo de Lotes para reflejar el estado del proceso de ventas (ej. `'Reservado'`, `'En negociación'`) y no solo `'Disponible'` o `'Vendido'`. **(Implementado: Campo `estadoProcesoVenta` añadido a la entidad Lote)**