import './Register.css'
import './ProductCreate.css'
import React, { useState } from 'react';
import authService from '../services/authService';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext'
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';

const RegisterSchema = yup.object().shape({
    username: yup.string().required("Имя пользователя обязательно!")
    .matches(/^[A-Za-zА-Яа-яЁё\s\-]+$/,
        'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы'),
    email: yup.string().email("Ошибка в формате email").required("Отсутствует адрес электронной почты!"),
    password: yup.string().required("Введите пароль!")
    .min(8, "Длина пароля должна быть не меньше 8 символов."),
    password2: yup.string().required("Введите пароль!")
    .min(8, "Длина пароля должна быть не меньше 8 символов.")
    .oneOf([yup.ref('password')], 'Пароли должны совпадать!')
});

export default function Register() {
    //const navigate = useNavigate();
    const { register } = useAuth()
    const formik = useFormik({
      initialValues:
      {
          username: '',
          email: '',
          password: '',
          password2: ''
      },
      validationSchema: RegisterSchema,
        onSubmit: async(values) => {
            console.log(values);
            setError('')
            try {
                await register(values.username, values.email, values.password, values.password2);
                navigate('/profile');
            } catch (err) {
                setError(err.message)
                // ✅ Проверяем конкретные ошибки от сервера
            if (err.response?.data) {
                const errors = err.response.data;

                // Проверяем ошибки для каждого поля
                if (errors.email) {
                    if (Array.isArray(errors.email)) {
                        setError(`Email: ${errors.email.join(', ')}`);
                    } else {
                        setError(`Email: ${errors.email}`);
                    }
                } else if (errors.username) {
                    if (Array.isArray(errors.username)) {
                        setError(`Username: ${errors.username.join(', ')}`);
                    } else {
                        setError(`Username: ${errors.username}`);
                    }
                } else if (errors.password) {
                    if (Array.isArray(errors.password)) {
                        setError(`Password: ${errors.password.join(', ')}`);
                    } else {
                        setError(`Password: ${errors.password}`);
                    }
                } else {
                    // Общая ошибка
                    setError(errors.detail || 'Ошибка при регистрации');
                }
            } else {
                setError(err.message || 'Ошибка при регистрации');
            }
             }
            if (values.password !== values.password2) {
                setError('Пароли не совпадают');
                return;
            }
        }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
      <div className="login__form-container">
          <h1 className="content__title" style={{color: "#fff"}}>Регистрация</h1>
           {error && (
            <div className="error-message">
                {error}
            </div>
            )}
          <form className="form form--register" onSubmit={formik.handleSubmit}>
              <label htmlFor="username" className="form__label">
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    id="username"
                    name="username"
                    value={formik.values.username}
                    className="form__input form__input_type_text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loading}
                    required
                />
                <p className="form-error">{formik.errors.username}</p>
                </label>
                <label htmlFor="email" className="form__label">
                <input
                    type="email"
                    placeholder="Email"
                    id="email"
                    name="email"
                    value={formik.values.email}
                    className="form__input form__input_type_text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loading}
                    required
                />
                <p className="form-error">{formik.errors.email}</p>
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
                    />
                   <p className="form-error">{formik.errors.password}</p>
              </label>
              <h4>Повторите ввод пароля:</h4>
              <label htmlFor="password2" className="form__label">
                <input
                    type="password"
                    placeholder="Пароль"
                    id="password2"
                    name="password2"
                    value={formik.values.password2}
                    className="form__input form__input_type_text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loading}
                    required
                />
                 <p className="form-error">{formik.errors.password2}</p>
              </label>
              <button className="button form__button" type="submit">
                  Отправить
              </button>
          </form>
      </div>
  );
}

