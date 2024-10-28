// src/models/cart.model.js
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Referencia al modelo de producto
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            }
        }
    ]
});

// Creamos el modelo basado en el esquema
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
