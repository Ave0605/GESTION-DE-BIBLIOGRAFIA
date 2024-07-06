const express = require("express");

const controladorMateria = require("../controladores/controladorMateria");

const router = express.Router();

router
  .route("/")
  .get(controladorMateria.getAll)
  .post(controladorMateria.createOne);

router
  .route("/:subjectId")
  .get(controladorMateria.getOne)
  .patch(controladorMateria.updateOne)
  .delete(controladorMateria.deleteOne);

router
  .route("/force/:subjectId")
  .delete(controladorMateria.deleteAll);

module.exports = router;
