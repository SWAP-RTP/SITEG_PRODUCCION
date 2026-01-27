import readXlsxFile from 'read-excel-file'
import { getSheetNames } from './getSheetsNames';

import { propuesta51 } from '../../helpers/esquemasExcel';
import { ajustarHora } from '../../helpers/datesFuncs';
import { quitarAcentos, stringIncludes } from '../../helpers/funcsToStrings';
import { rol_validateJornadas, verifyColsNames } from './forUseValidation/validations';
import { useEffect } from 'react';

const w = 1


const getHeader = async(file, pag=2) => {

    const rows = await readXlsxFile(file, { 
        sheet: pag, 
        // transformData(data) {
        //     const cellsNoNulls = data.map( fila => fila.filter( cell => cell != null) ).filter( f => f.length > 0)  
        //     return data
        // }
    });
 
    /*
     & Obtner los 'nombres de las columnas' del Rol     */
    const indexColsNames = rows.findIndex( fila => fila.some( cell => stringIncludes(cell, 'ECONOMICO') ))   // index of nombres de columnas  
    const colsNames = rows.find( fila => fila.some( cell => stringIncludes(cell, 'ECONOMICO') ))   // nombres de columnas  

    /*
     & Obtner el header (periodo, ruta y modalidad)     */
    const header = rows.slice(0, indexColsNames)        //! <-------------- MAL --------------- MAL -------------<<
    const indexPeriodo = header.findIndex( fila => fila.some( cell => stringIncludes(cell, 'PERIODO') ));
    const periodoRows = header.slice(indexPeriodo, indexPeriodo+2).flat()
    const dataPeriodo = {
        "periodo":    periodoRows[1],
        "ori_des":    periodoRows[3],
        "ruta":       periodoRows[5],
        "modalidad":  periodoRows[7],
    }

    /*
     & Obtner E/S      */
    const filaParaES = rows.find( fila => fila.some( cell => stringIncludes(cell, 'LOS OPERADORES DEL PRIMER TURNO SACAN') ))
    const paraES = filaParaES ? filaParaES.find( cell => stringIncludes(cell, 'LOS OPERADORES DEL PRIMER TURNO SACAN') ) : 'undefined';
    const hasPar = paraES.toUpperCase().includes('PAR')
    const hasImpar = paraES.toUpperCase().includes('IMPAR')
    const isPar = hasPar && !hasImpar
    // const isImpar = hasPar && hasImpar
    
    /*
     & Obtner Dias festivos del Rol
     ToDo: Hacer funcion getHeader.getDiasFestivos     */
    const word = 'festivo'; 
    const err_msg = `No se encontro ninguna celda con la palabra ${word}`;
    
    const df_fila = rows.find( fila => fila.some( cell => stringIncludes(cell, word) ))
    const i_filaDiasFestivos = rows.findIndex( fila => fila.some( cell => stringIncludes(cell, word) ))
    const i_colDiasFestivos = df_fila ? df_fila.findIndex( cell => stringIncludes(cell, word) ) : null ;

    const msg           = df_fila ? df_fila : err_msg;
    const diasFestivo   = df_fila ? rows[i_filaDiasFestivos][i_colDiasFestivos]  : null;
    const df_dias       = df_fila ? rows[i_filaDiasFestivos+1][i_colDiasFestivos]: null;
    const df_servicios  = df_fila ? rows[i_filaDiasFestivos+2][i_colDiasFestivos]: null;
    console.warn(`Hacer funcion getHeader.getDiasFestivos en pag: ${pag}`);
    // console.log('diasFestivo', diasFestivo);
    // console.log('dias', df_dias);
    // console.log('servicios', df_servicios);
    console.log('');

    return [
        {index: indexPeriodo, data: dataPeriodo},       // Header
        {index: indexColsNames, data: colsNames},       // Col's names
        {hasPar, isPar, df_dias, df_servicios, df_fila: msg},        // Para sistema E/S
        rows
    ]    
}


const schema = propuesta51;

