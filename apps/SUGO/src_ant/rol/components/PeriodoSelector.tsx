import React from 'react';
import { Dropdown } from 'primereact/dropdown';

interface PeriodoSelectorProps {
    periodo: any;
    setPeriodo: (p: any) => void;
    opciones: { label: string; value: any }[];
}

export const PeriodoSelector: React.FC<PeriodoSelectorProps> = ({ periodo, setPeriodo, opciones }) => {
    return (
        <Dropdown
            className="w-full"
            value={periodo}
            options={opciones} // Asegúrate de que las opciones tengan el formato correcto
            onChange={(e) => setPeriodo(e.value)}
            placeholder="Seleccione un periodo"
            optionLabel="label" // Propiedad que se muestra en el Dropdown
        />
    );
};