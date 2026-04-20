import React, { useState, useEffect } from 'react';
import api from '../api';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      console.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockUser = async (userId, isBlocked) => {
    try {
      await api.put(`/api/users/${userId}`, { isBlocked: !isBlocked });
      fetchUsers();
    } catch (err) {
      alert('Ошибка изменения статуса');
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Ошибка изменения роли');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="users-list">
      <h2>Управление пользователями</h2>
      
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Email</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                >
                  <option value="user">Пользователь</option>
                  <option value="seller">Продавец</option>
                  <option value="admin">Администратор</option>
                </select>
              </td>
              <td>{user.isBlocked ? 'Заблокирован' : 'Активен'}</td>
              <td>
                <button onClick={() => toggleBlockUser(user.id, user.isBlocked)}>
                  {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersList;   