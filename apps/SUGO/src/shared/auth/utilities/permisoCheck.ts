
const permisoCheck = <T>(permisosApp: T, permisosUser:any[] = []) => {

    const misPermisos = {...permisosApp};
    permisosUser.map( obj => {
        misPermisos[obj.codigo] = true
    });
    return misPermisos as T
}

export default permisoCheck