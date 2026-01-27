import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { ModuloSelectorProps } from '../interfaces/ModuloSelectorProps';

export const ModuloSelector: React.FC<ModuloSelectorProps> = ({ modulo, setModulo, opciones, hasError = false }) => {
    return (
        <Dropdown
            className={`w-full ${hasError ? 'p-invalid' : ''}`}
            value={modulo}
            options={opciones}
            onChange={(e: { value: any }) => setModulo(e.value)}
            placeholder="Seleccione un módulo"
            optionLabel="label"
        />
    );
};
