import React, { useState } from 'react'
import { Fieldset } from 'primereact/fieldset'



export const Wrapper = ({children, legend, insideKey, showRaw, className}) => {

    if(showRaw) return(
        <div 
            legend  = {legend}
            key     = { insideKey }
            className={`shadow-2 p-2 px-4 my-3 bg-white ${className}`}
        >
            <h2>{legend}</h2>
            {children}
        </div>
    )

  return (
    <Fieldset
        legend   = {legend}
        key      = { insideKey }
        className={`shadow-2 ${className}`}
        toggleable 
        style={{minWidth: '350px'}}
    >
        {children}
    </Fieldset>
  )
}
