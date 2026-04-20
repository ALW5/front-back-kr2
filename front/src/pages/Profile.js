import React, { useState, useEffect } from 'react';
import api from '../api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <div>Не удалось загрузить профиль</div>;

  return (
    <div className="profile">
      <h2>Мой профиль</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Имя:</strong> {user.first_name}</p>
      <p><strong>Фамилия:</strong> {user.last_name}</p>
      <p><strong>Роль:</strong> {user.role}</p>
      <p><strong>Статус:</strong> {user.isBlocked ? 'Заблокирован' : 'Активен'}</p>
      
      <button onClick={handleLogout} className="btn-logout">
        Выйти
      </button>
    </div>
  );
}

export default Profile;