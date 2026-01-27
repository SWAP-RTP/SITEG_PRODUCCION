interface Options {
    docTitle?: string
}


//& Función para crear un documento de excel con los datos de la tabla.
export const exportJsonToExcel = (data, options?: Options) => {
    const { 
        docTitle='doc' 
    } = options || {};

    import("xlsx").then((xlsx) => {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
        const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
        });
        saveAsExcelFile(excelBuffer, docTitle);
    });
};

//? Complemento para guardar el documento creado en la maquina 
const saveAsExcelFile = (buffer, name?: string) => {
    const fileName = !!name ? name : name + '_' + new Date().getTime();
    import("file-saver").then((module) => {
        if (module && module.default) {
        let EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        let EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], {
            type: EXCEL_TYPE,
        });

        module.default.saveAs(
            data,
            fileName + EXCEL_EXTENSION
        );
        }
    });
};