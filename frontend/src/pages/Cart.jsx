import React, { useState, useEffect } from 'react';
import './Cart.css';
import CartItem from '../components/CartItem.jsx';
import api from '../services/api';
import {useAuth} from '../context/AuthContext';

function Cart() {
    const [cart, setCart] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchData = async() => {
            api.get('/cart/')
            .then(response => {
                return response.data
            })
            .then(cartData => {
                setCartItems(cartData.items)
                setCart(cartData);
            })
            .catch(err => {
                console.log(err);
            })
        };
        fetchData();
    }, []);

    return (
        <div className="cart_container">
            <h2 className="cart_container__link">
                <a href="/products">
                    &#10094; Продолжить покупки
                </a>
            </h2>
            <h2 className="cart_container__title">Корзина</h2>
            <p>В корзине {cart.total_quantity} товаров</p>
            {cartItems.length == 0 &&
                <div className="cart_container__content">
                    <h3>В корзине пока пусто</h3>
                    <a href="/products">Перейти в каталог</a>
                </div>
            }
            {cartItems.length > 0 &&
            <div className="cart_container__content">
                <ul className="cart_items__list">
                    { cartItems.map(cartItem => {
                        return <li className="cart_items__list-item">
                            <CartItem key={cartItem.id} cartItem={cartItem}/>
                            </li>
                    })}
                </ul>
                <div className="cart-container__summary">
                    <h2>К оплате: {cart.total_price}Р</h2>
                    <button className="cart-container__button" type="button">
                        Заказать
                    </button>
                </div>
            </div>
            }
        </div>
    );
}

export default Cart;