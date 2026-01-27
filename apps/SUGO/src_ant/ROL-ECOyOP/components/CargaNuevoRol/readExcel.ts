import readXlsxFile from "read-excel-file";
import { propuesta51 } from "../../helpers/esquemasExcel";
import { quitarAcentos, ajustarHora } from "../../../shared/helpers";
import { CD, JoE, Jornadas, JornadasRaw, Rol, RolWithTurnos } from "./interfaces";


/**
 * @param file archivo XLSX
 * @param pag numero de pagina del libro de calculo a leer
 * @returns array de filas o null
 */
const readExcel = async(file: File, pag: number) => {
    try {
        const rows = await readXlsxFile(file, { 
            sheet: pag, 
        });
        return rows
    } catch (error) {
        console.warn(`Error en readExcel en ${pag}: ${error} `)   
        return null
        // throw new Error(`Error en readAndValidateHeader en ${pag}: ${error} `)   
    }
}


const makeJornadas = (servicio: JornadasRaw) => {
    const jornadas: Jornadas[] = []
    const { 
        hrIni1, lugIni1, hrIni2, lugIni2, hrIni3, lugIni3,
        hrIniCC, hrTer1, hrTer2, hrTerCC, hrTerMod, hrTerT, lugTerCC
    } = servicio

    if( hrIni1 && lugIni1 ) jornadas.push({
        turno:      1,
        hr_ini_t:     hrIni1,       
        lug_ini_cc:   lugIni1,
        hr_ini_cc:    hrIniCC,
        lug_ter_cc:   lugIni2 || lugIni3 || lugTerCC,
        hr_ter_cc:    ( lugIni2 || lugIni3) ? undefined : hrTerCC,
        hr_ter_mod:   ( lugIni2 || lugIni3) ? undefined : hrTerMod,
        hr_ter_t:     hrTer1,
    }); // else jornadas.push(null)
    
    if( hrIni2 && lugIni2 ) jornadas.push({
        turno:      2,
        hr_ini_t:     hrIni2,       
        lug_ini_cc:   lugIni2,
        hr_ini_cc:    undefined,
        lug_ter_cc:   (lugIni3) || lugTerCC,
        hr_ter_cc:    (lugIni3) ? undefined : hrTerCC,
        hr_ter_mod:   (lugIni3) ? undefined : hrTerMod,
        hr_ter_t:     hrTer2,
    }); // else jornadas.push(null)

    if( hrIni3 && lugIni3 ) jornadas.push({
        turno:      3,
        hr_ini_t:     hrIni3,       
        lug_ini_cc:   lugIni3,
        hr_ini_cc:    undefined,
        hr_ter_cc:    hrTerCC,
        lug_ter_cc:   lugTerCC,
        hr_ter_mod:   hrTerMod,
        hr_ter_t:     hrTerT,
    }); // else jornadas.push(null)

    return jornadas
}

const agrupaRol = ( rol: Rol[] ):RolWithTurnos[] => {

    const rolAgrupado: RolWithTurnos[] = rol.map( servicio => {
        const newShape: RolWithTurnos = {...servicio, lun_vie: undefined, sab: undefined, dom: undefined} 

        if( servicio.lun_vie ) {
            const jornadas = makeJornadas( servicio.lun_vie )
            if(jornadas.length != 0) newShape.lun_vie = jornadas
        }
        if( servicio.sab ) {
            const jornadas = makeJornadas( servicio.sab )
            if(jornadas.length != 0) newShape.sab = jornadas
        }
        if( servicio.dom ) {
            const jornadas = makeJornadas( servicio.dom )
            if(jornadas.length != 0) newShape.dom = jornadas
        }

        return newShape
    } )
    
    return rolAgrupado
}


const schema = propuesta51;

/**
 * Lee la hoja del XLSX con un schema y regresa rol (si el servicio es un num), cd (si el servicio es un string) y JoE (si sistema(cred) es un numero)
 * @param file excel
 * @param opt options
 * @returns data
 */
export const getDataRol = async(file: File, opt: {pag?: number, slice?: number}) => {

    const { pag=2, slice=0 } = opt

    const {rows, errors}: {errors: any, rows: any[]} = await readXlsxFile(file, { 
        sheet: pag,
        schema,
        transformData(rawData) {
            const data = rawData.slice(slice)
            /*
             &  Ajustar el nombre de las columnas del Rol al requerido por el schema 
                se puede pasar del obtenido en el header si pasa la comprobación *¹            */ 
            const rawColsNames = data[0].map( cell => {
                if(typeof cell == 'string') return quitarAcentos(cell).toLowerCase()
                else return cell
            } )

            data.shift()
            data.unshift(rawColsNames)
            // console.log('dataSliced', data);
            return data
        }
    })
    // const rows = filas

    const rowsData = rows.filter( reg =>!!reg.credenciales );

    const rol: Rol[] = rowsData.filter( reg => Number(reg.servicio) )
    const rolAgrupado: RolWithTurnos[] = agrupaRol(rol)
    
    const cd:   CD[] = rowsData.filter( reg => !Number(reg.servicio) && typeof (reg.servicio) == 'string'  ).slice(1) // slice cols Names  
    const joe: JoE[] = rowsData.filter( reg => typeof (reg.sistema ) == 'number' ).map( j => ({
        "cred":      j.sistema,
        "lugIni1":   j.credenciales?.cred_turno1,
        "hr_ini_t":    ajustarHora(j.credenciales?.cred_turno2),
        "hr_ter_t":    ajustarHora(j.credenciales?.cred_turno3),
        "descansos": j.descansos
    }) )

    return {rol: rolAgrupado, cd, joe, rows}
}

export default readExcel