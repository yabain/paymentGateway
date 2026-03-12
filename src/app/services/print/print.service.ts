import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  constructor() {}

  public generatePdf(elementId: string, fileName: string): void {
    // Get the receipt content element
    const element = document.getElementById(elementId);

    if (element) {
      // Optimize html2canvas options for smaller file size
      const options = {
        scale: 1.5, // Réduire la résolution (défaut: 2, peut être réduit à 1.5 ou 1)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 0,
        allowTaint: false,
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

      html2canvas(element, options).then(canvas => {
        // Utiliser JPEG avec compression au lieu de PNG
        // Qualité 0.85 = bon compromis qualité/taille (0.0 à 1.0)
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        
        const pdf = new jsPDF('p', 'mm', 'a4');  // Create jsPDF object in portrait mode and A4 size

        // A4 full width
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 0;
        const imgWidth = pageWidth;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = margin;

        // Utiliser 'JPEG' au lieu de 'PNG' pour une meilleure compression
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = margin + (heightLeft - imgHeight);
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(fileName); // Save the generated PDF
      });
    }
  
  }
}
