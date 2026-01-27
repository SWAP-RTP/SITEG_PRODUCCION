

const exRegFecha = /^\d{2}\/\d{2}\/\d{4}$/;     // Formato: dd/mm/yyyy

/*  
 &  Indice, funciones:
    eliminarDuplicados
    sortByProperty
    sortByDate
    objectToArray
    arrayToObject
    groupByRepeatedValue
  
*/



/**
 * Esta ajustado a un tipo de objeto especifico v1
 * @param {Array} arr array de objetos 
 * @param {string} valor key a identificar 
 * @param {object} options { order=true isDate=false }
 * @returns array de objetos sin duplicados
 */
export const eliminarDuplicados = (arr, prop, options={} ) => {

  const { order=true, isDate=false } = options

  const newArray = arr.filter((item, index, self) =>
    index === self.findIndex((t) => (
      t[prop] == item[prop]
    ))
  );

 
  if(order && isDate) return sortByDate(newArray, prop)

  else if(order) return sortByProperty(newArray, prop)
  
  else return newArray
}

/**
 * Ordena de menor a mayor un array de objetos 
 * @param {array} array array de objetos
 * @param {string} propiedad propiedad con valor number
 * @returns {array} 
 */
export const sortByProperty = (arr, prop) => {
    if(arr.length == 0) return []
  return arr.slice().sort((a, b) => {
    if (a[prop] < b[prop]) {
      return -1;
    }
    if (a[prop] > b[prop]) {
      return 1;
    }
    return 0;
  });
   
}

export const sortByPropertyString = (arr, prop, symbol='-') => {
    if(arr.length == 0) return []
    return arr.sort((obj1, obj2) => {
        const a = obj1[prop]
        const b = obj2[prop]
        const [charA, restA] = a.split(symbol);
        const [charB, restB] = b.split(symbol);
    
        if (isNaN(charA) && isNaN(charB)) {
          // Ambos son letras, compara como cadenas
          return charA.localeCompare(charB);
        } else if (isNaN(charA)) {
          // A es una letra, colócala después de B (número)
          return 1;
        } else if (isNaN(charB)) {
          // B es una letra, colócala antes de A (número)
          return -1;
        } else {
          // Ambos son números, compara como números
          return parseInt(charA) - parseInt(charB);
        }
      });
}


export const sortByDate = (arr, prop='fecha') => {
  arr.sort((a, b) => { 
    const a2 = a[prop].split('/')
    const b2 = b[prop].split('/')
    //                Date( mm/dd/yyyy)
    const dateA = new Date(`${a2[1]}/${a2[0]}/${a2[2]}`);
    const dateB = new Date(`${b2[1]}/${b2[0]}/${b2[2]}`);
    return dateA - dateB;
  });
  return arr;
}

export const sortStrings = (arr) => {
    return arr.sort((a, b) => {
      const [charA, restA] = a.split('-');
      const [charB, restB] = b.split('-');
  
      if (isNaN(charA) && isNaN(charB)) {
        // Ambos son letras, compara como cadenas
        return charA.localeCompare(charB);
      } else if (isNaN(charA)) {
        // A es una letra, colócala después de B (número)
        return 1;
      } else if (isNaN(charB)) {
        // B es una letra, colócala antes de A (número)
        return -1;
      } else {
        // Ambos son números, compara como números
        return parseInt(charA) - parseInt(charB);
      }
    });
};

/**
 * Función callback para usar con metodo sort
 * @param {string} prop 
 */
export const toSortByHrs = (prop) => {
    return function compararHoras(objetoA, objetoB) {
        // Divide la cadena en sus partes: horas, minutos y segundos
        const [hrA, minA, segA] = objetoA[prop].split(':');
        const [hrB, minB, segB] = objetoB[prop].split(':');

        // Crea un objeto Date y establece las partes de la hora
        const horaA = new Date();
        const horaB = new Date();
        horaA.setHours(parseInt(hrA, 10), parseInt(minA, 10), parseInt(segA, 10));
        horaA.setHours(parseInt(hrB, 10), parseInt(minB, 10), parseInt(segB, 10));
      
        // Compara las horas y devuelve el resultado de la comparación
        return horaB - horaA;
    }
}

  
/**
 * @param {object} obj 
 * @returns {array} [ key, value ][ ] 
 */
export const objectToArray = (obj) => {
  return Object.entries(obj).map(([key, value]) => [key, value]);
}

/**
 * @param {array} array array de [key, value]
 * @returns objeto
 */
export const arrayToObject = (array) =>
array.reduce((obj, [key, value]) => {
  obj[key] = value;
  return obj;
}, {});

/**
 * @param {*[]} arr 
 * @param {string} prop 
 * @param {boolean} dontSort 
 * @returns {*[]}
 */
export const groupByRepeatedValue = (arr, prop='eco', dontSort=false) => {
  if( !arr || arr.length == 0) return []
  const array = dontSort ? arr : sortByProperty( arr, prop );
  const result = [];
  let currentGroup = [];
  let currentValue = array[0][prop];
  
  array.forEach(item => {
    if (item[prop] == currentValue) {
      currentGroup.push(item);
    } else {
      result.push(currentGroup);
      currentGroup = [item];
      currentValue = item[prop];
    }
  });
  
  result.push(currentGroup);
  return result;
}


// export const orderByProp = (array, propiedad) => {
//     return array.slice().sort((a, b) => {
//       if (a[propiedad] < b[propiedad]) {
//         return -1;
//       }
//       if (a[propiedad] > b[propiedad]) {
//         return 1;
//       }
//       return 0;
//     });
// };
