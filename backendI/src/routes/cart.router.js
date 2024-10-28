// src/routes/cart.router.js
import { Router } from 'express';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

const router = Router();

// Agregar un producto a un carrito existente o crear uno nuevo si no existe
router.post('/products/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        // Verificar si el producto existe
        const producto = await Product.findById(pid);
        if (!producto) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        // Buscar un carrito existente
        let carrito = await Cart.findOne();

        // Si no hay carrito, crea uno nuevo
        if (!carrito) {
            carrito = new Cart({
                products: [{ product: pid, quantity: 1 }]
            });
        } else {
            // Verificar si el producto ya está en el carrito
            const productInCart = carrito.products.find(item => item.product.toString() === pid);
            if (productInCart) {
                // Incrementar la cantidad si el producto ya está en el carrito
                productInCart.quantity += 1;
            } else {
                // Agregar el producto al carrito si no está presente
                carrito.products.push({ product: pid, quantity: 1 });
            }
        }

        // Guardar el carrito (nuevo o actualizado)
        await carrito.save();

        res.json({
            status: 'success',
            message: 'Producto agregado al carrito',
            cartId: carrito._id
        });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
});

// Endpoint para agregar un producto al carrito existente
router.post('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const carrito = await Cart.findById(cid);
        if (!carrito) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        // Buscar si el producto ya está en el carrito
        const productInCart = carrito.products.find(item => item.product.toString() === pid);
        if (productInCart) {
            // Incrementar la cantidad si el producto ya está en el carrito
            productInCart.quantity += 1;
        } else {
            // Agregar el producto al carrito si no está presente
            carrito.products.push({ product: pid, quantity: 1 });
        }

        await carrito.save();
        res.json({ status: 'success', message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
});

// DELETE api/carts/:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const carrito = await Cart.findById(cid);
        if (!carrito) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        carrito.products = carrito.products.filter(item => item.product.toString() !== pid);
        await carrito.save();

        res.json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito' });
    }
});

// PUT api/carts/:cid - Actualizar el carrito con un nuevo arreglo de productos
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body; // Array de productos con { product: productId, quantity }

    try {
        const carrito = await Cart.findById(cid);
        if (!carrito) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        // Validar si los productos existen en la base de datos
        const productosExistentes = await Product.find({ _id: { $in: products.map(p => p.product) } });
        if (productosExistentes.length !== products.length) {
            return res.status(400).json({ status: 'error', message: 'Uno o más productos no existen' });
        }

        // Actualizar el carrito con el nuevo arreglo de productos
        carrito.products = products;
        await carrito.save();

        res.json({ status: 'success', message: 'Carrito actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el carrito' });
    }
});

// Otros endpoints siguen igual...

export default router;
