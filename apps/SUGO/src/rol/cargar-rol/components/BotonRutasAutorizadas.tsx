import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useRutasAutorizadas } from "../hooks/useRutasAutorizadas"; // Importa el hook personalizado
import { RutaAutorizada } from "../interfaces/rutasAutorizadas.interfaces"; // Importa la interfaz de RutaAutorizada


export const BotonRutasAutorizadas: React.FC = () => {
    const { data, loading, error, handlerRutasAutorizadas } = useRutasAutorizadas(); // Hook para manejar las rutas autorizadas
    const [visible, setVisible] = useState(false); // Estado para controlar la visibilidad del diálogo

    // Definición de modalidades y sus colores asociados
    const modalidades = ["ORDINARIO", "ATENEA", "EXPRESO", "ECOBÚS", "EXPRESO DIRECTO", "NOCHEBÚS"];
    const modalidadColors: Record<string, string> = {
        "ORDINARIO": "#f7c948",
        "ATENEA": "#e64980",
        "EXPRESO": "#4caf50",
        "ECOBÚS": "#00bcd4",
        "EXPRESO DIRECTO": "#388e3c",
        "NOCHEBÚS": "#1976d2"
    };

    return (
        <>
            {/* Botón para abrir el diálogo de rutas autorizadas */}
            <Button label="Rutas autorizadas" icon="pi pi-directions" severity='help' onClick={() => { setVisible(true); handlerRutasAutorizadas(); }} />


            {/* Diálogo de rutas autorizadas */}
            <Dialog header="RUTAS AUTORIZADAS" visible={visible} style={{ width: '90vw', textAlign: 'center' }} onHide={() => setVisible(false)}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {loading && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Cargando...</p>}
                    {error && <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'red' }}>Error al cargar las rutas</p>}
                    {data && Object.entries(data).map(([modulo, rutas]) => (
                        <div key={modulo} style={{ marginBottom: 32, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: 'fit-content', minWidth: 900, margin: '0 auto' }}>
                                <h3 style={{
                                    background: '#422dc7ff',
                                    color: '#fff',
                                    padding: 8,
                                    borderRadius: 4,
                                    fontWeight: 'bold',
                                    letterSpacing: 1,
                                    textAlign: 'center',
                                    marginBottom: 0,
                                    fontSize: '1.5rem',
                                    width: '100%'
                                }}>
                                    {`MÓDULO ${modulo}`}
                                </h3>
                                {/* Tabla de rutas autorizadas */}
                                <DataTable
                                    value={rutas as RutaAutorizada[]}
                                    responsiveLayout="scroll"
                                    stripedRows
                                    emptyMessage="No hay rutas para este módulo"
                                    style={{ fontSize: '1rem', minWidth: 900, marginTop: 0}}
                                >
                                    <Column field="ruta" header={<span style={{ textAlign: 'center', width: '100%', display: 'block' }}>Ruta</span>} style={{ fontWeight: 'bold', width: 100, textAlign: 'center' }} />
                                    <Column field="origen" header={<span style={{ textAlign: 'center', width: '100%', display: 'block' }}>Origen</span>} body={(row: RutaAutorizada) => `${row.origen} (${row.origen_nomenclatura})`} style={{ width: 220, textAlign: 'center' }} />
                                    <Column field="destino" header={<span style={{ textAlign: 'center', width: '100%', display: 'block' }}>Destino</span>} body={(row: RutaAutorizada) => `${row.destino} (${row.destino_nomenclatura})`} style={{ width: 220, textAlign: 'center' }} />
                                    {modalidades.map(m => (
                                        <Column
                                            key={m}
                                            header={<span style={{ textAlign: 'center', width: '100%', display: 'block' }}>{m}</span>}
                                            body={(row: RutaAutorizada) => (
                                                <span style={{
                                                    display: 'block',
                                                    background: row.modalidades.includes(m) ? modalidadColors[m] : '#eee',
                                                    color: row.modalidades.includes(m) ? '#fff' : '#888',
                                                    fontWeight: row.modalidades.includes(m) ? 'bold' : 'normal',
                                                    borderRadius: 4,
                                                    textAlign: 'center',
                                                    padding: '2px 0'
                                                }}>
                                                    {row.modalidades.includes(m) ? 'SI' : 'NO'}
                                                </span>
                                            )}
                                            style={{ textAlign: 'center', width: 120 }}
                                        />
                                    ))}
                                </DataTable>
                            </div>
                        </div>
                    ))}
                </div>
            </Dialog>
        </>
    );
}