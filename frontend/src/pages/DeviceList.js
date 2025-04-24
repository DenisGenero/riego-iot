import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DeviceList() {
  const { device_id } = useParams();
  const navigate = useNavigate();
  const [mediciones, setMediciones] = useState([]);

  const cargarMediciones = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/lecturas/${device_id}`);
      setMediciones(res.data);
    } catch (err) {
      console.error('Error al obtener mediciones:', err);
    }
  }, [device_id]);

  useEffect(() => {
    cargarMediciones();
  }, [cargarMediciones]);

  const formatearFecha = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('es-AR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mt-3">
      <h3 className="text-primary">Historial de mediciones – {device_id}</h3>

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={cargarMediciones}>
          Actualizar
        </button>
        <button className="btn btn-secondary me-2" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>

      <ul className="list-group">
        {mediciones.map((m, i) => (
          <li key={i} className="list-group-item">
            {formatearFecha(m.timestamp)} – Temp: {m.temperatura} °C, Presión: {m.presion} hPa
          </li>
        ))}
        {mediciones.length === 0 && <p className="text-muted">Sin registros</p>}
      </ul>
    </div>
  );
}

export default DeviceList;