/**
 * remueve elementos HTML que sean hijos de un elemento HTML y contengas cierta etiqueta, id (#) o class (.)
 * @param selector etiqueta, #id o .class del elemento padre
 * @param childrenSelector etiqueta, #id o .class para eliminar el elemento que lo contenga 
 */
export const removeHTMLelements = (selector: string, childrenSelector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      const elementsToRemove = element.querySelectorAll(childrenSelector);;
      elementsToRemove.forEach(element => element.remove());
    }
};

/**
 * Recorre elementos HTML en busca de strings, los une en uno solo y lo devuelve
 * @param element 
 * @returns texto dentro de los elementos HTML
 */
export const getInnerText = (element: JSX.Element) => {
  const textos: string[] = []

  if( typeof element?.props?.children == 'string') textos.push(element?.props?.children)
  else {
    element?.props?.children.forEach( item => {
      (typeof item == 'string') 
      ? textos.push(item) 
      : textos.push( getInnerText(item) )
    })
  }

  return textos.join('')
}