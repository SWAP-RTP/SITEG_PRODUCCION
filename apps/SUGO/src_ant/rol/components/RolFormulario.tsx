import React, { useState, useRef } from 'react';
import { PeriodoSelector } from './PeriodoSelector';
import { ModuloSelector } from './ModuloSelector';
import { ErroresRol } from './ErroresRol';
import { RolesEnviados } from './RolesEnviados';
import { BotonesFormulario } from './BotonesFormulario';
import { ExcelUploader } from './ExcelUploader';
import { useRolFormulario } from '../hooks/useRolFormulario';
import { useArchivoHandlers } from '../hooks/useArchivoHandlers';

/**
 * Componente principal para el formulario de carga de roles.
 */

export const RolFormulario = () => {
    // Hook personalizado que gestiona el estado y lógica del formulario
    const {
        periodo, setPeriodo, periodos,        // Estado y opciones para el periodo
        modulo, setModulo, modulos,           // Estado y opciones para el módulo
        excel, setExcel,                      // Estado para el archivo Excel cargado
        errores, error, isLoading, validatingData, // Estados de validación y errores
        canUpload, showErr, cont,             // Estados auxiliares para la UI
        sendData, limpiarFormulario,          // Funciones para enviar y limpiar el formulario
        rolesSended                           // Estado para roles enviados
    } = useRolFormulario();

    // Estados para mostrar errores visuales en los selects de periodo y módulo
    const [periodoError, setPeriodoError] = useState(false);
    const [moduloError, setModuloError] = useState(false);

    // Referencia para el input file oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Obtiene los handlers desde el hook personalizado
    const { handleSelectArchivo, handleFileSelect } = useArchivoHandlers( periodo, modulo, setPeriodoError, setModuloError, fileInputRef );

    // Solo muestra el botón "Enviar" si todos los campos requeridos están completos
    const canSend = periodo && modulo?.name && excel;

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <div className="w-3"> 
                    {/* Selector de periodo, muestra mensaje de error si corresponde */}
                    <PeriodoSelector
                        periodo={periodo}
                        setPeriodo={setPeriodo}
                        opciones={periodos}
                    />
                    {periodoError && (
                        <span style={{ color: 'red', fontSize: '12px' }}>
                            Selecciona un periodo
                        </span>
                    )}
                </div>
                <div className="w-2"> 
                    {/* Selector de módulo, muestra mensaje de error si corresponde */}
                    <ModuloSelector
                        modulo={modulo}
                        setModulo={setModulo}
                        opciones={modulos}
                    />
                    {moduloError && (
                        <span style={{ color: 'red', fontSize: '12px' }}>
                            Selecciona un módulo
                        </span>
                    )}
                </div>
                {/* Componente para seleccionar archivo Excel */}
                <ExcelUploader
                    fileInputRef={fileInputRef}
                    handleSelectArchivo={handleSelectArchivo}
                    handleFileSelect={e => handleFileSelect(e, setExcel)}
                    showError={false}
                    canUpload={canUpload}
                    periodo={periodo}
                    modulo={modulo}
                    setExcel={setExcel}
                    periodoValue={periodo}
                    moduloValue={modulo}
                />
                {/* Botones de enviar y limpiar, recibe todos los estados y handlers necesarios */}
                <BotonesFormulario
                    error={Array.isArray(error) ? error : []} // Asegura que sea un array
                    showErr={showErr}
                    mod={modulo}
                    periodo={periodo}
                    sendData={sendData}
                    limpiarFormulario={limpiarFormulario}
                    excel={excel}
                    setExcel={setExcel}
                    periodoError={periodoError}
                    setPeriodoError={setPeriodoError}
                    moduloError={moduloError}
                    setModuloError={setModuloError}
                    canSend={!!canSend}
                />
            </div>

            {/* Componente para mostrar los roles enviados */}
            <RolesEnviados periodo={periodo} modulo={modulo?.name?.slice(2)} deps={[rolesSended]} />

            {/* Componente para mostrar errores y estado de validación */}
            <ErroresRol
                errores={errores} 
                showErr={showErr}
                isLoading={isLoading}
                validatingData={validatingData}
                cont={cont}
            />
        </div>
    );
};