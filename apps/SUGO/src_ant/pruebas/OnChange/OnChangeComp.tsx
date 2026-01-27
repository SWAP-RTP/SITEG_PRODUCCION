import React, { useState, useEffect, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useInterval } from 'primereact/hooks';
       

const InputEspecial = () => {
    
    //// const [seconds, setSeconds] = useState(0);
    const seconds = useRef(0);
    const [input, setInput] = useState('');
    const [active, setActive] = useState(false);
    
    const resetInterval = () => {
        //// setSeconds(0);
        setActive(false)
        seconds.current = 0;
    }

    useInterval(
        () => {
            ////setSeconds((prevSecond) => (prevSecond === 59 ? 0 : prevSecond + 1)); //fn
            seconds.current ++;
            if( !!input && seconds.current == 2){
                console.log('logic',  input);
                resetInterval()
            }
            // console.log('tic', seconds.current);
        },
        1000,   //delay (ms)
        active  //condition (when)
    );

    const handleChange = (e) => {
        const value = e.target.value
        !!value ? setActive(true) : setActive(false);
        setInput(e.target.value)
        seconds.current = 0
        //// setSeconds(0);
    }

    return (
        <InputText 
            id='4587asasp'
            value={input} 
            onChange={ handleChange }
        />
    )
}

const Timer = () => {
  
    const [seconds, setSeconds] = useState(0);
    const [active, setActive] = useState(false);
    
    const resetInterval = () => {
        setSeconds(0);
        setActive(false)
    }

    useInterval(
        () => {
            setSeconds((prevSecond) => (prevSecond === 59 ? 0 : prevSecond + 1)); //fn
        },
        1000,   //delay (ms)
        active  //condition (when)
    );
    return (
        <>
            <h1>{seconds}s</h1>
            {/* <Button label='start' onClick={handleStart} disabled={isActive} />
            <Button label='stop'  onClick={handleStop} disabled={!isActive} />
                */}
            <Button 
                label={active ? 'Stop' : 'Start'} 
                onClick={() => active ? setActive(false) : setActive(true) } 
                className={classNames('w-6rem p-button-outlined', { 'p-button-danger': active })}
            /> 

            <Button label='reset' onClick={resetInterval} className='ml-3'/>
        </>
    )
}

export const OnChangeComp = () => {


    return (
    <>
        <Timer />
        <br />
        <br />
        <InputEspecial />
    </>
  );
};
