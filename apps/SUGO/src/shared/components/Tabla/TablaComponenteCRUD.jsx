/**
 * Componente para Generar Tablas con las Funcionalidades de un CRUD
 * @module TablaComponenteCRUD
 */
import jsPDF from "jspdf";
import PropTypes from 'prop-types';
import "jspdf-autotable";
import React, { useEffect, useContext, useState, useRef, useId } from "react";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { FormMaker } from "../../../shared/components/FormMaker";


//   @function TablaComponenteCRUD Functional Component.
//   @param {array} data ** Array Objetos con los datos para llenar la Tabla.
//   @param {array} cols ** Array de { field, header } para especificar las columnas para Tabla.
//   @param {array} inputs Array Campos para el formulario, para editar un registro.
//   @param {array} pdfHeaderColumns Array Pasar un array de array(s) de objetos.
//   @param {array} pdfPaperSize Array Especificar el tamaño del papel para exportar en PDF [width, height].
//   @param {number} pdfTable_mt Especificar el margin-top de la tabla para exportar en PDF.
//   @param {number} displayRows Numero de filas a mostrar, tip: set wantsPaginator=false.
//   @param {string} docTitle String Título que se le va a agregar a los documentos al momento de exportar los datos de la tabla.
//   @param {boolean} editb Boolean Renderizado de boton editar.
//   @param {boolean} deleteb Boolean Renderizado de boton borrar.
//   @param {boolean} exportar Boolean Condiciona la renderización de los botones de exportación.
//   @param {boolean} accion Boolean Condiciona la renderización de la columna de acción.
//   @param {boolean} paginator False para quitar/añadir el paginador.
//   @param {string}  label4edit Titulo para dialog del boton (editar).
//   @param {string}  labelDelete Titulo para dialog del boton (borrar).
//   @param {string}  emptyTableMsg Titulo para tabla vacia. por default = "No Hay Resultados"
//   @param {string}  dataKey Dato de la tabla que será identificador de la fila por default = "id"
//   @param {string}  idDeleteDialog Propiedad de la rowData a mostrar en el dialog del boton delete (trae id por defecto)
//   @param {string}  size small, normal o large
//   @param {function} headerButtons Función para renderizar componentes JSX en el lugar de los botenes.
//   @param {function} callBackForUpdate Función para enviar la actualización de un registro.
//   @param {function} callBackForDelete Función para enviar la eliminación de un registro.
//   @param {function} addPropsToDefVal Función para agregar las propiedades al reistro para su manipulación en el editor. (rowData) => { add props to rowData }
//   @param {function} addPdfDesign Función para agregar diseño/elementos al archivo PDF exportado de pack: jsPDF-autotable. (doc) => { usar metodos del obj doc }
//   @param {function} headerTopRows Funcion que retorna JSX ( <Row> <Column/>[] </Row> )
//   @returns jsx Componente Toast, Tabla, Dialog con FormMaker para Editar Registro y Dialog Para Eliminar Registro.
 
