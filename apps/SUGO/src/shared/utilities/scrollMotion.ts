
type Options = 
| {perc: number, distance?: number}
| {perc?: number, distance: number}


export const scrollDown = (elementQuery: string, options: Options ) => {
    const {perc, distance} = options 

    const element = document.querySelector(elementQuery);
    const scrollHeight = element?.scrollHeight || 0;    // Alto total del contenido del elemento
    //@ts-ignore
    const scrollTop = distance || scrollHeight * (perc>1 ? (perc/100):perc);    // Desplazamiento en vertical
    element?.scrollTo({
        top: scrollTop,
        // left: 500,
        behavior: 'smooth'
    });
}