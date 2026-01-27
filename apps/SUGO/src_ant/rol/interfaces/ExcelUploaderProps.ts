export interface ExcelUploaderProps {
    canUpload: boolean;
    periodo: any; // Cambia a tipo específico si lo tienes
    modulo: any;     // Cambia a tipo específico si lo tienes
    setExcel: (file: File | undefined) => void;
    periodoValue: any; // Cambia a tipo específico si lo tienes
    moduloValue: any;  // Cambia a tipo específico si lo tienes
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleSelectArchivo: () => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showError: boolean;
}
