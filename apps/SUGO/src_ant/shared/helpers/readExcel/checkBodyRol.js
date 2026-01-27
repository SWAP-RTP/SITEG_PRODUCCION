
export const checkBodyRol = (bodyRolRows) => {
    

    const servicio1 = bodyRolRows[0] 
    const servicio2 = bodyRolRows[1] 
    console.log(servicio1, servicio2);

    const { turno1cred, turno2cred, turno3cred } = servicio1.credenciales
    console.log({ turno1cred, turno2cred, turno3cred });

}