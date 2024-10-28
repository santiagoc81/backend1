import express from 'express';
import handlebars from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import __dirname from './utils.js';
import productsRouter from './routes/products.router.js';
import cartRouter from './routes/cart.router.js';
import viewsRouter from './routes/views.router.js';
import ProductsManager from './manager/productsManager.js';

const app = express();
const port = 8080;
const productsManager = new ProductsManager();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de handlebars
// Configuración de handlebars con opciones de seguridad
app.engine(
    'handlebars',
    handlebars.engine({
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
        }
    })
);
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

// Rutas estáticas
app.use(express.static(__dirname + '/public'));

// Rutas de API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);

// Rutas de vistas
app.use('/', viewsRouter);

// Iniciar el servidor HTTP y WebSocket
const server = app.listen(port, () => console.log(`Listening on port ${port}`));
const io = new SocketIOServer(server);

// Configuración de WebSocket
io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar productos actuales al cliente al conectarse
    const productos = await productsManager.leerProductos();
    socket.emit('productos', productos);

    // Escuchar creación de producto
    socket.on('crearProducto', async (producto) => {
        try {
            await productsManager.crearProducto(producto);
            const productosActualizados = await productsManager.leerProductos();
            io.emit('productos', productosActualizados);
        } catch (error) {
            console.error('Error al crear producto:', error);
        }
    });

    // Escuchar eliminación de producto
    socket.on('eliminarProducto', async (productId) => {
        try {
            let productos = await productsManager.leerProductos();
            productos = productos.filter(p => p.id !== productId);
            await productsManager.actualizarProductos(productos);

            const productosActualizados = await productsManager.leerProductos();
            io.emit('productos', productosActualizados);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });
});


//Configuro mongoose
import mongoose from 'mongoose';

const mongoUri = 'mongodb://localhost:27017/proyectobackendI';

mongoose.connect(mongoUri)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.error('Error de conexión a MongoDB:', err));