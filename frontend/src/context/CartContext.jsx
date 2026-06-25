import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchCartData = async() => {
    const response = await api.get("/cart");
    return response.data;
}

//Создаем контекст с дефолтным значением
const CartContext = createContext();

//Создаем провайдер для обертки приложения
export const CartProvider = ({ children }) => {
    const {cartData, isLoading, error} = useQuery({
        queryKey: ["cartData"],
        queryFn: fetchCartData
    });
    const addToTheCart = () => {
    }
    const value = {
        cartData
    }
    return <CartContext.Provider value={value}>
        {children}
    </CartContext.Provider>
}

// Создаем кастомный хук для удобства использования
export const useCart = () => useContext(CartContext);