const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
});

export const convertToMXN = (number: (number|string)) => formatter.format(Number(number));
