
/**
 * Redondear nuemros a X decimanles
 */
export const rouded = (number: number, decimals=4) => Math.round(10**decimals * number)/10**decimals