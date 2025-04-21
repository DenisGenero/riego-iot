require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Crear la base de datos
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

connection.query('CREATE DATABASE IF NOT EXISTS riegoiot', (err) => {
    if (err) {
        console.error('Error al crear la base de datos:', err.message);
        connection.end();
        return;
    }
    console.log("Base de datos creada correctamente...");
    connection.end();

    // Crear las tablas después de crear la DB
    const fullConn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    const scriptPath = path.join(__dirname, '../db/schema.sql');
    const script = fs.readFileSync(scriptPath, 'utf8');

    fullConn.query(script, async (err2) => {
        if (err2) {
            console.error('Error al crear tablas:', err2.message);
            fullConn.end();
            process.exit(1);
        } else {
            console.log('Tablas creadas correctamente');
            fullConn.end();

            // Ejecutar el script para insertar datos (comentar si se quiere db vacía)
            try {
                const seed = require('../db/seeds.js');
                await seed();
                process.exit(0);
            } catch (err3) {
                console.error('Error al ejecutar seeds:', err3.message);
                process.exit(1);
            }
        }
    });
});