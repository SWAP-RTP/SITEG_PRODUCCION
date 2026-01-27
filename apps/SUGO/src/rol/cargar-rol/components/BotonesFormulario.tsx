import React from 'react';
import { Button } from 'primereact/button';
import { BotonesFormularioProps } from '../interfaces/BotonesFormularioProps';

export const BotonesFormulario: React.FC<BotonesFormularioProps> = ({
    sendData,
    limpiarFormulario,
    canSend
}) => {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
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