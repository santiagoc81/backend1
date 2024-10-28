import fs from 'fs/promises';
import Joi from 'joi';  // Importar Joi

class ProductsManager {

  constructor() {
    this.filePath = './src/data/products.json'; 
  }

  // Definir un esquema de validación para los productos usando Joi
productoSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  code: Joi.string().required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().required(),
  status: Joi.boolean().default(true), // true por defecto
  thumbnails: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow('')
  ).default([]) // Permitir array de strings o una cadena vacía, default a []
});


  // Función para crear un producto con ID único autoincremental
  async crearProducto(producto) {
    try {
      // Validar los datos del producto usando Joi
      const { error, value } = this.productoSchema.validate(producto);
      if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
      }

      let productos = await this.leerProductos(); // Leer los productos existentes

      // Calcular el nuevo ID basándonos en el ID más alto
      let newId = 1;
      if (productos.length > 0) {
        const ids = productos.map(p => p.id);
        newId = Math.max(...ids) + 1;
      }

      // Crear el nuevo objeto de producto
      const nuevoProducto = {
        id: newId,
        title: value.title,
        description: value.description,
        code: value.code,
        price: value.price,
        stock: value.stock,
        category: value.category,
        status: value.status, 
        thumbnails: value.thumbnails 
      };

      // Agregar el nuevo producto al array de productos
      productos.push(nuevoProducto);
      
      // Guardar el array de productos en el archivo
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
      console.log('Producto creado exitosamente!');
    } catch (error) {
      console.log(error);
      console.error('Error al crear producto:', error);
      throw error;  // Lanza el error para que pueda manejarse en otras capas
    }
  }

  async leerProductos() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      if (!data) {
        return [];
      }
      return JSON.parse(data); 
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // Si el archivo no existe, devolvemos un array vacío
      } else {
        console.log(error);
        console.error('Error al leer productos:', error);
        throw error; 
      }
    }
  }

  // Actualizar productos
  async actualizarProductos(productos) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
    } catch (error) {
      throw error;
    }
  }
}

export default ProductsManager;
