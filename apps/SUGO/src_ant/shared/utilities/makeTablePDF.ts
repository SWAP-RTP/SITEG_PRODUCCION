import jsPDF from 'jspdf';
import "jspdf-autotable";
//@ts-ignore
// import headerImg from '../../assets/header_RTP_2023.png';
import headerImg from '../../assets/header_RTP_2024.png';
//@ts-ignore
import footerImg from '../../assets/rtp_ciudadInovadora.jpg';


// interfaces
interface Data { [key: string]: any } 
interface Cols { header: string, field: string }
type Format =   
"a0" | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8" | "a9" | "a10"
| "b0" | "b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8" | "b9" | "b10"
| "c0" | "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7" | "c8" | "c9" | "c10"
| "dl"
| "letter"
| "government-letter"
| "legal"
| "junior-legal"
| "ledger"
| "tabloid"
| "credit-card"
| [number, number];

interface PDFprops{
  title?:     string
  subject?:   string
  author?:    string
  keywords?:  string
  creator?:   string
}

type Color = false|string|number|[number, number, number]
interface StyleDef {
  font?: 'helvetica'|'times'|'courier'                    // = 'helvetica'    (Default)
  fontStyle?: 'normal'|'bold'|'italic'|'bolditalic'       // = 'normal'   (Default)
  overflow?: 'linebreak'|'ellipsize'|'visible'|'hidden'   // = 'linebreak'    (Default)
  fillColor?: Color                   // = null   (Default)
  textColor?: Color                   // = 20 (Default)
  cellWidth?: 'auto'|'wrap'|number    // = 'auto' (Default)
  minCellWidth?: number               // = 10 (Default)
  minCellHeight?: number              // = 0  (Default)
  halign?: 'left'|'center'|'right'    // = 'left' (Default)
  valign?: 'top'|'middle'|'bottom'    // = 'top'  (Default)
  fontSize?: number                   // = 10 (Default)
  cellPadding?: number | { top?: number, right?: number, left?: number, bottom?: number }  // = 10 (Default)
  lineColor?: Color                   // = 10 (Default)
  lineWidth?: number | { top?: number, right?: number, left?: number, bottom?: number }    // = 0  (Default)
}

interface OptionsHeader { title?: string, noImage?: boolean, dynamicContent?: (pdf: jsPDF) => void, showMargins?: boolean }
interface OptionsFooter { ext?: string|number, noImage?: boolean, dynamicContent?: (pdf: jsPDF) => void, showMargins?: boolean }

export interface Options{
  doc?: jsPDF
  initialNumberPage?: number
  autoSave?: boolean
  title?: string
  orientation?: "portrait" | "p" | "landscape" | "l"
  format?: Format
  pdfMetaProperties?: PDFprops
  startY?: number,
  headerColor?: Color
  rowColor?:    Color
  margin?: { top?: number, right?: number, left?: number, bottom?: number }
  tableHeaderStyle?: StyleDef
  tableRowStyle?: StyleDef
  tableAlternateRowStyle?: StyleDef
  tableOptions?
  header?: OptionsHeader
  afterTable?: { text?: string, dynamicContent?: (pdf: jsPDF, h: number) => void }
  footer?: OptionsFooter

  dynamicInitialContent?: (pdf: jsPDF) => void
  dynamicFinalContent?: (pdf: jsPDF, h: number) => void
}

interface HookData {
  table             //Table
  pageNumber: number 
  settings: object  // Parsed user supplied options
  doc: jsPDF        // The jsPDF document instance of this table
  cursor: { x: number, y: number }
}
// FIN de interfaces



/**
 * Helper para exportar PDF
 * 
 * Si se requiere poner headerTitle, title y/o dynamicInitialContent ajustar donde inicia la tabla con startY.
 * 
 * Para abrir en otra hoja: canelar autoSave y ejecutar window.open( bloburl, '_blank' );
 * @returns doc, numero de pagina actual y bloburl (para src de \<iframe />)
 */
