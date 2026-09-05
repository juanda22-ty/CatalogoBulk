import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Categoria from './src/modules/categorias/categoria.model.js';
import Proveedor from './src/modules/proveedores/proveedor.model.js';
import Producto from './src/modules/productos/producto.model.js';
import Usuario from './src/modules/auth/usuario.model.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('[Seed] Falta MONGO_URI. Configúralo en el .env o como variable de entorno.');
  process.exit(1);
}

const categorias = [
  { nombre: 'tecnologia', slug: 'tecnologia', descripcion: 'Celulares, accesorios y electrónica' },
  { nombre: 'hogar', slug: 'hogar', descripcion: 'Artículos para el hogar y cocina' },
  { nombre: 'deportes', slug: 'deportes', descripcion: 'Equipamiento deportivo y fitness' },
  { nombre: 'moda', slug: 'moda', descripcion: 'Ropa y accesorios de vestir' },
  { nombre: 'ferreteria', slug: 'ferreteria', descripcion: 'Herramientas y materiales de construcción' },
  { nombre: 'papeleria', slug: 'papeleria', descripcion: 'Útiles escolares y de oficina' }
];

const proveedores = [
  { nombre: 'TecnoImport', slug: 'tecnoimport', contactoEmail: 'ventas@tecnoimport.com', logoUrl: null, activo: true },
  { nombre: 'HogarMax', slug: 'hogarmax', contactoEmail: 'pedidos@hogarmax.com', logoUrl: null, activo: true },
  { nombre: 'DeporteTotal', slug: 'deportetotal', contactoEmail: 'ventas@deportetotal.com', logoUrl: null, activo: true },
  { nombre: 'ModaUnica', slug: 'modaunica', contactoEmail: 'contacto@modaunica.com', logoUrl: null, activo: true },
  { nombre: 'FerreTodo', slug: 'ferretodo', contactoEmail: 'ventas@ferretodo.com', logoUrl: null, activo: true },
  { nombre: 'PapeleriaPro', slug: 'papeleriapro', contactoEmail: 'ventas@papeleriapro.com', logoUrl: null, activo: true }
];

