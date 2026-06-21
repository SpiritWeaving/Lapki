import './ProductCreate.css';
import React, { useState, useEffect, useRef } from 'react';
import CheckBoxCustom from '../components/CheckBoxCustom.jsx';
import api from '../services/api';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as yup from 'yup';

const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg',
    'image/png', 'image/webp', 'image/avif', 'image/gif'];
const FILE_SIZE = 5 * 1024 * 1024; // 5 МБ

// Создаем схему валидации с помощью Yup
const productCreateSchema = yup.object().shape({
    title: yup.string()
    .min(2, "Название товара должно содержать как минимум 2 символа.")
    .max(150, "Название товара не может быть больше 150 символов.")
    .required("Название товара обязательно!")
    .matches(/^[A-Za-zА-Яа-яЁё\s\-]+$/, 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы'),
    description: yup.string().required("Описание товара обязательно!"),
    price: yup.number("Цена должна быть числом!")
    .positive("Цена не может быть отрицательной!"),
    discount: yup.number("Скидка должна быть числом!")
    .min(0, "Скидка не может быть отрицательной!")
    .max(100, "Скидка не может быть больше 100 %!")
    .notRequired(),
    in_stock: yup.boolean().notRequired(),
    thumbnail: yup.mixed()
    .required("Изображение обязательно для загрузки!")
    .test(
        'fileSize',
        'Размер файла превышает 5 МБ!',
        (value) => !value || value.size <= FILE_SIZE
    )
    .test(
        'fileFormat',
        'Неподдерживаемый формат изображения',
        (value) => !value || SUPPORTED_FORMATS.includes(value.type)
    ),
    category: yup.string().required("Категория обязательна!"),
    box_type: yup.string().required("Выберите тип упаковки!"),
    animal: yup.string().required("Выберите вид животного!"),
    animal_size: yup.string().required("Выберите размер животного!")
});

const fetchProductData = async(id) => {
    const response = axios.get(`http://127.0.0.1:8000/api/products/${id}`);
    if (response.ok){
        return response.data;
    }
}

export default function ProductCreate() {
    // Определяем есть ли параметр id в маршруте
    const { id } = useParams(); // Извлекаем id из URL
    if (id){

    }
    const [message, setMessage] = useState('');
    // Инициализируем Formik
    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            price: 0,
            discount: 0,
            in_stock: true,
            thumbnail: null,
            category: '',
            animal: '',
            animal_size: '',
            box_type: '',
        },
        validationSchema: productCreateSchema, // Подключаем схему Yup
        onSubmit: async(values) => {
            const response = await api.post("products/", values,{
                 headers: {
                     'Content-Type': 'multipart/form-data',
                 }
            });
            if(response.status >= 200 && response.status < 300){
                setMessage("Товар был успешно создан!");
                //navigate("/dashboard");
            }
        }
    });

    // Загружаем опции для select
    const {isLoading, data, error} = useQuery({
        queryKey: ["createFormOptions"],
        queryFn: async () => {
            const baseURL = 'http://localhost:8000/api';
            const [categories, animals,
                animal_size_options, box_type_options] = await Promise.all([
                    axios.get(`${baseURL}/categories`),
                    axios.get(`${baseURL}/animals`),
                    axios.get(`${baseURL}/animal_size_options`),
                    axios.get(`${baseURL}/box_type_options`),
                ]);
            return {
                categories: categories.data.results,
                animals: animals.data.results,
                animal_size_options: animal_size_options.data,
                box_type_options: box_type_options.data
            };
        }
    });
    /* Загрузка изображения */
    const handleImageChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
        //Обновляем значение поля 'thumbnail' в Formik
            formik.setFieldValue('thumbnail', file);
            formik.setFieldTouched('thumbnail', true);
        }
    }
    if (isLoading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Загрузка данных формы...</p>
            </div>
        );
    }
    return (
        <form className="product__create__form" noValidate
        onSubmit={formik.handleSubmit}>
            <h2 className="content__title"
            style={{textTransform: "uppercase"}}>
                {id ? "Редактирование товара" : "Создание товара"}
            </h2>
            {/* Поле Наименование */}
            <label htmlFor="title" className="form__label">
                <input
                    type="text"
                    id="title"
                    name="title"
                    onChange={formik.handleChange}
                    value={formik.values.title}
                    className="form__input form__input_type_text"
                    required
                    placeholder="Наименование"
                    minLength="2" maxLength="30" noValidate
                />
                <p className="form-error">{formik.errors.title}</p>
            </label>
            {/* Поле Описание */}
            <label htmlFor="description" className="form__label">
                <textarea
                    id="description"
                    name="description"
                    onChange={formik.handleChange}
                    value={formik.values.description}
                    className="form__textarea"
                    required
                    placeholder="Описание товара"
                    cols="50"
                    rows="5"
                    noValidate
                />
                <p className="form-error">{formik.errors.description}</p>
            </label>
            {/* Поле Цена */}
            <label htmlFor="price" className="form__label">
                <input
                    type="number"
                    id="price"
                    name="price"
                    onChange={formik.handleChange}
                    value={formik.values.price}
                    placeholder="Цена"
                    className="form__input form__input_type_number"
                    required min="0" step="0.01"
                    noValidate
                />
                <p className="form-error">{formik.errors.price}</p>
            </label>
            {/* Поле Скидка */}
            <label htmlFor="discount" className="form__label">
                <input
                    type="number"
                    id="discount"
                    name="discount"
                    onChange={formik.handleChange}
                    placeholder="Скидка (%)"
                    value={formik.values.discount}
                    className="form__input form__input_type_number"
                    min="0" max="100"
                    noValidate
                />
                <p className="form-error">{formik.errors.discount}</p>
            </label>
            {/* Чекбокс "В наличии" */}
            <div style={{ width: "100%" }}>
                <CheckBoxCustom
                    label="В наличии"
                    checked={formik.values.in_stock}
                    name="in_stock"
                    id="in_stock"
                    onChange={formik.handleChange}
                />
            </div>
            {/* Блок загрузки изображения */}
            <label className="form__label">
                <input
                    type="file"
                    name="thumbnail"
                    id="thumbnail"
                    onChange={handleImageChange}
                    onBlur={formik.onBlur}
                    className="form__input form__input_type-file"
                />
                <p className="form-error">{formik.errors.thumbnail}</p>
            </label>

            {/* Поля с выпадающими списками */}
            <fieldset className="product__create__form-fieldset">
                {/* Размер животного */}
                <div className="select-container">
                    <label htmlFor="animal_size">Выберите размер животного:</label>
                    <select
                        name="animal_size"
                        id="animal_size"
                        className="product__create__form-select"
                        onChange={formik.handleChange}
                        value={formik.values.animal_size}
                        required
                    >
                        <option value="">Выберите размер</option>
                        {data.animal_size_options.map((item, index) => (
                            <option key={index} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                    <p className="form-error">{formik.errors.animal_size}</p>
                </div>

                {/* Тип коробки */}
                <div className="select-container">
                    <label htmlFor="box_type">Выберите тип коробки:</label>
                    <select
                        name="box_type"
                        id="box_type"
                        className="product__create__form-select"
                        onChange={formik.handleChange}
                        value={formik.values.box_type}
                        required
                    >
                        <option value="">Выберите тип</option>
                        {data.box_type_options.map((item, index) => (
                            <option key={index} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                    <p className="form-error">{formik.errors.box_type}</p>
                </div>

                {/* Для какого животного */}
                <div className="select-container">
                    <label htmlFor="animal">Предназначено для:</label>
                    <select
                        name="animal"
                        id="animal"
                        className="product__create__form-select"
                        onChange={formik.handleChange}
                        value={formik.values.animal}
                        required
                    >
                        <option value="">Выберите вид</option>
                        {data.animals.map((item, index) => (
                            <option key={index} value={item.id}>{item.title}</option>
                        ))}
                    </select>
                    <p className="form-error">{formik.errors.animal}</p>
                </div>

                {/* Категория */}
                <div className="select-container">
                    <label htmlFor="category">Категория:</label>
                    <select
                        name="category"
                        id="category"
                        className="product__create__form-select"
                        onChange={formik.handleChange}
                        value={formik.values.category}
                        required
                    >
                        <option value="">Выберите категорию</option>
                        {data.categories.map((item, index) => (
                            <option key={index} value={item.id}>{item.title}</option>
                        ))}
                    </select>
                    <p className="form-error">{formik.errors.category}</p>
                </div>
            </fieldset>

            {/* Кнопка отправки */}
            <button
                type="submit"
                className="button form__button"
            >
                Сохранить
            </button>
        </form>
    );
}