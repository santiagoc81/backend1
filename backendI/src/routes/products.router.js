import { Router } from 'express';
import ProductsManager from '../manager/productsManager.js';

const router = Router();
const productsManager = new ProductsManager();

// Ruta para obtener todos los productos con límite opcional
router.get('/', async (req, res) => {
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
        const prevLink = productos.hasPrevPage ? `${baseUrl}/?limit=${limit}&page=${productos.prevPage}&sort=${sort || ''}&query=${query || ''}` : null;
        const nextLink = productos.hasNextPage ? `${baseUrl}/?limit=${limit}&page=${productos.nextPage}&sort=${sort || ''}&query=${query || ''}` : null;

        res.status(200).json({
            status: 'success',
            payload: productos.docs,
            totalPages: productos.totalPages,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            page: productos.page,
            hasPrevPage: productos.hasPrevPage,
            hasNextPage: productos.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', error: 'Error al obtener productos' });
    }
});

// Ruta para agregar un producto
router.post('/', async (req, res) => {
    try {
        const nuevoProducto = await productsManager.crearProducto(req.body);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Ruta para actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    const productUpdated = req.body;

    try {
        const productos = await productsManager.leerProductos();
        const productIndex = productos.findIndex(product => product.id === productId);
        if (productIndex === -1) {
            return res.status(404).send({ status: 'error', error: 'Producto no encontrado' });
        }

        productos[productIndex] = { ...productos[productIndex], ...productUpdated, id: productId };
        await productsManager.actualizarProductos(productos);
        res.status(200).send({ status: 'success', message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al actualizar el producto' });
    }
});

// Ruta para obtener detalles de un producto por ID
router.get('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
        const productos = await productsManager.leerProductos();
        const product = productos.find(product => product.id === productId);
        if (!product) {
            return res.status(404).send({ status: 'error', error: 'Producto no encontrado' });
        }
        res.status(200).send(product);
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al obtener el producto' });
    }
});

// Ruta para eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
        const productos = await productsManager.leerProductos();
        const productIndex = productos.findIndex(product => product.id === productId);
        if (productIndex === -1) {
            return res.status(404).send({ status: 'error', error: 'Producto no encontrado' });
        }

        productos.splice(productIndex, 1);
        await productsManager.actualizarProductos(productos);
        res.status(200).send({ status: 'success', message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al eliminar el producto' });
    }
});



export default router;
