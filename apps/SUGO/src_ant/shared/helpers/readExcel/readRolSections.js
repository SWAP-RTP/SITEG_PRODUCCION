import readXlsxFile from "read-excel-file";
import { propuesta51 } from "../esquemasExcel";



const schema = propuesta51;
const pag = 1                  //^ debe ser dinamico

const i = {                     //^ debe ser dinamico
    header: 8,      //? line 24
    rol: 12         //? line 37
}

export const readRol = async (file) => {
    //& Obtener nombres de hojas del excel
    // readSheetNames(file).then((sheetNames) => {
    //     console.log('sheetNames', sheetNames);
    // })
    
    //& Obtener el header del Rol       (ocupo indices)
    const headerRows = await readXlsxFile(file, {   
        sheet: pag, 
        transformData(data) {
            const header = data.slice( i.header,i.header+2);
            const headerNoNulls = header.map( fila => fila.filter( cell => cell != null) )
            return headerNoNulls
        }
    })
    // console.log('headerRows', headerRows);
    

    //& Obtener la data del Rol, CD y JoE
    const {rows:rolSchema, errors} = await readXlsxFile(file, { 
        sheet: pag,
        schema,
        transformData(data) {
            return data.slice(i.rol)
        }
    })

    const bodyRolRows = rolSchema.filter(reg => !!Number(reg.servicio)  && ( !!reg.economico || !!reg.sistema ) ) 
    // console.log('Roool', bodyRolRows );
    const cubreDescRows = rolSchema.filter(reg => !!reg.servicio && !Number(reg.servicio)  && ( !!reg.economico || !!reg.sistema ) ).slice(1) 
    // console.log('CubreDesc', cubreDescRows );
    const JoEB = rolSchema.filter(reg => !reg.servicio && !Number(reg.servicio)  && ( !!reg.sistema ) ).slice(1)
    const JoERows = (JoEB.length <= 0) ? [] : JoEB.map( o => ({
        cred: o.sistema,
        lugar: o.credenciales.turno1cred ,
        hrIni: o.credenciales.turno2cred ,
        hrTer: o.credenciales.turno3cred ,
        descansos: o.descansos
    }) )
    // console.log('JoE', JoERows );


    //& Obtener la data de la pagina sin rolBody
    const FILASdeHEADER = 10
    const rolSinBody = await readXlsxFile(file, { 
        sheet: pag,
        transformData(data) {
                return data.filter(row => row.filter(column => column !== null).length > 0).slice(bodyRolRows.length + FILASdeHEADER)
        }
    })

    const sistemaTFoES = rolSinBody.map( fila => fila.find( celda => ( 
                typeof celda == 'string' &&
                ( ( celda.toUpperCase() == "PARA SISTEMA E/S") 
                | ( celda.toUpperCase().includes("OPERADORES DEL PRIMER TURNO SACAN")) 
                | ( celda.toUpperCase().includes("OPERADORES DEL SEGUNDO TURNO SACAN")) )
            )
        ) 
    ).filter(Boolean) ;
    console.log(sistemaTFoES);

    //ToDo: con rolSinBody encontrar "Laborar día festivo", su fila y col, tomar valores de fila +1, +2, +3, +4 y col
    


    return [ headerRows, bodyRolRows, cubreDescRows, JoERows,  sistemaTFoES, 'Dias festivos' ]
    
}



function quitarAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
