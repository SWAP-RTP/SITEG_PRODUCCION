import React from 'react'
import { Container, Header } from '../../shared/components'
import { TabPanel, TabView } from 'primereact/tabview'
import { CumpliRol, CumpliOp } from '../components'


export const CumplimientoPage = () => {
  return (
    <Container>
        <Header/>

        <div className='surface-0 w-full'>
            <h2 className='m-3'>Cumplimiento</h2>
        </div>

        <TabView>
            <TabPanel header="Rol">
                <CumpliRol />
            </TabPanel>
            
            <TabPanel header="Operador">
                <CumpliOp />
            </TabPanel>

        </TabView>

    </Container>
  )
}
