const express = require("express");

const controladorBibliografia = require("../controladores/controladorBibliografia");

const router = express.Router();

router
  .route("/")
  .get(controladorBibliografia.getAll);
  

router
  .route("/:subjectId/:materialId")
  .get(controladorBibliografia.getOne)
  .post(controladorBibliografia.createOne)
  .patch(controladorBibliografia.updateOne)
  .delete(controladorBibliografia.deleteOne);

module.exports = router;
