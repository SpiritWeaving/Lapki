import './ProductDetail.css'
import {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom';
import AddToTheCart from '../components/AddToTheCart.jsx'
import GridRow from '../components/GridRow.jsx'
import authService from '../services/authService'
import api from '../services/api'
import { useNavigate } from 'react-router-dom';

import deleteIcon from '../assets/svg/delete-icon.svg'
import editIcon from '../assets/svg/edit-icon.svg'

function ProductDetail(){
    const { id: productId } = useParams(); // Извлекаем id из параметров URL
    const [product, setProduct] = useState({});
    const [error, setError] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if(authService.getCurrentUser()){
            setCurrentUser(authService.getCurrentUser());
        }
        fetch(`http://127.0.0.1:8000/api/products/${productId}/`)
        .then(res => {
            return res.json();
        })
        .then(data => {
            setProduct(data);
            setError(false);
        })
        .catch(err => {
            alert("Товар не найден");
            setError(true);
        });
    }, [productId]); //Перезапускать запрос, если изменится id в URL

    // Функция для обработки клика по кнопке "Удалить"
    const handleDelete = () => {
        // Перенаправляем на список товаров
        navigate('/products')
        api.delete(`http://127.0.0.1:8000/api/products/${productId}/`)
        .then(res => {
            if (res.ok) {
                console.log("Товар успешно удален");
            } else {
                console.log("Не удалось удалить товар (нет прав)");
            }
        })
        .catch(err => console.error(err));
    };

    if (error) {
        return <div className="product">Товар не найден или произошла ошибка</div>;
    }
    if (!product) {
        return <div className="product">Загрузка...</div>;
    }
    return (
        <div className="product">
            <section className = "product__section--img product__section">
                <img src={product.thumbnail}
                className="product__img"
                alt="Изображение товара"/>
            </section>
            <section className = "product__section-table product__section"
                style={{paddingTop: "20px"}}>
                    <h3>Информация о товаре:</h3>
                    <GridRow label="В наличии" value={product.in_stock ? "Да" : "Нет"} />
                    <GridRow label="Владелец" value={product.user_name} />
                    <GridRow label="Предназначено для" value={product.animal_title} />
                    <GridRow label="Упаковка" value={product.box_type_name} />
                    <GridRow label="Категория" value={product.category_title} />
                    <GridRow label="Размер животного" value={product.animal_size_name} />
            </section>
            <section className = "product__section--price product__section">
                <h2 className = "product__title">{product.title}</h2>
                <h3 className = "product__price">
                    Цена:
                    <span className="product-card__price--current"
                    style = {!product.in_stock ? {color: '#ad0505', paddingLeft: "8px"} : {paddingLeft: "8px"}}>
                        {product.final_price} Р
                    </span>
                    <span className="product-card__price--old"
                    style={ !product.discount ? {display: "none"} : {}}>
                        {product.price} Р
                    </span>
                </h3>
                <div className="product__date_container">
                    <GridRow label="Дата создания" value={product.created_at} />
                    <GridRow label="Обновлено" value={product.updated_at} />
                </div>
                <div className="product__buttons-controls">
                    <AddToTheCart product={product} />
                    {currentUser.id == product.user &&
                    <button type="button"
                    className="product__button product__button--delete"
                    onClick={() => handleDelete()}
                    >
                        <img src={deleteIcon} className="product__button__icon"/>
                    </button>
                    }
                    {currentUser.id == product.user &&
                    <a href={`/products/${product.id}/update`}
                    className="product__button product__button--delete"
                    >
                        <img src={editIcon} className="product__button__icon"/>
                    </a>
                    }
                </div>
            </section>

            <section className="product__section product__description-section">
                <h2 className="product__description-heading">Описание товара:</h2>
                <p className="product__description-paragraph">
                    {product.description}
                </p>
            </section>
        </div>
    );
}

export default ProductDetail