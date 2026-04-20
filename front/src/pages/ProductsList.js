import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/products');
      setProducts(data);
    } catch (err) {
      setError('Не удалось загрузить товары');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Ошибка удаления товара');
    }
  };

  if (loading) return <div className="loading">Загрузка товаров...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>🛋️ Мебель Shop</h1>
        {(userRole === 'seller' || userRole === 'admin') && (
          <button onClick={() => navigate('/products/new')} className="btn-add">
            + Добавить товар
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="no-products">Товаров пока нет</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              {/* Фото товара */}
              {product.imageUrl && (
                <div className="product-image-wrapper">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Нет+фото';
                    }}
                  />
                </div>
              )}
              
              {/* Информация о товаре */}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <span className="product-category">{product.category}</span>
                
                <p className="product-description">{product.description}</p>
                
                <div className="product-details">
                  {product.material && (
                    <div className="detail-item">
                      <span className="detail-label">📦 Материал:</span>
                      <span className="detail-value">{product.material}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="detail-item">
                      <span className="detail-label">📏 Размеры:</span>
                      <span className="detail-value">{product.dimensions}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="detail-item">
                      <span className="detail-label">🎨 Цвет:</span>
                      <span className="detail-value">{product.color}</span>
                    </div>
                  )}
                  {product.stock !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">📊 В наличии:</span>
                      <span className={`detail-value stock-${product.stock > 0 ? 'yes' : 'no'}`}>
                        {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="product-price">
                  {product.price.toLocaleString()} ₽
                </div>
                
                <div className="product-actions">
                  <button onClick={() => navigate(`/products/${product.id}/edit`)}>
                    ✏️ Редактировать
                  </button>
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => deleteProduct(product.id)} 
                      className="btn-delete"
                    >
                      🗑️ Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsList;