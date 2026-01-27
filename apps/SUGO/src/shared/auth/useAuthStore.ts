import { create } from 'zustand'
import getPermisosUser from './utilities/getPermisosUser'
import permisoCheck from './utilities/permisoCheck'



interface Store {
    logged: true,
    user: {
        credencial: number | null,
        nombre:     string | null,
        modulo:     number | null,
    },
    // permisosSUGO: { [key: string]: true }
    permisosSUGO: {
        sugo12cum:      true,
        sugo12pru:      true,
        sugo12rol:      true,
        sugo2rol0p1:    true,
        sugo2rol0p2:    true,
        sugo1rol0p1:    true,
        sugo2rol0p10t1: true,
        sugo4rol0p10t1: true,
        sugo12cas:      true,
        sugo2cas0b1:    true,
        sugo2cas0b2:    true,
        sugo3cas0p10t2: true,
        sugo4cas0p10t2: true,
        sugo1cas0p1:    true,
    }
}
interface Actions {
    login: (nombre, modulo, credencial, appId?: number) => void
    logout: () => void

    reset: () => void
}


const initialState = {
    logged: true,
    user: {
        credencial: null,
        nombre: null,
        modulo: null,
    },
    permisosSUGO: {     //#! Quitar signo
        sugo12cum:      true,
        sugo12pru:      true,
        sugo12rol:      true,
        sugo2rol0p1:    true,
        sugo2rol0p2:    true,
        sugo1rol0p1:    true,
        sugo2rol0p10t1: true,
        sugo4rol0p10t1: true,
        sugo12cas:      true,
        sugo2cas0b1:    true,
        sugo2cas0b2:    true,
        sugo3cas0p10t2: true,
        sugo4cas0p10t2: true,
        sugo1cas0p1:    true,
    }
}

const useAuthStore = create<Store & Actions>()( (set, get): (Store & Actions) => ({
    ...initialState, 

    logout: () => {
        // setLogged( log => !log )
        sessionStorage.removeItem('user');
        window.close();
        window.location.href = "http://sau.rtp.gob.mx/login";
        // window.open("http://sau.rtp.gob.mx/login", "_self");
    },

    login: async( nombre, modulo, credencial, appId ) => {
        sessionStorage.setItem( 'user', JSON.stringify({
            nombre     , 
            modulo     , 
            credencial ,
            appId
        }) ); 

        set( state => ({
            ...state,
            logged: true,
            user: {
                ...state.user,
                nombre ,
                modulo ,
                credencial ,
            }
        }))

        let permisosSUGO = initialState.permisosSUGO
        if(!!appId) {
            try {
                const permisosUser = await getPermisosUser(credencial, appId)
                permisosSUGO = permisoCheck(initialState.permisosSUGO, permisosUser)
            } catch (error) { 
                throw new Error(error)
            };
        }
        set( state => ({
            ...state,
            permisosSUGO
        }))
    },


    reset: () => set( initialState )
}))

export default useAuthStore