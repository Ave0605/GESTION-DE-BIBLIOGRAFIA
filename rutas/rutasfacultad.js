const express = require("express");

const controladorFacultad = require("../controladores/controladorFacultad");

const router = express.Router();

router
  .route("/")
  .get(controladorFacultad.getAll)
  .post(controladorFacultad.createOne);

router
  .route("/:facultyId")
  .get(controladorFacultad.getOne)
  .patch(controladorFacultad.updateOne)
  .delete(controladorFacultad.deleteOne);
router
  .route("/force/:facultyId")
  .delete(controladorFacultad.deleteAll)

module.exports = router;
