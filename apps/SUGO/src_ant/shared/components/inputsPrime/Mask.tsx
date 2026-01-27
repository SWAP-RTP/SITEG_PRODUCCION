import { InputMask, InputMaskProps } from 'primereact/inputmask'
import React from 'react'


interface Props extends InputMaskProps {
    id,
    label: string,
}

export const Mask = ({
    id,
    label='',
    ...rest
}: Props) => {
  return (
    <span className="p-float-label">
        <InputMask 
            id={id}
            {...rest}
        />
        <label htmlFor={id}>{label}</label>
    </span>
  )
}
