// -------------------------------------------------------------
// Componente modularizado: ModalGlosario
// Este componente muestra el modal de detalle para servicios,
// cubredescansos y jornadas excepcionales.
// Extraído desde RolesCargados.tsx para mejor organización.
// -------------------------------------------------------------

// Importaciones necesarias
import React from 'react';
import { TablasTurno } from './TablasTurno';
import { TablaCubreDescanso } from './TablaCubreDescanso';
import { TablaJornadaExcepcional } from './TablaJornadaExcepcional';

// Componente principal ModalGlosario
// Recibe open, onClose, data, tipo y periodo para mostrar el detalle correspondiente
export const ModalGlosario: React.FC<{ open: boolean, onClose: () => void, data: any, tipo: string, periodo: any }> = ({ open, onClose, data, tipo, periodo }) => {
    // Si el modal no está abierto, no se renderiza nada
    if (!open) return null;
    // Turnos disponibles para mostrar en servicios
    const turnos = [1, 2, 3];
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 8,
                padding: 24,
                minWidth: 900,
                maxWidth: 1400,
                width: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 2px 24px 0 rgba(0, 255, 42, 0.25)',
                border: '2px solid #3c873fff',
                position: 'relative'
            }}>
                {/* Botón para cerrar el modal */}
                <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 16,
                        background: 'transparent',
                        border: 'none',
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#43a047',
                        cursor: 'pointer',
                        lineHeight: 1
                    }}
                >
                    &#10005;
                </button>
                {/* Renderiza el contenido según el tipo: servicio, cubredescanso o jornada */}
                {tipo === 'servicio' ? (
                    <>
                        <div style={{ marginBottom: 12, textAlign: 'center', fontSize: 20 }}>
                            <strong>Económico:</strong> {data.economico} &nbsp;
                            <strong>Sistema:</strong> {data.sistema}
                        </div>
                        {/* Muestra las tablas por turno */}
                        {turnos.map(turno => (
                            <TablasTurno key={turno} data={data} turno={turno} periodo={periodo} />
                        ))}
                    </>
                ) : tipo === 'cubredescanso' ? (
                    <div style={{ marginBottom: 12, fontSize: 16, textAlign: 'center' }}>
                        <div style={{ marginBottom: 8, fontSize: 16 }}> 
                            <strong>SERVICIOS A CUBRIR</strong> &nbsp;
                        </div>
                        
                        {/* Se pasa la estructura esperada: un objeto con cubredescansos como arreglo */}
                        <TablaCubreDescanso data={{ cubredescansos: [data] }} />
                    </div>
                ) : tipo === 'jornada' ? (
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
                        <TablaJornadaExcepcional data={data} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};
