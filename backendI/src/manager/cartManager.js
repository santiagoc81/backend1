// src/manager/cartManager.js
import Cart from '../models/cart.model.js';

class CartManager {
  async agregarProductoAlCarrito(productId) {
    try {
      let carrito = await Cart.findOne();
      if (!carrito) {
        carrito = new Cart({ products: [] });
      }

      const productIndex = carrito.products.findIndex(p => p.product.toString() === productId);
      if (productIndex === -1) {
        carrito.products.push({ product: productId, quantity: 1 });
      } else {
        carrito.products[productIndex].quantity += 1;
      }

      await carrito.save();
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      throw error;
    }
  }
}

export default CartManager;