export const exportTablePDF = ( dataTable: Data[], cols: Cols[], options: Options = {} ) => {

  const {
    doc,
    initialNumberPage = 1,
    autoSave = true,
    orientation = 'p',
    format = 'letter',
    title = '',
    startY = 40,
    headerColor = [138, 205, 12],  // '#8acd0c',   
    rowColor = '#eaffd6',
    margin = {},
    pdfMetaProperties = {},
    tableHeaderStyle = {},
    tableRowStyle = {},
    tableAlternateRowStyle = {},
    tableOptions = {},
    header = {},
    afterTable = {},
    footer = {},
    dynamicInitialContent,
    dynamicFinalContent
  } = options



  //& Inicializar el PDF
  // Doc: https://artskydj.github.io/jsPDF/docs/jsPDF.html
  const DOC = doc || new jsPDF({
    orientation , 
    format ,      //'a4'==[ 297, 210] | letter==[279, 216]
    unit: 'mm',
    compress: true, 
  });
  !doc && DOC.setProperties({
    title: title || 'PDF',
    subject: 'Generado con jsPDF',
    author: 'JUD DS',
    keywords: 'javascript, PDF',
    creator: 'SUGO',
    ...pdfMetaProperties
  });

  //? Obtener el ancho de la pagina actual
  const pageSize = DOC.internal.pageSize;
  const pageWidth   = pageSize.width ? pageSize.width : pageSize.getWidth();

  //? Opciones para la tabla
  const tableMargin = { top: 45, right: 16, bottom: 30, left: 16, ...margin };
  const tableWidth = pageWidth - ((tableMargin.left)+(tableMargin.right));

  //& Dynamic initial content
  DOC.setFont("helvetica", "bold");
  DOC.setFontSize(20); 
  !!title && DOC.text( `${title}`, pageWidth/2, 35, { align: "center",  maxWidth: pageWidth-34 } );
  !!dynamicInitialContent && dynamicInitialContent(DOC);



  //& Tabla       (Contiene: Header, footer y dataTable )
  // Doc: https://github.com/simonbengtsson/jsPDF-AutoTable/tree/master
  let actualPage = 1
  //@ts-ignore
  DOC.autoTable({
    body: dataTable,
    columns: cols.map((col) => ({ header: col.header, dataKey: col.field })),
    tableWidth ,   // 'auto' it will be 100% of width of the page and if set to 'wrap' it will only be as wide as its content is.
    // // pageBreak: 'auto', // 'auto', 'avoid' or 'always'    'auto' will add a new page only when the next row doesn't fit.
    startY ,              // Indicates where the table should start to be drawn on the first page (overriding the margin top value). It can be used for example to draw content before the table.
    margin: tableMargin,  
    horizontalPageBreak: true,    // Si no cabe el contenido, lo corta y se pone al final
    // horizontalPageBreakRepeat: [0,1,2],

    headStyles: {
      fillColor: headerColor,
      fontSize: 8,
      // overflow: "ellipsize",
      cellWidth: "auto",
      minCellWidth: 15, 
      cellPadding: { top: 1.4, right: 2, bottom: 0.7, left: 2 },
      ...tableHeaderStyle
    },
    styles: {
      halign: "center",
      valign: "middle",
      font: "helvetica",
      cellWidth: "auto",
      textColor: "black",
      fillColor: rowColor,
      lineWidth: 0.25,
      lineColor: "black",
      fontSize: 6,
      cellPadding: { top: 1, right: 2, bottom: 0.5, left: 2 },
      ...tableRowStyle
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
      ...tableAlternateRowStyle
    },
    rowPageBreak: 'avoid',

    ...tableOptions,

    //? Hook por si renderiza mas paginas
    didDrawPage: (hookData: HookData) => {  
      const { doc, pageNumber } = hookData
      actualPage=initialNumberPage + (pageNumber-1)
      //// console.log(hookData.table);
      //& Header
      addHeaderPDF(doc, header);

      //& Footer
      addFooterPDF(doc, {...footer, page: actualPage});
    },
  });


  //& Dynamic final content 
  DOC.setFont("helvetica", "normal");
  DOC.setFontSize(12);
  //@ts-ignore
  const tableFinY = DOC.lastAutoTable.finalY + 10;
  DOC.text(`${afterTable.text || ''}`, 16, tableFinY)
  !!dynamicFinalContent && dynamicFinalContent(DOC, tableFinY);
  !!afterTable.dynamicContent && afterTable.dynamicContent(DOC, tableFinY);
  // Siiiii dynamicFinalContent & afterTable.dynamicContent sirven para lo mismo y que

  //& Guardar PDF
  const now = new Date();
  autoSave && DOC.save( `${title || 'Document'}-${now.getTime()}.pdf` );
  // !autoSave && DOC.output('dataurlnewwindow')

  //& Retorna URI para visualizar en un iframe
  return { bloburl: DOC.output('bloburl'), doc: DOC, actualPage }
};





export const getPageSizesPDF = (doc: jsPDF) => {
  //? Obtener el ancho y alto de la pagina actual
  const pageSize = doc.internal.pageSize;
  const width    = pageSize.width ? pageSize.width : pageSize.getWidth();
  const height   = pageSize.height ? pageSize.height : pageSize.getHeight();
  const widthCenter  = width/2
  const heightCenter = height/2

  return { width, height, widthCenter, heightCenter }
}

