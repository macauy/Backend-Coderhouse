# Proyecto Ecommerce - Backend

![Node.js](https://img.shields.io/badge/node-%3E%3D16.x-brightgreen)
![MongoDB](https://img.shields.io/badge/database-MongoDB-informational)
![Express](https://img.shields.io/badge/framework-Express-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

Este proyecto es un backend completo para la gestión de un ecommerce, construido utilizando Node.js, Express, MongoDB y Handlebars para el curso Backend de Coderhouse.

Proporciona funcionalidades para la administración de productos, usuarios, roles y carritos de compra, así como la autenticación y el manejo de archivos en la nube.

## Índice de Contenidos

1. [Características del Proyecto](#características-del-proyecto)
2. [Configuración y Ejecución](#configuración-y-ejecución)
3. [Tecnologías Usadas](#tecnologías-usadas)
4. [Documentación API](#documentación-api)
5. [Testing](#testing)
6. [Vistas](#vistas)
7. [Endpoints](#endpoints)
8. [Novedades Entrega Final](#novedades-entrega-final)

## Características del Proyecto

### Gestión de Usuarios

- Se tienen 3 roles para usuarios: `user`, `premium` y `admin`.
- Los administradores cuentan con una vista donde se pueden visualizar, modificar los roles y eliminar usuarios.
- Administración de usuarios inactivos: El sistema elimina usuarios que no se han conectado en los últimos 2 días y les envía un correo notificándoles la eliminación por inactividad.

### Manejo de Documentos y Roles Premium

- Los usuarios pueden solicitar cambiar su rol a `premium` para poder gestionar productos propios.
- Se incluye la verificación de documentos (mínimo 2 documentos y foto de perfil) antes de otorgar el rol `premium`.

### Gestión de Productos

- Se puede agregar y eliminar productos desde el panel de administración.
- Los usuarios premium pueden gestionar los productos que ellos crearon mientras que un administrador puede gestionar todos.
- Al eliminarse un producto de un usuario premium se le notifica por correo electrónico.
- Se cuenta con carga de imágenes de productos mediante subida a Cloudinary.

### Carrito de Compras

- Los usuarios pueden agregar productos a su carrito, cambiar las cantidades y hacer compras, generando un ticket de compra.

### Patrones de Diseño

- DAO (Data Access Object): Se implementó el patrón DAO para la separación de la lógica de acceso a datos, lo que permite una mejor modularización y mantenimiento del código.
- DTO (Data Transfer Object): Uso del patrón DTO para manejar la transferencia de datos entre capas, asegurando una estructura consistente y controlada de la información que se expone a las vistas o APIs.

## Configuración y Ejecución

### Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/macauy/Backend-Coderhouse.git
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Configurar variables de entorno en los archivos `.env.dev` y `.env.prod`.

4. Ejecutar en modo desarrollo:

   ```bash
   npm run dev
   ```

5. Ejecutar en modo producción:
   ```bash
   npm run prod
   ```

### Deploy

Railway: https://backend-coderhouse-production-b0ff.up.railway.app

Render: https://backend-coderhouse-yt57.onrender.com/

#### Usuario admin:

```bash
mail: admin@mail.com
password: admin
```

#### Usuario premium:

```bash
mail: premium@mail.com
password: premium
```

## Tecnologías Usadas

- **Node.js**: JavaScript en el servidor.
- **Express**: Framework web minimalista.
- **MongoDB**: Base de datos NoSQL.
- **Mongoose**: ODM para MongoDB.
- **Handlebars**: Motor de plantillas.
- **Cloudinary**: Almacenamiento de imágenes en la nube.
- **JWT & Cookies**: Autenticación segura.
- **Multer**: Subida de archivos.
- **Swagger**: Documentación de API.
- **Mocha & Chai**: Testing unitario e integración.
- **Winston**: Logger para la aplicación.

## Documentación API

La documentación de la API está disponible a través de Swagger:

- `GET /api/docs` : [Documentación Swagger](https://backend-coderhouse-yt57.onrender.com/api/docs/)

## Testing

### Ejecución de Tests

1. Iniciar la aplicación:

   ```bash
   npm run dev
   ```

2. Ejecutar los tests:
   - Unitarios: `npm run test:unit`
   - Integración: `npm run test`

## Vistas

### Vistas Principales

- `/products`: Listado de productos con paginación y filtrado.
- `/profile`: Vista del perfil de usuario, con opciones de carga de documentos.
- `/admin/products`: Vista de administración de productos (accesible para administradores y premium).
- `/admin/users`: Gestión de usuarios, visualización de roles, edición y eliminación (sólo accesible para administradores).

## Endpoints

### Usuarios

- `GET /api/users`: Obtener todos los usuarios.
- `DELETE /api/users`: Eliminar usuarios inactivos.
- `PUT /api/users/premium/:uid`: Cambiar el rol a premium.

### Productos

- `GET /api/products`: Listado de productos.
- `POST /api/products`: Agregar un nuevo producto.
- `PUT /api/products/:pid`: Actualizar un producto.
- `DELETE /api/products/:pid`: Eliminar un producto (envía correo a usuarios premium).

### Carrito

- `GET /api/carts`: Obtener carrito del usuario.
- `POST /api/carts/:cid/product/:pid`: Agregar producto al carrito.
- `PUT /api/carts/:cid`: Actualizar productos en el carrito.
- `DELETE /api/carts/:cid`: Vaciar carrito.

### Chat

Implementación de chat utilizando sockets

- /chat

## Novedades Entrega Final

- Se crea vista para administración de usuarios (/admin/users).
- Se mejora vista de administración de productos (/admin/products).
- Posibilidad de filtrar productos en /products (Home) y /admin/products.
- Eliminación de usuarios inactivos y envío de correo notificando.
- Envío de correo notificando eliminación de productos de usuarios premium.
- Links en el nabvar para acceder a la administración según roles.
- Permitir indicar y modificar la cantidad de items de cada producto a comprar. Actualización automática de totales.
- Mejoras generales de estética.
