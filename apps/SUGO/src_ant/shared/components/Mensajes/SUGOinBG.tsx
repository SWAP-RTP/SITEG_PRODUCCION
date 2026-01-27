import React from 'react'


interface Props {
  msg?: string, 
  textAlign?: string, 
  msg2?: string
}

export const SugoInBg = ({msg='SUGO', textAlign='center', msg2}: Props) => {
  return (
    <div className={`w-full text-${textAlign} opacity-20 my-auto`}>
        <h2 className='text-8xl m-0 mb-8' >{msg}</h2>
        <p className='text-4xl m-0 mb-8' >{msg2}</p>
    </div>
  )
}
