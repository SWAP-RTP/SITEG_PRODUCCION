import React, { useContext, useEffect, useState } from 'react'
import { SkeletonTable, TablaCRUD } from '../../../shared/components/Tabla'
import { EcosDespachoRecepcionContext } from '../../context/EcosDespachoRecepcion.context';
import { groupByRepeatedValue } from '../../../shared/helpers';
import { useElementSizes } from '../../../shared/hooks/useElementSizes';


interface TableProps {
    loading:        boolean;
    data:           any[];
    ecosTotales:    number;
}

const COLS = [
    { header: 'Ruta', field: 'ruta' },
    { header: 'Ecos', field: 'ecos' }
]

const initTableState = {
    loading: true,
    data: [],
    ecosTotales: 0
}



export const EstadoParqueVehicularResumen = () => {

    const [table, setTable] = useState<TableProps>(initTableState);
    const element = useElementSizes('caseta-despacho-ecos-accordion');  
    
    // useEffect(() => {
    //     console.log(element);
    // }, [element.height])

    const { 
        ecosDespachados, 
        // ecosRecepcionados
    } = useContext(EcosDespachoRecepcionContext);
     
    useEffect(() => {
        const { data: dataRaw } = ecosDespachados;
        //ToDo: Mostrar por motivos (Filtrar 'data' por motivo)
        const motivos = dataRaw?.map( registro => registro.motivo );
        const motivos_unicos = [... new Set(motivos)];

        const data0 = dataRaw?.map( ({ eco, ruta_swap, motivo }, i) => ({
            id: i,
            ruta: ruta_swap, 
            eco,
        }));
        const data1: any[][] = groupByRepeatedValue(data0!, 'ruta')
        const data2 = data1.map( (ecosXruta, i) => ({ id: i+1, ruta: ecosXruta[0].ruta, ecos: ecosXruta.length }) )
        let ecosTotales = 0;
        data2.forEach(obj => {
            ecosTotales += obj.ecos
        });
        // console.log(data2);
        setTable({
            data: data2,
            ecosTotales ,
            loading: false
        });
    }, [ecosDespachados.data])
    

    return (
    <div 
        className='w-12 md:w-3 p-2 border-2 overflow-y-auto flex-grow-1' 
        style={{ height: `${ element.height ||100}px` }} 
    >
        
        {/* <div className='h-5rem bg-green-200 opacity-70 relative z-0' style={{width: '120%', bottom: '10px', right: '10px'}} /> */}
        {/* <div className='relative' style={{ bottom: '80px' }} > */}
            <h3 className='m-0 mb-2 py-4 text-center bg-green-100' >Ecos Despachados</h3>
            <TablaCRUD 
                cols={COLS} 
                data={table.data}
                accion={ false }
                dataTableProps={{ 
                    header: () => headerTemplate(table.ecosTotales), 
                    paginator: false, 
                    loading: table.loading
                }}
            />
        {/* </div> */}
    </div>
    )
}


const headerTemplate = (ecos: number) => {
  
    return (
        <span>Ecos totales: <b>{ecos}</b></span>
    )
}