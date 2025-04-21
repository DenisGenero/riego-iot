const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://3.128.92.91:1883', {
  username: 'denis',
  password: 'denis346'
});

// Simular medición
client.publish(
  'riego/mediciones/esp01',
  JSON.stringify({ temperatura: 23.2, presion: 1001 })
);

// Simular acción de válvula
client.publish('riego/valvula/esp01', 'OPEN');