const addMarginsToPagePDF = (doc: jsPDF) => {

  const { height, heightCenter, width, widthCenter } = getPageSizesPDF(doc);
  const finishImgHeader = 10+16;
  const margin = { top: finishImgHeader, right: 16, bottom: 25, left: 16 }
  doc.setFontSize(8);
  doc.setTextColor('#f44');

  doc.line(0,margin.top, width, margin.top);
  doc.setDrawColor(255,0,0);
  doc.line(widthCenter, 0, widthCenter, margin.top)
  doc.setDrawColor(0,0,0);
  doc.text(`${margin.top}`, widthCenter-1, margin.top+3);

  doc.line(margin.left, 0, margin.left, height);
  doc.setDrawColor(255,0,0);
  doc.line(0, heightCenter+1, margin.left, heightCenter+1);
  doc.setDrawColor(0,0,0);
  doc.text(`${margin.left}`, 5, heightCenter);
  
  doc.line(width-margin.right, 0, width-margin.right, height);
  doc.setDrawColor(255,0,0);
  doc.line(width-margin.right, heightCenter+1, width, heightCenter+1);
  doc.setDrawColor(0,0,0);
  doc.text(`${margin.right}`, width-9, heightCenter);

  doc.line(0,height-margin.bottom, width, height-margin.bottom);
  doc.setDrawColor(255,0,0);
  doc.line(widthCenter, height-margin.bottom, widthCenter, height)
  doc.setDrawColor(0,0,0);
  doc.text(`${margin.bottom}`, widthCenter-1, height-26)

  doc.setTextColor('#000');
}

/**
 * Añade header "oficial" de RTP a un documento PDF creado con jsPDF
 */
export const addHeaderPDF = (doc: jsPDF, options: OptionsHeader = {}) => {
  const { dynamicContent, noImage, title='', showMargins=false } = options

  //? Obtener el ancho y alto de la pagina actual
  const { width, widthCenter, height, heightCenter } = getPageSizesPDF(doc)
  // //const pageHeight  = pageSize.height ? pageSize.height : pageSize.getHeight();
    
  //? Image ↓    
  !noImage && doc.addImage(headerImg, "jpg", widthCenter-(185/2), 10, 185, 16);
  
  //? Titulo (aparece en todas las paginas como parte del header)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text( `${title}`, width/2, 35, { align: "center",  maxWidth: width-34 } );

  //? Poner cualquier otra cosa en el Header 
  !!dynamicContent && dynamicContent(doc);


  //? Show page margins
  showMargins && addMarginsToPagePDF(doc)
}

/**
 * Añade footer "oficial" de RTP a un documento PDF creado con jsPDF
 */
export const addFooterPDF = (doc: jsPDF, options: (OptionsFooter & {page?: number}) = {} ) => {
  const { dynamicContent, ext='0000', noImage, page, showMargins=false} = options

  //? Obtener el ancho y alto de la pagina actual
  const { width, widthCenter, height } = getPageSizesPDF(doc)

  //? Punto inicial del Footer
  const hFooter = height-15

  //? Membrete
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`
    Versalles No. 46, Col. Juárez
    Alcaldía Cuauhtémoc, C. P. 06600, Ciudad de México
    Tel: 1328 6300   ext: ${ext}
  `, 16-(2*2)+1, hFooter-10);   // 2*2 == Tabulaciones al texto (dentro del codigo) * # de espacios
  
  //? Label del paginador
  doc.setFontSize(10);
  !!page && doc.text(`Página ${page}`, widthCenter, hFooter, {align: "center"});

  //? Imagen. Se puede quitar
  !noImage && doc.addImage(footerImg, "jpg", width-(16+40 +1), hFooter-8, 40, 7);
  // doc.line(85, hFooter,100, hFooter)   //265
  // doc.setFillColor('#eee');
  // doc.rect(10, hFooter-15, pageWidth-20, 20, 'f');

  //? Poner cualquier otra cosa en el Header 
  !!dynamicContent && dynamicContent(doc);


  //? Show page margins
  showMargins && addMarginsToPagePDF(doc)
}

interface CellDef {
  content?: string 
  rowSpan?: number 
  colSpan?: number 
  styles?:  StyleDef
}
type ObjetoConHeaderYField<T> = T & { header: string, cellDef?: CellDef };

export const makeHeaderColsForTablePDF = <T>( cols: (ObjetoConHeaderYField<T>)[] ) => {
  return cols.map((col) => {
    const cellDef = col.cellDef || {};
    return{ 
      content: col.header, 
      colSpan: 1,
      ...cellDef
    }
  })
}


interface Persona { nombre?: string, cargo: string, actividad?: string }
interface PutFirmasOptions { lengthLine?: number, pb?: number }

/**
 * Para cada persona, crear un espacio 
 */
export const putFirmas = (doc: jsPDF, personas: Persona[], options?: PutFirmasOptions) => {
  if(!(personas.length>0)) return
  const { lengthLine=40, pb=40 } = options || {};
  const { height, width } = getPageSizesPDF(doc);
  
  const wD = (width)/(personas.length+1); // dividir ancho de hoja (width divided)
  const l = lengthLine/2;   // Mitad del Largo de la linea (para "centrarla")
  const initX = wD;
  const initY = height-pb;

  doc.setFontSize(8);
  personas.forEach( ({ nombre, cargo, actividad }, i) => {
    doc.text(`${actividad}`, (initX*(i+1)), initY-20, { align: 'center',  maxWidth: lengthLine-4 });
    doc.line( (initX*(i+1))-l, initY, (initX*(i+1))+l, initY );
    doc.text(`${cargo} \n${nombre}`, (initX*(i+1)), initY+5, { align: 'center',  maxWidth: lengthLine-4 });
  });
}
