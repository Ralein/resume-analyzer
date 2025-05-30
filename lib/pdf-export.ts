"use client"

import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export async function exportAnalysisAsPDF(elementId: string, fileName: string) {
  try {
    // Get the element to export
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    // Calculate dimensions to maintain aspect ratio
    const imgWidth = 210 // A4 width in mm (210mm)
    const pageHeight = 297 // A4 height in mm (297mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Create PDF of A4 size
    const pdf = new jsPDF("p", "mm", "a4")
    let position = 0

    // Add image to PDF
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)

    // If content is larger than a single page, add new pages
    const pageCount = Math.ceil(imgHeight / pageHeight)

    if (pageCount > 1) {
      for (let i = 1; i < pageCount; i++) {
        position = -(pageHeight * i) + 10 // 10mm margin
        pdf.addPage()
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
      }
    }

    // Save the PDF
    pdf.save(`${fileName}.pdf`)
    return true
  } catch (error) {
    console.error("Error exporting PDF:", error)
    return false
  }
}
