import React from 'react'
import { TabView, TabPanel } from 'primereact/tabview';
// Globales
import { Container, Header } from '../shared/components'
import useAuthStore from '../shared/auth/useAuthStore';
import { SugoInBg } from '../shared/components/Mensajes';
// Componentes
import { RolFormulario } from './cargar-rol/components/';
import { EditarFormulario } from './editar-rol/components/';



export const Rol = () => {
    const { sugo12rol } = useAuthStore(state => state.permisosSUGO)
    const index = [sugo12rol].findIndex(Boolean)

    return (
        <Container>

            <Header />

            {(sugo12rol) ?
                <TabView activeIndex={index}>
                    {sugo12rol &&
                        <TabPanel header="Cargar de ROL">
                            <RolFormulario />
                        </TabPanel>
                    }
                    {sugo12rol &&
                        <TabPanel header="Editar ROL">
                            <EditarFormulario />
                        </TabPanel>
                    }
                </TabView>
                :
                <SugoInBg />
            }


        </Container>
    )
}