export const TablaComponenteCRUD = ({
  data,
  cols = [],
  inputs = [],
  pdfHeaderColumns = [],
  pdfPaperSize = [900, 1400],
  pdfTable_mt = 180,
  docTitle = "doc",
  editb = true,
  deleteb = true,
  exportar = true,
  accion = true,
  label4edit = false,
  label4Delete = false,
  emptyTableMsg = "No Hay Resultados",
  dataKey="id",
  idDeleteDialog= '',
  callBackForUpdate,
  callBackForDelete,
  addPropsToDefVal = false,
  addPdfDesign = false,
  paginator = true,
  displayRows= 10,
  size = 'small',
  headerButtons,
  className= '',
  multiSortMeta=[],
  headerTopRows=undefined
}) => {

  //? Hace la referencia para identificar la tabla. dt = dataTable
  const dt = useRef(null);
  //? id para el input del global filter
  const inputId = useId() 
  //? toast
  const msj = useRef(null);
  //? Dialogs de los botones de la columna Acción
  const [dialogEdicion, setDialogEdicion] = useState(false);
  const [dialogDeleteDisplay, setDialogDeleteDisplay] = useState(false);
  //? Hace la referencia para que el useEffect para agregar propiedades al elemento a editar no haga una acción al renderizar por primera vez
  const renderizado = useRef(true);
  //? Almacena los datos a renderizar en la tabla.
  const [dataTable, setDataTable] = useState([]);
  //? Almacena los datos de el registro del elemento editar
  const [defVal, setDefVal] = useState({});

  //? Datos para rellenar los datos de la Tabla
  useEffect(() => {
    setDataTable(data);
  }, [data]);

  //? Columnas para Renderizar la Tabla
  const dynamicColumns = cols.map((col) => {
    return (
      <Column
        key={col.field}
        style={{ width: "auto", ...col.style }}
        sortable
        {...col}
      />
    );
  });

  //? Función que renderiza el header de la tabla, en donde está el buscador global y botones de exportar data
  const tableHeader = () => {
    return (
      <div className="flex justify-content-between ">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            name={inputId}
            className="h-3rem"
            style={{minWidth: '9rem', maxWidth: '20rem'}}
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Búsqueda"
          />
        </span>
        <div className="flex pb-2 column-gap-2">
          { !!headerButtons && headerButtons() }
          {exportar && 
          <>
            <Button
              type="button"
              icon="pi pi-file-pdf"
              onClick={exportPdf}
              className="p-button-danger"
              tooltip="Exportar PDF"
              tooltipOptions={{ position: "top" }}
            />
            <Button
              type="button"
              icon="pi pi-file-excel"
              onClick={exportExcel}
              className="p-button-success"
              tooltip="Exportar Excel"
              tooltipOptions={{ position: "top" }}
            />
          </>
          }
        </div>
      </div>
    );
  };

  //? Gestiona el estado del filtro global, para la busqueda de la tabla, trabaja en conjunto con filters para hacer funcionar la busqueda.
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  //? Gestiona el estado de los filtros de la tabla.
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  //? Función que vincula el filtro global al valor ingresado en el input del buscador.
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters1 = { ...filters };
    _filters1["global"].value = value;

    setFilters(_filters1);
    setGlobalFilterValue(value);
  };

  //? Función que renderiza los botones de editar y eliminar dependiendo los permisos del usuario en la última columna de la tabla.
  const actionTemplate = (rowData) => {
    return (
      <div className="flex flex-wrap align-items-center justify-content-center gap-3">
        { editb &&
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-success"
            onClick={() => openDialog(rowData)}
          />
        }
        { deleteb && 
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-warning"
            onClick={() => openDialog(rowData)}
          />
        }
      </div>
    );
  };
  //? Función que se ejecuta al presionar algun botón del actionTemplate, llena el formulario para editar un registro.
  const openDialog = (rowData) => {
    setDefVal({ ...rowData });
    setDialogEdicion(true);
  };
  //? useEffect para agregar propiedades al elemento a editar y se pueda mostrar en el dialog.
    // solo se ejecutara cada vez que se llame a un nuevo elemento.
  useEffect(() => {
    if (renderizado.current) {
      renderizado.current = false;
      return;
    }
    addPropsToDefVal && addPropsToDefVal(defVal);
  }, [defVal]);

  const labelEdit = Boolean(label4edit) ? label4edit : `Editar ${defVal.id}`;
  const labelDelete = Boolean(label4Delete) ? label4Delete : `Eliminar Registro`;
  
  //? Se especifica el layout con los componentes que se requieren y el componente Select para las RowsPerPage
  const paginatorTemplate = {
    layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown',
    'RowsPerPageDropdown': (options) => {
      const dropdownOptions = [
          { label:  5, value:  5 },
          { label: 10, value: 10 },
          { label: 20, value: 20 },
          { label: 50, value: 50 },
          { label: 'Todos', value: options.totalRecords }
      ];

      return <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />;
    },
  };

  //? Segundo boton para el formulario de edicion
  const boton2 = {
    label: "Cancelar",
    icon: "pi pi-times",
    iconPosicion: "left",
    estilo: "danger",
    onClick: () => setDialogEdicion(false),
  };

  //& Función para crear un documento de excel con los datos de la tabla.
  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(dataTable);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      saveAsExcelFile(excelBuffer, docTitle);
    });
  };
  //? Complemento para guardar el documento creado en la maquina 
  const saveAsExcelFile = (buffer, fileName) => {
    import("file-saver").then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        let EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], {
          type: EXCEL_TYPE,
        });

        module.default.saveAs(
          data,
          "export" + fileName + new Date().getTime() + EXCEL_EXTENSION
        );
      }
    });
  };

  //#! Reemplazar por helper ---------------------------------------------------------------------------------
  //& Función que exporta los datos de la tabla a un documento PDF.
  const exportPdf = () => {
    // Definir la hoja
    const doc = new jsPDF({
      orientation: "landscape",
      format: pdfPaperSize,       //! [600, 1400] [w, h]
      unit: "pt",
    });

    // Creando la tabla
    doc.autoTable({
      theme: "grid",
      margin: { top: pdfTable_mt },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 3,
      styles: {
        halign: "center",
        valign: "middle",
        font: "helvetica",
        //! cellWidth: "wrap",
        textColor: "black",
        lineColor: [44, 62, 80],
        lineWidth: 1,
      },
      headStyles: {
        fillColor: [150, 230, 21],    // Color de la seccion "Nombre de las columnas"
        // fontSize: 11,
      },

      head: [
        ...pdfHeaderColumns,
        [
          ...cols.map((col) => ({     // spread/esparcir el array hecho por el map
            content: col.header,
            colSpan: 1,
            style: { halign: 'center' }
          }))
        ],
      ],

      columns: cols.map((col) => ({ ...col, dataKey: col.field })),   // columnas
      body: dataTable,                                                // Info de la tabla
      tableWidth: 'wrap',
    });

    // Funcion para añadir elementos al PDF si es necesario
    Boolean(addPdfDesign) && addPdfDesign(doc);

    // Exportar como archivo name.pdf
    doc.save("export" + docTitle + new Date().toLocaleDateString() + ".pdf"); //Titulo de archivo PDF
  };
  //#! Reemplazar por helper --FIN --------------------------------------------------------------------------


  //? Ejemplo de como agrupar las columnas
  const headerGroup = (
    <ColumnGroup>
      <Row>
          <Column header="ABC" rowSpan={2} colSpan={3} />
          <Column header="Sale Rate" colSpan={4} />
      </Row>
      
      <Row>
          <Column header="Sales" colSpan={2} />
          <Column header="Profits" colSpan={2} />
      </Row>

      { !!headerTopRows && headerTopRows({ Row, Column }) }

      <Row>
        {
          cols.map((col) => {
            return (
              <Column
              key={col.field}
              field={col.field}
              header={col.header}
              style={{ width: "auto" }}
              sortable
              />
              );
            })
        }
        {
          accion && (
            <Column
              body={actionTemplate}
              exportable={false}
              style={{ minWidth: "8rem" }}
              className="text-center"
              header={"  Acción"}
            ></Column>
          )
        }
      </Row>
    </ColumnGroup>
  );


  return (
    <div className="datatable-crud-demo">
      <Toast ref={msj} />

      <div className="card">
        <DataTable
          className={ className }
          ref={dt}
          value={dataTable}
          showGridlines
          stripedRows
          resizableColumns
          dataKey={dataKey}
          paginator
          rows={displayRows}
          paginatorTemplate={ paginator && paginatorTemplate}
          removableSort 
          currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} registros"
          responsiveLayout="scroll"
          sortMode='multiple'
            // sortField={dataKey}
            // sortOrder={0}
          multiSortMeta={ !!multiSortMeta ? multiSortMeta : {field: dataKey, order: 0} }
          header={tableHeader}
          headerColumnGroup={ !!headerTopRows ? headerGroup:false }
          emptyMessage={emptyTableMsg}
          scrollable 
          // Darle un alto maximo a la tabla y poder ver siempre los Headers
          scrollHeight="80vh"
          size={size}
        >
          {dynamicColumns}
          {
            accion && (
              <Column
                body={actionTemplate}
                exportable={false}
                style={{ minWidth: "8rem" }}
                className="text-center"
                header={"  Acción"}
              ></Column>
            )
          }
        </DataTable>
      </div>

      {/* //? Es el Dialog que se muestra para editar un registro ya existente en la base de datos */}
      <Dialog
        visible={dialogEdicion}
        header={labelEdit}
        modal
        className=""
        onHide={() => setDialogEdicion(false)}
      >
        <div className="field">
          <FormMaker
            inputs={inputs}
            defaultValues={defVal}
            callBackForSubmit={ (data) => { callBackForUpdate(data);; setDialogEdicion(false) }}
            forButton={{ estilo: "success", label: "Confirmar" }}
            boton2={boton2}
          />
          {/* <Button label='Cancelar' className='mt-4' style={{backgroundColor: "var(--pink-500)", border: "var(--blue-500)" }} icon="pi pi-times"  onClick={ () => setDialogEdicion(false) }/> */}
        </div>
      </Dialog>

      {/* //? Es el dialog que se muestra de confirmación cuando se va a borrar un elemento */}
      <Dialog
        visible={dialogDeleteDisplay}
        style={{ width: "500px" }}
        header={labelDelete}
        onHide={() => setDialogDeleteDisplay(false)}
      >
        <div className="flex justify-content-center">
          <i
            className="pi pi-exclamation-triangle mb-2"
            style={{ fontSize: "4rem", color: " var(--yellow-500)" }}
          />
        </div>
        <div className="flex justify-content-center ">
          {defVal && (
            <span style={{ fontSize: "1.2rem" }}>
              ¿Estas seguro que quieres eliminar el registro 
              <b style={{ color: " var(--yellow-500)" }}> { defVal[idDeleteDialog] || `${defVal.id}`}</b>?
            </span>
          )}
        </div>
        <div className="flex justify-content-evenly  mt-6 ">
          <Button
            label="Confirmar"
            icon="pi pi-check"
            className="p-button-danger w-4"
            onClick={() => { callBackForDelete(defVal); setDialogDeleteDisplay(false); }}
          />
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className=" w-4"
            onClick={() => setDialogDeleteDisplay(false)}
          />
        </div>
      </Dialog>
    </div>
  );
};



