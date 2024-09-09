import fs from 'fs/promises';

class CartManager {

  constructor() {
    this.filePath = './src/data/cart.json';  // Ruta al archivo del cart
  }

  // Función para crear un carrito con ID único autoincremental
  async createCart() {
    try {
        let carritos = await this.getCart(); // Leer carritos existentes
        // Calcular el nuevo ID basándonos en el ID más alto
        let newId = 1;
        if (carritos.length > 0) {
          const ids = carritos.map(c => c.id);
          newId = Math.max(...ids) + 1;
      }
      // Crear un nuevo carrito vacío
      const nuevoCarrito = {
          id: newId,
          products: [] // Inicialmente, el carrito está vacío
      };
      // Agregar el nuevo carrito al array de carritos
      carritos.push(nuevoCarrito);
      
      // Guardar el array de carritos en el archivo
      await fs.writeFile(this.filePath, JSON.stringify(carritos, null, 2));
      console.log('Carrito creado exitosamente!');
    } catch (error) {
      console.log(error);
      console.error('Error al crear el carrito:', error);
      throw error;  // Lanza el error para que pueda manejarse en otras capas
    }
  }

  // Función para agregar un producto a un carrito existente
  async addProduct(carritoId, productId, quantity) {
    try {
      let carritos = await this.getCart(); // Leer carritos existentes
      const carritoIndex = carritos.findIndex(c => c.id === carritoId);
      if (carritoIndex === -1) {
        throw new Error('Carrito no encontrado');
      }

      // Buscar si el producto ya está en el carrito
      const productIndex = carritos[carritoIndex].products.findIndex(p => p.id === productId);

      if (productIndex === -1) {
        // Si el producto no existe, agregarlo
        carritos[carritoIndex].products.push({ id: productId, quantity });
      } else {
        // Si el producto ya está en el carrito, actualizar la cantidad
        carritos[carritoIndex].products[productIndex].quantity += quantity;
      }
      // Guardar los carritos actualizados en el archivo
      await fs.writeFile(this.filePath, JSON.stringify(carritos, null, 2));
      console.log('Producto agregado al carrito exitosamente!');
    } catch (error) {
      console.log(error);
      console.error('Error al agregar producto al carrito:', error);
      throw error;
    }
  }

  // Leer los carritos del archivo
  async getCart() {
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
        console.error('Error al leer carritos:', error);
        throw error; 
      }
    }
  }

  // Actualizar carritos
  async updateCart(carritos) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(carritos, null, 2));
    } catch (error) {
      throw error;
    }
  }
}

export default CartManager;
