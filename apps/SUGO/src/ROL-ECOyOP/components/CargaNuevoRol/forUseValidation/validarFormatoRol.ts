import { Err, Err_page, HeaderData, DataRolPage, HeaderRol } from "../interfaces"

import readExcel from "../readExcel"
import validateEncabezadoRol from "./validateEncabezadoRol"
import { stringIncludes } from "../../../../shared/helpers"
import { verifyColsNames } from "./validations"


interface FormatoData {
    header_errorsCriticos:  Err[],
    header_errors:          Err[],
    header_warnings:        Err[],
    header_data:            HeaderData,
    rows?:                   any[]
}


/**
 * Leer los datos de la hoja, validar y obtener 'nombres de las columnas', Encabezado, info para E/S, info para dias festivos
 * @param file Archivo XLSX
 * @param hoja Nombre de la hoja
 * @param pag numero de la pagina
 * @returns [errors, data]
 */
const validarFormatoRol = async(file: File, hojaName: string, pag: number, validacion):Promise<FormatoData> => {     
    const header_errorsCriticos:Err[] = []
    const header_errors:Err[] = []
    const header_warnings:Err[] = []
    const header_data: HeaderData = {i_ColsNames: 0, data: { periodo: 'null' }, op1SacaDiasPares: false, hojaName, pag }

    //& Obtener la data del archivo filas[]
    const rows = await readExcel(file, pag)
    //^ Validacion: La hoja tiene informacion
    if(!rows) {
        //! Error critico: No se encontro data en la hoja
        header_errorsCriticos.push({msg: `Fallo la lectura del archivo en la hoja ${hojaName}`, canNotDismiss: true })
        return {header_errorsCriticos, header_errors, header_warnings, header_data}
    }
        

    //& Obtner los 'nombres de las columnas' del Rol
    //^ Validacion: Encontrar la fila con los nombres de columnas
    const wordFor_colsNames = 'DESCANSOS EN EL PERIODO'
    const colsNames = rows.findIndex( fila => fila.some( cell => stringIncludes(cell, wordFor_colsNames) ))            // nombres de columnas  
    //! Error critico: No se encontro la fila con los nombres de columnas
    if(colsNames<0){
        header_errorsCriticos.push({msg: 'No se encontro la fila con los nombres de columnas', canNotDismiss: true})
    } else{
        // Get index (sumarle 1) de la fila de las colsNames para recortar y usar la lectura con schema para obtener la data
        header_data.i_ColsNames = colsNames +1

        //^ Validacion: Los headers de las columnas coinciden con el estipulado (en: helpers/esquemasExcel/myColsNames )
        const errorsColsNames = verifyColsNames(rows[colsNames+1])
        //! Error critico: Hay errores en los nombres de las columnas
        if(errorsColsNames){
            header_errorsCriticos.push(errorsColsNames)
        }
    }


    // Quitar filas y celdas sin data 
    const rowsNoNulls = rows.map( fila => fila.filter( cell => cell != null) ).filter( f => f.length > 0);

    //& Obtner el encabezado (periodo, ruta y modalidad)
    //^ Validacion: En el encabezo exite la fila con 'RUTA' y 'MODALIDAD' y la fila anterior tiene 'PERIODO' y 'ORIGEN-DESTINO'
    const wordFor_ruta = 'RUTA'
    const wordFor_modalidad = 'MODALIDAD'
    const wordFor_periodo = 'PERIODO'
    const wordFor_oriDes = 'ORIGEN'
    const indexPeriodo = rowsNoNulls.findIndex( (fila, i) => 
        fila.some( cell => stringIncludes(cell, wordFor_ruta)) 
        && fila.some( cell => stringIncludes(cell, wordFor_modalidad) ) 
        && ( rowsNoNulls[i-1].some( cell => stringIncludes(cell, wordFor_periodo)) 
        && rowsNoNulls[i-1].some( cell => stringIncludes(cell, wordFor_oriDes)) )
    );
    //! Error critico: No se encontro el encabezado del Rol
    if (indexPeriodo == -1) {
        header_errorsCriticos.push({msg: 'Error en el uso de la nomenclatura del rol', canNotDismiss: true, 
            desc: [`El encabezado debe contener en 2 filas:
            - PERIODO : [No.] - Del [fecha] al [fecha]      ORIGEN-DESTINO : [origen]-[destino]
            - RUTA : [ruta autorizada]                      MODALIDAD: [modalidad autorizada]
        `] })
    } else {
            const periodoRows = rowsNoNulls.slice(indexPeriodo-1, indexPeriodo+1).flat()
            const dataHeaderRol = {
                "periodo":    periodoRows[1],
                "ori_des":    periodoRows[3],
                "ruta":       periodoRows[5],
                "modalidad":  periodoRows[7],
            }
            //^ Validacion: Validar los datos del Encabezado
                // ToDo: completar validateEncabezadoRol
            // const errors_dataHeader = validateEncabezadoRol(dataHeaderRol)
            const [errors_dataHeader, ids_dataHeader] = validacion.encabezadoRol(dataHeaderRol)
            if(!errors_dataHeader) header_data.data = { ...dataHeaderRol, ...ids_dataHeader } as HeaderRol   //^ <-------
            else{
                const { errorsCriticos, errors } = errors_dataHeader
                //! Error critico: El encabezado del Rol falla en algun elemento critico
                if( errorsCriticos.length>0 ) header_errorsCriticos.push(...errors_dataHeader.errorsCriticos)
                
                //! Error normal: 
                if(errors.length>0) header_errors.push(...errors_dataHeader.errors)             
            
        }        
    }


    //& Obtener info para E/S
    const wordFor_paraES = 'LOS OPERADORES DEL PRIMER TURNO SACAN LOS DIAS'
    const paraES_fila = rows.find( fila => fila.some( cell => stringIncludes(cell, wordFor_paraES ) ))
    //^ Validacion: Encontrar la celda que declara 'LOS OPERADORES DEL PRIMER TURNO SACAN' los dias 'PAR' o 'IMPAR'
    if(paraES_fila){
        const paraES = `${paraES_fila.find( cell => stringIncludes(cell, wordFor_paraES ))}`;
        const hasPar =   paraES.toUpperCase().includes('PAR')
        if(!hasPar){
            //! Error normal: No se encontro 'PAR' o 'IMPAR' en la celda
            header_errors.push({msg: `Hace falta especificar "PAR" o "IMPAR" en la celda con la leyenda: ${wordFor_paraES}`})    
        } else {
            const hasImpar = paraES.toUpperCase().includes('IMPAR')
            const isPar = hasPar && !hasImpar           
            header_data.op1SacaDiasPares = isPar             //^ <-------
        }
    } else{
        //! Error normal: No se encontro la celda con la leyenda
        header_errors.push({msg: `No se encontro la celda con la leyenda: "${wordFor_paraES}: [PAR / IMPAR]" `})   
    }


    //& Obtener info para dias festivos
    const wordFor_diasFes = 'FESTIVO'; 
    const df_fila = rows.find( fila => fila.some( cell => stringIncludes(cell, wordFor_diasFes) ))
    //^ Validacion: Existe la sección con FESTIVO
    if(!df_fila){
        //! Error normal: no se encontro la palabra FESTIVO
        header_warnings.push({msg: 'No se encontro la seccion nombrada "LABORAR DIA FESTIVO"'})
    }else{
        //* Continua si se encontro la palabra FESTIVO
        const df_i_col =  df_fila.findIndex( cell => stringIncludes(cell, wordFor_diasFes) );
        const df_i_fila = rows.findIndex( fila => fila.some( cell => stringIncludes(cell, wordFor_diasFes) ))  //? Excatamente lo mismo que df_fila solo que encuentra el index
        
        let df_dias_exist = true
        let n = 1
        do {
            const diasFestivo   = rows[df_i_fila]     ? rows[df_i_fila][df_i_col] : undefined;
            const df_dias       = rows[df_i_fila+n]   ? rows[df_i_fila+n][df_i_col] : undefined;
            const df_servicios  = rows[df_i_fila+n+1] ? rows[df_i_fila+n+1][df_i_col] : undefined;

            if(!df_dias) {
                // console.log('CICLO DO-WHILE TERMINADO');
                df_dias_exist = false
            }
            //^ Validacion: Se especifica como se desea los dias festivos y los servicios que lo cubriran
            //ToDo: definir forma de dias festivos y los servicios que lo cubriran
            else if( typeof df_dias != 'string' || typeof df_servicios != 'string'){
                //! Error normal: no se cumple con lo definido
                // console.log(hojaName, 'num do while', n);
                console.log('df_dias..: ', df_dias);
                console.log('df_servicios..: ', df_servicios);
            }
            else {
                !header_data.diasFestivos ? 
                header_data.diasFestivos = {
                    existLabel: diasFestivo as string,
                    lista: [ {df_dias: `${df_dias}`, df_servicios: `${df_servicios}`} ]
                } : 
                header_data.diasFestivos.lista.push({
                    df_dias: `${df_dias}`, 
                    df_servicios: `${df_servicios}`
                })  //^ <-------
            }
            n += 2
        } while ( df_dias_exist && n<12 );
    } 

    
    //^ console.log('header_data', header_data);

    return {header_errorsCriticos, header_errors, header_warnings, header_data, rows}
}



export default validarFormatoRol