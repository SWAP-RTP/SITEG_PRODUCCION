import { Button } from 'primereact/button';
import { BotonesFormularioProps } from '../interfaces/BotonesFormularioProps';
import React from 'react';

// Componente que muestra los botones de "Enviar" y "Limpiar".
// El botón "Enviar" solo se muestra si canSend es true (todos los campos requeridos están completos).
export const BotonesFormulario: React.FC<BotonesFormularioProps> = ({
    sendData,
    limpiarFormulario,
    canSend
}) => {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {/* Botón Enviar, solo visible si canSend es true */}
            {canSend && (
                <Button
                    label='Enviar'
                    icon='pi pi-send'
                    iconPos='left'
                    severity='help'
                    onClick={sendData}
                    className="btn-form"
                    style={{ width: '130px', height: '40px' }}
                />
            )}
            {/* Botón Limpiar, siempre visible */}
            <Button
                label='Limpiar'
                icon='pi pi-trash'
                severity='danger'
                onClick={limpiarFormulario}
                className="btn-form"
                style={{ width: '130px', height: '40px' }}
            />
        </div>
    );
};