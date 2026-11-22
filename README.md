# API REST de Catálogo de Productos y Favoritos Personales

> **Proyecto de Desarrollo de API REST con Node.js, Express, SQLite, Autenticación JWT y Autorización por Roles.**  
> **Autora / Integrante:** Angela Dennisse Cavero Mosquera  
> **Institución:** Universidad Estatal de Milagro (UNEMI)  
> **Materia / Nivel:** Desarrollo de Software / Backend y APIs REST  

---

## 1. Propósito de la API

El objetivo principal de esta API RESTful es gestionar de manera centralizada un **catálogo público de productos** y un sistema de **favoritos personales** para los usuarios registrados. 

La arquitectura implementa mecanismos estrictos de seguridad de nivel industrial:
- **Autenticación robusta basada en JSON Web Tokens (JWT):** Generación de tokens firmados y verificación de firma y expiración en cada solicitud protegida.
- **Autorización basada en roles (RBAC):**
  - **Público:** Consulta del catálogo y filtrado por categoría sin necesidad de autenticación.
  - **Usuario:** Registro seguro (siempre como rol `usuario`), inicio de sesión, y gestión exclusiva de sus propios favoritos personales con estricto aislamiento entre usuarios.
  - **Administrador:** Control total (CRUD) del catálogo de productos (crear, actualizar, eliminar). El rol de administrador no se puede obtener mediante el registro público; se inicializa por un procedimiento controlado local.
- **Integridad referencial y persistencia comprobada:** Uso de una base de datos relacional sobre disco físico que garantiza la persistencia tras el reinicio del servidor y eliminación en cascada (`ON DELETE CASCADE`) para preservar la consistencia de los datos.

---

## 2. Elección de la Base de Datos

Se seleccionó **SQLite 3** (a través del controlador de alto rendimiento `better-sqlite3`) por las siguientes razones técnicas y académicas:
1. **Persistencia física comprobada:** A diferencia de bases de datos en memoria, almacena todo el estado en un archivo local (`data/database.sqlite`), cumpliendo la premisa de persistencia demostrable tras reiniciar el proceso de Node.js.
2. **Integridad referencial nativa (`FOREIGN KEY` con `CASCADE`):** Permite modelar formalmente las relaciones `usuarios`, `productos` y `favoritos`. Al eliminar un producto, sus favoritos asociados se purgan de forma atómica y consistente sin dejar registros huérfanos.
3. **Cero dependencias de infraestructura externa:** El docente o cualquier evaluador puede clonar el repositorio, ejecutar `npm install` y tener el entorno operativo al 100% de inmediato, sin requerir contenedores Docker ni configurar servicios de PostgreSQL, MySQL o MongoDB.
4. **Modo WAL (Write-Ahead Logging):** Configurado para permitir lecturas y escrituras concurrentes eficientes.

---

## 3. Arquitectura del Proyecto

El código sigue una estricta separación de responsabilidades en capas (*Routes*, *Controllers*, *Models/Data Access*, *Middlewares*, *Config*):

```text
api-catalogo-productos/
├── data/                                 # Directorio de persistencia de SQLite (ignorado en git)
├── postman/                              # Pruebas automatizadas reproducibles
│   ├── Catalogo_Productos_API.postman_collection.json
│   └── Catalogo_Productos_API.postman_environment.json
├── src/
│   ├── config/                           # Variables de entorno y conexión a la BD
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/                      # Lógica de negocio y orquestación de respuestas
│   │   ├── authController.js
│   │   ├── productosController.js
│   │   └── favoritosController.js
│   ├── middlewares/                      # Validación, autenticación JWT, roles y errores
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── validateMiddleware.js
│   ├── models/                           # Acceso a datos y consultas SQL preparadas
│   │   ├── favoritoModel.js
│   │   ├── productoModel.js
│   │   └── usuarioModel.js
│   ├── routes/                           # Definición de rutas y mapeo de endpoints
│   │   ├── authRoutes.js
│   │   ├── favoritosRoutes.js
│   │   ├── productosRoutes.js
│   │   └── index.js
│   ├── scripts/                          # DDL de la BD y siembra inicial
│   │   ├── initDb.js
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── app.js                            # Configuración de Express y middlewares
│   └── server.js                         # Inicialización y arranque del servidor HTTP
├── .env.example                          # Plantilla de variables de entorno sin secretos
├── .gitignore                            # Exclusión de node_modules, .env y BD física
├── package.json                          # Dependencias y scripts de ejecución
├── package-lock.json                     # Bloqueo determinista de versiones
├── README.md                             # Documentación técnica completa
└── test-runner.js                        # Suite automatizada local de las 28 pruebas
```

