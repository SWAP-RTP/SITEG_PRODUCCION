import React from 'react'
import { Container, Header } from '../../shared/components'

import { TabView, TabPanel } from 'primereact/tabview';
import { CargarNuevoRol } from '../components/CargaNuevoRol';
import useAuthStore from '../../shared/auth/useAuthStore';
import { SugoInBg } from '../../shared/components/Mensajes';



export const RolPage = () => {
    const { sugo2rol0p1, sugo2rol0p2 } = useAuthStore( state => state.permisosSUGO )
    const index = [sugo2rol0p1, sugo2rol0p2].findIndex(Boolean) 
 
    return (
        <Container>

            <Header/>
    
            { (sugo2rol0p1 || sugo2rol0p2) ? 
                <TabView activeIndex={index}>
                    { sugo2rol0p1 && 
                        <TabPanel header="Cargar nuevo Rol">
                            <CargarNuevoRol />
                        </TabPanel>
                    }
                    { sugo2rol0p2 && false &&
                        <TabPanel header="Actualizar Rol">
                            {/* <ActualizarRol /> */}
                            <h2>ActualizarRol</h2>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores ea dolorem dolore dolores quisquam ad eos accusantium facere nobis. Officiis enim adipisci optio ex, nesciunt eos amet consequatur nemo harum!</p>
                        </TabPanel>
                    }
                </TabView>
                :
                <SugoInBg />
            }

        </Container>
    )
}