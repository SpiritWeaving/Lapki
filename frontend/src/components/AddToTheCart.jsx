import './AddToTheCart.css'
import api from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useCart} from '../context/CartContext';
import React from 'react'

function AddToTheCart({product, quantity = 1}){
    const {updateQuantity} = useCart();
    function handleClick(){
        // Проверка наличия товара
        if (!product.in_stock) {
            alert("Товара нет в наличии!");
            return;
        }

        alert("Товар добавлен в корзину!");
    }

    return (
        <button className="button button--cart"
        onClick={handleClick} disabled={!product.in_stock}>
            <span className="button--text">
                Добавить в корзину
            </span>
        </button>
    );
}

export default AddToTheCart;