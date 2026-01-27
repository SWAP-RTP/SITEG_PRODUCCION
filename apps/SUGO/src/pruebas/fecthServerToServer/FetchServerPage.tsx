import { Button } from 'primereact/button'
import React, { useState } from 'react'
import { UseFetchGet, UseFetchPost } from '../../shared/helpers-HTTP'
import { LoadingDialog } from '../../shared/components/Loaders'


const fetch2servers = async() => {
    console.log('clic')
    const data = {msg: 'hola php'}

    try {
        const msg = await UseFetchGet('http://localhost:4000/api/hi')
        console.log(msg.msg)
        const trab = await UseFetchGet('http://dev-swap.rtp.gob.mx/Mantenimiento/correctivo/alta_correctivo/query_sql/SaveOrden.php')
        // const trab = await UseFetchPost('http://dev-swap.rtp.gob.mx/Mantenimiento/correctivo/alta_correctivo/query_sql/SaveOrden.php', data)

        console.log({trab, msg: msg.msg})
    } catch (error) {
        
    }

}



export const FetchServerPage = () => {
    const [isLoading, setIsLoading] = useState(false)

    const loadingFor = (time: number) => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, time);
    }

    return (
    <>
        <h1>Fetch Server Page</h1>

        <div>
            <Button icon='pi pi-send' onClick={() => {
                    loadingFor(20000)
                    // fetch2servers()
                }} /> 
        </div>

        <LoadingDialog isVisible={isLoading}/>
    </>
    )
}
