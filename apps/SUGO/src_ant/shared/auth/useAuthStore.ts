import { create } from 'zustand'
import getPermisosUser from './utilities/getPermisosUser'
import permisoCheck from './utilities/permisoCheck'



interface Store {
    logged: boolean,
    user: {
        credencial: number | null,
        nombre:     string | null,
        modulo:     number | null,
    },
    // permisosSUGO: { [key: string]: boolean }
    permisosSUGO: {
        sugo12cum:      boolean,
        sugo12pru:      boolean,
        sugo12rol:      boolean,
        sugo2rol0p1:    boolean,
        sugo2rol0p2:    boolean,
        sugo1rol0p1:    boolean,
        sugo2rol0p10t1: boolean,
        sugo4rol0p10t1: boolean,
        sugo12cas:      boolean,
        sugo2cas0b1:    boolean,
        sugo2cas0b2:    boolean,
        sugo3cas0p10t2: boolean,
        sugo4cas0p10t2: boolean,
        sugo1cas0p1:    boolean,
    }
}
interface Actions {
    login: (nombre, modulo, credencial, appId?: number) => void
    logout: () => void

    reset: () => void
}


const initialState = {
    logged: false,
    user: {
        credencial: null,
        nombre: null,
        modulo: null,
    },
    permisosSUGO: {     //#! Quitar signo
        sugo12cum:      false,
        sugo12pru:      false,
        sugo12rol:      false,
        sugo2rol0p1:    false,
        sugo2rol0p2:    false,
        sugo1rol0p1:    false,
        sugo2rol0p10t1: false,
        sugo4rol0p10t1: false,
        sugo12cas:      false,
        sugo2cas0b1:    false,
        sugo2cas0b2:    false,
        sugo3cas0p10t2: false,
        sugo4cas0p10t2: false,
        sugo1cas0p1:    false,
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