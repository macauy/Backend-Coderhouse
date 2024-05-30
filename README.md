# Curso BackEnd - CoderHouse

## Entrega Práctica Integradora

### Se integran todos los aspectos vistos en el curso. Se conecta con base de datos Atlas.

### Endpoints

#### Se agrega un archivo de thunder client con los endpoints testeados:

-> thunder-PreEntrega2.json

#### Endpoints productos:

- GET /api/products
- GET /api/products/:pid
- POST /api/products
- PUT /api/products/:pid
- DELETE /api/products/:pid

#### Endpoints carrito:

- GET /api/carts
- GET /api/carts/:cid
- POST /api/carts
- POST /api/carts/:cid/product/:pid
- DELETE /api/carts/:cid/products/:pid
- PUT /api/carts/:cid
- PUT /api/carts/:cid/products/:pid
- DELETE /api/carts/:cid

#### Endpoints views - sockets:

- GET /products : http://localhost:5000/products
- GET /realtimeproducts: http://localhost:5000/realtimeproducts
- GET /carts: http://localhost:5000/carts

#### Implementación chat:

http://localhost:5000/chat

### Paginado y filtrado:

- limit=N : indica tamaño de página
- page=N : indica página a mostrar
- sort: asc | desc | 1 | -1 : ordena ascendente o descendente por precio
- category=X : permite filtrar una categoria X
- stock=N : filtra productos con stock mínimo N

#### Se realiza persistencia de datos en base de datos Mongodb Atlas

#### Archivo de configuración:

- /config.js
