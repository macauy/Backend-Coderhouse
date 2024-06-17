# Curso BackEnd - CoderHouse

## Novedades:

- Se agrega passport strategies para login.

- Login con github

## Entregas anteriores:

#### Implementación de endpoints de carrito, productos y usuarios.

#### Implementación de vistas de usuario.

#### Implementación de chat con websockets.

#### Conexión con base de datos MongoDB Atlas.

#### Se agrega paginado y filtrado

#### Se agrega manejo de sesión

#### Se agrega implementación de Login, Register y Logout

#### Se agrega control de autenticación para las rutas

## Endpoints

#### Se agrega un archivo de thunder client con los endpoints testeados:

-> thunder-endpoints.json

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

#### Endpoints views:

- GET /products : http://localhost:5000/products
- GET /realtimeproducts: http://localhost:5000/realtimeproducts - Admin required
- GET /carts/:cid: http://localhost:5000/carts/:cid
- GET /carts : http://localhost:5000/carts - trae el carrito que esté en sesión
- GET /register : http://localhost:5000/register
- GET /registerok : http://localhost:5000/registerok
- GET /login : http://localhost:5000/login
- GET /profile : http://localhost:5000/profile
- GET /accessdenied : http://localhost:5000/accessdenied

#### Implementación chat:

http://localhost:5000/chat

### Paginado y filtrado:

- limit=N : indica tamaño de página
- page=N : indica página a mostrar
- sort: asc | desc | 1 | -1 : ordena ascendente o descendente por precio
- category=X : permite filtrar una categoria X
- stock=N : filtra productos con stock mínimo N

#### Archivo de configuración:

- /config.js
