import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      setFormData({
        title: data.title,
        category: data.category,
        description: data.description,
        price: data.price
      });
    } catch (err) {
      setError('Товар не найден');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/api/products/${id}`, formData);
      } else {
        await api.post('/api/products', formData);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form">
      <h2>{isEdit ? 'Редактировать товар' : 'Новый товар'}</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Категория"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Описание"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Цена"
          value={formData.price}
          onChange={handleChange}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button type="button" onClick={() => navigate('/products')}>
          Отмена
        </button>
      </form>
    </div>
  );
}

export default ProductForm;