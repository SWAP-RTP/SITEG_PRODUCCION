// import { Cell } from "read-excel-file/types";
export const capitalize = (str) => {
    if(typeof str == 'string') return str.charAt(0).toUpperCase() + str.slice(1);
    else return `It's not string: ${str}`
}

export const quitarAcentos = (texto) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * @param {Cell} text string en el que buscar
 * @param {string} label testo que buscar en el string
 * @returns {boolean}
 */
export const stringIncludes = (text, label='') => {
    if(typeof label != 'string') throw new Error(`segundo atributo deber ser string: ${label}-${typeof label}`)
    return(
    typeof text == 'string' && 
    quitarAcentos(text).toUpperCase().includes(label.toUpperCase())
    // texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // .toUpperCase().includes(label.toUpperCase())
)}