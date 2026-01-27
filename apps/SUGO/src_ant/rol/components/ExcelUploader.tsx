import React from 'react';
import { ExcelUploaderProps } from '../interfaces/ExcelUploaderProps';
import { Button } from 'primereact/button';

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
    fileInputRef,
    handleSelectArchivo,
    handleFileSelect
}) => {
    return (
        <div>
            <Button
                type="button"
                onClick={handleSelectArchivo}
                label="Seleccionar Excel"
                icon="pi pi-file-excel"
                className="btn-form"
            />
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
        </div>
    );
};