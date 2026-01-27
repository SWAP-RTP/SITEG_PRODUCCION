import { Err } from "../interfaces";


const arr1 = [
    {
        "msg": "Error en servicio 1",
        "desc": [
            "No tiene 2 dias de descanso"
        ]
    },
    {
        "msg": "Error en servicio 2",
        "desc": [
            "No se encontro el dato de tipo de sistema (E/S o T/F)"
        ]
    },
    {
        "msg": "Error en servicio 4",
        "desc": [
            "No tiene 2 dias de descanso"
        ]
    },
    {
        "msg": "Error en servicio 4",
        "desc": [
            "El tipo de sistema debe ser E/S o T/F "
        ]
    },
    {
        "msg": "Error en servicio A",
        "desc": [
            "No tiene 2 dias de descanso"
        ]
    },
    {
        "msg": "Error en servicio A",
        "desc": [
            "La cantidad de operadores de cubre descanso [2] no coincide con la cantidad de turnos programados [3] en el servicio 2 ",
            "No se encontro el servicio D para cubrir en el dia viernes",
            "No se encontro el servicio D para cubrir en el dia sabado",
            "No se encontro el servicio D para cubrir en el dia domingo"
        ]
    },
    {
        "msg": "Error en servicio B",
        "desc": [
            "El tipo de sistema debe ser E/S o T/F "
        ]
    },
    {
        "msg": "Error en servicio B",
        "desc": [
            "La cantidad de operadores de cubre descanso [2] no coincide con la cantidad de turnos programados [3] en el servicio 2 ",
            "El servicio 3 no descansa el dia viernes",
            "No se encontro el servicio D para cubrir en el dia sabado",
            "No se encontro el servicio D para cubrir en el dia domingo"
        ]
    },
    {
        "msg": "Error en servicio C",
        "desc": [
            "El tipo de sistema debe ser E/S o T/F "
        ]
    },
    {
        "msg": "Error en servicio C",
        "desc": [
            "La cantidad de operadores de cubre descanso [3] no coincide con la cantidad de turnos programados [2] en el servicio 4 ",
            "La cantidad de operadores de cubre descanso [3] no coincide con la cantidad de turnos programados [2] en el servicio 3 ",
            "La cantidad de operadores de cubre descanso [3] no coincide con la cantidad de turnos programados [2] en el servicio 3 ",
            "El servicio 5 no descansa el dia viernes",
            "No se encontro el servicio D para cubrir en el dia sabado",
            "No se encontro el servicio D para cubrir en el dia domingo"
        ]
    },
    {
        "msg": "Hace falta especificar \"PAR\" o \"IMPAR\" en la celda con la leyenda: LOS OPERADORES DEL PRIMER TURNO SACAN LOS DIAS"
    },
    {
        "msg": "No se encontro la celda con la leyenda: \"LOS OPERADORES DEL PRIMER TURNO SACAN LOS DIAS: [PAR / IMPAR]\" "
    }
]

/**
 * Agrupa todas las descripciones de errores con los Err que tengan el mismo msg
 * @param arr {msg: string, desc: string[]}
 */
export const groupByValue = (arr: Err[]): Err[] => {
    const result: Err[] = [];
    
    arr.forEach(({ msg, desc }) => {
        const currentGroup: Err = { msg, desc: [] };

        const existingGroup = result.find(group => group.msg === msg);
        if (existingGroup) {
            existingGroup.desc?.push(...(desc || []));
        } else {
            currentGroup.desc = desc ? desc : [];
            result.push( currentGroup );
        }
    });

    return result;
}


export const findDuplicates = (arr:any[], prop?: string) => {
    if(prop){
        const filtered = arr.filter((item, index) => arr.indexOf(item[prop]) !== index);
        return [...new Set(filtered)]
    }
    const filtered = arr.filter((item, index) => arr.indexOf(item) !== index);
    return [...new Set(filtered)]
}

export const findDuplicates2 = (arr: any[], prop: string) => {
    const busqueda = arr.reduce((acc, persona) => {
        acc[persona[prop]] = ++acc[persona[prop]] || 0;
        return acc;
    }, {});
      
    const duplicados = arr.filter( (persona) => {
          return busqueda[persona[prop]];
    });

    return duplicados
}

// export const deleteDuplicates = <T>(array: T[], propiedad: keyof T): T[] => {
//         const valoresUnicos = new Set();
//         const resultado: T[] = [];
  
//     array.forEach(obj => {
//       const valorPropiedad = obj[propiedad];
//       if (!valoresUnicos.has(valorPropiedad)) {
//         valoresUnicos.add(valorPropiedad);
//         resultado.push(obj);
//       }
//     });
  
//     return resultado;
// };    

export const deleteDuplicates = <T>(array: T[], props: (keyof T)[]|string): T[] => {
    const paresUnicos = new Set<string>();
    const resultado: T[] = [];
  
    array.forEach(obj => {
        let par
        if(Array.isArray(props)){
            const arrProps = props.map( (prop) => obj[prop] )
            par = arrProps.join('-');
        } 
        else if( typeof props == 'string' ){
            par = obj[props];
        } else throw new Error(`Error in deleteDuplicates(), second attribute must be string|string[]. Second attribute = ${props}`)
    
        
        if (!paresUnicos.has(par)) {
            paresUnicos.add(par);
            resultado.push(obj);
        }
    });
  
    return resultado;
  };
  