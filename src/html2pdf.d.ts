/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'html2pdf.js' {
  function html2pdf(): html2pdf.Html2PdfWrapper;
  
  namespace html2pdf {
    interface Html2PdfWrapper {
      from(element: HTMLElement): Html2PdfWrapper;
      set(options: Html2PdfOptions): Html2PdfWrapper;
      save(): Promise<void>;
    }
    
    interface Html2PdfOptions {
      margin?: number | [number, number, number, number];
      filename?: string;
      image?: {
        type?: string;
        quality?: number;
      };
      html2canvas?: {
        scale?: number;
        [key: string]: any;
      };
      jsPDF?: {
        unit?: string;
        format?: string;
        orientation?: 'portrait' | 'landscape';
        [key: string]: any;
      };
      [key: string]: any;
    }
  }
  
  export = html2pdf;
}