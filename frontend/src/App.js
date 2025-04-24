import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DeviceList from './pages/DeviceList';
import Valvulas from './pages/Valves'

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <header className="bg-primary text-white p-3">
          <h2 className="m-0 text-center">Sistema de Riego IoT</h2>
        </header>

        <main className="flex-fill bg-white py-4">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/medidas/:device_id" element={<DeviceList />} />
              <Route path="/valvulas/:device_id" element={<Valvulas />} />
            </Routes>
          </div>
        </main>

        <footer className="bg-primary text-white text-center py-2">
          <small>FIUBA - CEIoT - Denis Genero</small>
        </footer>
      </div>
    </Router>
  );
}

export default App;
