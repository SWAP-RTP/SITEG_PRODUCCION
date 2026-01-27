import React from 'react'
import { Button } from 'primereact/button';



interface Porps {
    iPosition: number,
    setIPosition:  React.Dispatch<React.SetStateAction<number>>,
    totalSteps: number,
    dato2show: string,
    severity?: "warning" | "secondary" | "success" | "info" | "danger" | "help", 
    textColor?: "blue" | "green" | "yellow" | "cyan" | "pink" | "indigo" | "teal" | "orange" | "bluegray" | "purple" | "gray" | "red" | "primary" | "black-alpha" | "white-alpha",
}

export const BotonesPagDias = ({
    iPosition,
    setIPosition,
    totalSteps,
    dato2show,
    severity='warning',
    textColor= 'green'
}: Porps) => {

  return (
    <div className='mb-4 mt-2 w-full flex justify-content-center '>  {/* //? Botones "paginacion de dias" */}
        <div>
            <Button icon="pi pi-angle-left" rounded severity={severity}
                disabled={ iPosition==0 } 
                outlined ={ iPosition==0 } 
                style={{top: '7px', right: '7px'}}
                onClick={ () => setIPosition( i => i-1 ) } 
            />

            <h3 className={`inline text-${textColor}-400`} > {dato2show} </h3>

            <Button icon="pi pi-angle-right" rounded severity={severity}
                disabled={ iPosition==totalSteps } 
                outlined ={ iPosition==totalSteps } 
                style={{top: '7px', left: '7px'}} className='mb-'
                onClick={ () => setIPosition(i => i+1 ) } 
            />
        </div>
    </div>       
  )
}