---

## 4. Requisitos Previos

- **Node.js**: Versión `18.x` o superior (probado y verificado en Node.js `v20.17.0`).
- **NPM**: Versión `9.x` o superior.
- **Git**: Para control de versiones y clonación.
- **Postman**: Para importar y ejecutar la suite de pruebas reproducible.

---

## 5. Instalación y Configuración

### Paso 1: Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO_GITHUB>
cd api-catalogo-productos
```

### Paso 2: Instalar las dependencias
```bash
npm install
```

### Paso 3: Configurar las variables de entorno
Crea tu archivo `.env` a partir de la plantilla `.env.example`:
```bash
cp .env.example .env
```
*(En Windows PowerShell: `Copy-Item .env.example .env`)*

El archivo `.env` contendrá:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super_clave_secreta_jwt_desarrollo_unemi_2026_segura
JWT_EXPIRES_IN=2h
DB_PATH=./data/database.sqlite
```

---

## 6. Inicialización de la Base de Datos y del Administrador

Para garantizar que el docente pueda probar la API inmediatamente sin configuraciones complejas:
1. Al arrancar el servidor con `npm start` o `npm run dev`, el sistema verifica e inicializa automáticamente las tablas si no existen.
2. Si el catálogo está vacío, ejecuta automáticamente la siembra (`seed`) creando el administrador y los productos de ejemplo.

También puedes ejecutar la inicialización de forma manual en cualquier momento con:
```bash
# Crear las tablas en SQLite
npm run db:init

# Sembrar los usuarios iniciales y productos de ejemplo
npm run db:seed
```

### Credenciales de prueba generadas por el script `seed`:
| Rol | Nombre | Correo Electrónico | Contraseña | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | Administrador Principal | `admin@tienda.com` | `Admin123*` | Gestión CRUD del catálogo de productos |
| **Usuario A** | Usuario Demo A | `usuarioA@tienda.com` | `User123*` | Pruebas de favoritos y aislamiento |
| **Usuario B** | Usuario Demo B | `usuarioB@tienda.com` | `User123*` | Pruebas de aislamiento entre usuarios |

> [!IMPORTANT]
> **Seguridad en Registro:** El endpoint público `POST /api/auth/registro` **fuerza incondicionalmente el rol `'usuario'`**. Aunque un cliente envíe `{ "rol": "admin" }` en el cuerpo de la petición, el servidor ignora ese valor. La creación de administradores se realiza exclusivamente mediante el script de siembra controlado `npm run db:seed`.

---

## 7. Comandos de Ejecución

```bash
# Modo Producción
npm start

# Modo Desarrollo con recarga automática (watch mode nativo de Node.js)
npm run dev

# Ejecutar la suite automatizada de 28 pruebas locales
npm test
```

---

## 8. Documentación de Endpoints de la API

La API responde y escucha bajo el prefijo `/api` (y también cuenta con alias directo):

| Método | Endpoint | Acceso / Permiso | Propósito / Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registro` | Público | Registra un nuevo usuario común (rol forzado a `usuario`). | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | Público | Valida credenciales y emite un JWT firmado. | `200`, `400`, `401` |
| `GET` | `/api/productos` | Público | Lista los productos. Permite filtrar con `?categoria=nombre`. | `200` |
| `GET` | `/api/productos/:id` | Público | Consulta el detalle de un producto por su ID. | `200`, `400`, `404` |
| `POST` | `/api/productos` | Administrador | Crea un nuevo producto (precio > 0 obligatorio). | `201`, `400`, `401`, `403` |
| `PUT` | `/api/productos/:id` | Administrador | Actualiza nombre, descripción, categoría o precio. | `200`, `400`, `401`, `403`, `404` |
| `DELETE` | `/api/productos/:id` | Administrador | Elimina un producto y purga sus favoritos en cascada. | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/api/favoritos` | Autenticado | Lista los favoritos del usuario autenticado vía JWT. | `200`, `401` |
| `POST` | `/api/favoritos` | Autenticado | Agrega un producto a la lista de favoritos del usuario. | `201`, `400`, `401`, `404`, `409` |
| `DELETE` | `/api/favoritos/:productoId` | Autenticado | Quita un producto de los favoritos del usuario. | `200`, `400`, `401`, `404` |

---

## 9. Criterios de Diseño, Validación y Códigos HTTP

