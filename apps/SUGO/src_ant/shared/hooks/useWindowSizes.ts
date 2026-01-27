import { useState, useEffect } from 'react'


/**
 * @returns [ width, height ]
 */
export const useWindowSizes = () => {

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  // Función que se ejecuta cuando cambia el ancho de pantalla
  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    // Agrega un event listener para el evento 'resize'
    window.addEventListener('resize', handleResize);

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height
  }
}
