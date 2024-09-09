import express from 'express';
import productsRouter from './routes/products.router.js';
import cartRouter from './routes/cart.router.js';

//configuro servidor y puerto de escuha
const app = express();
const port = 8080;

//Pongo a escuhar al puerto configurado
app.listen(port, () => console.log(`Listent port ${port}`));

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Rutas de la app
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
