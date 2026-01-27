import { Dropdown, DropdownProps } from 'primereact/dropdown'
import React from 'react'

interface Props extends DropdownProps {
  id: string
  label?: string
}

export const Select = ({
    label='',
    id,
    optionLabel='name',
    className, 
    style,
    ...rest

}: Props) => {
  return (
    <span className="p-float-label">
      <Dropdown 
        inputId={id}
        optionLabel={optionLabel} 
        className={`w-full ${className}`} 
        style={{minWidth: '12.4rem', maxWidth: '26.8rem', ...style}}
        {...rest}
      />
      <label htmlFor={id}>{label}</label>
    </span>
  )
}
