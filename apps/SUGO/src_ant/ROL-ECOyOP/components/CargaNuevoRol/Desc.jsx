import React, { useEffect, useState } from 'react'
import { Checkbox } from 'primereact/checkbox'
import { InputTextarea } from 'primereact/inputtextarea';

export const Desc = ({text, dismiss=true, raw=false}) => {
    
    const [check, setCheck] = useState(false);
    const [input, setInput] = useState('');
    

    const options = [
        { value: 'public', icon: 'pi pi-globe' },
        { value: 'protected', icon: 'pi pi-lock-open' },
        { value: 'private', icon: 'pi pi-lock' }
    ];

        
    return (
        <>
            <pre>
                {text}
            </pre> 

            {/* { dismiss && !raw && 
                <div className='flex-center justify-content-start gap-4 mb-4'>
                    <p className='my-0 py-1  border-round-lg px-2 bg-red-500 text-100 text-sm font-semibold'>Descartar</p> 
                    <Checkbox onChange={e => setCheck(e.checked)} checked={check} ></Checkbox>
                </div>
            }
            { check && !raw &&
                <div className='mb-3'>
                <p className='m-0 text-600 text-sm font-medium'>Razon</p>
                <InputTextarea autoResize value={input} onChange={(e) => setInput(e.target.value)} rows={1} cols={30} />
                </div>
            }

            { dismiss && raw && 
                <div className='flex-center justify-content-start gap-4 mb-2'>
                    <p className='my-0 py-1 font-semibold'>Descartar: {check ? 'SI': 'NO' } </p> 
                </div>
            }
            { check && raw &&
                <div className='mb-3'>
                
                <p className='m-0 font-medium'>Razon: </p>
                <p className='m-0'>{input}</p>
                </div>
            } */}
        </>
    )
}
