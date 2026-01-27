import React from 'react'

import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export const SkeletonTable = ({
    filas=10, 
    campos=[ "campos", "filas", "Code", "Name"], 
    calcWidth = true,
    className='',
}) => {

    const items = Array.from({ length: filas }, (v, i) => i);

    const bodyTemplate = () => {
        return <Skeleton></Skeleton>
    }

    const widthCalc = (100%campos.length==0) ? 100/campos.length : (100/campos.length)-1 ;
    const widthCol = (calcWidth) ? widthCalc : 25 ;


  return (
    <div className={'w-full flex justify-content-center '+className}>
    <DataTable value={items} className="p-datatable-striped w-12">
        {
            campos.map( (campo, i) => (
                <Column field={campo.toLowerCase()} header={campo} style={{ width: `${widthCol}%` }} body={bodyTemplate} key={i+campo}></Column>
            ) )
        }
    </DataTable>
    </div>
  )
}


// ["Concepto", "Plan", "Real", "Cumplio"]