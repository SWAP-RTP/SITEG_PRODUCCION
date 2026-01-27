import { UseFetchGet } from "../../helpers-HTTP";


const getPermisosUser = async(credencial, appId: number) => {
    try {
        const resp = await UseFetchGet(`${import.meta.env.VITE_SGA_PERMISOS}?idUsuario=${credencial}&idAplicacion=${appId}`)
        const permisos = resp[0]?.permisos || []
        return permisos
    } catch (error) {
        throw new Error(`Error in getPermisosUser - ${error}`)
    }
}


export default getPermisosUser