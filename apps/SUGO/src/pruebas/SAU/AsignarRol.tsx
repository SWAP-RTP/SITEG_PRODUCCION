import React from 'react'
import { UploadAndReadXls } from './UploadAndReadXls'
import { UseFetchPost } from '../../shared/helpers-HTTP'



const schema = { 
    "CREDENCIAL": {
        prop: 'cred'
    },
}

export const AsignarRol = () => {
    const createNewUsers = (data) => {
        const {rows, errors} = data as { rows: {"cred": number,"email": string,"contra": string}[], errors }
        console.log(rows);
        rows.forEach((user, i) => {
            const data = {
                idRol: [28], 
                idUsuario: user.cred, 
                createdFor: 11171
            }

            UseFetchPost(
                'API', 
                data, 
            ).then( r => console.log(i+1, user.cred) )
            .catch( error => console.error(user.cred, error) )
        });
    }

    return (
    <>
        <h2>AsignarRol</h2>
        <UploadAndReadXls callback={createNewUsers} schema={schema}/>
    </>
    )
}
