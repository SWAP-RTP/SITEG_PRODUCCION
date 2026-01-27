import React from 'react'


type Props = { 
    src, 
    minHeight?: string  
    minWidth?: string  
    classname?: string
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>


export const PreviewPDF = ({ 
    src, 
    minHeight='60vh', 
    minWidth='50%', 
    className= '',
    ...rest  
}: Props) => {
  return (
    <div className={`flex flex-column ${className}`} style={{ minHeight, minWidth }} {...rest}>
        <iframe title="Preview" src={src} width="100%" height="100%" className='flex-grow-1'/>
    </div>
  )
}
