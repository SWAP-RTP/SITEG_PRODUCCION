import readXlsxFile from "read-excel-file";



interface Options {
    pag?: number,
    schema?
}


/**
 * @param file archivo XLSX
 * @param pag numero de pagina del libro de calculo a leer
 * @returns array de filas o null
 */
export const readExcel = async(file: File, opt?: Options) => {
    const { 
        pag=1,
        schema
    } = opt ||{};
    try {
        const rows = await readXlsxFile(file, { 
            sheet: pag,
            schema 
        });
        return rows
    } catch (error) {
        console.warn(`Error en readExcel en ${pag}: ${error} `)   
        return null
        // throw new Error(`Error en readAndValidateHeader en ${pag}: ${error} `)   
    }
}