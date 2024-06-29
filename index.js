const { error } = require("console");
const express = require("express");
const fs = require("fs");
const { getSystemErrorMap } = require("util");
const cors = require("cors"); // Import the cors package
const rutasFacultad = require("./rutas/rutasfacultad");
const rutasMateria = require("./rutas/rutasmateria");

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

//////////////////////////////////////////////SUBJECT ALTA

// app.post("/materia/alta", async (req, res) => {
//   const nuevo = {
//     subjectId: req.body.facultyId,
//     name: req.body.name,
//     facultyId: req.body.facultyId,
//     bibliographies: req.body.bibliographies,
//   };
//   try {
//     if (
//       nuevo.subjectId == undefined ||
//       nuevo.name == undefined ||
//       nuevo.facultyId == undefined ||
//       nuevo.bibliographies == undefined
//     ) {
//       throw new Error("DATOS INCOMPLETOS");
//     }
//
//     if (
//       nuevo.subjectId.trim() == "" ||
//       nuevo.name.trim() == "" ||
//       nuevo.facultyId.trim() == ""
//     ) {
//       throw new Error("DATOS INCOMPLETOS");
//     }
//
//     if (nuevo.bibliographies.length == 0) {
//       throw new Error("DATOS INCOMPLETOS");
//     }
//
//     const datos = await leerDatos();
//     const duplicado = await datos.materias.filter(
//       (registro) => registro.subjectId == req.body.subjectId,
//     );
//     if (duplicado.length > 0) {
//       throw new Error("ID DUPLICADO");
//     }
//
//     datos.materias.push(nuevo);
//     fs.writeFile(
//       "base.json",
//       JSON.stringify(datos, null, 2),
//       "utf8",
//       (err, data) => {
//         if (err) {
//           console.error("error");
//           return;
//         }
//         res.status(201);
//         res.send({
//           Mensaje: "ELEMENTO INSERTADO",
//           Datos:
//             "subjectId: " +
//             req.body.subjectId +
//             ", name: " +
//             req.body.name +
//             ", facultyId: " +
//             req.body.facultyId +
//             " bibliographies: " +
//             req.body.bibliographies,
//         });
//         console.log("exito");
//       },
//     );
//   } catch (error) {
//     res.status(400);
//     res.send({ mensaje: error.message });
//   }
// });
//
// //////////////////////////////////
//
// /////////////////////////////////////////////////////CONSULTA SUBJECT
//
// app.get("/materia/consulta", async (req, res) => {
//   const consulta = await leerDatos();
//   res.send(consulta.materias);
// });
// ////////////////////////////////////////////////////// CONSULTA FILTRADO
//
// app.get("/materia/consultafiltrado", async (req, res) => {
//   try {
//     const datos = await leerDatos();
//     const consulta = await datos.materias.filter(
//       (registro) => registro.subjectId == req.body.subjectId,
//     );
//     if (consulta.length > 0) {
//       res.status(200).send(consulta);
//     } else {
//       throw new Error("NO EXISTE");
//     }
//   } catch (error) {
//     res.status(400);
//     res.send(error.message);
//   }
// });
//
// ////////////////////////////////////////////////////////////////
//
// //////////////////////////////////////////////////MATERIA BAJA
//
// app.delete("/materia/baja", async (req, res) => {
//   const elemento = req.body.subjectId;
//
//   try {
//     if (elemento == null || elemento == undefined) {
//       throw new Error("ID FALTANTE");
//     }
//
//     let datos = await leerDatos();
//
//     const eliminar = await datos.materias.findIndex(
//       (registro) => registro.subjectId == elemento,
//     );
//     if (eliminar == -1) {
//       throw new Error("ID NO EXISTE");
//     }
//     const datoseliminar = datos.materias[eliminar];
//     datos.materias.splice(eliminar, 1);
//
//     fs.writeFile(
//       "base.json",
//       JSON.stringify(datos, null, 2),
//       "utf8",
//       (err, data) => {
//         if (err) {
//           console.error("error");
//           return;
//         }
//         res.status(200);
//         res.send({
//           Mensaje: "ELEMENTO ELIMINADO",
//           Datos:
//             "subjectId: " +
//             datoseliminar.subjectId +
//             ", name: " +
//             datoseliminar.name +
//             ", facultyId: " +
//             datoseliminar.facultyId +
//             ", bibliographies: " +
//             datoseliminar.bibliographies,
//         });
//       },
//     );
//   } catch (error) {
//     res.status(400);
//     res.send({ Mensaje: error.message });
//   }
// });
//
// /////////////////////////////////////////////
//
// //////////////////////////////////////////////////////////MODIFICAR MATERIA
// app.patch("/materia/modificar", async (req, res) => {
//   try {
//     if (
//       req.body.subjectId == null ||
//       req.body.subjectId == undefined ||
//       req.body.subjectId.trim() == ""
//     ) {
//       throw new Error("FALTA ID");
//     }
//     const datos = await leerDatos();
//
//     const indice = datos.materias.findIndex(
//       (registro) => registro.subjectId === req.body.subjectId,
//     );
//     if (indice == -1) {
//       throw new Error("ELEMENTO NO EXISTE");
//     }
//
//     const nuevosdatos = {
//       subjectId: req.body.subjectId,
//       name:
//         req.body.name !== undefined
//           ? req.body.name
//           : datos.materias[indice].name,
//       facultyId:
//         req.body.facultyId !== undefined
//           ? req.body.facultyId
//           : datos.materias[indice].facultyId,
//       bibliographies:
//         req.body.subjects !== undefined
//           ? req.body.subjects
//           : datos.materias[indice].bibliographies,
//     };
//
//     datos.materias[indice] = { ...datos[indice], ...nuevosdatos };
//
//     fs.writeFile(
//       "base.json",
//       JSON.stringify(datos, null, 2),
//       "utf8",
//       (err, data) => {
//         if (err) {
//           console.error("error");
//           return;
//         }
//         res.status(200);
//         res.send({
//           mensaje: "ELEMENTO MODIFICADO",
//           datos: "id: " + req.body.subjectId,
//         });
//         console.log("exito");
//       },
//     );
//   } catch (error) {
//     res.status(400);
//     res.send({ Mensaje: error.message });
//   }
// });
///////////////////////////////////////////////
