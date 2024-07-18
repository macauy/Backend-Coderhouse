# Curso BackEnd - CoderHouse

## Novedades

### Tercera Pre Entrega

1. Se utilizan middlewares para controlar el acceso a los endpoints según el rol del usuario.
2. Se implementa DAO y DTO y los patrones de Singleton, Factory y Repository.
3. Se crea modelo, servicio y controlador para Ticket.
4. Se implementa la opción de generar la compra, lo que genera un ticket, realiza control de stock y actualización de los productos.
5. Se mantienen 2 archivos `.env` (dev y prod) apuntando a 2 bases de datos distintas.

#### Criterios Tomados

- El patrón factory permite intercambiar la persistencia entre MongoDB y Filesystem. El mismo está implementado particularmente para los productos, indicando si se utiliza el `products.dao.fs` o el `products.mdb.fs`. En caso de utilizar el FS, el archivo se genera en `/data/productos.json`. La configuración se toma de la variable `PERSISTENCE` de los `.env`.
- El control de stock en la compra se realiza de forma tal que la misma se confirma completamente o devuelve error. En caso de que no haya stock para algún producto, la compra no se confirmará, se indicará los productos para los que no haya stock y el carrito seguirá conteniendo todos los ítems.
- Se agregó uso de Mongoose sessions para asegurar transaccionalidad en el proceso de compra.

#### Opciones de Ejecución

- `npm run dev`
- `npm run prod`

## Entregas Anteriores

1. Implementación de endpoints de carrito, productos y usuarios.
2. Implementación de vistas de usuario.
3. Implementación de chat con websockets.
4. Conexión con base de datos MongoDB Atlas.
5. Se agrega paginado y filtrado.
6. Se agrega manejo de sesión.
7. Se agrega implementación de Login, Register y Logout.
8. Se agrega control de autenticación para las rutas.
9. Se agrega passport strategies para login.
10. Se implementa login con GitHub.
11. Nuevo endpoint: `api/sessions/current` obtiene el usuario logueado.
12. Arquitectura MVC: Rutas, controladores y servicios. Separación de responsabilidades. Entorno desarrollo y producción.

## Endpoints

### Archivo de Thunder Client con los Endpoints Testeados

- `thunder-endpoints.json`

### Endpoints Productos

- `GET /api/products`
- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`

### Endpoints Carrito

- `GET /api/carts`
- `GET /api/carts/:cid`
- `POST /api/carts`
- `POST /api/carts/:cid/product/:pid`
- `DELETE /api/carts/:cid/products/:pid`
- `PUT /api/carts/:cid`
- `PUT /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid`

### Endpoints Views

- `GET /products` : [http://localhost:5000/products](http://localhost:5000/products)
- `GET /realtimeproducts` : [http://localhost:5000/realtimeproducts](http://localhost:5000/realtimeproducts) - Admin required
- `GET /carts/:cid` : [http://localhost:5000/carts/:cid](http://localhost:5000/carts/:cid)
- `GET /carts` : [http://localhost:5000/carts](http://localhost:5000/carts) - trae el carrito que esté en sesión
- `GET /register` : [http://localhost:5000/register](http://localhost:5000/register)
- `GET /registerok` : [http://localhost:5000/registerok](http://localhost:5000/registerok)
- `GET /login` : [http://localhost:5000/login](http://localhost:5000/login)
- `GET /profile` : [http://localhost:5000/profile](http://localhost:5000/profile)
- `GET /accessdenied` : [http://localhost:5000/accessdenied](http://localhost:5000/accessdenied)

### Implementación Chat

- [http://localhost:5000/chat](http://localhost:5000/chat)

### Paginado y Filtrado

- `limit=N` : indica tamaño de página
- `page=N` : indica página a mostrar
- `sort=asc|desc|1|-1` : ordena ascendente o descendentemente por precio
- `category=X` : permite filtrar una categoría X
- `stock=N` : filtra productos con stock mínimo N

### Archivo de Configuración

- `/config.js`

### Archivos de Variables de Entorno

- `.env.dev`
- `.env.prod`
