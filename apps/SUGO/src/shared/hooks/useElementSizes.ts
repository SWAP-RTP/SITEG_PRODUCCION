import { useState, useEffect } from 'react'

let c=0
let timer;
function debounce(func, delay) {
  clearTimeout(timer);
  timer = setTimeout(() => func(), delay);
}


export const useElementSizes = (id: string) => {

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  //& Función que se ejecuta cuando cambia el ancho de pantalla
  const handleResize = (element: HTMLElement|null ) => {
    // console.log('-----');
    //? Esperar a que pase el tiempo para setear el estado
    debounce(() => {
      // c++; console.log(c, 'elemnt');
      setSize({
        width: element?.clientWidth ||10,
        height: element?.clientHeight ||10,
      });
    }, 500);
  };

  //& Crear y remover el obsrvador del elemento
  useEffect(() => {
    const element = document.getElementById(id);
    const resizeObserver = new ResizeObserver( () => handleResize(element) );
    if (element) {
      resizeObserver.observe(element);
    }

    // Remover al desmontar el componente
    return () => {
      if (element) {
        resizeObserver.unobserve(element);
      }
    };
  }, []);

  return {
    width: size.width,
    height: size.height
  }
}
