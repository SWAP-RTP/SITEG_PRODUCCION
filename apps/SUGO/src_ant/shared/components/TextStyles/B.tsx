import React from 'react'
import { PrimeColors } from '../../interfaces/primeInterface'

interface Props {
    children: JSX.Element | JSX.Element[] | any,
    color?: PrimeColors, 
}
export const B = ({children, color= 'green'}: Props) => {
  return (
    <b className={`text-${color}-500 font-bold`} >{children}</b>
  )
}
