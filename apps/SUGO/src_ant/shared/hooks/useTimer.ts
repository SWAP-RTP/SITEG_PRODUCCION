import { useState, useEffect } from 'react';


interface Props {
  initialTime?:  number;
  startRunning?: boolean;
  timeout?:      number;
}


export const useTimer = ({ initialTime=0, startRunning=false, timeout=10 }: Props) => {
    const [timer, setTimer] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(startRunning);
  
    useEffect(() => {
      let intervalId: number //: NodeJS.Timeout;
  
      if (isRunning) {
        intervalId = setInterval(() => {
          setTimer((prevTimer) =>  Math.round((prevTimer + 0.01)*100)/100  );
        }, timeout);
      }
  
      return () => {
        clearInterval(intervalId);
      };
    }, [isRunning]);
  
    const handleStartStop = () => {
      setIsRunning((prevIsRunning) => !prevIsRunning);
    };
  
    const handleReset = () => {
      setTimer(0);
      setIsRunning(false);
    };

    return {
        timer,
        isRunning,
        handleStartStop,
        handleReset
    }
}