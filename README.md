# Curso BackEnd - CoderHouse

## Entregable Websockets

### Se agrega el uso de websockets para actualizar dinámicamente la lista de productos al agregar y eliminar.

#### Endpoints productos:

- GET /api/products
- GET /api/products/pid
- POST /api/products
- PUT /api/products/pid
- DELETE /api/products/pid

#### Endpoints carrito:

- GET /api/carts
- GET /api/carts/cid
- POST /api/carts
- POST /api/carts/cid/product/pid

#### Endpoints views - sockets:

- GET /
- GET /realtimeproducts

#### Implementación chat:

http://localhost:5000/chat

#### Se realiza persistencia de datos en base de datos Mongodb

#### Archivo de configuración:

- /config/config.js
