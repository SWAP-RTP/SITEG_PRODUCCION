import { useState, useEffect } from 'react';


interface Props {
  stop?: boolean;
}


export const useClock = ({ stop=false }: Props) => {
    const [time, setTime] = useState(new Date());
    const [isRunning, setIsRunning] = useState(!stop);
  
    const tick = () => {
        setTime( () => new Date() );
    };

    useEffect(() => {
        let intervalId: number //: NodeJS.Timeout;

        if (isRunning && !stop) {
            intervalId = setInterval(tick, 1000); //timeout);
        }
    
        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, stop]);

  
    const handleStartStop = () => {
        setIsRunning((prev) => !prev);
    };

    
    return {
        time,
        isRunning,
        handleStartStop,
    }
}