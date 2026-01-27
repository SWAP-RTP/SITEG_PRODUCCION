import React from 'react'
import { InputText, InputTextProps } from 'primereact/inputtext'


interface Props extends InputTextProps {
    id: string,
    label: string,
}

export const Text = ({
    id,
    label='',
    ...rest
}: Props) => {
  return (
    <span className="p-float-label">
        <InputText 
            id={id} 
            {...rest} 
        />
        <label htmlFor={id}>{label}</label>
    </span>
  )
}
