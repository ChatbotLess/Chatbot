from typing import List

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


class PDFOutputWriter:
    """Write processed text into a PDF file."""

    def __init__(self, font_name: str = "Times-Roman"):
        self.font_name = font_name

    def write_pdf(self, text: str, output_pdf_path: str) -> None:
        pdf_canvas = canvas.Canvas(output_pdf_path, pagesize=A4)
        _, height = A4
        margin_left = margin_right = margin_top = margin_bottom = 2 * cm
        y_position = height - margin_top

        pdf_canvas.setFont(self.font_name, 11)

        for line in self._wrap_text(text, max_chars=95):
            if y_position < margin_bottom:
                pdf_canvas.showPage()
                pdf_canvas.setFont(self.font_name, 11)
                y_position = height - margin_top
            pdf_canvas.drawString(margin_left, y_position, line)
            y_position -= 14

        pdf_canvas.save()

    def _wrap_text(self, text: str, max_chars: int) -> List[str]:
        if not text:
            return []
        return [text[index : index + max_chars] for index in range(0, len(text), max_chars)]
