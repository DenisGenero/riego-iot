const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'riegoIoT'
};

const device = {
  device_id: 'esp01',
  ubicacion: 'Planta de test'
};

const lecturas = [
  { temperatura: 22.5, presion: 1002 },
  { temperatura: 24.1, presion: 1005 },
  { temperatura: 21.8, presion: 998 }
];

const valvulas = [
  { estado: 'OPEN' },
  { estado: 'CLOSE' }
];

async function seed() {
  const conn = await mysql.createConnection(config);

  try {
    // Insertar dispositivo
    await conn.execute(
      'INSERT IGNORE INTO dispositivo (device_id, ubicacion) VALUES (?, ?)',
      [device.device_id, device.ubicacion]
    );

    // Insertar lecturas
    for (const l of lecturas) {
      await conn.execute(
        'INSERT INTO lecturas (device_id, temperatura, presion) VALUES (?, ?, ?)',
        [device.device_id, l.temperatura, l.presion]
      );
    }

    // Insertar acciones válvula
    for (const v of valvulas) {
      await conn.execute(
        'INSERT INTO valvula (device_id, estado) VALUES (?, ?)',
        [device.device_id, v.estado]
      );
    }

    console.log('Datos de prueba insertados correctamente.');
  } catch (err) {
    console.error('Error al insertar datos:', err.message);
  } finally {
    await conn.end();
  }
}

module.exports = seed;