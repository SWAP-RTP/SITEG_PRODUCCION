/**
 * Componente para Generar Tablas con las Funcionalidades de un CRUD
 * @module TablaComponenteCRUD
 */
import React, { useEffect, useState, useRef, useId } from "react";
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
import { FormMaker } from "../FormMaker";
import { TablaCRUDProps } from "./interfaces";
import { exportTablePDF } from "../../utilities/makeTablePDF";
import { exportJsonToExcel } from "../../utilities/exportXLSX";
import { getInnerText } from "../../helpers/forHTML";


export const TablaCRUD = ({
  data=[],
  cols = [],
  // name='',
  title='', 
  inputs = [],
  docTitle,
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
  addPropsToDefVal,
  paginator = true,
  displayRows= 10,
  size = 'small',
  headerTable,
  className= '',
  multiSortMeta=[],
  headerTopRows,
  optionsPDF,
  handleExportPDF,
  dataTableProps
}: TablaCRUDProps) => {

  // const titleString = !!title ? 
  // (typeof title == 'string' ? title : getInnerText(title) ) 
  // : undefined;  

  //& declaracion de useId, useRef y useStates
  const inputId = useId();  // id para el input del global filter
  const dt = useRef(null);  // Hace la referencia para identificar la tabla. dt = dataTable
  const msj = useRef(null); // Toast (componente)
  const [dataTable, setDataTable] = useState<any[]>([]);        // Almacena los datos a renderizar en la tabla.
  const [filteredData, setFilteredData] = useState<any[]>([]); 
  const [dataToExport, setDataToExport] = useState<any[]>([]);
  const [defVal, setDefVal] = useState< Record<any, any> >({}); // Almacena los datos de el registro del elemento editar
  const [dialogEdicion, setDialogEdicion] = useState(false);    
  const [dialogDelete, setDialogDelete] = useState(false);
  const renderizado = useRef(true); // Hace la referencia para que el useEffect para agregar propiedades al elemento a editar no haga una acción al renderizar por primera vez

  //& useEffect para setear data (por decir algo)
  useEffect(() => {   // Datos para rellenar los datos de la Tabla
    // console.log(name, data);
    if(data && data.length>0) setDataTable(data);
  }, [data]);

  useEffect(() => {
    const data = filteredData.length > 0 ? filteredData : dataTable;
    setDataToExport( data );
  }, [filteredData])
  
  //& Filtros para la tabla
  const [globalFilterValue, setGlobalFilterValue] = useState("");   // Gestiona el estado del input de filtro global.
  const [filterFields, setFilterFields] = useState<string[]>([]);   // Lo ocupa la prop del componente DataTable.globalFilterFields
  //? Gestiona el estado de los filtros de la tabla.
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  //? Función que vincula el filtro global al valor ingresado en el input del buscador.
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters1 = { ...filters };
    _filters1["global"].value = value;

    setFilters(_filters1);
    setGlobalFilterValue(value);
  };
  //? Añadir filtros a las columnas que lo requieran
  useEffect(() => {
    const newFilters = {}
    const filterFields = cols.map(col => {
      if( col.filter ){
        newFilters[col.field] = { value: null, matchMode: FilterMatchMode.CONTAINS }
        return col.field
      } else return undefined
    }).filter(Boolean);

    setFilters( prev => ({
      ...prev,
      ...newFilters
    }));
    setFilterFields( filterFields as string[] );
  }, [cols]);
    

  //& Columnas
  //? Columnas para Renderizar la Tabla
  const dynamicColumns = cols.map((col) => {
    return (
      <Column
        key={col.field}
        style={{ 
          width: "auto", 
          minWidth: filterFields.find( field => field == col.field ) ? '12rem':undefined,
          ...col.style, 
        }}
        sortable
        {...col}
      />
    );
  });

  //? Función que renderiza la columan Accion con los botones de editar y eliminar dependiendo los permisos del usuario en la última columna de la tabla.
  const actionColumn = (rowData:Record<string,any>={}) => {
    const {editButton, deleteButton} = rowData
    return (
      <div className="flex flex-wrap align-items-center justify-content-center gap-3">
        { editb && (editButton===undefined || editButton) &&
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-success"
            onClick={() => openDialog(rowData, 'edit')}
          />
        }
        { deleteb && (deleteButton===undefined || deleteButton) &&
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-warning"
            onClick={() => openDialog(rowData, 'delete')}
          />
        }
      </div>
    );
  };
  //? Función que se ejecuta al presionar algun botón de la columna Accion (actionColumn), llena el formulario para editar un registro.
  const openDialog = (rowData, type: 'edit'|'delete') => {
    setDefVal({ ...rowData });
    if(type==='edit')setDialogEdicion(true);
    if(type==='delete')setDialogDelete(true);
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
  const labelEdit = Boolean(label4edit) ? label4edit : `Editar registro ${defVal.id}`;
  const labelDelete = Boolean(label4Delete) ? label4Delete : `Eliminar Registro`;
  
  //& Header
  //? Función que renderiza el header de la tabla, en donde está el buscador global y botones de exportar data
  const tableHeader = () => (
  <div className="flex justify-content-between ">
    <span className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText
        name={inputId}
        value={globalFilterValue}
        onChange={onGlobalFilterChange}
        placeholder="Búsqueda"
        className="h-3rem"
        style={{minWidth: '9rem', maxWidth: '20rem'}}
      />
    </span>
    <div className="flex pb-2 column-gap-2">
      { !!headerTable && headerTable() }
      {exportar && 
      <>
        <Button
          type="button"
          icon="pi pi-file-pdf"
          onClick={ () => {
            if( handleExportPDF) handleExportPDF(dataToExport);
            else exportPDF(dataToExport, { docTitle, cols, optionsPDF })
          }}
          className="p-button-danger"
          tooltip="Exportar PDF"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          type="button"
          icon="pi pi-file-excel"
          onClick={ () => exportXLSX(dataToExport, { docTitle }) }
          className="p-button-success"
          tooltip="Exportar Excel"
          tooltipOptions={{ position: "top" }}
        />
      </>
      }
    </div>
  </div>
  );
  //? Añadir y agrupar filas del header (Siempre renderizar hasta abajo "dynamicColumns")
    // Solo se renderiza si existe headerTopRows 
  const headerGroup = (
    <ColumnGroup>
      { !!headerTopRows && headerTopRows({ Row, Column })}
      <Row>
        { dynamicColumns }
        {
          accion && (
            <Column
              body={actionColumn}
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

  //& Footer
  //? Se especifica el layout con los componentes que se requieren y el componente Select para las RowsPerPage
  const paginatorTemplate = {
    layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown',
    RowsPerPageDropdown: (options) => {   //  →                  →                 →                 ↑
      if(dataTable.length==0) return undefined;
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



  return (
    <>
      <Toast ref={msj} />

      <div style={{maxWidth: '100%'}}>
        {/* { typeof title == 'string' 
        ? <span className="block text-2xl font-bold my-3"> { title } </span>
        : title
        } */}

        <DataTable
          dataKey={dataKey}   // Name of the field that uniquely identifies a record in the data
          ref={dt}
          value={dataTable}
          onValueChange={(filteredValue) => setFilteredData(filteredValue) }
          // Estilos
          className={ className }
          resizableColumns
          scrollable 
          scrollHeight="80vh" // Darle un alto maximo a la tabla para poder ver siempre los Headers
          stripedRows size={size}   // Estilo a las filas
          // showGridlines 
          // Sort
          sortMode='multiple'
          multiSortMeta={ !!multiSortMeta ? multiSortMeta : [{field: dataKey, order: 0}] }
          removableSort
          // Header & Footer 
          emptyMessage={emptyTableMsg}
          header={tableHeader}
          headerColumnGroup={ !!headerTopRows ? headerGroup:false }
          paginator
          paginatorTemplate={ paginator ? paginatorTemplate:undefined}
          currentPageReportTemplate={ dataTable.length>0 ? "Mostrando del {first} al {last} de {totalRecords} registros": ""}
          rows={displayRows}  // Number of rows to display per page.
          // Filters
          filters={filters}
          filterDisplay={ filterFields.length>0 ? "row":undefined} 
          globalFilterFields={ filterFields.length>0 ? filterFields:undefined} 
          {...dataTableProps}
        >
          { dynamicColumns }
          {
            accion && (
              <Column
                body={actionColumn}
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
            callBackForSubmit={ (data) => { callBackForUpdate(data); setDialogEdicion(false) }}
            forButton={{ estilo: "success", label: "Confirmar" }}
            boton2={ { label: "Cancelar", icon: "pi pi-times", estilo: "danger", onClick: () => setDialogEdicion(false) } }
          />
          {/* <Button label='Cancelar' className='mt-4' style={{backgroundColor: "var(--pink-500)", border: "var(--blue-500)" }} icon="pi pi-times"  onClick={ () => setDialogEdicion(false) }/> */}
        </div>
      </Dialog>

      {/* //? Es el dialog que se muestra de confirmación cuando se va a borrar un elemento */}
      <Dialog
        visible={dialogDelete}
        style={{ width: "500px" }}
        header={labelDelete}
        onHide={() => setDialogDelete(false)}
      >
        <i className="pi pi-exclamation-triangle mb-2 text-center w-12 text-yellow-500" style={{ fontSize: "4rem" }}/>
        <span className="text-xl flex-center">
          ¿Estas seguro que quieres eliminar el registro‎ 
          <b className="text-yellow-500"> { defVal[idDeleteDialog] || `${defVal?.id}`}</b>?
        </span>

        <div className="flex justify-content-evenly mt-4">
          <Button
            label="Confirmar"
            icon="pi pi-check"
            className="p-button-danger w-4"
            outlined
            onClick={() => { callBackForDelete(defVal); setDialogDelete(false); }}
          />
          <Button
            label="Cancelar"
            severity="warning"
            icon="pi pi-times"
            className=" w-4"
            onClick={() => setDialogDelete(false)}
          />
        </div>
      </Dialog>
    </>
  );
};



// HELPERS

const exportPDF = ( data, options:{docTitle, cols, optionsPDF?} ) => {
  const { docTitle, cols, optionsPDF } = options || {};
  const { bloburl } = exportTablePDF( data, cols as any, { 
    autoSave: false,
    title: docTitle,
    ...optionsPDF 
  } )
  window.open( bloburl, '_blank' )
}
const exportXLSX = ( data, { docTitle } ) => {
  exportJsonToExcel(data, { 
    docTitle 
  });
}