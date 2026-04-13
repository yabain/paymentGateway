import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  constructor() {}

  private pxToMm(px: number): number {
    return px * 0.2645833333;
  }

  public generatePdf(
    elementId: string,
    fileName: string,
    pageWidth: number = 210,
    pageHeight: number = 297,
    dynamicSize: boolean = false,
    renderScale: number = 1.2,
    imageQuality: number = 0.82,
  ): Promise<void> {
    // Get the receipt content element
    const element = document.getElementById(elementId);

    if (element) {
      const captureElement =
        element.children.length === 1
          ? (element.children.item(0) as HTMLElement)
          : element;
      const safePageWidth = Number(pageWidth);
      const safePageHeight = Number(pageHeight);
      const rect = captureElement.getBoundingClientRect();
      const targetWidth = Math.max(
        1,
        Math.round(
          captureElement.scrollWidth ||
            captureElement.clientWidth ||
            rect.width ||
            1,
        ),
      );
      const targetHeight = Math.max(
        1,
        Math.round(
          captureElement.scrollHeight ||
            captureElement.clientHeight ||
            rect.height ||
            1,
        ),
      );

      // Optimize html2canvas options for smaller file size
      const options = {
        scale: Math.max(0.7, Math.min(renderScale, 2)),
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 15000,
        allowTaint: false,
        width: targetWidth,
        height: targetHeight,
        windowWidth: targetWidth,
        windowHeight: targetHeight,
        // Optimiser les images
        onclone: (clonedDoc: Document) => {
          // Réduire la qualité des images dans le clone
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img: HTMLImageElement) => {
            // Forcer le chargement des images avant capture
            if (!img.complete) {
              img.style.display = 'none';
            }
          });
        }
      };

      return html2canvas(captureElement, options).then(canvas => {
        if (!canvas || canvas.width < 1 || canvas.height < 1) {
          console.error('PDF generation aborted: invalid canvas size', {
            canvasWidth: canvas?.width,
            canvasHeight: canvas?.height,
          });
          return;
        }

        // Utiliser JPEG avec compression au lieu de PNG
        // Qualité 0.85 = bon compromis qualité/taille (0.0 à 1.0)
        const imgData = canvas.toDataURL(
          'image/jpeg',
          Math.max(0.5, Math.min(imageQuality, 0.95)),
        );

        if (dynamicSize) {
          const pdfWidthMm = this.pxToMm(canvas.width);
          const pdfHeightMm = this.pxToMm(canvas.height);
          const pdf = new jsPDF({
            orientation: pdfWidthMm >= pdfHeightMm ? 'l' : 'p',
            unit: 'mm',
            format: [pdfWidthMm, pdfHeightMm],
            compress: true,
          });
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
          pdf.save(fileName);
          return;
        }
        
        const pdf = new jsPDF('p', 'mm', 'a4');  // Create jsPDF object in portrait mode and A4 size

        // A4 full width
        // const pageWidth = 210;
        // const pageHeight = 297;
        const margin = 0;
        const imgWidth = Number.isFinite(safePageWidth) && safePageWidth > 0 ? safePageWidth : 210;
        const fallbackPageHeight = Number.isFinite(safePageHeight) && safePageHeight > 0 ? safePageHeight : 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (!Number.isFinite(imgHeight) || imgHeight <= 0) {
          console.error('PDF generation aborted: invalid image size', { imgWidth, imgHeight });
          return;
        }
        let heightLeft = imgHeight;
        let position = margin;

        // Utiliser 'JPEG' au lieu de 'PNG' pour une meilleure compression
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= fallbackPageHeight;

        while (heightLeft > 0) {
          position = margin + (heightLeft - imgHeight);
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
          heightLeft -= fallbackPageHeight;
        }

        pdf.save(fileName); // Save the generated PDF
      }).catch((error) => {
        console.error('PDF generation error:', error);
      });
    }
    return Promise.resolve();
  }
}
