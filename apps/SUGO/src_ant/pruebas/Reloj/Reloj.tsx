import React from 'react'
import { useClock } from '../../shared/hooks/useClock'
import { dateToString, hrDateToString } from '../../shared/helpers';

export const Reloj = () => {

    const { time } = useClock();
    return (
    <>
        <h1>Hook useClock</h1>
        <h2>{ hrDateToString(time) }</h2> - <span>{ dateToString(time) }</span>
    </>
    )
}
