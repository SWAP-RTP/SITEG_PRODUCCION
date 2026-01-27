import React from 'react'


interface ClipoProps { txt: string }
export const ClipoMsg = ({txt}: ClipoProps) => {
    return (
        <div className='flex flex-wrap align-items-center opacity-60 min-w-max'>
            <p className='m-0' style={{fontSize: '6rem'}}>📎</p>
            <p 
                className='m-0 p-2 w-min md:w-auto text-xl font-bold bg-yellow-300 border-round-xl'
                style={{ minWidth: '5rem', maxWidth: '18rem'}}
            >
                {txt}
            </p>
        </div>
    )
}