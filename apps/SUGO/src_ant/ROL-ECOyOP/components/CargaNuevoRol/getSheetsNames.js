import { readSheetNames } from 'read-excel-file'



/**
 * Obtener nombres de hojas del excel
 * @param {File} file excel de roles
 * @returns {Array} nombres de hojas
 */ 
export const getSheetNames = async(file) => {
    try {
        const sheetNames = await readSheetNames(file)
        return sheetNames
    } catch (error) {
        return []
        // console.log('file', file);
        // throw new Error('Error en getSheetNames', error);
    }
}