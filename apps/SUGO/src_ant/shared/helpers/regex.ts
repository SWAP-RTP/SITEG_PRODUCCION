/* Expresiones regulares    */


/**
 * Regex para horas en formato 24hrs, ejemplo: '15:57:01'
 */
export const regex_24hrs = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

/**
 * Regex para año en formato dd/mm/yyyy, ejemplo: '30/12/2024'
 */
export const regex_year_ddmmyyyy = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20[0-9]{2}|2[1-9][0-9]{2})$/;

export const regex_year_yyyymmdd = /^(20[0-9]{2}|2[1-9][0-9]{2})\/(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])$/;