const getDataRol = async(file, opt= {}) => {

    const { pag=2, slice } = opt

    const {rows, errors} = await readXlsxFile(file, { 
        sheet: pag,
        schema,
        transformData(rawData) {
            const data = rawData.slice(slice)    //#! usar: i_colsNames

            /*
             &  Ajustar el nombre de las columnas del Rol al requerido por el schema 
             *  se puede pasar del obtenido en el header si pasa la comprobación *¹            */ 
            const rawColsNames = data[0].map( cell => {
                if(typeof cell == 'string') return quitarAcentos(cell).toLowerCase()
                else return cell
            } )

            data.shift()
            data.unshift(rawColsNames)
            return data
        }
    })

    const rowsData = rows.filter( reg =>!!reg.credenciales );

    const rol = rowsData.filter( reg => Number(reg.servicio) )
    const cd = rowsData.filter( reg => !Number(reg.servicio) && typeof (reg.servicio) == 'string'  ).slice(1) // slice cols Names  
    const joe = rowsData.filter( reg => typeof (reg.sistema ) == 'number' ).map( j => ({
        "cred":     j.sistema,
        "lugIni1":  j.credenciales?.cred_turno1,
        "hr_ini_t":   ajustarHora(j.credenciales?.cred_turno2),
        "hr_ter_t":   ajustarHora(j.credenciales?.cred_turno3),
    }) )

    return {rol, cd, joe}
}


/**
 * Verifica cada hoja del rol (Esta dentro de un forEach)
 * @param {File} file Excel de roles
 * @param {number} pag numero de pagina
 * @returns [errores y 1 si Termino]
 */
export const verifyRol = async(file, pag, hojaName) => {
    const errores = []
    // Hoja y secciones del rol | Hoja y error critico 
    let data = {}       // re pensar: si hay error pues: no ¿enviarla?

    try {
        /*
        &  Get header y data         */
        //? GET & Validate Header
        const [header, colsNames, notas, rows] = await getHeader(file, pag);
        //? Validate nombre de columnas del Rol
        const errorsColsNames = verifyColsNames(colsNames.data, hojaName)
        // console.log({pag, hoja: hojaName, colsNames, colsNombres,  rows});

        //? Si hay errores en los nombres de las columnas, no sigas y manda solo ese error
        if(errorsColsNames){
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve( errores.push({hoja: hojaName, err: errorsColsNames}) );
                }, 5000 *1+10);
            });
            //^ errores.push({hoja: hojaName, err: errorsColsNames})
            data = {hoja: hojaName, err: 'Error en el nombre de las columnas'} 
 
        } 
        //? NO hay errores en los nombres de las columnas
        else{
            const {rol, cd, joe} = await getDataRol(file, { pag, slice: colsNames.index })

            //? Validate existData in Rol
            if(cd.length == 0 && joe.length == 0 && rol.length == 0) {
                data = {hoja: hojaName, err: 'No hay informacion que validar'}
                errores.push({hoja: hojaName, err: [{msg: 'No hay informacion que validar'}]})
                return {data, errores}

            } else if (rol.length == 0){
                data = {hoja: hojaName, err: 'No hay informacion que validar, faltan datos en los servicios del Rol'}
                errores.push({hoja: hojaName, err: [{msg: 'No hay informacion que validar, faltan datos en los servicios del Rol'}]})
                return {data, errores}
            }
            //? --FIN Validate existData in Rol

            const { isPar, df_fila, df_dias, df_servicios } = notas
            data = {
                hoja: hojaName, 
                rol, cd, joe, 
                notas: {
                    sacanDiasParesT1: isPar,
                    df_exist: df_fila,
                    df_dias,
                    df_servicios,
                }
            }   
            console.log({pag, ...data });

            //?  Validate jornadas/turnos segun si es L-V, Sab o Dom
            const err_rol_jornadas = rol.map( (s,i) => {
                const err = []
                if(s.lun_vie)   {
                    err.push( rol_validateJornadas({...s.lun_vie, cred: s.credenciales}, 'Lunes a viernes') )
                }
                if(s.sab)       {
                    err.push( rol_validateJornadas({...s.sab, cred: s.credenciales}, 'Sabado')  )
                }
                if(s.dom)       {
                    err.push( rol_validateJornadas({...s.dom, cred: s.credenciales}, 'Domingo') )
                }
                return {msg: `Error en servicio ${s.servicio}`, desc: err.flat()}
            } ).filter( i => i.desc.length > 0)
            
            if(err_rol_jornadas.length>0) {
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                      resolve( errores.push({hoja: hojaName, err: err_rol_jornadas}) );
                    }, 2500 *1+10);
                });
                //^ errores.push({hoja: hojaName, err: err_rol_jornadas})
            }
            //? --FIN Validate jornadas/turnos segun si es L-V, Sab o Dom
            
        }

        return {data, errores}
    } catch (error) {
        console.warn(`Error en la lectura del excel: ${error}`);
        return {data: {}, errores: []}      //!     <-------------------------------------------------------

    }
}
