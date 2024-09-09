import { Router } from 'express'
import ProductsManager from '../manager/productsManager.js';

const router = Router();
const productsManager = new ProductsManager();


// Obtengo todos los productos via GET al raiz
// GET Products with limit
router.get('/', async (req, res) => {
    try {
        // Leer todos los productos
        const productos = await productsManager.leerProductos();
        // Si el archivo está vacío o no hay productos, devuelvo un array vacío con status 200
        if (productos.length === 0) {
            return res.status(200).json({ message: 'No hay productos disponibles' });
        }
        // Obtener el valor del parámetro limit en la consulta
        const limit = parseInt(req.query.limit);
        // Si existe el parámetro limit y es un número válido, limito el array que voy a devolver
        const productosLimitados = limit && !isNaN(limit) ? productos.slice(0, limit) : productos;
        // Devolver los productos, limitados o no según el parámetro
        res.status(200).json(productosLimitados);
    } 
    catch (error) {
        // Si ocurre un error, devolvemos un mensaje de error
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al obtener productos' });
    }
});

// Agrego un producto via POST al raiz
router.post('/', async (req, res) => {
    let product = req.body;
    // Verificamos que los campos obligatorios estén presentes
    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
        return res.status(400).send({ status: 'error', error: 'Campos obligatorios faltantes' });
    }
    
    try {
      await productsManager.crearProducto(product); // Agregar el nuevo producto al archivo
        res.status(201).send({ status: 'success', message: 'Producto creado exitosamente' });
    } catch (error) {
        // si llego a tener error tiro este mensaje
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al crear producto' });
    }
});


//Actualizo un producto via PUT con ID
router.put('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid); // Convertir el id a número
    const productUpdated = req.body; // Datos actualizados del producto
    try {
        // Leer los productos desde el archivo
        const productos = await productsManager.leerProductos();
        // Buscar el índice del producto por ID
        const productIndex = productos.findIndex(product => product.id === productId);
        if (productIndex === -1) {
            return res.status(404).send({ status: 'error', error: 'Product not found' });
        }
        // Actualizar el producto, pero mantener el mismo ID
        productos[productIndex] = { ...productos[productIndex], ...productUpdated, id: productId };
        // Guardar los productos actualizados en el archivo
        await productsManager.actualizarProductos(productos);
        // Enviar respuesta exitosa
        res.status(200).send({ status: 'success', message: 'Product updated successfully' });
    } 
    catch (error) {
        // Manejo de errores
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al actualizar el producto' });
    }
});

// Obtengo detalles del producto via GET e ID
router.get('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid); // Asegurarse de que el ID sea un número
    try {
        // Leer los productos desde el archivo
        const productos = await productsManager.leerProductos();
        // Buscar el producto por ID
        const product = productos.find(product => product.id === productId);  
        if (!product) {
            return res.status(404).send({ status: 'error', error: 'Product not found' });
        }
        // Si encontramos el producto, lo enviamos en la respuesta
        res.status(200).send(product);
    } 
    catch (error) {
        // si llego a tener error tiro este mensaje
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al obtener el producto' });
    }
});

// Elimino el producto via DELETE e ID
router.delete('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid); // Convertir el id a número
    try {
        // Leer los productos desde el archivo
        const productos = await productsManager.leerProductos();
        // Buscar el índice del producto por ID
        const productIndex = productos.findIndex(product => product.id === productId);
        // Verificar si el producto existe
        if (productIndex === -1) {
            return res.status(404).send({ status: 'error', error: 'Product not found' });
        }
        // Eliminar el producto
        productos.splice(productIndex, 1);
        // Guardar los productos actualizados en el archivo
        await productsManager.actualizarProductos(productos);
        // Enviar respuesta exitosa
        res.status(200).send({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
        // Manejo de errores
        console.log(error);
        res.status(500).send({ status: 'error', error: 'Error al eliminar el producto' });
    }
});

export default router;