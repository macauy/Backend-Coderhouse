# Curso BackEnd - CoderHouse

## Novedades

### Entrega Testing

Realización de test unitarios y de integración utilizando mocha, chai y supertests.

### Test unitario

#### Dao de Users:

Se realizan test de cada método del dao utilizando una colección aparte 'test_users' para no modificar la original.

##### Para ejecutar este test:

- npx mocha .\test\Users.dao.test.js --collection test_users
- `npm run test:unit`

### Test de integración

Se realizan test de integración para métodos de session / users y para productos utilizando Supertest y probando directamente los enpoints.

#### Sessions:

Se realizan 4 tests:

- Registar un nuevo usuario
- No permitir registrar un usuario ya existente
- Realizar login
- Ruta /current retorna usuario en sesión

##### Para ejecutar este test: npx mocha .\test\sessions.supertest.test.js

#### Products:

Se realizan 5 tests:

- Get de todos los productos
- Get de un producto por id
- Crear nuevo producto
- Actualizar producto existe
- Eliminar producto: error al eliminar como usuario premium y éxito como usuario admin

##### Para ejecutar este test: npx mocha .\test\products.supertest.test.js

### Para ejecutar todos los tests de integración:

1. Levantar la aplicación: `npm run dev`
2. Ejecutar tests: `npm run test`

#### Opciones de Ejecución de la aplicación

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

#### Login

9. Se agrega passport strategies para login.
10. Se implementa login con GitHub.

#### Integración

11. Nuevo endpoint: `api/sessions/current` obtiene el usuario logueado.

#### Reestructura

12. Arquitectura MVC: Rutas, controladores y servicios. Separación de responsabilidades. Entorno desarrollo y producción.
13. Variables de entorno y uso de dotenv. Modos 'Desarrollo' y 'Producción'.

#### Tercera Preentrega

14. Implementación de DAO y DTO y los patrones de Singleton, Factory y Repository.
15. Middlewares para control de autorización
16. Generación de Ticket y método Purchase

#### Errores y Mocking

17. Manejo de errores y nuevo endpoint: mockingproducts.

#### Logger

18. Implementación de un Logger utilizando Winston para el manejo de logs. Formateo de logs.

#### Tercera práctica de integración

19. Envío de mail para recuperación de contraseña
20. Nuevo rol premium, campo owner en producto y manejo de permisos.
21. Endpoint para modificar rol de usuario.
22. Mejoras de diseño y usabilidad.

#### Documentación

23. Uso de Swagger para documentación de API de productos, usuario y carrito.

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
- `GET /mockingproducts` : [http://localhost:5000/mockingproducts/](http://localhost:5000/mockingproducts/)

### Logger

- `GET /api/loggerTest` [http://localhost:5000/api/loggerTest](http://localhost:5000/api/loggerTest)

#### Documentación API:

- `GET /api/docs` : [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

#### Implementación Chat

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
