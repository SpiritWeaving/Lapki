import './Register.css'
import './ProductCreate.css'
import React, { useState } from 'react';
import authService from '../services/authService';
import { useFormik } from 'formik';
import * as yup from 'yup';

const RegisterSchema = yup.object().shape({
    username: yup.string().required("Имя пользователя обязательно!")
    .matches(/^[A-Za-zА-Яа-яЁё\s\-]+$/,
        'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы'),
    email: yup.string().email("Ошибка в формате email").required("Отсутствует адрес электронной почты!"),
    password: yup.string().required("Введите пароль!")
    .min(8, "Длина пароля должна быть не меньше 8 символов."),
    password2: yup.string().required("Введите пароль!")
    .min(8, "Длина пароля должна быть не меньше 8 символов.")
});

export default function Register() {
  const formik = useFormik({
      initialValues:
      { username: '',
          email: '',
          password: '',
          password2: ''
      },
      validationSchema: RegisterSchema,
        onSubmit: async(values) => {
            console.log(values);
            setError('')
//             try {
//                 await login(values.username, values.password);
//                 navigate('/profile');
//             } catch (err) {
//                 setError(err.message)
//             }
            if (values.password !== values.password2) {
                setError('Пароли не совпадают');
                return;
            }
        }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      await authService.register(formData.username, formData.email, formData.password, formData.password2);
      alert('Регистрация успешна! Теперь войдите.');
      window.location.href = '/login';
    } catch (err) {
      setError('Ошибка при регистрации');
    }
  };

  return (
      <form className="form form--register">
          {error && (
              <div className="error-message">
                  {error.message}
              </div>
          )}

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
  );
}

