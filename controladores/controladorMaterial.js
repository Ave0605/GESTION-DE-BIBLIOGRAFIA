const { conectar } = require('../utils/leerDatos');

exports.getOne = async (req, res) => {
    let conexion
    const materialIdnumerico = parseInt(req.params.materialId, 10)
    ////////////////////////////////////////////VALIDACION LOCAL
    if (!materialIdnumerico || isNaN(materialIdnumerico))  {
      throw new Error("ID FALTANTE");
    }
    //////////////////////////////////////
    try {
       conexion = await conectar()
    
      const sqlres = await conexion.query("select * from material where idmaterial = $1", [materialIdnumerico])
      
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

exports.getAll = async(req, res) =>{
    let conexion
    try {
        conexion = await conectar()
        const ressql = await conexion.query("select * from material")
        await conexion.end()

        res.status(200).json({
            status: "success",
            results: ressql.rowCount,
            data: ressql.rows,
          });

    } catch (error) {
        if(conexion){
            conexion.end()
        }
        res.status(404).send(error)
    }
}


exports.createOne = async(req, res) =>{
    let conexion

    try {
      ////////////////////VALIDACION LOCAL
      if (!req.body.title) {
        throw new Error("TITLE IS MISSING");
      }
  
      if (req.body.title.trim() === "") {
        throw new Error("TITLE IS EMPTY");
      }

      if (!req.body.author) {
        throw new Error("author IS MISSING");
      }
  
      if (req.body.author.trim() === "") {
        throw new Error("author IS EMPTY");
      }

      if (!req.body.url) {
        throw new Error("URL IS MISSING");
      }
  
      if (req.body.url.trim() === "") {
        throw new Error("URL IS EMPTY");
      }

      if (!req.body.type) {
        throw new Error("TYPE IS MISSING");
      }
  
      if (req.body.type> 5 || req.body.type <1) {
        throw new Error("TIPO INEXISTENTE");
      }

      /////////////////////////////////////////


      conexion = await conectar()

      duplicadomaterial = await conexion.query("select count(titulo) from material where titulo=$1 and autor=$2", [req.body.title, req.body.author])
      if (duplicadomaterial.rows[0].count>0) {//////////////////VERIFICAR SI YA EXISTE UN MATERIAL CON EL MISMO NOMBRE Y AUTOR, LANZAR ERROR
        await conexion.end()
        throw new Error("MATERIAL DUPLICADO")
      }

      duplicadoURL = await conexion.query("select count(idmaterial) from material where url=$1", [req.body.url])
      if (duplicadoURL.rows[0].count>0) {//////////////////VERIFICAR SI YA EXISTE UN MATERIAL CON EL URL, LANZAR ERROR
        await conexion.end()
        throw new Error("URL DUPLICADO")
      }

      
        const resql = await conexion.query("INSERT INTO material (titulo, autor, tipomaterial, url) values($1, $2, $3, $4) RETURNING *", [req.body.title, req.body.author, req.body.type, req.body.url])
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










exports.deleteOne = async(req, res) =>{
    const materialIdnumerico = parseInt(req.params.materialId, 10)
    let conexion
    try {
      //////////////////VALIDACION LOCAL
      if (!materialIdnumerico || isNaN(materialIdnumerico))  {
        throw new Error("ID FALTANTE");
      }
      //////////////////////////////////////
      
      conexion = await conectar()
  
      
      const existencia = await conexion.query("select * from material where idmaterial=$1", [materialIdnumerico])

      if (existencia.rowCount === 0){ ////////////SE VERIFICA QUE EL REGISTRO A ELIMINAR EXISTE Y SE LANZA ERROR
        await conexion.end()
        throw new Error ("ID NO EXISTE")
  
      }
      const existenciabibliografia = await conexion.query("select * from bibliografia where idmaterial = $1",[materialIdnumerico])
    if (existenciabibliografia.rowCount > 0) {
          await conexion.end();
          const err = new Error(
            "MATERIAL NO PUEDE SER ELIMINADA PORQUE TIENE BIBLIOGRAFIA",
          );
          err.code = "ERROR_MATERIAL_CON_BIBLIOGRAFIA";
          throw err;
      }




        sqldelete = await conexion.query("delete from material where idmaterial=$1 RETURNING *", [materialIdnumerico]) //////SE ELIMINA Y RETORNAN DATOS
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
        if (error.code === "ERROR_MATERIAL_CON_BIBLIOGRAFIA") {
          res.status(409);
        } else {
          res.status(400);
        }
        res.send({ Mensaje: error.message });
    }
}


exports.updateOne = async(req, res) =>{
    let conexion
    const materialIdnumerico = parseInt(req.params.materialId, 10)
    try {
      ///////////////////////VALIDACION LOCAL
      if (!materialIdnumerico|| isNaN(materialIdnumerico)) {
        throw new Error("FALTA ID");
      }
  
      if (!req.body.title) {
        throw new Error("TITLE IS MISSING");
      }
  
      if (req.body.title.trim() === "") {
        throw new Error("TITLE IS EMPTY");
      }

      if (!req.body.author) {
        throw new Error("author IS MISSING");
      }
  
      if (req.body.author.trim() === "") {
        throw new Error("author IS EMPTY");
      }

      if (!req.body.url) {
        throw new Error("URL IS MISSING");
      }
  
      if (req.body.url.trim() === "") {
        throw new Error("URL IS EMPTY");
      }

      if (!req.body.type) {
        throw new Error("TYPE IS MISSING");
      }
  
      if (req.body.type> 5 || req.body.type <1) {
        throw new Error("TIPO INEXISTENTE");
      }
      ////////////////////////////////////

      conexion = await conectar()


      //////////////////////////////
      /*VARIABLES PARA EVITAR ERROR AL MANTENER NOMBRE Y CAMABIAR otros datos*/
      const datosoriginales = await conexion.query("select * from material where idmaterial = $1",[materialIdnumerico])
      const urlduplicado = await conexion.query("select * from material where url = $1",[req.body.url])
      const tituloautorduplicado = await conexion.query("select * from material where titulo= $1 and autor=$2",[req.body.title, req.body.author])
      //////////////////////////////////

    
      if (urlduplicado.rowCount>0 && (urlduplicado.rows[0].url != datosoriginales.rows[0].url) ) {
        await conexion.end()
        throw new Error("URL DUPLICADA")
      }
    
     
      
if (tituloautorduplicado.rowCount>0 && tituloautorduplicado.rows[0].idmaterial != materialIdnumerico) {
    await conexion.end()
        throw new Error("TITULO Y AUTOR DUPLICADO")
}

 


      /////////////////////////////////SE ACTUALIZA EL REGISTRO
      const sqlres = await conexion.query("update material set titulo = $1, autor = $2 , tipomaterial = $3, url = $4 where idmaterial= $5 RETURNING *" ,[req.body.title, req.body.author, req.body.type, req.body.url, materialIdnumerico])
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

exports.deleteAll = async(req, res) =>{
  /*const materialIdnumerico = parseInt(req.params.materialId, 10)
  let conexion
  try {
    if (!materialIdnumerico || isNaN(materialIdnumerico))  {
      throw new Error("ID FALTANTE");
    }

    conexion = await conectar()
    const sqlres = await conexion.query("select * from material where idmaterial = $1",[materialIdnumerico])
    if(sqlres.rowCount===0){throw new Error("MATERIA NO EXISTE")} ///VALIDAR EXISTENCIA ID MATERIAL A ELIMINAR Y LANZAR ERROR
    const sqldeleteforce0 = await conexion.query("delete from bibliografia where idmaterial= $1 RETURNING *", [materialIdnumerico])
    const sqldeleteforce1 = await conexion.query("delete from material where idmaterial=$1 RETURNING *", [materialIdnumerico])
    await conexion.end()

    res.status(200).json({
      status: "eliminado",
      results: (sqldeleteforce0.rowCount + sqldeleteforce1.rowCount),
      data: {
        deletedBibliografia: sqldeleteforce0.rows,
        deletedMaterial: sqldeleteforce1.rows
      }
    });

  } catch (error) {
    if(conexion){
      await conexion.end()
    }
    res.status(400);
    res.send({ Mensaje: error.message });
  }
*/
}
