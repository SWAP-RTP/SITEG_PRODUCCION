import React, { useContext, useEffect } from 'react'
import { redirect, useLocation, useNavigate } from 'react-router-dom'
import { getDataInTokenByPath } from '../shared/helpers'
import { UseFetchGet } from '../shared/helpers-HTTP'
import { Container, Header } from '../shared/components'
import { Loading1 } from '../shared/components/Loaders'
// import { GeneralContext } from '../shared/GeneralContext'
import useAuthStore from '../shared/auth/useAuthStore'


const apiDataUser = import.meta.env.VITE_SGA_TRABAJADORLOGGED
const apiVerifyToken = import.meta.env.VITE_SGA_TOKEN_VERIFY


export const HomePage = () => {

  const navigate = useNavigate();

  const login = useAuthStore( state => state.login )
  const location = useLocation();

  useEffect(() => {

    const dataUser = JSON.parse( sessionStorage.getItem('user') as string )
    if(!!dataUser){
      const { nombre, modulo, credencial, appId } = dataUser
      login( nombre, modulo, credencial, appId)

    }
    else if( !location.search ) {
      login( 'devE', 0, 1001)
      // sessionStorage.setItem( 'user', JSON.stringify({nombreCompleto: 'devE', moduloClave:0, credencial:'1001'}) );          
      console.log('errorLogin', 'no token in query');
    }
    else{
      const {credencial, idApp, token}  = getDataInTokenByPath(location.search);
    
      console.log('doingFetch');
      UseFetchGet( `${apiDataUser}/${credencial}` ) 
        .then( ({nombreCompleto, moduloClave}) => {
          login( nombreCompleto, moduloClave, credencial, idApp)
          // sessionStorage.setItem( 'user', JSON.stringify({nombreCompleto, moduloClave, credencial}) );          
        } )
        .catch( (err) => {
          login( 'devE', 6, 1001)
          // sessionStorage.setItem( 'user', JSON.stringify({nombreCompleto: 'devE', moduloClave:6, credencial:'1001'}) );          
          console.log('errorLogin', err);
        } )
      .finally( () => navigate('/') ); 
    }


  }, [])
  

  return (
    <>
    <Container>
        <Header links={[]} />
        <Loading1 size={250} strokeWidth={3} />
        
    </Container>
    </>
  )
}