const productos = [
  { sku: 'TEC-001', nombre: 'Audífonos Bluetooth Pro', precio: 89.9, stock: 150, categoria: 'tecnologia', proveedorSlug: 'tecnoimport', descripcion: 'Audífonos inalámbricos con cancelación de ruido.' },
  { sku: 'TEC-002', nombre: 'Cargador Rápido 65W', precio: 24.5, stock: 300, categoria: 'tecnologia', proveedorSlug: 'tecnoimport', descripcion: 'Cargador USB-C de carga rápida.' },
  { sku: 'TEC-003', nombre: 'Smartwatch Serie 8', precio: 129.0, stock: 80, categoria: 'tecnologia', proveedorSlug: 'tecnoimport', descripcion: 'Reloj inteligente con monitor de salud.' },
  { sku: 'HOG-001', nombre: 'Juego de Ollas 10 pzas', precio: 149.9, stock: 60, categoria: 'hogar', proveedorSlug: 'hogarmax', descripcion: 'Juego de ollas de acero inoxidable.' },
  { sku: 'HOG-002', nombre: 'Licuadora 1.5L', precio: 59.9, stock: 120, categoria: 'hogar', proveedorSlug: 'hogarmax', descripcion: 'Licuadora de alta potencia con vaso de vidrio.' },
  { sku: 'HOG-003', nombre: 'Set de Toallas x6', precio: 39.9, stock: 200, categoria: 'hogar', proveedorSlug: 'hogarmax', descripcion: 'Set de toallas de algodón suave.' },
  { sku: 'DEP-001', nombre: 'Balón de Fútbol #5', precio: 29.9, stock: 250, categoria: 'deportes', proveedorSlug: 'deportetotal', descripcion: 'Balón profesional cosido a máquina.' },
  { sku: 'DEP-002', nombre: 'Mancuernas 10kg (par)', precio: 45.0, stock: 90, categoria: 'deportes', proveedorSlug: 'deportetotal', descripcion: 'Par de mancuernas recubiertas de caucho.' },
  { sku: 'DEP-003', nombre: 'Colchoneta Yoga', precio: 19.9, stock: 180, categoria: 'deportes', proveedorSlug: 'deportetotal', descripcion: 'Colchoneta antideslizante de 6mm.' },
  { sku: 'MOD-001', nombre: 'Camiseta Básica Algodón', precio: 12.9, stock: 500, categoria: 'moda', proveedorSlug: 'modaunica', descripcion: 'Camiseta unisex de algodón peinado.' },
  { sku: 'MOD-002', nombre: 'Jeans Slim Fit', precio: 34.9, stock: 220, categoria: 'moda', proveedorSlug: 'modaunica', descripcion: 'Jeans de corte slim para hombre y mujer.' },
  { sku: 'MOD-003', nombre: 'Chaqueta Cortavientos', precio: 49.9, stock: 110, categoria: 'moda', proveedorSlug: 'modaunica', descripcion: 'Chaqueta liviana impermeable.' },
  { sku: 'FER-001', nombre: 'Taladro Inalámbrico 20V', precio: 99.9, stock: 70, categoria: 'ferreteria', proveedorSlug: 'ferretodo', descripcion: 'Taladro percutor con batería y maletín.' },
  { sku: 'FER-002', nombre: 'Caja de Herramientas 100 pzas', precio: 79.9, stock: 45, categoria: 'ferreteria', proveedorSlug: 'ferretodo', descripcion: 'Kit completo de herramientas para el hogar.' },
  { sku: 'FER-003', nombre: 'Pintura Blanca 1GL', precio: 27.5, stock: 140, categoria: 'ferreteria', proveedorSlug: 'ferretodo', descripcion: 'Pintura látex lavable de alta cubrición.' },
  { sku: 'PAP-001', nombre: 'Resma de Papel A4 x500', precio: 8.9, stock: 400, categoria: 'papeleria', proveedorSlug: 'papeleriapro', descripcion: 'Papel bond A4 de 75 gramos.' },
  { sku: 'PAP-002', nombre: 'Caja de Bolígrafos x50', precio: 15.9, stock: 350, categoria: 'papeleria', proveedorSlug: 'papeleriapro', descripcion: 'Bolígrafos de tinta azul punta fina.' },
  { sku: 'PAP-003', nombre: 'Cuaderno Cosido 100 hojas', precio: 4.5, stock: 600, categoria: 'papeleria', proveedorSlug: 'papeleriapro', descripcion: 'Cuaderno universitario cuadriculado.' }
];

async function seed() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('[Seed] Conectado a MongoDB');

  for (const categoria of categorias) {
    await Categoria.updateOne(
      { nombre: categoria.nombre },
      { $setOnInsert: categoria },
      { upsert: true }
    );
  }
  console.log(`[Seed] Categorías listas (${categorias.length})`);

  for (const proveedor of proveedores) {
    await Proveedor.updateOne(
      { slug: proveedor.slug },
      { $setOnInsert: proveedor },
      { upsert: true }
    );
  }
  console.log(`[Seed] Proveedores listos (${proveedores.length})`);

  for (const producto of productos) {
    const proveedor = await Proveedor.findOne({ slug: producto.proveedorSlug });
    if (!proveedor) {
      console.error(`[Seed] Proveedor no encontrado para ${producto.sku}: ${producto.proveedorSlug}`);
      continue;
    }
    const { proveedorSlug, ...datos } = producto;
    await Producto.updateOne(
      { sku: producto.sku },
      {
        $setOnInsert: {
          ...datos,
          proveedorId: proveedor._id,
          imagenUrl: `https://placehold.co/600x600?text=${encodeURIComponent(producto.nombre)}`,
          disponible: producto.stock > 0
        }
      },
      { upsert: true }
    );
  }
  console.log(`[Seed] Productos listos (${productos.length})`);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@catalogobulk.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await Usuario.updateOne(
    { email: adminEmail },
    {
      $setOnInsert: {
        email: adminEmail,
        password: passwordHash,
        rol: 'admin',
        activo: true
      }
    },
    { upsert: true }
  );
  console.log(`[Seed] Admin listo: ${adminEmail}`);

  await mongoose.disconnect();
  console.log('[Seed] Finalizado correctamente');
}

seed().catch((error) => {
  console.error('[Seed ERROR]', error);
  process.exit(1);
});
