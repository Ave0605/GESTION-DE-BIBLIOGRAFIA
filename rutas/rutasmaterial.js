const express = require("express")

const controladorMaterial = require ("../controladores/controladorMaterial")

const router = express.Router();


router
  .route("/")
  .get(controladorMaterial.getAll)
  .post(controladorMaterial.createOne);

router
  .route("/:materialId")
  .get(controladorMaterial.getOne)
  .patch(controladorMaterial.updateOne)
  .delete(controladorMaterial.deleteOne);

  router
  .route("/force/:materialId")
  .delete(controladorMaterial.deleteAll)
 

module.exports = router;
