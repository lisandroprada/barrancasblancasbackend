# Plan de Expansión del Dashboard de Barrancas Blancas

Este documento detalla un plan de desarrollo para expandir el backend y el dashboard administrativo de "Barrancas Blancas", basándose en el análisis de la arquitectura y funcionalidades existentes. El objetivo es evolucionar la plataforma de una herramienta de gestión a un completo sistema de CRM (Customer Relationship Management) y gestión de ventas, integrando la interacción con los clientes que llegan a través del frontend público.

## 1. Resumen de la Evolución Necesaria

El sistema actual gestiona de forma eficiente la información estática de lotes y usuarios administradores. La siguiente fase se centrará en la gestión dinámica de los **clientes potenciales (leads)**. Esto implica capturar sus consultas, registrar su actividad, y proveer al equipo de ventas (usuarios con rol de vendedor o admin) las herramientas necesarias para un seguimiento eficaz, desde el primer contacto hasta el cierre de la venta.

## 2. Esquema de Desarrollo por Fases

### Fase 1: Captura y Gestión de Leads 🚀

**Objetivo:** Crear un canal formal para que las consultas del frontend se conviertan en leads gestionables en el backend.

#### 2.1 Backend (Tareas Clave):

- **Modelo de Datos Lead:**
  - Crear un nuevo esquema `Lead` en MongoDB.
  - Campos mínimos: `nombre`, `email`, `telefono`, `fuente` (ej. `'frontend'`), `estado` (ej. `'Nuevo'`, `'En contacto'`), `fechaCreacion`.
  - Establecer una referencia a un posible usuario (`user_id`) si el lead decide registrarse.

- **API para el Frontend Público:**
  - Desarrollar un nuevo endpoint `POST /leads/contact` que **no requiera autenticación**.
  - Este endpoint recibirá los datos de contacto del cliente (`nombre`, `email`, `teléfono`) y el tipo de consulta.
  - **Lógica:** Validar los datos, crear un nuevo documento `Lead` en la base de datos y, opcionalmente, enviar una notificación interna al equipo de ventas.

- **Lógica de Registro Simplificado (Frontend No Envía Contraseña):**
  - **Endpoint `POST /auth/register`:**
    - Acepta `nombre`, `email`, `telefono` (y opcionalmente `roles`).
    - El backend genera una contraseña segura y aleatoria.
    - El backend envía esta contraseña (en texto plano) al email proporcionado por el usuario.
    - El backend crea la cuenta de usuario con la contraseña hasheada.
    - La respuesta del endpoint NO debe incluir la contraseña.

- **Servicio de Envío de Correos:**
  - Integrar un servicio de envío de correos (ej. Nodemailer, SendGrid) para enviar las contraseñas generadas y otras notificaciones.

#### 2.2 Dashboard (Tareas Clave):

- **Vista de Consultas Nuevas:**
  - Crear una nueva sección en el dashboard para mostrar las consultas entrantes (los `Leads` con estado `'Nuevo'`).
  - La tabla debe mostrar `nombre`, `email`, `teléfono`, `tipo de consulta`, y `fecha de llegada`.

- **Asignación de Leads:**
  - Implementar un botón de "Asignar" que permita a un admin asignar un `Lead` a un vendedor específico.
  - Actualizar el campo `asignadoA` en el documento `Lead`.

### Fase 2: CRM y Seguimiento de Ventas 📈

**Objetivo:** Proporcionar al equipo de ventas herramientas para registrar y dar seguimiento a la actividad de cada lead.

#### 2.3 Backend (Tareas Clave):

- **Modelo de Datos Actividad:**
  - Crear un nuevo esquema `Actividad` que se relacione con el `Lead`.
  - Campos: `lead_id`, `tipoActividad` (ej. `'Llamada'`, `'Email'`, `'Visita'`), `fecha`, `comentarios`, `proximoPaso`.

- **Modelo de Datos Propuesta y BoletoCompra:**
  - Crear modelos de datos para formalizar propuestas y boletos de compra, vinculándolos a un `Lead` y un `Lote`.

- **APIs de CRM:**
  - `GET /leads/:id/activity`: Obtener el historial de actividades de un lead.
  - `POST /leads/:id/activity`: Registrar una nueva actividad.
  - `POST /leads/:id/proposal`: Generar una propuesta en formato digital (PDF o similar). Utilizar una librería de NestJS para la generación de documentos.
  - `POST /leads/:id/purchase-ticket`: Generar y asociar un boleto de compra.

#### 2.4 Dashboard (Tareas Clave):

- **Ficha del Cliente/Lead:**
  - Crear una vista de detalle para cada `lead`, accesible desde la tabla de consultas.
  - Esta ficha debe mostrar toda la información de contacto, los lotes de interés y un timeline de actividades.
  - Un ejemplo de la información a mostrar sería:
    - Datos de contacto.
    - Historial de Consultas: Un resumen de todas las consultas realizadas por ese cliente.
    - Actividad Registrada: Un registro cronológico de las interacciones.
    - Lotes de Interés: Los lotes por los que ha preguntado o se le han propuesto.

- **Registro de Actividad:**
  - Implementar un formulario en la ficha del `lead` para que los vendedores puedan registrar nuevas actividades (llamadas, emails, visitas).

- **Generación de Documentos:**
  - Añadir botones en la ficha del `lead` para "Generar Propuesta" y "Generar Boleto de Compra".
  - Esto iniciará un proceso que, a través de la API, generará el documento, lo asociará al `lead` y lo almacenará.

## 3. Consideraciones Adicionales y Próximos Pasos

### 3.1 Coordinación Frontend/Dashboard para Flujo de Roles

Para alinear el comportamiento del frontend/dashboard con la lógica de roles del backend, se deben considerar las siguientes acciones:

- **Flujo de Registro de Clientes:**
  - La interfaz de registro (`/auth/register`) debe estar claramente diseñada para la captación de "clientes" (usuarios con rol `user` por defecto).
  - Tras un registro exitoso, el usuario **no debe ser redirigido automáticamente al dashboard principal** si este requiere roles de `admin` o `vendedor`.
  - **Sugerencia:** Redirigir a una página de "perfil completado", un "portal de cliente" específico para usuarios con rol `user`, o mostrar un mensaje que indique que su cuenta está pendiente de revisión/activación por un administrador.

- **Acceso al Dashboard Principal (Admin/Vendedor):**
  - El dashboard principal (diseñado para `admin` o `vendedor`) debe verificar el rol del usuario obtenido del token JWT.
  - Si un usuario con el rol `user` intenta acceder a rutas protegidas del dashboard principal, debe ser redirigido a su "portal de cliente" o a una página de "acceso denegado".

- **Panel de Administración para Gestión de Roles:**
  - El panel de administración debe incluir una sección de gestión de usuarios donde los administradores puedan visualizar, editar perfiles y, fundamentalmente, **asignar o modificar roles** (`admin`, `vendedor`, `user`) a los usuarios existentes.

- **Optimización Móvil:** El dashboard, aunque no es para el cliente final, debe ser responsive para que los vendedores puedan usarlo desde el móvil en el terreno.
- **Notificaciones:** Utilizar un sistema de notificaciones (web push o email) para avisar a los vendedores sobre nuevas consultas asignadas o actividades programadas.
- **Integración con Módulo Lotes:** Ampliar el módulo de Lotes para reflejar el estado del proceso de ventas (ej. `'Reservado'`, `'En negociación'`) y no solo `'Disponible'` o `'Vendido'`.
- **Seguridad:** Asegurar que solo los usuarios con el rol de vendedor o admin puedan acceder a la información de los leads y las herramientas de CRM.
