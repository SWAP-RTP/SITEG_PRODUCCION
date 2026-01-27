export interface BotonesFormularioProps {
    error?: any[];
    showErr?: boolean;
    mod: any;
    periodo: any;
    sendData: () => void;
    limpiarFormulario: () => void;
    excel: File | undefined;
    setExcel: (file: File | undefined) => void;
    periodoError: boolean;
    setPeriodoError: (value: boolean) => void;
    moduloError: boolean;
    setModuloError: (value: boolean) => void;
    canSend: boolean;
}
