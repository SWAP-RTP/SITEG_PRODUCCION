export interface RolFormularioState {
    periodo: any;
    setPeriodo: (p: any) => void;
    periodos: any[];
    modulo: any;
    setModulo: (m: any) => void;
    modulos: any[];
    excel: any;
    setExcel: (e: any) => void;
    errores: any[];
    error: string;
    isLoading: boolean;
    validatingData: boolean;
    canUpload: boolean;
    showErr: boolean;
    cont: number;
    sendData: () => void;
    limpiarFormulario: () => void;
    rolesSended: any[];
}
