import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [dispositivos, setDispositivos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/api/dispositivos')
      .then(res => setDispositivos(res.data))
      .catch(err => console.error('Error al obtener dispositivos:', err));
  }, []);

  const eliminarDispositivo = (id) => {
    if (!window.confirm('¿Eliminar este dispositivo y su historial?')) return;
  
    axios.delete(`http://localhost:3001/api/dispositivos/${id}`)
      .then(() => {
        // Eliminar el dispositivo de la lista
        setDispositivos(prev => prev.filter(d => d.device_id !== id));
      })
      .catch(err => console.error('Error al eliminar:', err));
  };

  const agregarDispositivo = () => {
    const ubicacion = prompt('Ingrese la ubicación del nuevo dispositivo:');
    if (!ubicacion) return;

    const nextId = dispositivos.length + 1;
    const device_id = `esp${nextId.toString().padStart(2, '0')}`;

    axios.post('http://localhost:3001/api/dispositivos', { device_id, ubicacion })
      .then(res => setDispositivos([...dispositivos, res.data]))
      .then(() => {window.location.reload();})
      .catch(err => console.error('Error al agregar:', err));
  };

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">Dispositivos</h3>
        <button className="btn btn-success" onClick={agregarDispositivo}>
          + Agregar
        </button>
      </div>

      <div className="row">
        {dispositivos.map(d => (
          <div className="col-md-6 mb-3" key={d.device_id}>
            <div className="card border-primary shadow-sm">
              <div className="card-body bg-light">
                <h5 className="card-title text-primary">{d.device_id}</h5>
                <p className="card-text">
                  <strong>Ubicación:</strong> {d.ubicacion}
                </p>
                <button
                  className="btn btn-primary me-2"
                  onClick={() => navigate(`/medidas/${d.device_id}`)}
                >
                  Ver medidas
                </button>
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => navigate(`/valvulas/${d.device_id}`)}
                >
                  Válvula
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => eliminarDispositivo(d.device_id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {dispositivos.length === 0 && (
          <p className="text-muted">No hay dispositivos cargados aún.</p>
        )}
      </div>
    </div>
  );
}

export default Home;