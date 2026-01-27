import React, { useState } from 'react';
import { ServicioEdit } from '../interfaces/ServicioEdit.interface';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import EditarServicioFormulario from './EditarServicioFormulario';
import { cellStyle, headerCellStyle, tableStyle } from '../../../shared/styles/TableStyles';

interface ServiciosTableProps {
    servicios: ServicioEdit[];
}

const OPERADORES_BASE = [0, 1, 2];
const DIAS = ['Lunes a Viernes', 'Sabado', 'Domingo'];
const TURNOS = [1, 2, 3];

const DIAS_SEMANA = [
    { label: 'Lunes', value: 'L' },
    { label: 'Martes', value: 'M' },
    { label: 'Miércoles', value: 'Mi' },
    { label: 'Jueves', value: 'J' },
    { label: 'Viernes', value: 'V' },
    { label: 'Sábado', value: 'S' },
    { label: 'Domingo', value: 'D' }
];

const ServiciosTable: React.FC<ServiciosTableProps> = ({ servicios }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioEdit | null>(null);

    const rowStyle = (idx: number) => ({
        background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
        transition: 'background 0.2s',
        cursor: 'pointer'
    });

    // Función para abrir el modal con el servicio seleccionado
    const handleEditar = (servicio: ServicioEdit) => {
        // Transforma turno_operadores a operadores_servicios con todas las propiedades requeridas
        let operadores_servicios = servicio.operadores_servicios;
        if (!operadores_servicios && servicio.turno_operadores) {
            operadores_servicios = Object.values(servicio.turno_operadores).map((op: any, idx: number) => ({
                id: op.id ?? '',
                servicio_id: op.servicio_id ?? '',
                turno: op.turno ?? idx + 1,
                operador: op.operador ?? '',
                descansos: op.descansos ?? [],
                credencial: op.credencial ?? '',
                created_at: op.created_at ?? '',
                updated_at: op.updated_at ?? ''
            }));
        }
        // Si tu data no tiene horarios, pon un array vacío para evitar errores
        const horarios = servicio.horarios ?? [];
        setServicioSeleccionado({
            ...servicio,
            operadores_servicios,
            horarios
        });
        setModalVisible(true);
    };

    // Función para cerrar el modal
    const handleCerrarModal = () => {
        setModalVisible(false);
        setServicioSeleccionado(null);
    };

    // Función para agregar un nuevo servicio
    const handleAgregarServicio = () => {
        setServicioSeleccionado({
            economico: 0, // <-- debe ser number, no string
            sistema: '',
            operadores_servicios: [],
            horarios: [],
            turno_operadores: {},
            no: 0,
            'Lunes a Viernes': {},
            'Sabado': {},
            'Domingo': {}
        } as ServicioEdit);
        setModalVisible(true);
    };

    return (
        <div style={{ marginBottom: 40, position: 'relative' }}>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: 3,
                justifyContent: 'space-between'
            }}>
                <div>
                    <label style={{ fontWeight: 600, fontSize: 17 }}>Servicios</label>
                </div>
                <div style={{ marginTop: 12 }}>
                    <Button
                        label="Agregar servicio"
                        icon="pi pi-calendar-plus"
                        severity="success"
                        style={{
                            height: 40,
                            minWidth: 180
                        }}
                        onClick={handleAgregarServicio}
                    />
                </div>
            </div>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={headerCellStyle}>#</th>
                        <th style={headerCellStyle}>Económico</th>
                        <th style={headerCellStyle}>Sistema</th>
                        <th style={headerCellStyle}>1er Turno</th>
                        <th style={headerCellStyle}>2do Turno</th>
                        <th style={headerCellStyle}>3er Turno</th>
                        <th style={headerCellStyle}>Descansos</th>
                        <th style={headerCellStyle}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {(servicios ?? []).map((servicio, idx) => {
                        // Unifica los días de descanso de los tres turnos sin repetir
                        const descansosSet = new Set([
                            ...(servicio.turno_operadores?.['Turno 1']?.descansos ?? []),
                            ...(servicio.turno_operadores?.['Turno 2']?.descansos ?? []),
                            ...(servicio.turno_operadores?.['Turno 3']?.descansos ?? [])
                        ]);
                        const descansos = Array.from(descansosSet).join(', ') || '-'; // Muestra '-' si no hay descansos
                        return (
                            <tr key={idx} style={rowStyle(idx)}>
                                <td style={cellStyle}>{idx + 1}</td>
                                <td style={cellStyle}>{servicio.economico}</td>
                                <td style={cellStyle}>{servicio.sistema}</td>
                                <td style={cellStyle}>{servicio.turno_operadores?.['Turno 1']?.credencial ?? '-'}</td>
                                <td style={cellStyle}>{servicio.turno_operadores?.['Turno 2']?.credencial ?? '-'}</td>
                                <td style={cellStyle}>{servicio.turno_operadores?.['Turno 3']?.credencial ?? '-'}</td>
                                <td style={cellStyle}>{descansos}</td>
                                <td style={cellStyle}>
                                    <Button
                                        icon="pi pi-pencil"
                                        className="p-button-rounded p-button-text p-button-lg"
                                        tooltip="Editar"
                                        severity="info"
                                        onClick={() => handleEditar(servicio)}
                                    />
                                    <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-lg" tooltip="Borrar" severity="danger" style={{ marginLeft: 8 }} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Modal para editar servicio */}
            <Dialog
                header="Editar Servicio"
                visible={modalVisible}
                style={{ width: '80vw', maxWidth: 1200 }} // ancho del dialog 
                onHide={handleCerrarModal}
                modal
            >
                {servicioSeleccionado && (
                    <EditarServicioFormulario
                        servicio={servicioSeleccionado}
                        onCancel={handleCerrarModal}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default ServiciosTable;
