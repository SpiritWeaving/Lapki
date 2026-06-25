// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'
import './Login.css';
import '../pages/ProductCreate.css'
import cover from '../assets/images/cover.webp';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

const LoginSchema = yup.object().shape({
    username: yup.string().required("Логин обязателен!"),
    password: yup.string().required("Введите пароль!").min(8, "Длина пароля должна быть не меньше 8 символов.")
});

function Login() {
    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: LoginSchema,
        onSubmit: async(values) => {
            console.log(values);
            setError('')
            try {
                await login(values.username, values.password);
                navigate('/profile');
            } catch (err) {
                setError(err.message)
            }
        }
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { login, isAuthenticated } = useAuth()
    // Если уже авторизован, перенаправляем на профиль
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile');
        }
    }, []);

    return (
        <div className="login__form-container">
            <h1 className="content__title" style={{color: "#fff"}}>Вход</h1>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            <form className="login__form" onSubmit={formik.handleSubmit}>
                <img
                    src={cover}
                    alt="Форма входа"
                    className="form__decor"
                />
                <label htmlFor="username" className="form__label">
                <input
                    type="text"
                    placeholder="Имя пользователя или email"
                    id="username"
                    name="username"
                    value={formik.values.username}
                    className="form__input form__input_type_text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loading}
                    required
                    autoComplete="username"
                />
                <p className="form-error">{formik.errors.username}</p>
                </label>

                <label htmlFor="password" className="form__label">
                    <input
                        type="password"
                        placeholder="Пароль"
                        id="password"
                        name="password"
                        value={formik.values.password}
                        className="form__input form__input_type_text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={loading}
                        required
                        autoComplete="current-password"
                    />
                     <p className="form-error">{formik.errors.password}</p>
                </label>
                <button
                    type="submit"
                    className="button login-button"
                    disabled={loading}
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>
                <span>
                    Нет учётной записи?
                    <a href="/register" style={{marginLeft: "8px"}}>
                        Зарегистрироваться
                    </a>
                </span>
            </form>
        </div>
    );
}

export default Login;