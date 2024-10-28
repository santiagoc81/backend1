// src/routes/views.router.js
import { Router } from 'express';
import ProductsManager from '../manager/productsManager.js';
import Cart from '../models/cart.model.js'; // Importa el modelo Cart


const router = Router();
const productsManager = new ProductsManager();

// Ruta para renderizar la vista de productos con paginación
router.get('/products', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    try {
        const productos = await productsManager.leerProductos({
            limit,
            page,
            sort,
            query
        });

        // Construir enlaces prevLink y nextLink
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        const prevLink = productos.hasPrevPage ? `${baseUrl}/products?limit=${limit}&page=${productos.prevPage}&sort=${sort || ''}&query=${query || ''}` : null;
        const nextLink = productos.hasNextPage ? `${baseUrl}/products?limit=${limit}&page=${productos.nextPage}&sort=${sort || ''}&query=${query || ''}` : null;

        res.render('productos', {
            productos: productos.docs,  // Productos limitados
            totalPages: productos.totalPages,
            page: productos.page,
            hasPrevPage: productos.hasPrevPage,
            hasNextPage: productos.hasNextPage,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            prevLink: prevLink,
            nextLink: nextLink
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar la vista de productos');
    }
});

// Ruta para renderizar la vista de productos en tiempo real
router.get('/realtimeProducts', async (req, res) => {
    try {
        const productos = await productsManager.leerProductos();
        res.render('realtimeProducts', { productos });
    } catch (error) {
        console.error('Error al cargar la vista en tiempo real de productos:', error);
        res.status(500).send('Error al cargar la vista en tiempo real de productos');
    }
});

// Ruta para mostrar los productos de un carrito específico en la vista
router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        // Busca el carrito y obtiene los productos completos con populate
        const carrito = await Cart.findById(cid).populate('products.product');
        if (!carrito) {
            return res.status(404).render('error', { message: 'Carrito no encontrado' });
        }

        // Renderiza la vista del carrito con los productos específicos
        res.render('carrito', {
            cartId: cid,
            products: carrito.products
        });
    } catch (error) {
        console.error('Error al cargar la vista del carrito:', error);
        res.status(500).render('error', { message: 'Error al cargar la vista del carrito' });
    }
});

export default router;
