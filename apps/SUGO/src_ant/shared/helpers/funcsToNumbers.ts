

/*** Redondea un número a N decimales */
export const fixN = (numero: number, fixedTo=4) => {
    return parseFloat(numero.toFixed(fixedTo))
}