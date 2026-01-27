import { getDataRol } from "../readExcel";
import { getSheetNames } from "../getSheetsNames"
import { Err, PeriodoApi, ValRol } from "../interfaces"
import validarFormatoRol from "./validarFormatoRol";
import { ValidarRoles } from "./validarRolData";
import { sortByProperty } from "../../../../shared/helpers";
import { groupByValue } from "./funcsToArrays";


interface Props {
    setProgress?: (c: number) => void; 
    mod: number, 
    periodo: PeriodoApi
}


// const res: {hoja, data, errores}[] = validateRol(file, { setProgress() })

const validarRol = async(file: File, {setProgress, mod, periodo}:Props): Promise<ValRol[]> => {

    // console.log('Doing Validacion');

    let progress = 0
    let contador = 1
    const sum1ToProgress = (len: number, hojaName: string) => {
        if(setProgress){
            const sum = Math.round( progress + (100/len) )
            if(sum<100) progress = sum 
            else        progress = 99 
            setProgress( progress )
        }
        contador += 1
        // console.log('Paginas verificadas:', hojaName, contador, len)
    }

    try {
        //& Obtener data
        //~ Lectura-0: sheetNames
        const excel_sheetNames = await getSheetNames(file)
        const len = excel_sheetNames.length; 

        //^ Validacion: El archivo no tiene hojas de calculo
        //! Error critico: No hay data que leer en el archivo, no sigas
        if (len == 0) {
            const msg = '¡¡¡Error en la lectura del archivo: No se encontro informacion en el archivo XLSX!!!';
            console.warn(msg);
            // const err_page:Err_page = { hoja: file.name, err: [{ msg, canNotDismiss: true }] }
            return [ { hoja: file.name, err: [{ msg, canNotDismiss: true }] } ]
        }

        //* Continua si hay hojas que leer en el XLSX
        const OMITIR = ['HOJA', 'OTRAS', 'ACTIVIDADES']
        const excel_sheetNamesFilter = excel_sheetNames.filter( hojaName => !(OMITIR.some( word => hojaName.toUpperCase().includes(word) ))  ) 
        //~ new ValidarRoles
        const val = new ValidarRoles()

        const getDatos = await val.doFetch(mod, periodo)
        if(!getDatos) return  [ { hoja: 'Obtner datos del modulo', err: [{ msg: 'Fallaron las peticiones de informacion del modulo', canNotDismiss: true }] } ]

        //? Inicia Bucle para cada hoja
        const getDataAsync = excel_sheetNamesFilter.map( async(hojaName, index):Promise<ValRol> => {     
            try {  
                //~ Lectura-1: Header y formato (encabezado, header de columnas, secciones "para E/S" y "Laborar dias festivos")
                //^ Validar formato
                // ToDo: Considerar aceptar periodo actual para las actualizaciones
                const { header_errorsCriticos, header_errors, header_data } = await validarFormatoRol(file, hojaName, index+1, val)
                //! Errores criticos en el formato, no sigas
                if(header_errorsCriticos.length > 0) {
                    // Debug: mostrar por consola qué validación falló y el header extraído
                    console.warn(`¡ERROR EN ${hojaName} AL VALIDAR FORMATO Y ENCABEZADO!`);
                    // try {
                    //     // console.groupCollapsed(`DEBUG encabezado ${hojaName}`);
                    //     // console.log('header_errorsCriticos:', header_errorsCriticos);
                    //     // console.log('header_errors:', header_errors);
                    //     // console.log('header_data:', header_data);
                    //     console.groupEnd();
                    // } catch(e) {
                    //     console.warn('No se pudo imprimir header_data', e);
                    // }
                    return { hoja: hojaName, err: [...header_errorsCriticos, ...header_errors]}
                } 

                //* Continua si no tiene errores criticos en el formato
                const erroresHoja: Err[][] = [ header_errors ]
                // val.pushErr( header_errors )

                //~ Lectura-2: Rol por hoja (con schema)
                const { rol, cd, joe } = await getDataRol(file, { pag: index+1, slice: header_data.i_ColsNames })
                // console.log(hojaName, {rol, cd});
                const { data: headerData, diasFestivos, op1SacaDiasPares } = header_data
                const notas = { sacanDiasParesT1: op1SacaDiasPares, diasFes: diasFestivos }
                

                // Validaciones por hoja/Rol del oficio RTP/DEOM/GOS/2493/2023
                    // validacion: 14
                const err_bodyRol = val.hasBodyRolData(rol, cd , joe)
                //ToDo: verificar match de turnos y credenciales (un suimple map que retorne donde Err donde no coincida)
                //! Errores criticos en la data del rol y sus turno, no sigas
                if(err_bodyRol.length > 0) return { hoja: hojaName, err: [ ...erroresHoja.flat(), ...err_bodyRol]}
                    // validacion: 1 y 11
                const err_bodyRol_jornadas = val.jornada( rol )
                    // validacion: 12
                const err_descansos = val.descansos( rol )
                const err_descansos_cd = val.descansos( cd )
                    // validacion: nomenclatura para    • 10.1: SistemaES     • 10.2: CC 
                const err_nomenclaturaES    = val.nomenclaturaES( rol )
                const err_nomenclaturaES_cd = val.nomenclaturaES( cd )
                const err_nomenclaturaCC    = val.nomenclaturaCC( rol, headerData )
                    // validacion: 13       (posibilidar de valuar minimo de servicios a cubrir aca)
                const err_existeTurnoEnRolPara_cd = val.existeTurno( cd, rol )


                // push Errores y continua 
                erroresHoja.push( 
                    err_bodyRol_jornadas, err_descansos, err_descansos_cd, err_nomenclaturaES, 
                    err_nomenclaturaES_cd, 
                    err_existeTurnoEnRolPara_cd ,
                    err_nomenclaturaCC
                )


                const err_ordered = sortByProperty(erroresHoja.flat(), 'msg')
                const err_grouped = groupByValue(err_ordered)
                return { hoja: hojaName, data: { header:headerData, rol, cd, joe, notas}, err: err_grouped }
            } catch (error) {
                console.warn(`Error al leer la hoja ${hojaName}`, error);
                return { hoja: file.name, err: [{ msg: 'Catch', canNotDismiss: true }] }
            }
        })
        //? --FIN Bucle para cada hoja


        const getDataOfRoles: ValRol[] = await Promise.all(getDataAsync)
        // Validaciones al archivo / Excel / Roles del modulo del oficio RTP/DEOM/GOS/2493/2023
        //ToDo: Validaciones al Excel
            // validacion: 2
        const err_ecosRepetidos = val.ecosRepetidos(getDataOfRoles)
            // validacion: 4
        const err_ecosBaja = val.ecosBaja(getDataOfRoles)
            // validacion: 5
        const err_credRepetidas = val.credencialesRepetidas(getDataOfRoles)
            // validacion: 8
        const err_credsIncap = val.credsIncapacidad(getDataOfRoles)
            // validacion: 6
        const err_credsActiv = val.credsActivas(getDataOfRoles)

        //ToDo: push Errores y continua 
        const errGenerales = [ err_ecosRepetidos, err_ecosBaja, err_credRepetidas, err_credsIncap, err_credsActiv ].filter(Boolean)

        getDataOfRoles.unshift({ hoja: 'la programación', err: (errGenerales as Err[]) })
        
        return getDataOfRoles   // { hoja, DataRolPage[], Err[] }[]

    } catch (error) {
        console.error(error);
        console.log('');
        throw new Error(`Error en validateRol !!!; ${error}`)
    }
}


export default validarRol