const express = require("express");
const authMiddleware = require("../middleware/auth");
const Product = require("../models/products");
const Cart = require("../models/cart");
const router = express.Router();

router.post("/:productId", authMiddleware, async (req, res) => {
    const { quantity } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    if (!productId || !quantity) {
        return res.status(400).json({ message: "Missing required fields!" });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(400).json({ message: "Missing required fields!" });
    }

    // Check if product is still in stock
    if (product.stock < quantity) {
        return res.status(400).json({ message: "Stock is not enough!" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({
            user: userId,
            products: [],
            totalProducts: 0,
            totalCartPrice: 0,
        });
    }

    // Check if the product is already in the cart
    let existingProductIndex = cart.products.findIndex(
        (product) => product.productId.toString() === productId.toString()
    );

    if (existingProductIndex !== -1) {
        if (
            cart.products[existingProductIndex].quantity + quantity >=
            product.stock
        ) {
            return res.status(400).json({ message: "Stock is not enough!" });
        }
        cart.products[existingProductIndex].quantity += quantity;
    } else {
        cart.products.push({
            productId: productId,
            quantity: quantity,
            title: product.title,
            price: product.price,
            image: product.images[0],
            totalPrice: product.price * quantity,
        });
    }

    cart.totalProducts = cart.products.reduce((total, product) => {
        return total + product.quantity;
    }, 0);

    cart.totalCartPrice = cart.products.reduce((total, product) => {
        return total + product.price * product.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({
        message: "Product added cart successfully",
        cart: cart,
    });
});

module.exports = router;
