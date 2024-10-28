// src/routes/views.router.js
import { Router } from 'express';
import ProductsManager from '../manager/productsManager.js';

const router = Router();
const productsManager = new ProductsManager();

// Ruta para renderizar la vista estática de productos
router.get('/products', async (req, res) => {
    try {
        const productos = await productsManager.leerProductos();
        res.render('productos', { productos });
    } catch (error) {
        console.error('Error al cargar la vista de productos:', error);
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

export default router;
