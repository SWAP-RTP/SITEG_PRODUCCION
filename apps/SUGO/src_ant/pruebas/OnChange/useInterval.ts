
import React, { useEffect, useState } from 'react'


interface Props {
    timeStart?: number;
    timeSteps?: number;
    increment?: number;
    callback?: () => void;
}

export const useInterval = (props: Props = {}) => {
    const {
        timeStart   = 3,
        timeSteps     = 1000,
        increment   = -1,
        callback
    } = props;

    const [time, setTime] = useState(timeStart);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval;

        if (isActive) {
        interval = setInterval(() => {
            setTime((prevSeconds) => Math.round((prevSeconds + increment)*100)/100 );
            !!callback && callback()
        }, timeSteps);
        } else {
        clearInterval(interval);
        }

        return () => {
        clearInterval(interval);
        };
    }, [isActive]);

    const startTimer = () => {
        setIsActive(true);
    };

    const stopTimer = () => {
        setIsActive(false);
    };

    const resetTimer = (activeTimer=false) => {
        setIsActive(activeTimer);
        setTime(10);
    };


    return {
        time,
        isActive,
        startTimer,
        stopTimer,
        resetTimer,
    }
}
