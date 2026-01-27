import React, { useState } from 'react'
import { makePeriodos } from './helper'
import { TablaComponenteCRUD } from '../../shared/components/Tabla/TablaComponenteCRUD'

export const MakePeriodos = () => {

    const [data, setData] = useState<{fechaIni, fechaFin}[]>([])

    React.useEffect(() => {
        const periodos = makePeriodos(2099)
        console.log(periodos);
        setData( periodos );
    }, [])
    

    return (
    <>
        <h1>Periodos</h1>
        <TablaComponenteCRUD 
            data={data} 
            cols={[
                { field: 'id', header: 'id' }, 
                { field: 'year', header: 'año' }, 
                { field: 'periodo', header: 'periodo' }, 
                { field: 'fechaIni', header: 'fechaIni' }, 
                { field: 'fechaFin', header: 'fechaFin' },
                { field: 'weeks', header: 'weeks' }
            ]} 
            accion={false}
        />
    </>
  )
}
