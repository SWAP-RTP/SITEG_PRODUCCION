import React from 'react'
import { UploadAndReadXls } from './UploadAndReadXls'
import { UseFetchPost } from '../../shared/helpers-HTTP'



const schema = { 
    "CREDENCIAL": {
        prop: 'cred'
    },
    "CORREO ELECTRÓNICO": {
        prop: 'email'
    },
    "contra": {
        prop: 'contra'
    },
}

export const CrearUsuarios = () => {

    const createNewUsers = (data) => {
        const {rows, errors} = data as { rows: {"cred": number,"email": string,"contra": string}[], errors }
        console.log(rows);
        rows.forEach((user, i) => {
            const data = {
                email: user.email, 
                idUsuario: user.cred, 
                contraseña: user.contra
            }
            UseFetchPost(
                'API', 
                data, 
                'TOKEN'
            ).then( r => console.log(i+1) )
            .catch( error => console.error(user.cred, error) )
        });
    }

    return (
    <>
        <h2>CrearUsuarios</h2>
        <UploadAndReadXls callback={createNewUsers} schema={schema}/>
    </>
    )
}
