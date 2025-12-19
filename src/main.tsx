// src/main.tsx (CORRECTE CODE)

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import App from './App.tsx';
import PropertyDetail from './components/PropertyDetail.tsx'; // Detailpagina component

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* De BrowserRouter wikkelt de hele applicatie in */}
    <BrowserRouter>
        <Routes>
            {/* Route 1: De hoofdpagina (Dashboard) */}
            <Route path="/" element={<App />} />
            {/* Route 2: De Detailpagina (met dynamische ID) */}
            <Route path="/property/:id" element={<PropertyDetail />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>,
);