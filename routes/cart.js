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
        return res.status(404).json({ message: "Product not found!" });
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

router.get("/", authMiddleware, async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.status(404).json({ message: "User cart is empty!" });
    }
    res.json({ cart: cart });
});

// Increase the product quantity
router.patch("/increase/:productId", authMiddleware, async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user._id;

    // Get Product
    const product = await Product.findById(productId).select("stock");
    if (!product) {
        return res.status(404).json({ message: "Product not found!" });
    }

    await crementQuantity(res, productId, userId, "increase", product.stock);
});

// Decrease the product quantity
router.patch("/decrease/:productId", authMiddleware, async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user._id;

    await crementQuantity(res, productId, userId, "decrease");
});

const crementQuantity = async (
    res,
    productId,
    userId,
    option,
    product_stock = undefined
) => {
    // find the current user cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return res.status(404).json({ message: "User cart is empty!" });
    }

    // find the product in the products array
    let productIndex = cart.products.findIndex(
        (product) => product.productId.toString() === productId.toString()
    );

    if (productIndex === -1) {
        return res
            .status(404)
            .json({ message: "Product not found in the cart!" });
    }

    // Define increment quantity
    let value = 0;
    if (option === "increase") {
        // Check if quantity number is at limit(stock)
        if (
            product_stock &&
            cart.products[productIndex].quantity === product_stock
        ) {
            return res.status(400).json({
                message:
                    "Product run out of stock, can't increase product by one!",
            });
        }
        // set increment
        value = 1;
    }
    if (option === "decrease") {
        if (cart.products[productIndex].quantity > 1) {
            // set decrement
            value = -1;
        } else {
            // Update totalProducts & totalCartPrice
            cart.totalProducts -= 1;
            cart.totalCartPrice -= cart.products[productIndex].price;

            // remove complete product object
            cart.products.splice(productIndex, 1);

            // save the updated cart
            await cart.save();

            return res.json({
                message: "Product removed successfully!",
                cart: cart,
            });
        }
    }

    // increase the product quantity
    cart.products[productIndex].quantity += value;

    // update totalProducts & totalCartPrice
    cart.totalProducts += value;

    cart.products[productIndex].totalPrice +=
        cart.products[productIndex].price * value;
    cart.totalCartPrice += cart.products[productIndex].price * value;

    // save the updated cart
    await cart.save();

    res.json({
        message: "product quantity updated successfully!",
        cart: cart,
    });
};
module.exports = router;
