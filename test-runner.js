const { Readable } = require('stream');
const { EventEmitter } = require('events');
const app = require('./src/app');

function dispatch(method, url, { headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const req = Readable.from(payload ? [Buffer.from(payload)] : []);

    req.method = method;
    req.url = url;
    req.headers = {};
    Object.keys(headers).forEach(k => {
      req.headers[k.toLowerCase()] = headers[k];
    });

    if (payload) {
      req.headers['content-type'] = req.headers['content-type'] || 'application/json';
      req.headers['content-length'] = Buffer.byteLength(payload).toString();
    }

    req.ip = '127.0.0.1';
    req.socket = { remoteAddress: '127.0.0.1', encrypted: false };

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (key, val) => { res._headers[key.toLowerCase()] = val; };
    res.getHeader = (key) => res._headers[key.toLowerCase()];
    res.status = (code) => { res.statusCode = code; return res; };

    let resBody = '';
    res.write = (chunk) => {
      if (chunk) resBody += chunk.toString();
      return true;
    };
    res.end = (chunk) => {
      if (chunk) resBody += chunk.toString();
      let parsed = resBody;
      try {
        parsed = JSON.parse(resBody);
      } catch (e) {}
      resolve({
        status: res.statusCode,
        headers: res._headers,
        body: parsed
      });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
      else {
        resolve({
          status: 404,
          headers: res._headers,
          body: { error: 'Not Found' }
        });
      }
    });
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS DE LA API');
  console.log('========================================================\n');

  try {
    // -----------------------------------------------------------------
    console.log('📌 1. PRUEBAS DE AUTENTICACIÓN Y REGISTRO');
    // -----------------------------------------------------------------
    const uniqueEmailA = `test_user_a_${Date.now()}@correo.com`;
    const uniqueEmailB = `test_user_b_${Date.now()}@correo.com`;

    // 1.1 Registro exitoso de Usuario A
    const resRegA = await dispatch('POST', '/api/auth/registro', {
      body: {
        nombre: 'Usuario Test A',
        correo: uniqueEmailA,
        password: 'Password123*',
        rol: 'admin' // Intento de escalada de privilegios
      }
    });
    assert(resRegA.status === 201, 'Registro exitoso devuelve código HTTP 201');
    assert(resRegA.body.usuario.rol === 'usuario', 'El registro público SIEMPRE fuerza rol "usuario" (ignora intento de ser admin)');
    assert(!resRegA.body.usuario.password, 'La respuesta jamás contiene el campo password en texto plano');
    assert(!resRegA.body.usuario.password_hash, 'La respuesta jamás contiene el hash de la contraseña');

    // 1.2 Rechazo de correo duplicado
    const resRegDup = await dispatch('POST', '/api/auth/registro', {
      body: {
        nombre: 'Usuario Duplicado',
        correo: uniqueEmailA,
        password: 'Password123*'
      }
    });
    assert(resRegDup.status === 409, 'Rechazo de correo duplicado devuelve código HTTP 409 Conflict');

    // 1.3 Rechazo de campos vacíos o inválidos
    const resRegInv = await dispatch('POST', '/api/auth/registro', {
      body: {
        nombre: '',
        correo: 'correo_invalido_sin_arroba',
        password: '123'
      }
    });
    assert(resRegInv.status === 400, 'Rechazo de datos inválidos en registro devuelve código HTTP 400 Bad Request');

    // 1.4 Registro de Usuario B
    const resRegB = await dispatch('POST', '/api/auth/registro', {
      body: {
        nombre: 'Usuario Test B',
        correo: uniqueEmailB,
        password: 'Password123*'
      }
    });
    assert(resRegB.status === 201, 'Registro de Usuario B devuelve código HTTP 201');

    // 1.5 Login exitoso de Usuario A
    const resLoginA = await dispatch('POST', '/api/auth/login', {
      body: {
        correo: uniqueEmailA,
        password: 'Password123*'
      }
    });
    assert(resLoginA.status === 200, 'Login correcto de Usuario A devuelve HTTP 200');
    assert(typeof resLoginA.body.token === 'string', 'Login devuelve token JWT firmado');
    const tokenUserA = resLoginA.body.token;

    // 1.6 Login exitoso de Usuario B
    const resLoginB = await dispatch('POST', '/api/auth/login', {
      body: {
        correo: uniqueEmailB,
        password: 'Password123*'
      }
    });
    assert(resLoginB.status === 200, 'Login correcto de Usuario B devuelve HTTP 200');
    const tokenUserB = resLoginB.body.token;

    // 1.7 Login exitoso de Administrador (sembrado en seed)
    const resLoginAdmin = await dispatch('POST', '/api/auth/login', {
      body: {
        correo: 'admin@tienda.com',
        password: 'Admin123*'
      }
    });
    assert(resLoginAdmin.status === 200, 'Login de Administrador devuelve HTTP 200');
    assert(resLoginAdmin.body.usuario.rol === 'admin', 'Usuario logueado tiene rol "admin"');
    const tokenAdmin = resLoginAdmin.body.token;

    // 1.8 Login fallido: contraseña incorrecta
    const resLoginWrongPass = await dispatch('POST', '/api/auth/login', {
      body: {
        correo: uniqueEmailA,
        password: 'ClaveIncorrecta'
      }
    });
    assert(resLoginWrongPass.status === 401, 'Login con contraseña incorrecta devuelve HTTP 401 Unauthorized');

    // 1.9 Login fallido: correo inexistente
    const resLoginNoUser = await dispatch('POST', '/api/auth/login', {
      body: {
        correo: 'no_existe_nunca@correo.com',
        password: 'Password123*'
      }
    });
    assert(resLoginNoUser.status === 401, 'Login con correo inexistente devuelve HTTP 401 Unauthorized');

    // -----------------------------------------------------------------
    console.log('\n📌 2. PRUEBAS DE CATÁLOGO DE PRODUCTOS (PÚBLICO Y FILTROS)');
    // -----------------------------------------------------------------
    // 2.1 Listar catálogo sin token (público)
    const resListProd = await dispatch('GET', '/api/productos');
    assert(resListProd.status === 200, 'Consulta de catálogo sin token devuelve HTTP 200 OK');
    assert(Array.isArray(resListProd.body.productos), 'Respuesta contiene lista de productos en array');
    assert(resListProd.body.productos.length >= 5, 'El catálogo contiene al menos 5 productos de ejemplo');

    // 2.2 Filtrar productos por categoría
    const resFilter = await dispatch('GET', '/api/productos?categoria=Tecnologia');
    assert(resFilter.status === 200, 'Filtro por categoría devuelve HTTP 200 OK');
    assert(resFilter.body.productos.every(p => p.categoria.toLowerCase() === 'tecnologia'), 'Todos los productos devueltos corresponden a la categoría solicitada');

    // 2.3 Consultar un producto por ID existente
    const existingId = resListProd.body.productos[0].id;
    const resGetOne = await dispatch('GET', `/api/productos/${existingId}`);
    assert(resGetOne.status === 200, 'Consultar producto existente por ID devuelve HTTP 200 OK');
    assert(resGetOne.body.producto.id === existingId, 'El producto obtenido coincide con el ID solicitado');

    // 2.4 Consultar producto inexistente
    const resGetNotFound = await dispatch('GET', '/api/productos/999999');
    assert(resGetNotFound.status === 404, 'Consultar producto inexistente devuelve HTTP 404 Not Found');

    // -----------------------------------------------------------------
    console.log('\n📌 3. PRUEBAS DE CONTROL DE ACCESO POR ROLES (ADMIN CRUD)');
    // -----------------------------------------------------------------
    // 3.1 Intento de crear producto sin token (debe fallar con 401)
    const resCreateNoToken = await dispatch('POST', '/api/productos', {
      body: { nombre: 'Producto Test', descripcion: 'Desc', categoria: 'Test', precio: 50 }
    });
    assert(resCreateNoToken.status === 401, 'Crear producto sin token es rechazado con HTTP 401 Unauthorized');

    // 3.2 Intento de crear producto con rol usuario (debe fallar con 403)
    const resCreateUserRole = await dispatch('POST', '/api/productos', {
      headers: { Authorization: `Bearer ${tokenUserA}` },
      body: { nombre: 'Producto Test', descripcion: 'Desc', categoria: 'Test', precio: 50 }
    });
    assert(resCreateUserRole.status === 403, 'Crear producto con rol "usuario" es rechazado con HTTP 403 Forbidden');

    // 3.3 Intento de crear producto con precio <= 0
    const resCreateInvalidPrice = await dispatch('POST', '/api/productos', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      body: { nombre: 'Producto Inválido', descripcion: 'Desc', categoria: 'Test', precio: -10 }
    });
    assert(resCreateInvalidPrice.status === 400, 'Crear producto con precio <= 0 es rechazado con HTTP 400 Bad Request');

    // 3.4 Creación exitosa como Administrador
    const resCreateAdmin = await dispatch('POST', '/api/productos', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      body: {
        nombre: 'Cámara Mirrorless 4K Pro',
        descripcion: 'Sensor CMOS 24MP, grabación 4K 60fps, estabilización 5 ejes',
        categoria: 'Fotografia',
        precio: 950.00
      }
    });
    assert(resCreateAdmin.status === 201, 'Crear producto como administrador devuelve HTTP 201 Created');
    const createdProduct = resCreateAdmin.body.producto;
    assert(createdProduct && createdProduct.id, 'Producto creado contiene un ID autoincremental');

    // 3.5 Actualización exitosa como Administrador
    const resUpdateAdmin = await dispatch('PUT', `/api/productos/${createdProduct.id}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      body: {
        nombre: 'Cámara Mirrorless 4K Pro Mark II',
        descripcion: 'Sensor CMOS 32MP y grabación 6K',
        categoria: 'Fotografia',
        precio: 1100.00
      }
    });
    assert(resUpdateAdmin.status === 200, 'Actualizar producto como administrador devuelve HTTP 200 OK');
    assert(resUpdateAdmin.body.producto.precio === 1100.00, 'El precio del producto fue actualizado correctamente');

    // 3.6 Actualizar producto inexistente como Administrador
    const resUpdateNotFound = await dispatch('PUT', '/api/productos/999999', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      body: { nombre: 'X', descripcion: 'Y', categoria: 'Z', precio: 100 }
    });
    assert(resUpdateNotFound.status === 404, 'Actualizar producto inexistente devuelve HTTP 404 Not Found');

    // -----------------------------------------------------------------
    console.log('\n📌 4. PRUEBAS DE FAVORITOS Y AISLAMIENTO ENTRE USUARIOS');
    // -----------------------------------------------------------------
    // 4.1 Usuario A lista sus favoritos inicialmente vacíos
    const resFavInitA = await dispatch('GET', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserA}` }
    });
    assert(resFavInitA.status === 200, 'Usuario A lista favoritos devuelve HTTP 200 OK');
    assert(resFavInitA.body.favoritos.length === 0, 'La lista inicial de favoritos de Usuario A está vacía');

    // 4.2 Usuario A agrega producto a sus favoritos
    const resAddFavA = await dispatch('POST', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserA}` },
      body: { productoId: createdProduct.id }
    });
    assert(resAddFavA.status === 201, 'Usuario A agrega producto a favoritos devuelve HTTP 201 Created');

    // 4.3 Rechazo de favorito duplicado con 409 Conflict
    const resAddFavDup = await dispatch('POST', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserA}` },
      body: { productoId: createdProduct.id }
    });
    assert(resAddFavDup.status === 409, 'Rechazo de favorito duplicado devuelve HTTP 409 Conflict');

    // 4.4 Rechazo de favorito con producto inexistente con 404
    const resAddFavNotFound = await dispatch('POST', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserA}` },
      body: { productoId: 999999 }
    });
    assert(resAddFavNotFound.status === 404, 'Rechazo de favorito de producto inexistente devuelve HTTP 404 Not Found');

    // 4.5 AISLAMIENTO: Usuario B lista sus favoritos y NO debe ver el favorito de Usuario A
    const resFavListB = await dispatch('GET', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserB}` }
    });
    assert(resFavListB.status === 200, 'Usuario B lista sus favoritos devuelve HTTP 200 OK');
    assert(resFavListB.body.favoritos.length === 0, 'AISLAMIENTO: Usuario B NO ve los favoritos de Usuario A');

    // 4.6 AISLAMIENTO: Usuario B intenta eliminar el favorito de Usuario A
    const resDelFavByB = await dispatch('DELETE', `/api/favoritos/${createdProduct.id}`, {
      headers: { Authorization: `Bearer ${tokenUserB}` }
    });
    assert(resDelFavByB.status === 404, 'AISLAMIENTO: Usuario B no puede eliminar el favorito de Usuario A (recibe 404)');

    // 4.7 AISLAMIENTO: Verificar que el favorito de Usuario A permanece intacto
    const resFavCheckA = await dispatch('GET', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserA}` }
    });
    assert(resFavCheckA.status === 200, 'Usuario A vuelve a consultar sus favoritos');
    assert(resFavCheckA.body.favoritos.length === 1, 'AISLAMIENTO: El favorito de Usuario A sigue existiendo intacto');
    assert(resFavCheckA.body.favoritos[0].producto_id === createdProduct.id, 'El producto en favoritos de A coincide');

    // -----------------------------------------------------------------
    console.log('\n📌 5. PRUEBAS DE INTEGRIDAD REFERENCIAL (CASCADE ON DELETE)');
    // -----------------------------------------------------------------
    // 5.1 Admin elimina el producto creado
    const resDeleteProd = await dispatch('DELETE', `/api/productos/${createdProduct.id}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    assert(resDeleteProd.status === 200, 'Admin elimina producto exitosamente con HTTP 200 OK');

    // 5.2 Comprobar que en favoritos de Usuario A el producto se eliminó en cascada
    const resFavAfterDelete = await dispatch('GET', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserA}` }
    });
    assert(resFavAfterDelete.status === 200, 'Usuario A consulta sus favoritos tras eliminación del producto');
    assert(resFavAfterDelete.body.favoritos.length === 0, 'INTEGRIDAD: El favorito fue eliminado automáticamente en cascada al suprimirse el producto');

    // 5.3 Usuario A agrega otro producto y luego lo elimina voluntariamente
    const resAddFavA2 = await dispatch('POST', '/api/favoritos', {
      headers: { Authorization: `Bearer ${tokenUserA}` },
      body: { productoId: existingId }
    });
    assert(resAddFavA2.status === 201, 'Usuario A agrega producto existente a favoritos (201)');

    const resDelFavA = await dispatch('DELETE', `/api/favoritos/${existingId}`, {
      headers: { Authorization: `Bearer ${tokenUserA}` }
    });
    assert(resDelFavA.status === 200, 'Usuario A elimina voluntariamente su propio favorito con HTTP 200 OK');

    console.log('\n========================================================');
    console.log('✅ TODAS LAS 28 PRUEBAS AUTOMATIZADAS PASARON CON ÉXITO');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n❌ ERROR EN LA SUITE DE PRUEBAS:', err);
    process.exitCode = 1;
  }
}

runTests();
