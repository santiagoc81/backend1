import Product from '../models/product.model.js'; // Importa el modelo de productos de MongoDB
import fs from 'fs/promises';
import Joi from 'joi';

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
    thumbnails: Joi.array().items(Joi.string()).default([]) // no requerido
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

  async leerProductos({ limit = 10, page = 1, sort, query }) {
    const options = {
        limit: parseInt(limit), // Establece el número de productos por página
        page: parseInt(page),   // Establece la página actual
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : null, // Ordena por precio si se especifica
        lean: true  // Devuelve resultados en un formato JSON plano
    };

    // Aplica un filtro de búsqueda si se especifica `query`
    const filter = query ? { category: query } : {};

    // Usamos `.paginate` para obtener los productos con paginación
    return await Product.paginate(filter, options);
}

}

export default ProductsManager;