TablaComponenteCRUD.propTypes = {
  data: PropTypes.array,
  inputs: PropTypes.array,
  cols: PropTypes.arrayOf( PropTypes.shape( {field: PropTypes.string, header: PropTypes.string} ) ),
  pdfHeaderColumns: PropTypes.arrayOf( PropTypes.arrayOf( PropTypes.shape( { content: PropTypes.string, colSpan: PropTypes.number, rowSpan: PropTypes.number  }))),
  pdfPaperSize: PropTypes.arrayOf( PropTypes.number ),
  multiSortMeta: PropTypes.arrayOf( PropTypes.shape( {field: PropTypes.string, order: PropTypes.number} ) ),
  pdfTable_mt: PropTypes.number,
  displayRows: PropTypes.number,
  docTitle: PropTypes.string,
  editb: PropTypes.bool,
  deleteb: PropTypes.bool,
  exportar: PropTypes.bool,
  accion: PropTypes.bool,
  paginator: PropTypes.bool,
  label4edit: PropTypes.string,
  label4Delete: PropTypes.string,
  emptyTableMsg: PropTypes.string,
  dataKey: PropTypes.string,
  idDeleteDialog: PropTypes.string,
  callBackForUpdate: PropTypes.func,
  callBackForDelete: PropTypes.func,
  addPropsToDefVal: PropTypes.func,
  addPdfDesign: PropTypes.func,
  headerButtons: PropTypes.func,
}

// TablaComponenteCRUD.defaultValues={
//   cols : [],
//   inputs : [],
//   pdfHeaderColumns : [],
//   pdfPaperSize : [900, 1400],
//   pdfTable_mt : 180,
//   docTitle : "doc",
//   editb : true,
//   deleteb : true,
//   exportar : true,
//   accion : true,
//   label4edit : false,
//   label4Delete : false,
//   emptyTableMsg : "No Hay Resultados",
//   dataKey:"id",
//   idDeleteDialog: null,
//   callBackForUpdate: undefined,
//   callBackForDelete: undefined,
//   addPropsToDefVal : false,
//   addPdfDesign : false,
//   wantsPaginator : true,
//   displayRows: 10

// }