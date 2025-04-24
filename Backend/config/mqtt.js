const mqtt = require('mqtt');
const db = require('./db');
const fs = require('fs');

const client_mqtt = mqtt.connect('mqtt://3.128.92.91:1883', {
  username: 'denis', // Conexión sin TLS
  password: 'denis346',
  // Conexión con TLS
  host: '3.128.92.91', // IP elástica --> mosquitto en EC2
  port: 8883,
  protocol: 'mqtts',
  rejectUnauthorized: false,
  ca: fs.readFileSync('./certs/ca.crt'),
  cert: fs.readFileSync('./certs/client.crt'),
  key: fs.readFileSync('./certs/client.key'),
});

client_mqtt.on('connect', () => {
  console.log('Conexión al broker MQTT exitosa...');

  // Escuchar mediciones de todos los dispositivos
  client_mqtt.subscribe('riego/+/mediciones', (err) => {
    if (!err) console.log('Suscrito a riego/+/mediciones');
  });
});

client_mqtt.on('message', (topic, message) => {
  const parts = topic.split('/');
  const device_id = parts[1];
  const categoria = parts[2];
  const payload = message.toString();

  if (!device_id) return;

  if (categoria === 'mediciones') {
    let data;
    try {
      data = JSON.parse(payload);
    } catch {
      console.log('JSON inválido');
      return;
    }

    const { temperatura, presion } = data;

    // Validaciones
    if (
      typeof temperatura !== 'number' || temperatura < -10 || temperatura > 50 ||
      typeof presion !== 'number' || presion < 950 || presion > 1050
    ) {
      console.log('Datos fuera de rango:', data);
      return;
    }

    // Insertar en DB
    db.query(
      'INSERT INTO lecturas (device_id, temperatura, presion) VALUES (?, ?, ?)',
      [device_id, temperatura, presion],
      (err) => {
        if (err) return console.error('Error DB (lectura):', err.message);
        console.log(`Lectura guardada para ${device_id}`);
      }
    );
  }
  else {
    console.log("Categoria no reconocida")
  }
});

client_mqtt.on('error', (err) => {
  console.error('Error MQTT:', err.message);
});

module.exports = client_mqtt;