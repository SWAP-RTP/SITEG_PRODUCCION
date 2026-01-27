import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { PeriodoSelectorProps } from '../interfaces/PeriodoSelectorProps';

export const PeriodoSelector: React.FC<PeriodoSelectorProps> = ({ periodo, setPeriodo, opciones, hasError = false }) => {
    return (
        <Dropdown
            className={`w-full ${hasError ? 'p-invalid' : ''}`}
            value={periodo}
            options={opciones}
            onChange={(e) => setPeriodo(e.value)}
            placeholder="Seleccione un periodo"
            optionLabel="label"
        />
    );
};
