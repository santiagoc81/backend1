import { Router } from 'express'
import ProductsManager from '../manager/productsManager.js';
import CartManager from '../manager/cartManager.js';

const router = Router();
const cartManager = new CartManager();
const productsManager = new ProductsManager(); 


// Creo un carrito agregandole un producto
router.post('/', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        // Validación básica
        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).send({ status: 'error', message: 'ID de producto y cantidad son requeridos y deben ser válidos' });
        }
        // Verificar si el producto existe en ProductsManager
        const productos = await productsManager.leerProductos(); // Leer productos desde ProductsManager
        const producto = productos.find(p => p.id === productId);
        if (!producto) {
            return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
    }
    // Crear un nuevo carrito y agregarle el producto
    await cartManager.createCart();  // Crear un carrito vacío
    const carritos = await cartManager.getCart(); // Obtener los carritos
    const newCart = carritos[carritos.length - 1]; // Obtener el carrito recién creado
    await cartManager.addProduct(newCart.id, productId, quantity); // Agregar producto al carrito recién creado
        res.status(201).send({ status: 'success', message: 'Carrito creado con éxito y producto agregado', cartId: newCart.id });
    } 
    catch (error) {
        console.log(error);
        console.error('Error al crear el carrito y agregar producto:', error);
        res.status(500).send({ status: 'error', message: 'Error al crear el carrito y agregar producto' });
    }
});

// Obtengo los productos en el carrito con el ID del carrito
router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        // Leer el carrito por su ID
        const carritos = await cartManager.getCart();
        const carrito = carritos.find(c => c.id === cartId);
        if (!carrito) {
            return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
        }
        // Leer todos los productos del archivo para obtener detalles
        const productos = await productsManager.leerProductos();
        // Mapear los productos del carrito con sus detalles
        const productosEnCarrito = carrito.products.map(cartProduct => {
            const productDetails = productos.find(p => p.id === cartProduct.id);
            return {
                id: cartProduct.id,
                title: productDetails?.title || 'Producto no disponible',
                description: productDetails?.description || 'Descripción no disponible',
                price: productDetails?.price || 'Precio no disponible',
                quantity: cartProduct.quantity
            };
        });
        // Enviar los productos del carrito
        res.status(200).send({ status: 'success', products: productosEnCarrito });
    } catch (error) {
        console.error('Error al obtener los productos del carrito:', error);
        res.status(500).send({ status: 'error', message: 'Error al obtener los productos del carrito' });
    }
});


// Agrego un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);

        // Validar si el producto existe primero
        const productos = await productsManager.leerProductos();
        const producto = productos.find(p => p.id === productId);

        if (!producto) {
            return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        }

        // Leer el carrito por su ID
        const carritos = await cartManager.getCart();
        const carrito = carritos.find(c => c.id === cartId);

        if (!carrito) {
            return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
        }

        // Verificar si el producto ya está en el carrito
        const productInCart = carrito.products.find(p => p.id === productId);

        if (productInCart) {
            // Si el producto ya existe, incremento la cantidad
            productInCart.quantity += 1;
        } else {
            // Si el producto no existe, lo agrego con la cantidad corecta
            carrito.products.push({ id: productId, quantity: 1 });
        }

        // Actualizar el carrito
        await cartManager.updateCart(carritos);

        res.status(200).send({ status: 'success', message: 'Producto agregado al carrito', cart: carrito });
    } catch (error) {
        console.log(error);
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).send({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
});


export default router;