- `200 OK`: Consultas (`GET`), actualizaciones exitosas (`PUT`), inicios de sesión (`POST /auth/login`) y eliminaciones confirmadas con respuesta JSON descriptiva (`DELETE`).
- `201 Created`: Creación exitosa de usuarios (`POST /auth/registro`), productos (`POST /productos`) y favoritos (`POST /favoritos`).
- `400 Bad Request`: Datos de entrada inválidos (campos obligatorios vacíos, correo con formato no válido, contraseña con menos de 6 caracteres, precios negativos o iguales a cero, IDs no enteros).
- `401 Unauthorized`: Petición a ruta protegida sin cabecera `Authorization: Bearer <token>`, token con firma manipulada, token expirado o credenciales incorrectas en el login.
- `403 Forbidden`: Token válido pero el usuario no posee el rol requerido (por ejemplo, un usuario común intentando crear, editar o borrar productos del catálogo).
- `404 Not Found`: Recurso no encontrado (producto inexistente, favorito no encontrado en la lista del usuario, o ruta no mapeada).
- `409 Conflict`: Conflicto de unicidad (intento de registrar un correo que ya existe, o agregar a favoritos un producto que ya estaba en la lista del usuario).

### Protección y Privacidad de Credenciales
- En ningún endpoint (`registro`, `login`, listados) se retorna la contraseña en texto plano ni el hash `password_hash`.
- Las contraseñas se encriptan con **bcryptjs** utilizando un factor de costo (salt rounds) de 10.

### Consistencia y Borrado en Cascada
En `src/scripts/schema.sql`, la tabla `favoritos` define:
```sql
FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
```
Cuando un administrador elimina un producto del catálogo, SQLite automáticamente elimina todos los registros en `favoritos` que apuntaban a dicho producto. Esto previene referencias rotas y mantiene la base de datos íntegra y consistente.

### Aislamiento de Favoritos entre Usuarios
La identidad del usuario se obtiene estrictamente de `req.user.id` (extraído del token JWT verificado por `authMiddleware`), **nunca** de un parámetro o cuerpo enviado por el cliente.
- Si el **Usuario B** solicita `GET /api/favoritos`, solo ve los registros donde `usuario_id = req.user.id` (ID de B).
- Si el **Usuario B** intenta ejecutar `DELETE /api/favoritos/:id_de_producto_de_A`, la consulta busca la combinación `usuario_id = B AND producto_id = X`. Como no existe para B, el servidor responde `404 Favorito no encontrado`, y el favorito del **Usuario A** permanece intacto.

---

## 10. Pruebas Obligatorias en Postman

Se incluye en el directorio `postman/` una colección y un entorno listos para importar:
1. `postman/Catalogo_Productos_API.postman_collection.json`
2. `postman/Catalogo_Productos_API.postman_environment.json`

### Pasos para ejecutar en Postman:
1. Abre **Postman**.
2. Haz clic en **Import** (esquina superior izquierda) y arrastra ambos archivos JSON ubicados en la carpeta `postman/`.
3. En la esquina superior derecha de Postman, selecciona el entorno **"API Catálogo & Favoritos - Local Environment"**.
4. Inicia tu servidor en la terminal:
   ```bash
   npm start
   ```
5. Haz clic derecho sobre la colección **"API Catálogo de Productos y Favoritos - Pruebas Oficiales"** y selecciona **Run Collection**.
6. Haz clic en **Run API Catálogo...**.

### Casos de prueba demostrados:
- **Autenticación:** Registro y login exitoso, rechazo de correo duplicado (409), rechazo de contraseñas cortas o email inválido (400), credenciales incorrectas (401), forzado inmutable del rol `usuario` en registro público.
- **Catálogo:** Consulta pública sin token (200), filtrado por categoría (`?categoria=Tecnologia`), consulta por ID existente (200) y consulta por ID inexistente (404).
- **Control de Roles:** Intento de crear producto sin token (401), intento de crear con rol `usuario` (403), intento de crear con precio <= 0 (400), creación de producto como admin (201), actualización de producto como admin (200) y rechazo de ID inexistente (404).
- **Favoritos y Aislamiento:** Agregar favorito (201), rechazo de favorito duplicado (409), rechazo de producto inexistente (404), comprobación de que el Usuario B no ve ni puede eliminar el favorito del Usuario A, y verificación de que el favorito de A permanece intacto.
- **Borrado en Cascada:** Al eliminar el producto como admin (200), el favorito asociado del Usuario A desaparece automáticamente (comprobación de integridad).
- **Persistencia tras Reinicio:** Reinicio del servidor y consulta para evidenciar que todos los datos persisten intactos en la base de datos física SQLite.

---

## 11. Ejecución de la Suite Automatizada en Consola

También puedes ejecutar las 28 pruebas automáticas directamente desde la terminal con:
```bash
npm test
```
Este comando valida cada código de estado HTTP, cada aserción de seguridad, la integridad referencial y el aislamiento entre usuarios de forma desatendida.
