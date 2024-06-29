
const { Client } = require('pg');



  const conectar = async () => {
    const client = new Client({
      user: 'postgres',
      password: '1234',
      host: 'localhost',
      port: '5432',
      database: 'dbgestion',
    });  
  
    try {
      await client.connect();
      console.log('Conectado correctamente a la base de datos PostgreSQL');
      return client;
    } catch (error) {
      throw new Error(`Error al conectar a la base de datos: ${error.message}`);
    }
  };
  
  module.exports = {
    conectar
  };









/*const fs = require("fs");

async function leerDatos(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        // Si el archivo no existe, crear uno nuevo con un arreglo vacío
        if (err.code === "ENOENT") {
          const estructuraInicial = [];
          fs.writeFile(
            filePath,
            JSON.stringify(estructuraInicial, null, 2),
            "utf8",
            (writeErr) => {
              if (writeErr) {
                reject(writeErr);
              } else {
                resolve(estructuraInicial);
              }
            },
          );
        } else {
          reject(err);
        }
      } else {
        if (data.trim() === "") {
          const estructuraInicial = [];
          // Si el archivo está vacío, inicializa un arreglo vacío
          resolve(estructuraInicial);
        } else {
          try {
            const datos = JSON.parse(data);
            resolve(datos);
          } catch (parseError) {
            reject(parseError);
          }
        }
      }
    });
  });
}

module.exports = leerDatos;*/
