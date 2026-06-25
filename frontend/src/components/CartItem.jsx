import './CartItem.css'
import React, { useState, useEffect } from 'react';
import api from '../services/api'
import deleteIcon from '../assets/svg/delete-icon-black.svg'

function CartItem({cartItem}){
    const[error, setError] = useState('');
    const updateQuantity = async(delta) => {
        const newQuantity = cartItem.quantity + delta;
        if(newQuantity <= 0){
             api.delete(`/cart-items/${cartItem.id}/`)
             .then(response => {
                console.log(response);
                return response.data;
             })
            .catch(err => {
                console.log(err)
            })
            return;
        }
        api.patch(`/cart-items/${cartItem.id}/`,
            { quantity: newQuantity })
        .then(response => {
            return response.data;
        })
        .then(data => {
            return data
        })
        .catch(err => {
            console.log(err)
        })
    }
    return (
        <div className="cart_item">
            <img src={cartItem.product_detail.thumbnail}
            alt="Изображение товара"
            className="cart_item__img"/>

            <div className="cart_item__content">
                <div className="cart_item__title_container">
                    <p className="cart_item__title">
                        {cartItem.product_detail.title}
                    </p>
                    <p className="cart_item__description">
                        {cartItem.product_detail.description}
                    </p>
                </div>
                <div className="cart_item__buttons">
                    <div className="cart_item__quantity_container">
                        <span className="cart_item__quantity">{cartItem.quantity}</span>
                        <div className="cart_item__buttons_container">
                            <button className="cart_item__button
                            cart_item-button" onClick={() => updateQuantity(1)}>
                               &#9650;
                            </button>
                            <button className="cart_item__button
                            cart_item-button"
                            onClick={() => updateQuantity(-1)}>
                            &#9660;
                            </button>
                        </div>
                    </div>
                    <span className="cart_item__price">
                        {cartItem.total_price} Р
                    </span>
                    <button className="cart_item__button">
                        <img src={deleteIcon}
                        className="cart_item__button__icon" style={{color: "#000"}}/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartItem