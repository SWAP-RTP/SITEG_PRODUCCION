import { useEffect } from 'react'

//! No funciona cuando hay inputs disabled
export const useArrowsLikeTab = () => {
    // Función para manejar el evento de tecla
    const handleKeyDown = (e) => {
        const activeElement = document.activeElement;
        if( !activeElement ) return console.log('Element is null');
        const tags = [activeElement.tagName, 'button', 'input'].join(',')
        const elements = document.querySelectorAll(tags);
        const currentIndex = Array.from(elements).indexOf(activeElement);

        if (e.key === 'ArrowRight') {
            // Si se presiona la flecha derecha, realiza la acción de Tab
            e.preventDefault();
            console.log('right');

            if (currentIndex !== -1 && currentIndex < elements.length - 1) {
                const nextElement = elements[currentIndex + 1];
                //@ts-ignore
                nextElement?.focus();
            }
        } else if (e.key === 'ArrowLeft') {
            // Si se presiona la flecha izquierda, realiza la acción de Shift + Tab
            e.preventDefault();
            console.log('left');

            if (currentIndex !== -1 && currentIndex < elements.length - 1) {
                const nextElement = elements[currentIndex - 1];
                //@ts-ignore
                nextElement?.focus();
            }
        }
    };

    // Agregar el event listener cuando el componente se monta
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
        // Eliminar el event listener cuando el componente se desmonta
        document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
  
    return { 
        active: true
    }
}
