export const cellStyle: React.CSSProperties = {
    padding: 10,
    textAlign: 'center',
    verticalAlign: 'middle',
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif'",
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.2px',
    border: '1px solid #d1d5db'
};

export const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 700,
    fontSize: 16,
    background: '#2f23aeff',
    color: '#fff',
    border: '1px solid #2f23ae'
};

export const tableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: 15,
    borderRadius: 12,
    overflow: 'hidden',
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif'",
    border: '1px solid #d1d5db'
};
