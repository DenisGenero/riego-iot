const express = require('express');
const router = express.Router();
const db = require('../config/db');
const client_mqtt = require('../config/mqtt');

// Validador dispositivo
const isValidDevice = async (device_id) => {
  const [rows] = await db.promise().query('SELECT * FROM dispositivo WHERE device_id = ?', [device_id]);
  return rows.length > 0;
};

// POST /api/dispositivos
router.post('/dispositivos', async (req, res) => {
  const { device_id, ubicacion } = req.body;
  if (!device_id || !ubicacion) return res.status(400).json({ error: 'Faltan datos' });

  try {
    await db.promise().query('INSERT INTO dispositivo (device_id, ubicacion) VALUES (?, ?)', [device_id, ubicacion]);
    res.status(201).json({ message: 'Dispositivo registrado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar dispositivo', details: err.message });
  }
});

// GET /api/dispositivos
router.get('/dispositivos', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM dispositivo');
  res.json(rows);
});


// Eliminar dispositivo y sus historiales
router.delete('/dispositivos/:device_id', async (req, res) => {
  const { device_id } = req.params;

  console.log('Eliminando dispositivo con device_id:', device_id);

  // Eliminación secuencial --> primero lecturas
  try {
    await db.promise().query('DELETE FROM lecturas WHERE device_id = ?', [device_id]);
    console.log('Lecturas eliminadas para el dispositivo', device_id);
  } catch (err) {
    console.error('Error al eliminar lecturas:', err);
    return res.status(500).json({ error: 'Error al eliminar lecturas', details: err.message });
  }

  // Luego los registros de la válvula
  try {
    await db.promise().query('DELETE FROM valvula WHERE device_id = ?', [device_id]);
    console.log('Válvulas eliminadas para el dispositivo', device_id);
  } catch (err) {
    console.error('Error al eliminar válvulas:', err);
    return res.status(500).json({ error: 'Error al eliminar válvulas', details: err.message });
  }

  // Finalmente el dispositivo
  try {
    await db.promise().query('DELETE FROM dispositivo WHERE device_id = ?', [device_id]);
    console.log('Dispositivo eliminado:', device_id);
    res.json({ message: 'Dispositivo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar el dispositivo:', err);
    return res.status(500).json({ error: 'Error al eliminar el dispositivo', details: err.message });
  }
});

// GET /api/lecturas/:device_id
router.get('/lecturas/:device_id', async (req, res) => {
  const { device_id } = req.params;
  if (!(await isValidDevice(device_id))) return res.status(404).json({ error: 'Dispositivo no encontrado' });

  const [rows] = await db.promise().query('SELECT * FROM lecturas WHERE device_id = ? ORDER BY timestamp DESC', [device_id]);
  res.json(rows);
});

// GET /api/valvulas/:device_id
router.get('/valvulas/:device_id', async (req, res) => {
  const { device_id } = req.params;
  if (!(await isValidDevice(device_id))) return res.status(404).json({ error: 'Dispositivo no encontrado' });

  const [rows] = await db.promise().query('SELECT * FROM valvula WHERE device_id = ? ORDER BY timestamp DESC', [device_id]);
  res.json(rows);
});

// POST /api/valvulas/:device_id
router.post('/valvulas/:device_id', (req, res) => {
  const device_id = req.params.device_id;
  const estado = req.body.action;

  if (estado !== 'OPEN' && estado !== 'CLOSE') {
    return res.status(400).json({ error: 'Acción inválida. Debe ser OPEN o CLOSE.' });
  }

  // Validar que el dispositivo existe
  db.query('SELECT * FROM dispositivo WHERE device_id = ?', [device_id], (err, results) => {
    if (err) {
      console.error('Error al buscar dispositivo:', err);
      return res.status(500).json({ error: 'Error al verificar el dispositivo' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // Publicar en MQTT
    try {
      client_mqtt.publish(`riego/${device_id}/valvula`, estado);
    } catch (mqttErr) {
      console.error('Error publicando en MQTT:', mqttErr);
      return res.status(500).json({ error: 'Error al publicar en MQTT' });
    }

    // Guardar en DB
    db.query(
      'INSERT INTO valvula (device_id, estado) VALUES (?, ?)',
      [device_id, estado],
      (err2) => {
        if (err2) {
          console.error('Error al guardar en DB:', err2);
          return res.status(500).json({ error: 'Error al guardar acción' });
        }

        res.json({ success: true, message: `Válvula de ${device_id} → ${estado}` });
      }
    );
  });
});

module.exports = router;