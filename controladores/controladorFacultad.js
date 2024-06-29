
const { conectar } = require('../utils/leerDatos');


////////////////////////////////////////////////GETALL
exports.getAll = async (req, res) => {
  let conexion
  try {

    conexion = await conectar()

    const sqlres = await conexion.query('select * from facultad')
  


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

};
//////////////////////////////////////////////////////////


//////////////////////////////////////////////GETONE
exports.getOne = async (req, res) => {
let conexion

const facultyIdnumerico = parseInt(req.params.facultyId, 10)
/////////////////////////////////////////////////////VALIDACION LOCAL
if (!facultyIdnumerico || isNaN(facultyIdnumerico))  {
  throw new Error("ID FALTANTE");
}
////////////////////////////////////////////////////////////////////
try {
  conexion = await conectar()

  const sqlres = await conexion.query("select * from facultad where idfacultad= $1", [facultyIdnumerico])

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

};
///////////////////////////////////////////////////////////






///////////////////////////////////////////////////CREATEONE
exports.createOne = async (req, res) => {
  let conexion

  try {
    ////////////VALIDACIONES LOCALES
    if (!req.body.name) {
      throw new Error("NAME IS MISSING");
    }

    if (req.body.name.trim() === "") {
      throw new Error("NAME IS EMPTY");
    }
    ///////////////////////////////////

    conexion = await conectar()


    const sqlduplicado = await conexion.query("select count(nombre) from facultad where nombre=$1",[req.body.name])

    if (sqlduplicado.rows[0].count>0) {  /////VALIDAR SI YA EXISTE FACULTAD CON EL MISMO NOMBRE Y LANZAR ERROR
      await conexion.end()
      throw new Error("FACULTAD DUPLICADA")
    }else{

     const sqlinsert = await conexion.query("insert into facultad (nombre) values($1) RETURNING *",[req.body.name]) /////////////INSERTAR Y DEVOLVER DATOS INSERTADOS
      await conexion.end()
      res.status(200).json({
        status: "insertado",
        results: sqlinsert.rowCount,
        data: sqlinsert.rows[0]
      });
    }
  
  } catch (error) {
    if (conexion) {
      await conexion.end();
    }
        res.status(400).send({ mensaje: error.message });
  }
};
/////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////UPDATEONE
exports.updateOne = async (req, res) => {
let conexion
const facultyIdnumerico = parseInt(req.params.facultyId, 10)
  try {
    //////////////////////////VALIDACIONES LOCALES
    if (!facultyIdnumerico || isNaN(facultyIdnumerico))  {
      throw new Error("ID FALTANTE");
    }

    if (!req.body.name) {
      throw new Error("NOMBRE NECESARIO");
    }

    if (req.body.name.trim()==="") {
      throw new Error("NOMBRE NECESARIO");
    }

    ////////////////////////////////////////////
    conexion = await conectar()


    const sqlduplicado = await conexion.query("select count(nombre) from facultad where nombre =$1", [req.body.name])

    if(sqlduplicado.rows[0].count > 0){ /////////////VALIDAR SI YA EXISTE UNA FACULTAD DEL MISMO NOMBRE Y LANZAR ERROR
      await conexion.end()
      throw new Error("FACULTAD YA EXISTE")
    } else{
      const updatesql = await conexion.query("update facultad set nombre = $1 where idfacultad= $2 RETURNING *", [req.body.name, facultyIdnumerico]) //////UPDATE Y RETORNAR DATOS
      res.status(200).json({
        status: "actualizado",
        results: updatesql.rowCount,
        data: updatesql.rows[0]
      });
    }

  } catch (error) {
    res.status(400).send({ mensaje: error.message });
    if (conexion) {
      await conexion.end();
    }

  }

};
///////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////DELETEONE
exports.deleteOne = async (req, res) => {
  const facultyIdnumerico = parseInt(req.params.facultyId, 10)
  let conexion
  try {
    ///////////////////////VALIDACION LOCAL
    if (!facultyIdnumerico || isNaN(facultyIdnumerico))  {
      throw new Error("ID FALTANTE");
    }
    conexion = await conectar()

    const existencia = await conexion.query("select * from facultad where idfacultad=$1", [facultyIdnumerico]) /////VERIFICAR SI EXISTE FACULTAD A ELIMINAR Y LANZAR ERROR
    if (existencia.rowCount === 0){
      await conexion.end()
      throw new Error ("ID NO EXISTE")

    }else{
      const sqldelete = await conexion.query("delete from facultad where idfacultad=$1 RETURNING *", [facultyIdnumerico]) //////////ELIMINAR Y RETORNAR DATOS
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
};
////////////////////////////////////////////////////////////////

//////////////////DELETE ALL
exports.deleteAll = async(req, res) =>{
  const facultyIdnumerico = parseInt(req.params.facultyId, 10)
  let conexion
  try {
    if (!facultyIdnumerico || isNaN(facultyIdnumerico))  {
      throw new Error("ID FALTANTE");
    }

    conexion = await conectar()
    const sqlres = await conexion.query("select * from facultad where idfacultad = $1",[facultyIdnumerico])
    if(sqlres.rowCount===0){throw new Error("FACULTAD NO EXISTE")} ///VALIDAR EXISTENCIA ID FACULTAD A ELIMINAR Y LANZAR ERROR

    const sqldeleteforce = await conexion.query("delete from materia where idfacultad=$1 RETURNING *", [facultyIdnumerico])
    const sqldeletefaculty = await conexion.query("delete from facultad where idfacultad=$1 RETURNING *",[facultyIdnumerico])
    await conexion.end()

    res.status(200).json({
      status: "eliminado",
      results: (sqldeleteforce.rowCount + sqldeletefaculty.rowCount),
      data: {
        deletedMateria: sqldeleteforce.rows,
        deletedFacultad: sqldeletefaculty.rows
      }
    });

  } catch (error) {
    if(conexion){
      await conexion.end()
    }
    res.status(400);
    res.send({ Mensaje: error.message });
  }

}
