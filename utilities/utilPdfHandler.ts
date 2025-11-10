import PDFParser from 'pdf2json';

export class UtiPDFhandler {

    constructor() {

    }

    private async getPDFContents(pdfFilePath: string): Promise<any> {
        let pdfParser = new PDFParser();
        return new Promise((resolve, reject) => {
            pdfParser.on('pdfParser_dataError', (errData: { parserError: Error } | Error) => {
                const error = errData instanceof Error ? errData : errData.parserError;
                reject(error);
            });
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
                resolve(pdfData);
            });

            pdfParser.loadPDF(pdfFilePath);
        });

    }

    public async getPDFtextContent(downloadPath: string) {
        const pdfContents = await this.getPDFContents(downloadPath);
        let PDFtext = "";
        pdfContents.Pages.forEach((Page: any) => {
            Page.Texts.forEach((Text: any) => {
                Text.R.forEach((R: any) => {
                    PDFtext += decodeURIComponent(R.T || '').trim() + ' ';
                });
            });
        });
        return PDFtext;
    }
}      
