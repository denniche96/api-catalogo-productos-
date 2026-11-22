const bcrypt = require('bcryptjs');
const db = require('../config/database');
const initDb = require('./initDb');

function seed() {
  // Asegurar que las tablas existan
  initDb();

  console.log('🌱 Iniciando siembra de datos de prueba (Seed)...');

  // 1. Crear usuarios base
  const saltRounds = 10;

  const adminPasswordHash = bcrypt.hashSync('Admin123*', saltRounds);
  const userPasswordHash = bcrypt.hashSync('User123*', saltRounds);

  const insertUser = db.prepare(`
    INSERT INTO usuarios (nombre, correo, password_hash, rol)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(correo) DO UPDATE SET
      nombre = excluded.nombre,
      password_hash = excluded.password_hash,
      rol = excluded.rol
  `);

  insertUser.run('Administrador Principal', 'admin@tienda.com', adminPasswordHash, 'admin');
  insertUser.run('Usuario Demo A', 'usuarioA@tienda.com', userPasswordHash, 'usuario');
  insertUser.run('Usuario Demo B', 'usuarioB@tienda.com', userPasswordHash, 'usuario');

  console.log('👤 Usuarios inicializados:');
  console.log('   - Admin:    admin@tienda.com    / Contraseña: Admin123* (Rol: admin)');
  console.log('   - UsuarioA: usuarioA@tienda.com / Contraseña: User123*  (Rol: usuario)');
  console.log('   - UsuarioB: usuarioB@tienda.com / Contraseña: User123*  (Rol: usuario)');

  // 2. Sembrar catálogo inicial de productos de ejemplo (mínimo 5 requeridos)
  const countProducts = db.prepare('SELECT COUNT(*) as count FROM productos').get();

  if (countProducts.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO productos (nombre, descripcion, categoria, precio)
      VALUES (?, ?, ?, ?)
    `);

    const sampleProducts = [
      {
        nombre: 'Laptop Gamer Pro X15',
        descripcion: 'Intel Core i7 13va gen, 16GB RAM DDR5, 1TB SSD NVMe, NVIDIA RTX 4060',
        categoria: 'Tecnologia',
        precio: 1299.99
      },
      {
        nombre: 'Smartphone Ultra 5G',
        descripcion: 'Pantalla AMOLED 6.7 pulgadas 120Hz, 256GB almacenamiento, Cámara 108MP',
        categoria: 'Tecnologia',
        precio: 799.50
      },
      {
        nombre: 'Auriculares Inalámbricos Pro ANC',
        descripcion: 'Cancelación activa de ruido, Bluetooth 5.3, hasta 30 horas de batería',
        categoria: 'Audio',
        precio: 149.99
      },
      {
        nombre: 'Teclado Mecánico RGB Switch Red',
        descripcion: 'Formato TKL 80%, switches mecánicos lineales rojos, retroiluminación RGB configurable',
        categoria: 'Perifericos',
        precio: 89.90
      },
      {
        nombre: 'Monitor Curvo Gamer 27" 144Hz',
        descripcion: 'Panel VA QHD 2560x1440, curvatura 1500R, FreeSync Premium, 1ms',
        categoria: 'Monitores',
        precio: 279.00
      },
      {
        nombre: 'Mouse Ergonómico Inalámbrico',
        descripcion: 'Sensor óptico de alta precisión 4000 DPI, conexión dual 2.4GHz y Bluetooth',
        categoria: 'Perifericos',
        precio: 45.00
      }
    ];

    const insertMany = db.transaction((products) => {
      for (const prod of products) {
        insertProduct.run(prod.nombre, prod.descripcion, prod.categoria, prod.precio);
      }
    });

    insertMany(sampleProducts);
    console.log(`📦 ${sampleProducts.length} productos de ejemplo insertados en el catálogo.`);
  } else {
    console.log(`ℹ️ El catálogo ya contiene ${countProducts.count} productos. No se reinsertaron duplicados.`);
  }

  console.log('🎉 Seeding completado con éxito.');
}

if (require.main === module) {
  seed();
  process.exit(0);
}

module.exports = seed;
