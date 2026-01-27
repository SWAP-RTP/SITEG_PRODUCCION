import React from 'react'
// @ts-ignore
import png from '../assets/under-construction.gif';
// @ts-ignore
import logoPng from '../assets/Logo_RTP_y_Movilidad_Integrada.png';
import { useRouteError } from 'react-router-dom';
import { Container, Header } from '../shared/components';


export const UnderConstructionPage = () => (
  <Container>
      <Header/>

      <div className='flex-center flex-column gap-4 md:mt-8'>
          <h1 className='text-4xl' >Under Construction!</h1>
          <img src={logoPng} alt="logo png" height='auto' width={250} />
          <img src={png} alt="image png" height='auto' width={250} />
          <h2 className='text-6xl' >Coming Christmas 2023!</h2>
      </div>
  </Container>
)
