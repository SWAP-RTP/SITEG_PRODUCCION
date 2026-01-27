import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { PeriodoSelector } from '../../shared/components/PeriodoSelector'; // Importa el selector de periodo compartido
import { ModuloSelector } from '../../shared/components/ModuloSelector'; // Importa el selector de módulo compartido
import { ErroresRol } from './ErroresRol'; // Componente para mostrar errores y estado de validación
import { BotonesFormulario } from './BotonesFormulario'; // Componente para los botones del formulario
import { BotonDescargaPlantilla } from './BotonDescargaPlantilla'; // Componente para el botón de descarga de plantilla
import { useRolFormulario } from '../hooks/useRolFormulario'; // Hook personalizado para el formulario de rol
import { useArchivoHandlers } from '../hooks/useArchivoHandlers'; // Hook para manejar selección de archivo
import { useSelectoresRol } from '../../shared/hooks/useSelectoresRol'; // Hook compartido para manejar selectores y validación
import { RolesCargados } from './RolesCargados'; // Componente para mostrar roles cargados por módulo
import { BotonRutasAutorizadas } from './BotonRutasAutorizadas'; // Componente para el botón de rutas autorizadas


/**
 * Componente principal para el formulario de carga de roles.
 * Flujo: Cargar archivo → Llenar formulario → Enviar → Mostrar recuadro → Clic recuadro → Modal completo
 */

export const RolFormulario = () => {
    const [reloadRoles, setReloadRoles] = useState(0);

    // Hook personalizado que gestiona el estado y lógica del formulario
    const {
        periodo, setPeriodo, periodos,
        modulo, setModulo, modulos,
        errores, error, isLoading, validatingData,
        canUpload, showErr, cont,
        sendData, limpiarFormulario,
        rolesSended,
        periodoError, setPeriodoError, moduloError, setModuloError,
        excel, setExcel,
        fileInputKey, showSuccess
    } = useRolFormulario();


    // Referencia para el input file oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Procesa el archivo solo al cargar, no al enviar
    const handleSendData = async () => {
        const result = await sendData();
        if (result?.ok) {
            setReloadRoles(prev => prev + 1);
        }
    };
    // Restaurar handlers para validación al seleccionar archivo
    const { handleSelectArchivo, handleFileSelect } = useArchivoHandlers(
        periodo, modulo, setPeriodoError, setModuloError, fileInputRef, setExcel
    );
    const { handlePeriodoChange, handleModuloChange } = useSelectoresRol();

    // Solo muestra el botón "Enviar" si todos los campos requeridos están completos y hay archivo
    const canSend = periodo && modulo && excel;


    return (
        <div>
            {/* Mensaje de éxito temporal */}
            {showSuccess && (
                <div style={{ background: '#43a047', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '10px', textAlign: 'center' }}>
                    ¡Registro exitoso!
                </div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                    <div className="w-3">
                        <PeriodoSelector
                            periodo={periodo}
                            setPeriodo={setPeriodo}
                            opciones={periodos}
                            hasError={periodoError}
                        />
                        {periodoError && (
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                Selecciona un periodo
                            </span>
                        )}
                    </div>
                    <div className="w-2">
                        <ModuloSelector
                            modulo={modulo}
                            setModulo={setModulo}
                            opciones={modulos}
                            hasError={moduloError}
                        />
                        {moduloError && (
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                Selecciona un módulo
                            </span>
                        )}
                    </div>
                    <Button
                        label={excel ? `${excel.name}` : "Seleccionar Archivo"}
                        icon="pi pi-upload"
                        iconPos="left"
                        onClick={handleSelectArchivo}
                        className="btn-form"
                        severity='info'
                        style={{ width: 'auto', maxWidth: '100%', height: '40px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '32px', paddingLeft: '16px' }}
                    />
                    <input
                        key={fileInputKey}
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    <BotonesFormulario
                        sendData={handleSendData}
                        limpiarFormulario={limpiarFormulario}
                        canSend={!!canSend}
                    />
                    <BotonDescargaPlantilla />
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <BotonRutasAutorizadas />
                </div>
            </div>


            <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
                {/* Componente para mostrar roles cargados por módulo */}
                <div style={{ flex: 1 }}>
                    <RolesCargados periodo={periodo} reload={reloadRoles} />
                </div>
                {/* Componente para mostrar errores y estado de validación */}
                <div style={{ maxWidth: 700, flex: 0.6 }}>
                    <ErroresRol
                        errores={errores}
                        showErr={showErr}
                        isLoading={isLoading}
                        validatingData={validatingData}
                        cont={cont}
                    />
                </div>

            </div>
        </div>
    );
};