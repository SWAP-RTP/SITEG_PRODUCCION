import React, { useState } from 'react'
import { Button } from 'primereact/button'
import getPermisosUser from '../../shared/auth/utilities/getPermisosUser'

export const Comp = () => {

  const [permisosLength, setPermisosLength] = useState(0)

  const clic = async() => {
    try {
      const res: any[] = await getPermisosUser(11171, 7)
      console.log(res);
      setPermisosLength( res.length )
      
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <>
      <h1>Get-Permisos</h1>
      <Button label='Get' onClick={clic} />
      <h3>Cantidad de permisos:  {permisosLength}</h3>
    </>
  )
}
