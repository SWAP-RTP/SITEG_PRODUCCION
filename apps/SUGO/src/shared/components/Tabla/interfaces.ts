import { DataTableProps, DataTableValueArray } from 'primereact/datatable';
import { Options as MakeTablePDF_Options } from './../../utilities/makeTablePDF';
import { ColumnHeaderOptions, ColumnProps } from "primereact/column"
import { Row, RowProps } from 'primereact/row';


export type ColsProps = ColumnProps & { 
    field: string, 
    header: React.ReactNode | ((options: ColumnHeaderOptions) => React.ReactNode), 
}
export interface HeadeTopRowsProps { Row: any, Column: any }


export interface TablaCRUDProps {
    // data: any[] | undefined      
    data: (Record<string, any>&{editButton?: boolean, deleteButton?: boolean})[] | undefined      
    cols: ColsProps[]
    title?: string | JSX.Element; 
    inputs?: any[]
    docTitle?: string
    editb?: boolean
    deleteb?: boolean
    exportar?: boolean
    accion?: boolean
    label4edit?: boolean
    label4Delete?: boolean
    emptyTableMsg?: string
    dataKey?: string        // keyof ...
    idDeleteDialog?: string
    callBackForUpdate?        ; // callBackForUpdate,
    callBackForDelete?        ; // callBackForDelete,
    addPropsToDefVal?: (defVal: any) => void
    paginator?: boolean
    displayRows?: number
    size?: 'small' | 'normal' | 'large';
    className?: string
    optionsPDF?: MakeTablePDF_Options;
    handleExportPDF?: (data: any[]) => void;
    headerTable?          ; //headerButtons,
    multiSortMeta?:       {field, order}[]; //multiSortMeta=[],
    headerTopRows?:       (params: HeadeTopRowsProps ) => any; //headerTopRows=undefined
    dataTableProps?: DataTableProps<DataTableValueArray>;
}