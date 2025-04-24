# 🌱 Sistema de Riego Inteligente con MQTT + React + Node.js

Este proyecto forma parte de la Maestría en Internet de las Cosas del **Laboratorio de Sistemas Embebidos** de la **Facultad de Ingeniería - UBA**. Fue desarrollado por **Denis J. Genero** 💻✨.

## 📦 Requisitos para correr el proyecto

Antes de arrancar, asegurate de tener instaladas las siguientes herramientas en tu máquina:

- **Node.js** ✅  
- **XAMPP** (para correr el servidor MySQL local) 🐬  

## ⚙️ Cómo configurarlo (muy fácil)

1. Cloná este repositorio:

   git clone https://github.com/DenisGenero/riego-iot.git
   cd riego-web

2. Ejecutá el script de instalación:

   npm run setup

   Esto va a:
   - Instalar las dependencias del backend
   - Crear la base de datos e insertar unos datos de prueba
   - Instalar las dependencias del frontend (React)

3. Luego simplemente corré:

   npm start

   La aplicación va a arrancar y el frontend va a estar disponible en http://localhost:3000 🚀

## ☁️ Broker MQTT usado

El sistema se comunica con un broker MQTT,  usando el protocolo mqtts:// **con TLS** (puerto 8883).  
Se utilizó **Mosquitto**, instalado en una instancia EC2 de AWS, con una IP pública fija asociada mediante una IP elástica.

Podés adaptarlo fácilmente si tenés otro broker o configuración personalizada.

## 🔌 Firmware del ESP32

Se desarrollaron **dos firmwares** para el ESP32, ambos basados en los ejemplos provistos por la cátedra **DAIoT**:

1. **Firmware sin TLS (firmware_no_tls):**  
   Realiza la conexión al broker Mosquitto por el puerto **1883**, sin uso de certificados. Utilizado para pruebas iniciales.

2. **Firmware con TLS firmware_tls:**  
   Establece una conexión segura mediante **certificados TLS** (puerto 8883). Los certificados se generaron usando el script `crea_certs.sh`. Este firmware implementa **autenticación mutua**, asegurando la integridad y confidencialidad de las comunicaciones.

Ambos firmwares permiten:
- Publicar simulaciones de mediciones del sensor BMP280 al topic MQTT correspondiente.
- Escuchar comandos para la válvula desde un topic específico y controlar un LED simulando su apertura/cierre.

## 💻 ¿Qué hace el frontend?

Desarrollado en **React**, el frontend ofrece una interfaz simple y práctica. Desde la página principal vas a poder:

- Ver un listado de dispositivos conectados
- Ingresar a cada uno para ver el historial de mediciones recibidas por MQTT
- Controlar el estado de una válvula (OPEN/CLOSE)

Cada acción (nuevo dispositivo, cambio de estado) impacta directamente sobre la base de datos.

## 🔙 ¿Y el backend?

Hecho en **Node.js**, el backend se encarga de:

- Conectar con el broker MQTT
- Manejar la base de datos MySQL
- Exponer una API RESTful para que el frontend funcione correctamente

## 📋 Endpoints disponibles

| Método | Ruta                    | Funcionalidad                                |
|--------|-------------------------|----------------------------------------------|
| GET    | /devices                | Lista todos los dispositivos registrados     |
| POST   | /devices                | Agrega un nuevo dispositivo                  |
| DELETE | /devices/:device_id     | Elimina un dispositivo y su historial        |
| GET    | /mediciones/:device_id  | Obtiene todas las mediciones del dispositivo |
| POST   | /valvula/:device_id     | Cambia el estado de la válvula (ON/OFF)      |

## 👨‍💻 Autor

**Denis J. Genero**  
Realizado en el marco de la **Maestría en Internet de las Cosas**  
**Laboratorio de Sistemas Embebidos - FIUBA**

---

¡Gracias por pasar! ✨  
Si tenés alguna duda o sugerencia, ¡bienvenida sea!