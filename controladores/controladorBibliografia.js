const { conectar } = require('../utils/leerDatos');

exports.getAll = async (req, res) => {
    let conexion
  try {

    conexion = await conectar()

    const sqlres = await conexion.query(`
    SELECT 
        bibliografia.idmaterial, 
        material.titulo AS "titulo_material", 
        material.autor AS "autor_material", 
        bibliografia.idmateria, 
        materia.nombre AS "nombre_materia",
        bibliografia.tipobibliografia 
    FROM 
        bibliografia
    INNER JOIN 
        materia ON bibliografia.idmateria = materia.idmateria
    INNER JOIN 
        material ON bibliografia.idmaterial = material.idmaterial
`)
  


    res.status(200).json({
      status: "success",
      results: sqlres.rowCount,
      data: sqlres.rows,
    });
    await conexion.end
  } catch (error) {
    if (conexion) {
      await conexion.end();
    }
    res.status(404).send(error)
  }

}
exports.getOne = async (req, res) => {
    let conexion

const subjectIdnumerico = parseInt(req.params.subjectId, 10)
const materialIdnumerico = parseInt(req.params.materialId, 10)
/////////////////////////////////////////////////////VALIDACION LOCAL
if (!subjectIdnumerico || isNaN(subjectIdnumerico))  {
  throw new Error("ID FALTANTE");
}

if (!materialIdnumerico || isNaN(materialIdnumerico))  {
    throw new Error("ID FALTANTE");
  }
////////////////////////////////////////////////////////////////////
try {
  conexion = await conectar()

  const sqlres = await conexion.query(`
    SELECT 
        bibliografia.idmaterial, 
        material.titulo AS "titulo_material", 
        material.autor AS "autor_material", 
        bibliografia.idmateria, 
        materia.nombre AS "nombre_materia",
        bibliografia.tipobibliografia 
    FROM 
        bibliografia
    INNER JOIN 
        materia ON bibliografia.idmateria = materia.idmateria
    INNER JOIN 
        material ON bibliografia.idmaterial = material.idmaterial
    WHERE 
        bibliografia.idmaterial = $1 AND 
        bibliografia.idmateria = $2
`, [materialIdnumerico, subjectIdnumerico]);

  await conexion.end()
 
  if (sqlres.rowCount>0) { //////SI EXISTE UNO, MOSTRAR, SINO ERROR
    res.status(200).json({
      status: "success",
      results: sqlres.rowCount,
      data: sqlres.rows,
    });
  } else{
    throw new Error("NO EXISTE")
  }
} catch (error) {
  if (conexion) {
    await conexion.end();
  }
  res.status(404).send(error)
  
}
}
exports.createOne = async (req, res) => {
    let conexion
    const subjectIdnumerico = parseInt(req.params.subjectId, 10)
    const materialIdnumerico = parseInt(req.params.materialId, 10)

    try {


      ////////////////////VALIDACION LOCAL    
      if (!subjectIdnumerico || isNaN(subjectIdnumerico))  {
        throw new Error("ID FALTANTE");
       }
   
       if (!materialIdnumerico || isNaN(materialIdnumerico))  {
       throw new Error("ID FALTANTE");
        }
  
      if (req.body.type> 2 || req.body.type <1) {
        throw new Error("TIPO INEXISTENTE");
      }

      /////////////////////////////////////////


      conexion = await conectar()

      const existenciamaterial = await conexion.query("select * from material where idmaterial = $1",[materialIdnumerico])
      const existenciamateria = await conexion.query("select * from materia where idmateria = $1",[subjectIdnumerico])

      const duplicadobibliografia = await conexion.query("select * from bibliografia where idmaterial = $1 and idmateria = $2",[materialIdnumerico, subjectIdnumerico])
      
if (existenciamaterial.rowCount<1) {
    throw new Error("MATERIAL NO EXISTE")
}


if (existenciamateria.rowCount<1) {
    throw new Error("MATERIA NO EXISTE")
}

if (duplicadobibliografia.rowCount>0) {
    throw new Error("MATERIA/MATERIAL YA EXISTE")
}


        const resql = await conexion.query("INSERT INTO bibliografia (idmaterial, idmateria, tipobibliografia) values($1, $2, $3) RETURNING *", [materialIdnumerico, subjectIdnumerico,req.body.type])
        res.status(200).json({
            status: "success",
            results: resql.rowCount,
            data: resql.rows[0],
          });
          await conexion.end()

      
    } catch (error) {
        if (conexion) {
          await conexion.end();
        }
            res.status(400).send({ mensaje: error.message });
      }
}



exports.updateOne = async (req, res) => { 
    let conexion
    const subjectIdnumerico = parseInt(req.params.subjectId, 10)
    const materialIdnumerico = parseInt(req.params.materialId, 10)
    try {

      ////////////////////VALIDACION LOCAL    
      if (!subjectIdnumerico || isNaN(subjectIdnumerico))  {
        throw new Error("ID FALTANTE");
       }
   
       if (!materialIdnumerico || isNaN(materialIdnumerico))  {
       throw new Error("ID FALTANTE");
        }
  
      if (req.body.type> 2 || req.body.type <1) {
        throw new Error("TIPO INEXISTENTE");
      }

      /////////////////////////////////////////

      conexion = await conectar()


    
 


      /////////////////////////////////SE ACTUALIZA EL REGISTRO
      const sqlres = await conexion.query("update bibliografia set tipobibliografia = $1 where idmaterial= $2 and idmateria=$3 RETURNING *" ,[req.body.type, materialIdnumerico, subjectIdnumerico])
      res.status(200).json({
        status: "actualizado",
        results: sqlres.rowCount,
        data: sqlres.rows[0]
      });
      conexion.end()

  
    } catch (error) {
      res.status(400).send({ mensaje: error.message });
      if (conexion) {
        await conexion.end();
      }
  
    }}




exports.deleteOne = async (req, res) => {

    let conexion
    const subjectIdnumerico = parseInt(req.params.subjectId, 10)
    const materialIdnumerico = parseInt(req.params.materialId, 10)
    try {

      ////////////////////VALIDACION LOCAL    
      if (!subjectIdnumerico || isNaN(subjectIdnumerico))  {
        throw new Error("ID FALTANTE");
       }
   
       if (!materialIdnumerico || isNaN(materialIdnumerico))  {
       throw new Error("ID FALTANTE");
        }

    ///////////////////////////////////////////////
      conexion = await conectar()
  
      
      const existencia = await conexion.query("select * from bibliografia where idmaterial=$1 and idmateria = $2", [materialIdnumerico, subjectIdnumerico])

      if (existencia.rowCount === 0){ ////////////SE VERIFICA QUE EL REGISTRO A ELIMINAR EXISTE Y SE LANZA ERROR
        await conexion.end()
        throw new Error ("ID NO EXISTE")
  
      }else{
        sqldelete = await conexion.query("delete from bibliografia where idmaterial=$1 and idmateria = $2 RETURNING *", [materialIdnumerico, subjectIdnumerico]) //////SE ELIMINA Y RETORNAN DATOS
        await conexion.end()
        res.status(200).json({
          status: "eliminado",
          results: sqldelete.rowCount,
          data: sqldelete.rows[0]
        });
      }

    } catch (error) {
      if(conexion){
        await conexion.end()
      }
      res.status(400);
      res.send({ Mensaje: error.message });
    }
}