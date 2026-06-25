import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Создаем контекст с дефолтным значением
const AuthContext = createContext();

// Кастомный хук для использования аутентификации
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

// Создаём Provider — компонент, который будет предоставлять данные
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем сохраненного пользователя при загрузке
        const currentUser = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();
        if (currentUser && isAuthenticated) {
            setUser(currentUser);
        }
        else{
            try{
                authService.refreshToken();
            }
            catch(err){
                console.log(err);
            }
        }
        setLoading(false);
    }, []);

    const register = async (username, email, password, password2) => {
        try {
            await authService.register(username, email, password, password2);
            // После регистрации выполняем вход
            return await login(username, password);
        } catch (error) {
            throw error;
        }
    };
    const login = async (username, password) => {
        try {
            // Сначала получаем JWT токены
            // await authService.getTokens(username, password);
            // Затем получаем данные пользователя
            const response = await axios.post(`${API_URL}/auth/login/`, { username,
                password });
            // Сохраняем токены (они уже в ответе!)
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: 'Ошибка входа' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Ошибка входа'
            };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user && authService.isAuthenticated()
    };

    /* Компонент, который оборачивает дочерние компоненты. Он принимает
    обязательное свойство value (данные или методы, которые нужно сделать глобальными)
    и передает их всем компонентам внутри. */
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
        );
};