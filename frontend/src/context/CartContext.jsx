import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchCartData = async() => {
    const response = await api.get("/cart");
    return response.data;
}

//Создаем контекст с дефолтным значением
const CartContext = createContext();

//Создаем провайдер для обертки приложения
export const CartProvider = ({ children }) => {
    const queryClient = useQueryClient();
    // Получение данных корзины
    const {data: cartData, isLoading, error} = useQuery({
        queryKey: ["cartData"],
        queryFn: fetchCartData
    });
    // Мутация: добавить в корзину
    const addToCartMutation = useMutation({
        mutationFn: async (item) => {
          const res = await api.post('/api/cart-items/', {
            method: 'POST',
            body: JSON.stringify(item)
          });
          return res.json();
        },
        onSuccess: () => {
          // Обновляем кэш, чтобы UI отобразил актуальные данные
          queryClient.invalidateQueries({ queryKey: ['cartData'] });
        }
    });
    // Мутация: изменить количество товара в корзине
    const updateQuantityMutation = useMutation({
        mutationFn: async(delta, cartItem) => {
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
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartData'] });
        }
    });
    // Мутация: удалить из корзины
    const removeFromCartMutation = useMutation({
        mutationFn: async (itemId) => {
          const res = await fetch(`/api/cart-items/${itemId}/`, { method: 'DELETE' });
          return res.json();
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['cartData'] });
        }
    });
    const value = {
        cartData,
        addToTheCart: addToCartMutation.mutate,
        removeFromCart: removeFromCartMutation.mutate,
        updateQuantity: updateQuantityMutation.mutate,
    };
    return <CartContext.Provider value={value}>
        {children}
    </CartContext.Provider>
}

// Создаем кастомный хук для удобства использования
export const useCart = () => useContext(CartContext);