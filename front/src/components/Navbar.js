import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Мебель Shop</Link>
      </div>
      
      <div className="nav-links">
        {accessToken ? (
          <>
            <Link to="/products">Товары</Link>
            
            {userRole === 'admin' && (
              <Link to="/users">Пользователи</Link>
            )}
            
            <Link to="/profile">Профиль</Link>
            <button onClick={handleLogout} className="nav-btn">
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;