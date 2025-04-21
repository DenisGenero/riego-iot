# 🌱 Sistema de Riego Inteligente con MQTT + React + Node.js

Este proyecto forma parte de la Maestría en Internet de las Cosas del Laboratorio de Sistemas Embebidos de la Facultad de Ingeniería - UBA. Fue desarrollado por Denis J. Genero 💻✨.

---

## 📦 Requisitos para correr el proyecto

Antes de arrancar, asegurate de tener instaladas las siguientes herramientas en tu máquina:

- Node.js ✅
- XAMPP (para correr el servidor MySQL local) 🐬

---

## ⚙️ Cómo configurarlo (muy fácil)

1. Cloná este repositorio:

   git clone https://github.com/TU_USUARIO/riego-web.git
   cd riego-web

2. Ejecutá el script de instalación:

   npm run setup

   Esto va a:
   - Instalar las dependencias del backend
   - Instalar las dependencias del frontend (React)

3. Luego simplemente:

   npm start

   La aplicación va a arrancar y el frontend va a estar disponible en http://localhost:3000 🚀

---

## ☁️ Broker MQTT usado

El sistema se comunica con un broker MQTT usando el protocolo mqtt:// sin TLS (puerto 1883).  
Se utilizó un Mosquitto instalado en una instancia EC2 de AWS, con una IP pública (asociada mediante una IP elástica).

Podés adaptarlo fácilmente si tenés otro broker.

---

## 💻 ¿Qué hace el frontend?

Desarrollado en React, tiene una interfaz simple y práctica. Desde la página principal vas a poder:

- Ver un listado de dispositivos conectados
- Ingresar a cada uno para ver las mediciones recibidas por MQTT
- Controlar el estado de una válvula (ON/OFF)

Cada acción sobre la válvula o nuevo dispositivo impacta directamente sobre la base de datos.

---

## 🔙 ¿Y el backend?

Hecho en Node.js, se encarga de conectar con el broker MQTT y con la base de datos MySQL.  
Además, expone varios endpoints RESTful para que el frontend funcione correctamente.

### 📋 Endpoints disponibles

Método | Ruta                     | Funcionalidad
-------|--------------------------|-------------------------------
GET    | /devices                 | Lista todos los dispositivos registrados
POST   | /devices                 | Agrega un nuevo dispositivo
DELETE | /devices/:device_id      | Elimina un dispositivo y su historial
GET    | /mediciones/:device_id   | Obtiene todas las mediciones del dispositivo
POST   | /valvula/:device_id      | Cambia el estado de la válvula (ON/OFF)

---

## 👨‍💻 Autor

Denis J. Genero  
Realizado en el marco de la Maestría en Internet de las Cosas  
Laboratorio de Sistemas Embebidos - FIUBA

---

¡Gracias por pasar! ✨  
Si tenés alguna duda o sugerencia, ¡bienvenida sea!