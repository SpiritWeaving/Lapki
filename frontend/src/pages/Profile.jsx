// src/components/Profile.jsx
import './Profile.css';
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// GET /auth/profile
const fetchUserProfile = async() => {
    const response = await api.get("/auth/profile");
    return response.data;
}
// PATCH /auth/profile
const updateUserProfile = async(formData) => {
    const response = await api.patch("/auth/profile/", formData);
    return response.data;
}
export default function Profile() {
    const queryClient = useQueryClient();
    // Загружаем данные пользователя
    const {data: userData, isLoading} = useQuery({
        queryKey: ['userData'],
        queryFn: fetchUserProfile,
        // Настройки автоматического обновления:
        refetchInterval: 10000, // Обновлять данные каждые 10 секунд
        refetchIntervalInBackground: false, // Не обновлять, если вкладка свернута (экономит трафик)
        staleTime: 5000, // Данные считаются свежими 5 секунд (в это время фоновые запросы не запускаются)
        retry: 2,
    });
    // Создаем мутацию для отправки изменений
    const { mutate, isPending } = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: (data) => {
            setSuccessMessage('Профиль успешно обновлен!');
            // Инвалидируем кэш, чтобы перезагрузить данные
            queryClient.invalidateQueries({ queryKey: ['userData'] });
            setTimeout(() => setSuccessMessage(''), 3000);
        },
        onError: (err) => {
            console.error('Ошибка сохранения:', err);
            if (err.response?.status === 401) {
                setError('Сессия истекла. Пожалуйста, войдите снова.');
                setTimeout(() => {
                    authService.logout();
                    navigate('/login');
                }, 1500);
            } else if (err.response?.data) {
                const serverErrors = err.response.data;
                const errorMessages = Object.values(serverErrors).flat().join(', ');
                setError(errorMessages || 'Ошибка при сохранении данных');
            } else {
                setError('Не удалось сохранить изменения. Проверьте соединение.');
            }
            setTimeout(() => setError(''), 3000);
        },
    });
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        birth_date: ''
    });
    // State для улучшения UX
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

    const {login, isAuthenticated, user, logout} = useAuth();
    const navigate = useNavigate();
    // Загрузка профиля при старте
    useEffect(() => {
        if(!isAuthenticated){
            navigate("/login", {replace: true});
            return;
        }
        if(userData){
            setFormData({
                username: userData.username || '',
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                birth_date: userData.birth_date || '',
            });
            if(userData.avatar){
                setAvatar(userData.avatar);
            }
        }
    }, [isAuthenticated, userData]);
    // Обработчик submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        mutate(formData);
    };
    // Обработчик события change
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
    //Обработка загрузки аватара
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Валидация файла
        if (file.size > 5 * 1024 * 1024) {
            setError('Размер изображения не должен превышать 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение');
            return;
        }
        // Мгновенный предпросмотр
        setAvatar(URL.createObjectURL(file));
        setError('');
        setSuccessMessage('');
        const formData = new FormData();
        formData.append('avatar', file);
        api.patch('/auth/profile/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(res => {
            setSuccessMessage('Аватар успешно обновлен!');
            queryClient.invalidateQueries({ queryKey: ['userData'] });
            setTimeout(() => setSuccessMessage(''), 3000);
            if (res.data.avatar) {
                setAvatar(res.data.user.avatar);
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        avatar: {avatar}
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }
        })
        .catch(err => {
            setError('Не удалось сохранить аватар');
        });
    };
    // Удаление аватара
    const handleAvatarDelete = async () => {
        try {
            await api.patch('/auth/profile/', {avatar: null});
            setAvatar('');
            queryClient.invalidateQueries({ queryKey: ['userData'] });
            setSuccessMessage('Аватар успешно удален');
            // Обновляем localStorage - удаляем аватар
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    avatar: null
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Не удалось удалить аватар');
        }
    };
    // Обработчик logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    if (isLoading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Загрузка профиля...</p>
            </div>
        );
    }
    return (
        <main className="content">
            <h2 className="content__title">Основная информация</h2>
            {/* Сообщения об ошибках и успехе */}
            {error && (
                <div className="error-message">
                    <strong>Ошибка:</strong> {error}
                </div>
            )}
            {successMessage && (
                <div className="success-message">
                    <strong>Успех!</strong> {successMessage}
                </div>
            )}
            <h3 className="content__title">Аватар</h3>
            <section className="avatar__section">
                <img
                    className="avatar__img"
                    src={avatar}
                    alt="Аватар пользователя"
                />
                <button
                    type="button"
                    className="button button-avatar-new button-avatar"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isPending}
                >
                    Загрузить новый аватар
                </button>
                <button
                    type="button"
                    className="button button-avatar-delete button-avatar"
                    onClick={handleAvatarDelete}
                    disabled={isPending}
                >
                    Удалить аватар
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                    disabled={isPending}
                />
            </section>
            <section className="personal-details">
                <h3 className="content__title">Персональные данные</h3>
                <form className="form form__personal-details"
                    onSubmit={handleSubmit}>
                    <label htmlFor="username" className="label">
                        <span className="form__span">Username</span>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form__input form__input_type_profile"
                            required
                            disabled={isPending}
                            placeholder="username"
                        />
                    </label>
                    <label htmlFor="name" className="label">
                        <span className="form__span">Имя</span>
                        <input
                            type="text"
                            id="name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="form__input form__input_type_profile"
                            disabled={isPending}
                            placeholder="Введите ваше имя"
                        />
                    </label>
                    <label htmlFor="surname" className="label">
                        <span className="form__span">Фамилия</span>
                        <input
                            type="text"
                            id="surname"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="form__input form__input_type_profile"
                            disabled={isPending}
                            placeholder="Введите вашу фамилию"
                        />
                    </label>
                    <label htmlFor="email" className="label">
                        <span className="form__span">Электронная почта</span>
                        <input
                            type="email" id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="me@example.com"
                            className="form__input form__input_type_profile"
                            required disabled={isPending}
                        />
                    </label>
                    <label htmlFor="birthdate" className="label">
                        <span className="form__span">Дата рождения</span>
                        <input
                            type="date" id="birthdate"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            className="form__input form__input_type_profile"
                            disabled={isPending}
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="button form__button"
                    >
                        {isPending ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </form>
                <button className="button form__button"
                    onClick={handleLogout}>
                    Выйти
                </button>
            </section>
        </main>
    );
}