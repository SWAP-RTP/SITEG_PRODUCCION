/**
 * Componente para mostrar la información de cubredescansos.
 * Solo muestra los datos relevantes de la propiedad cubredescansos en data.
 * @param data - Objeto que contiene la propiedad cubredescansos (arreglo)
 */
export const TablaCubreDescanso = ({ data }: { data: any }) => {
    // Validar que data.cubredescansos sea un arreglo
    // Filtrar cubredescansos que tengan al menos un turno con información
    const cubredescansosArr = Array.isArray(data?.cubredescansos)
        ? data.cubredescansos.filter((cd: any) => Array.isArray(cd.cubredescansos_turnos) && cd.cubredescansos_turnos.length > 0)
        : [];

    return (
        <div>
            {cubredescansosArr.length === 0 ? (
                <p>No hay cubredescansos para mostrar.</p>
            ) : (
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                    {cubredescansosArr.map((cd: any, idx: number) => (
                        <table key={cd.id} style={{ borderCollapse: 'collapse', fontSize: 12, marginBottom: 14, minWidth: 700 }}>
                            <caption style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>
                                {/* Información del cubredescanso */}
                                Económico: {cd.economico ? cd.economico : 'N/A'} — Sistema: {cd.sistema ? cd.sistema : 'N/A'}
                            </caption>
                            <thead>
                                <tr style={{ background: '#f7f7f7' }}>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Turno</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Operador</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Lunes</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Martes</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Miércoles</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Jueves</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Viernes</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Sábado</th>
                                    <th style={{ border: '1px solid #eee', padding: 6 }}>Domingo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cd.cubredescansos_turnos.map((turno: any) => ( // Iterar sobre los turnos de cubredescanso
                                    <tr key={turno.id}>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.turno}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.operador}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.servicios_a_cubrir.L}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.servicios_a_cubrir.M}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.servicios_a_cubrir.Mi}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.servicios_a_cubrir.J}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.servicios_a_cubrir.V}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.servicios_a_cubrir.S}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{turno.servicios_a_cubrir.D}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ))}
                </div>
            )}
        </div>
    );
};

