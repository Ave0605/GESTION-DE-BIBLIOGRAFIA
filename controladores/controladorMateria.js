
  const { conectar } = require('../utils/leerDatos');



  //////////////////////////////////GETALL
  exports.getAll = async(req, res) =>{
    let conexion
    try {
  
      conexion = await conectar()
  
  
      const sqlres = await conexion.query('SELECT materia.idmateria, materia.nombre AS nombre_materia, facultad.idfacultad, facultad.nombre AS nombre_facultad FROM materia INNER JOIN facultad ON materia.idfacultad = facultad.idfacultad');
  
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
//////////////////////////////////////////////

/////////////////////////////GETONE
  exports.getOne = async(req, res) =>{
    let conexion
    const subjectIdnumerico = parseInt(req.params.subjectId, 10)
    ////////////////////////////////////////////VALIDACION LOCAL
    if (!subjectIdnumerico || isNaN(subjectIdnumerico))  {
      throw new Error("ID FALTANTE");
    }
    //////////////////////////////////////
    try {
       conexion = await conectar()
    
      const sqlres = await conexion.query("select materia.idmateria, materia.nombre AS nombre_materia, facultad.idfacultad, facultad.nombre AS nombre_facultad from materia inner join facultad on materia.idfacultad = facultad.idfacultad where idmateria= $1", [subjectIdnumerico])
      
      await conexion.end()
     
      if (sqlres.rowCount>0) {
        res.status(200).json({
          status: "success",
          results: sqlres.rowCount,
          data: sqlres.rows[0],
        });
      } else{
        throw new Error('REGISTRO NO EXISTE')
      }
    } catch (error) {
      if (conexion) {
        await conexion.end();
      }
      res.status(404).send(error)
      
    }
  }
//////////////////////////////////////////////////////

//////////////////////////////////////CREATEONE
  exports.createOne = async(req, res) =>{
    let conexion

    try {
      ////////////////////VALIDACION LOCAL
      if (!req.body.name) {
        throw new Error("NAME IS MISSING");
      }
  
      if (req.body.name.trim() === "") {
        throw new Error("NAME IS EMPTY");
      }

      if(!req.body.facultyId){
        throw new Error("FACULTYID IS MISSING");
      }
      /////////////////////////////////////////


      conexion = await conectar()

      duplicadomateria = await conexion.query("select count(nombre) from materia where nombre=$1", [req.body.name])
      if (duplicadomateria.rows[0].count>0) {//////////////////VERIFICAR SI YA EXISTE UNA MATERIA CON EL MISMO NOMBRE Y LANZAR ERROR
        await conexion.end()
        throw new Error("MATERIA DUPLICADA")
      }

      existenciafacultad = await conexion.query("select * from facultad where idfacultad=$1" , [req.body.facultyId])
      if (existenciafacultad.rowCount === 0) { /////////////////////////////////////VERIFICAR EXISTE LA FACULTAD SELECCIONADA Y LANZZAR ERROR
        await conexion.end()
        throw new Error("FACULTAD NO EXISTE")
      } else{
        const resql = await conexion.query("INSERT INTO materia (nombre, idfacultad) values($1, $2) RETURNING *", [req.body.name, req.body.facultyId])
        res.status(200).json({
            status: "success",
            results: resql.rowCount,
            data: resql.rows[0],
          });
          await conexion.end()

      }
    } catch (error) {
        if (conexion) {
          await conexion.end();
        }
            res.status(400).send({ mensaje: error.message });
      }
  }
//////////////////////////////////////////////////////////

/////////////////////////////////////UPDATEONE
  exports.updateOne= async(req, res) =>{
    let conexion
    const subjectIdnumerico = parseInt(req.params.subjectId, 10)
    try {
      ///////////////////////VALIDACION LOCAL
      if (!subjectIdnumerico|| isNaN(subjectIdnumerico)) {
        throw new Error("FALTA ID");
      }
  
      if (!req.body.name) {
        throw new Error("NOMBRE NECESARIO");
      }
      if (req.body.name.trim() == "") {
        throw new Error("NOMBRE NECESARIO");
      }

      if (!req.body.facultyId) {
        throw new Error("FALTA ID FACULTAD")
      }
      ////////////////////////////////////

      conexion = await conectar()


      //////////////////////////////
      /*VARIABLES PARA EVITAR ERROR AL MANTENER NOMBRE Y CAMABIAR FACULTYID*/
      const datosoriginales = await conexion.query("select * from materia where idmateria=$1",[subjectIdnumerico])
      const duplicadomateria = await conexion.query("select * from materia where nombre = $1",[req.body.name])
      //////////////////////////////////

      ////////////////////////////////////
      /*ERROR SI YA EXISTE UNA MATERIA CON EL MISMO NOMBRE.
      EXCEPCION: SE IGNORA EL ERROR SI EL NOMBRE DEL ID ES EL MISMO QUE EL DE REQ.BODY.NAME, SE ENTIENDE QUE SE MANTIENE EL NOMBRE Y SE CAMBIA EL FACULTYID*/
      if (duplicadomateria.rowCount>0 && (datosoriginales.rows[0].idmateria != duplicadomateria.rows[0].idmateria)) {
       await  conexion.end()
       throw new Error("MATERIA YA EXISTE")
      }
      /////////////////////////////////

      //////////////////////////////SE VERIFICA QUE LA NUEVA FACULTAD EXISTA Y SE LANZA ERROR
      const existenciafacultad = await conexion.query("select * from facultad where idfacultad = $1", [req.body.facultyId])
      if (existenciafacultad.rowCount===0) {
        await conexion.end()
        throw new Error("FACULTAD NO EXISTE")
      }
      /////////////////////////////////////////////////////////


      /////////////////////////////////SE ACTUALIZA EL REGISTRO
      const sqlres = await conexion.query("update materia set nombre = $1, idfacultad = $2 where idmateria= $3 RETURNING *" ,[req.body.name, req.body.facultyId, subjectIdnumerico])
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
  
    }
  }

  ///////////////////////////////////////////////////


  ////////////////////////////////////DELETEONE
  exports.deleteOne = async(req, res) =>{
    const subjectIdnumerico = parseInt(req.params.subjectId, 10)
    let conexion
    try {
      //////////////////VALIDACION LOCAL
      if (!subjectIdnumerico || isNaN(subjectIdnumerico))  {
        throw new Error("ID FALTANTE");
      }
      //////////////////////////////////////
      
      conexion = await conectar()
  
      
      const existencia = await conexion.query("select * from materia where idmateria=$1", [subjectIdnumerico])

      if (existencia.rowCount === 0){ ////////////SE VERIFICA QUE EL REGISTRO A ELIMINAR EXISTE Y SE LANZA ERROR
        await conexion.end()
        throw new Error ("ID NO EXISTE")
  
      }

      const existenciabibliografia = await conexion.query("select * from bibliografia where idmateria = $1",[subjectIdnumerico])
      if (existenciabibliografia.rowCount>0) {
        await conexion.end()
        throw new Error("MATERIA NO PUEDE SER ELIMINADA PORQUE TIENE BIBLIOGRAFIA")
      }
        sqldelete = await conexion.query("delete from materia where idmateria=$1 RETURNING *", [subjectIdnumerico]) //////SE ELIMINA Y RETORNAN DATOS
        await conexion.end()
        res.status(200).json({
          status: "eliminado",
          results: sqldelete.rowCount,
          data: sqldelete.rows[0]
        });
      

    } catch (error) {
      if(conexion){
        await conexion.end()
      }
      res.status(400);
      res.send({ Mensaje: error.message });
    }
  }
  //////////////////////////////////////////////

  //////////////////DELETE ALL
exports.deleteAll = async(req, res) =>{
 /* const subjectIdnumerico = parseInt(req.params.subjectId, 10)
  let conexion
  try {
    if (!subjectIdnumerico || isNaN(subjectIdnumerico))  {
      throw new Error("ID FALTANTE");
    }

    conexion = await conectar()
    const sqlres = await conexion.query("select * from materia where idmateria = $1",[subjectIdnumerico])
    if(sqlres.rowCount===0){throw new Error("MATERIA NO EXISTE")} ///VALIDAR EXISTENCIA ID MATERIA A ELIMINAR Y LANZAR ERROR
    const sqldeleteforce0 = await conexion.query("delete from bibliografia where idmateria= $1 RETURNING *", [subjectIdnumerico])
    const sqldeleteforce1 = await conexion.query("delete from materia where idmateria=$1 RETURNING *", [subjectIdnumerico])
    await conexion.end()

    res.status(200).json({
      status: "eliminado",
      results: (sqldeleteforce0.rowCount + sqldeleteforce1.rowCount),
      data: {
        deletedBibliografia: sqldeleteforce0.rows,
        deletedMateria: sqldeleteforce1.rows
      }
    });

  } catch (error) {
    if(conexion){
      await conexion.end()
    }
    res.status(400);
    res.send({ Mensaje: error.message });
  }*/

}