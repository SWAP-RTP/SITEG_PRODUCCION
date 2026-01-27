import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { ColsProps, HeadeTopRowsProps, TablaCRUD } from '../../../shared/components/Tabla';
import { UseFetchGet } from '../../../shared/helpers-HTTP';
import { removeHTMLelements } from '../../../shared/helpers/forHTML';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { Row } from 'primereact/row';
import { Column } from 'primereact/column';
import { PV_Ecos } from '../interfaces';


const API = import.meta.env.VITE_SUGO_BackTS


const style = { minWidth: '7rem' }
const COLS: ColsProps[] = [
    { field: 'no',          header: '#', filter: true, align: 'center', style },
    { field: 'modulo_desc', header: 'Modulo', filter: true, align: 'center', style },
    { field: 'eco',         header: 'Eco', filter: true, align: 'center', style },
    { field: 'modalidad',   header: 'Tipo de economico', filter: true, style: { maxWidth: '14rem' } },
    { field: 'eco_marca',   header: 'Marca', filter: true, align: 'center', style },
    { field: 'vehiculo_modelo', header: 'Modelo', filter: true, align: 'center', style },
    { field: 'matricula',       header: 'Matricula', filter: true, align: 'center', style },
    { field: 'estado_fisico_desc',  header: 'Estado fisico', filter: true, align: 'center', style },
    { field: 'capacidad_sentados',  header: 'Capacidad Sentados', filter: true, align: 'center', style },
    { field: 'capacidad_parados',   header: 'Capacidad Parados', filter: true, align: 'center', style },
    { field: 'puertas',             header: 'Puertas', filter: true, align: 'center', style },
    { field: 'servicio_tipo',       header: 'Servicio', filter: true, align: 'center', style },
    { field: 'vehiculo_tipo',       header: 'Tipo de vehiculo', filter: true, align: 'center', style },
    // { field: 'servicio_modalidad_sicab',    header: 'servicio_modalidad_sicab', filter: true, align: 'center', style },
    { field: 'tarifa',      header: 'Tarifa', filter: true, align: 'center', style },
];



export const EcosConSuModalidad = () => {
    const userModulo = useAuthStore( s => s.user.modulo)
    const [visible, setVisible] = useState(false);

    // get Ecos
    const { data, isLoading } = useQuery<PV_Ecos[], any, (PV_Ecos&{id: string, no: number})[]>(
        ['ecos', 'all'], 
        () => UseFetchGet(`${API}/api/caseta/pv-ecos`),
        {
            enabled: visible,
            select(data) {
                return ( data
                    .filter( eco => userModulo ? eco.modulo==userModulo:true )
                    .map( (d, i) => ({
                        ...d,
                        no: i+1,
                        id: 'reporte-ecos-'+d.eco,
                    }))
                )
            },
            onSuccess(data) {
                console.log(data)
            },
            refetchInterval: false,
            staleTime: Infinity,
        }
    )

    // useEffect(() => {
    //     setTimeout(() => {
    //         visible && removeHTMLelements('#dialog-rutas', '.p-column-filter-clear-button')
    //     }, 200);
    // }, [visible])
    


    return (
    <>
        {/* <Button 
            label="Ecos" 
            severity='info'
            onClick={() => setVisible(true)} 
        />  */}

        {/* Es un elemento flotante y oculto al inicio */}
        {/* <Dialog id='dialog-rutas' header='Economicos' modal maximizable  position='right' visible={visible} onHide={() => setVisible(false)} style={{ minWidth: '50rem', width: '50vw', height: '60vh' }} pt={{ footer: { className: 'p-2' }}}> */}
            <h2>Ecos</h2>
            <TablaCRUD 
                data={data} 
                cols={COLS} 
                className='my-2 '
                accion={false}
                multiSortMeta={ [{field: 'modulo', order: 1}, {field: 'nombre', order: 1}] }
                dataTableProps={{ 
                    resizableColumns: false,
                    loading: !data || isLoading
                }} 
            />
        {/* </Dialog> */}
    </>
    )
}