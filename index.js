const { error } = require("console");
const express = require("express");
const fs = require("fs");
const { getSystemErrorMap } = require("util");
const cors = require("cors"); // Import the cors package
const rutasFacultad = require("./rutas/rutasfacultad");
const rutasMateria = require("./rutas/rutasmateria");
const rutasMaterial = require("./rutas/rutasmaterial");
const rutasBibliografia = require("./rutas/rutasbibliografia")

// Define the CORS options
const corsOptions = {
  origin: "http://localhost:4200", // Cambia esto por la URL de tu aplicación Angular en producción
  optionsSuccessStatus: 200, // Algunos navegadores antiguos (como IE11) necesitan esto
};

const app = express();

// Use cors middleware with the options
// app.use(cors(corsOptions));

// Use express.json middleware
app.use(express.json());

const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hola Mundo");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.use("/facultad", rutasFacultad);
app.use("/materia", rutasMateria);
app.use("/material", rutasMaterial);
app.use("/bibliografia", rutasBibliografia);


