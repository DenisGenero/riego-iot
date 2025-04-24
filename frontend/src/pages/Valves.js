import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Valvulas() {
  const { device_id } = useParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState(null);
  const [historial, setHistorial] = useState([]);

  const cargarHistorial = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/valvulas/${device_id}`);
      setHistorial(res.data);
      if (res.data.length > 0) {
        setEstado(res.data[0].estado); // 'OPEN' o 'CLOSE'
        console.log(res.data[0].estado);
      }
    } catch (err) {
      console.error('Error al obtener historial:', err);
    }
  }, [device_id]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const toggleValvula = async () => {
    var uno = 0;
    const nuevaAccion = estado === 'OPEN' ? 'CLOSE' : 'OPEN';
    if (estado === nuevaAccion) return;

    try {
      uno ++;
      // Enviar la nueva acción al backend
      await axios.post(`http://localhost:3001/api/valvulas/${device_id}`, { action: nuevaAccion });
      setEstado(nuevaAccion);
      if (estado !== nuevaAccion) {
        await cargarHistorial();
      }
      console.log("contador: ",uno);
    } catch (err) {
      console.error('Error al cambiar válvula:', err);
    }
  };

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
      <h3 className="text-primary">Historial de válvula – {device_id}</h3>

      <div className="mb-3">
        <button
          className={`btn ${estado === 'OPEN' ? 'btn-danger' : 'btn-success'} me-2`}
          onClick={toggleValvula}
        >
          {estado === 'OPEN' ? 'Cerrar válvula' : 'Abrir válvula'}
        </button>

        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>

      <ul className="list-group">
        {historial.map((h, i) => (
          <li key={i} className="list-group-item">
            {formatearFecha(h.timestamp)} – {h.estado === 'OPEN' ? 'Abierta' : 'Cerrada'}
          </li>
        ))}
        {historial.length === 0 && <p className="text-muted">Sin registros</p>}
      </ul>
    </div>
  );
}

export default Valvulas;