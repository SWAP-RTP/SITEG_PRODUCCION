
export interface FormInput {
    id: string,
    label: string,
    info?: string,
    bigInfo?: string,
    cols?: number,
    inputType?: 'inputText' | 'select' | 'multiSelect' | 'calendar' | 'mask',
    disabled?: boolean,
    selectionModeForCal?: "single" | "multiple" | "range",
    canSelectAll?: boolean,
    optionsforSelect?: {code: any, name: string}[],
    validaciones?: {
        required?: {value: boolean, message: string } | boolean, 
        maxLength?: {value: number, message: string }, 
        minLength?: {value: number, message: string }, 
        max?: {value: number, message: string }, 
        min?: {value: number, message: string }, 
        pattern?: {value: RegExp, message: string }, 
        valueAsNumber?: boolean,
        valueAsDate?: boolean,
        validate?: (value: any) => boolean | string ,
        
    },
    properties?: any,  
    unregister?: boolean,
    callBackForOnBlur?: ( {e, setValue, getValues, setError, clearErrors } ) => void,
    callBackForOnChange?: ( {e, getValues, setValue } ) => void,
    callBackForRender?: ( watch: () => void ) => void,
}



//* ************ Valores por Defecto ************ *//

//* cols: 3                 // Por defecto 
//* inputType: 'inputText'  // Por defecto, unicas opciones 'select', 'multiSelect' y 'calendar'
//* disabled: false         //! Por defecto false
//* selectionModeForCal="string"    // "single" (default), "multiple" and "range"
//* canSelectAll= Boolean   // Por defecto false, para Multi-Selects 


//^ ************ Valores Requeridos ************ *//

//^ id: "string"    // Identificador
//^ label: "string" // Etiqueta a Mostrar en el Campo


//? ************ Valores Opcionales ************ *//

//? info: "string"         // Mensaje a mostrar en el tooltip
//? bifInfo: "string"      // Mensaje a mostrar en un desplegable
//? cols: "number"         // Número de columnas que ocupa el 
//? optionsforSelect: "array de {code: any, name: "string"}"         // Opciones para Select y Multi-Select
//? callBackForOnBlur: "metodo"      // Funcion que se ejecuta al evento onBlur
//? callBackForOnChange: "metodo"      // Funcion que se ejecuta al evento onChange
//? callBackForRender: "metodo"      // Funcion que condiciona el renderizado de un input (y controler)
//? disabled: true         // Para deshabilitar un Campo
//? validaciones: "objeto" // { { tipodevalidacion:{value: "", message: "" }, required: `*Campo Requerido`, } }
//? properties: "objeto"   // consultar propiedades en: https://www.primefaces.org/primereact/autocomplete/

/**
        cols: string, 
        id: string, 
        label: string, 
        value: string, 
        info: string, 
        bigInfo: string, 
        canSelectAll: string, 
        callBackForOnBlur: string, 
        validaciones: string, 
        disabled: string, 
        selectionModeForCal: string, 
        inputType: string, 
        options: string,   
        callBackForOnChange: string, 
        callBackForRender: string, 
        properties: string, 
 */