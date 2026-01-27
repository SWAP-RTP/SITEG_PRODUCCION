import React from 'react';
import {JornadaExcepcionalProps} from '../interfaces/JornadaExcepcionalProps';


export const TablaJornadaExcepcional: React.FC<JornadaExcepcionalProps> = ({ data }) => { // Días de la semana para la tabla
    const dias = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];
    return (
        <table style={{ borderCollapse: 'collapse', fontSize: 12, marginBottom: 14, minWidth: 700 }}>
            <caption style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8, textAlign: 'center' }}>
                {/* Información del operador y lugar */}
                Credencial: {data.operador ? data.operador : 'N/A'} — Lugar: {data.lugar ? data.lugar : 'N/A'}
            </caption>
            <thead>
                <tr style={{ background: '#f7f7f7' }}>
                    <th style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>Hora de inicio</th>
                    <th style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>Hora de término</th>
                    {dias.map(dia => ( // Genera las cabeceras de los días
                        <th key={dia} style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{dia}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{data.hora_inicio || '-'}</td>
                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{data.hora_termino || '-'}</td>
                    {dias.map(dia => ( // Genera las celdas de los días
                        <td key={dia} style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>
                            {/* Mostrar el valor del día o un guion si no hay datos */}
                            {data.dias_servicio && data.dias_servicio[dia] !== undefined && data.dias_servicio[dia] !== null && String(data.dias_servicio[dia]).trim() !== ''
                                ? data.dias_servicio[dia]
                                : '-'}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
};
