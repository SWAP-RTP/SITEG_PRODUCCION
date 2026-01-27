import React from 'react'
import { TabView, TabPanel } from 'primereact/tabview';
// Globales
import { Container, Header } from '../shared/components'
import useAuthStore from '../shared/auth/useAuthStore';
import { SugoInBg } from '../shared/components/Mensajes';
// Componentes
import { RolFormulario } from './components/';



export const Rol = () => {
    const { sugo2rol0p1, sugo2rol0p2 } = useAuthStore( state => state.permisosSUGO )
    const index = [sugo2rol0p1, sugo2rol0p2].findIndex(Boolean) 
 
    return (
        <Container>

            <Header/>
    
            { (sugo2rol0p1 || sugo2rol0p2) ? 
                <TabView activeIndex={index}>
                    { sugo2rol0p1 && 
                        <TabPanel header="Cargar de Rol">
                            <RolFormulario />
                        </TabPanel>
                    }
                </TabView>
                :
                <SugoInBg />
            }

        </Container>
    )
}