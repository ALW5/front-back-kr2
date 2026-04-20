import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductsList from './pages/ProductsList';
import ProductForm from './pages/ProductForm';
import UsersList from './pages/UsersList';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/products" />} />
          
          {/* Защищённые маршруты */}
          <Route element={<PrivateRoute />}>
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Только для админа */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<UsersList />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;