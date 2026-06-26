import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard.jsx'
import CheckBoxCustom from '../components/CheckBoxCustom.jsx'
import './Products.css'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function Products(){
    //Создаем стейты для хранения данных из API
    const [products, setProducts] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ordering, setOrdering] = useState('-created_at'); // состояние для сортировки

    // Стейты для выбранных фильтров (массивы значений)
    const [selectedAnimals, setSelectedAnimals] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    //Стейты для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    //Стейты для поиска и процесса загрузки
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    // Делаем запросы к Django при монтировании компонента
    useEffect(() => {
        // Функция для параллельного получения всех данных
        const fetchData = async (page) => {
            try {
                setLoading(true);
                const [animalsRes, categoriesRes, productsRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/animals/'),
                    axios.get('http://127.0.0.1:8000/api/categories'),
                    axios.get(`http://127.0.0.1:8000/api/products?page=${page}`)
                ]);
                // Записываем данные в соответствующие стейты
                setAnimals(animalsRes.data.results || animalsRes.data);
                setCategories(categoriesRes.data.results || categoriesRes.data);
                setProducts(productsRes.data.results || productsRes.data);
                // Вычисляем общее количество страниц (count / PAGE_SIZE)
                setTotalPages(Math.ceil(productsRes.data.count / 8));
            } catch (err) {
                setError("Не удалось загрузить данные с сервера.");
            } finally {
                setLoading(false);
            }
        };
        fetchData(currentPage);
    }, [currentPage]); // Вызов при монтировании компонента и изменении страницы

    // Эффект для динамической отправки фильтров на бэкенд при их изменении
    useEffect(() => {
        // Пропускаем первый рендер, когда данные еще загружаются
        if (loading) return;
        const fetchFilteredProducts = async () => {
            try {
                // Формируем объект с фильтрами для отправки в Django кастомный action
                const filters = {
                    animals: selectedAnimals,
                    categories: selectedCategories
                };
                const response = await fetch(
                    `http://127.0.0.1:8000/api/products/filters/`,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(filters)
                })
                .then(data => {
                    return data.json();
                })
                .catch(error => {
                    console.log(error);
                });
                //setProducts(response.data.results || response.data);
                setProducts(response);
            } catch (err) {
                console.log(err);
            }
        };
        fetchFilteredProducts();
    }, [selectedAnimals, selectedCategories]); // Срабатывает каждый раз при клике на чекбоксы

    // Обработчики переключения чекбоксов
    const handleAnimalChange = (event) => {
        const { value, checked } = event.target;
        setSelectedAnimals(prev =>
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    const handleCategoryChange = (event) => {
        const { value, checked } = event.target;
        setSelectedCategories(prev =>
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    // Обработчики кнопок пагинации
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };
    // Поиск по названию на клиенте
    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()))
    //Обработка выбора значения select
    const handleOrderingChange = (event) => {
        setOrdering(event.target.value);
    }

    // Обработка интерфейса во время загрузки или ошибки
    if (loading) return <div>Идет загрузка...</div>;
    if (error) return <main><h2 style={{textAlign: 'center', color: 'red', marginTop: '50px'}}>{error}</h2></main>;
    return (
        <main>
            <h1 className="content__title" style={{marginTop: 0}}>Наши товары</h1>
            <section className="search-sorting-section">
                <form className="sorting-form">
                    <label htmlFor="ordering">Сортировать по:</label>
                    <select name="ordering" id="ordering" className="sorting-form__select">
                        <option value="">Не сортировать</option>
                        <option value="-created_at">Новинки</option>
                        <option value="price">Дешевле</option>
                        <option value="-price">Дороже</option>
                    </select>
                </form>
                <input type="text" placeholder="Поиск..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{padding: '0.5rem', width:'200px'}} name="search"/>
            </section>
            <section className="filters-section">
                <form className="filters-form" name="animals">
                    <h3 className="filters-form__title">Для кого ищете?</h3>
                    <div className="filters-form__group">
                    {animals.map(animal =>
                        (
                        <CheckBoxCustom key={animal.id} label={animal.title} value={animal.title}
                        id={`animal-${animal.id}`} name="animal" onChange={handleAnimalChange}/>
                        ))}
                    </div>
                </form>
                <form className="filters-form" name="categories">
                    <h3 className="filters-form__title">Категории товаров:</h3>
                    <div className="filters-form__group">
                    {categories.map(category => (
                    <CheckBoxCustom key={category.id} label={category.title} value={category.title}
                        id={`category-${category.id}`} name="category" onChange={handleCategoryChange}/>
                    ))}
                    </div>
                </form>
            </section>
            <section className="products-section">
                <ul className="products-grid">
                {!filteredProducts.length && <h2>По данному запросу товары не найдены.</h2>}
                {filteredProducts.map(product => (<li key={product.id} className="products-grid__item">
                    <ProductCard product={product} />
                </li>
                ))}
                </ul>
                <div className="pagination-block" style={{marginTop: '30px', width: 'fit-content',
                    borderRadius: '15px', display: 'flex', gap: '8px', marginInline: 'auto'}}>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>
                      Назад 🡠
                    </button>
                    <span>Страница {currentPage} из {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                      Вперед 🡢
                    </button>
                </div>
            </section>
        </main>
    )
}

export default Products