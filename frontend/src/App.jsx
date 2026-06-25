import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import {AuthProvider} from './context/AuthContext.jsx'
import PrivateRoute from './components/PrivateRoute'

import Header from './components/Header'
import Home from './pages/Home'
import Products from './pages/Products'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'
import Login from './components/Login'
import Profile from './pages/Profile'
import ProductCreate from './pages/ProductCreate'
import './App.css'
import './variables.css'
import Footer from './components/Footer.jsx'
import './assets/fonts/fonts.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Создаем клиент
const queryClient = new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
                {/* Шапка видна всегда */}
                <AuthProvider>
                <Header />
                {/*Контент меняется при переходе. Список путей, которые при переходе будут обновляться*/}
                <main style={{padding: '1rem'}}>
                <Routes>
                    <Route path='/' element = {
                        <Home />
                    } />
                    <Route path='/products' element = {
                        <Products />
                    } />
                    <Route path='/products/:id' element = {
                        <ProductDetail />
                    } />
                    <Route path='/products/:id/update' element = {
                        <PrivateRoute>
                            <ProductCreate />
                        </PrivateRoute>
                    } />
                    <Route path='/login' element = {
                        <Login />
                    } />
                    <Route path='/register' element = {
                        <Register />
                    } />
                    <Route path='/profile' element = {
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                    <Route path='/cart' element = {
                        <PrivateRoute>
                            <Cart />
                        </PrivateRoute>
                    } />
                    <Route path='/create_product' element = {
                        <PrivateRoute>
                            <ProductCreate />
                        </PrivateRoute>
                    } />
                </Routes>
                </main>
                <Footer />
                </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
  )
}

export default App
