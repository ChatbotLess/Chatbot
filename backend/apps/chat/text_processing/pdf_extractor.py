from typing import Dict, List

import pdfplumber


class PDFTextExtractor:
    """Extract text from PDF files while ignoring table regions."""

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        all_pages_text = []

        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                table_bboxes = self._get_table_bboxes(page)
                words = page.extract_words(use_text_flow=True, keep_blank_chars=False)
                filtered_words = [
                    word
                    for word in words
                    if not self._is_inside_any_bbox(word, table_bboxes)
                ]
                page_text = self._rebuild_text(filtered_words)
                all_pages_text.append(page_text)

        return "\n\n".join(page_text for page_text in all_pages_text if page_text.strip())

    def _get_table_bboxes(self, page) -> List[tuple]:
        try:
            return [table.bbox for table in page.find_tables()]
        except Exception:
            return []

    def _is_inside_any_bbox(self, word: Dict, bboxes: List[tuple]) -> bool:
        x0, x1, top, bottom = word["x0"], word["x1"], word["top"], word["bottom"]
        return any(
            x0 >= bx0 and x1 <= bx1 and top >= btop and bottom <= bbottom
            for bx0, btop, bx1, bbottom in bboxes
        )

    def _rebuild_text(self, words: List[Dict], line_tolerance: float = 3.0) -> str:
        if not words:
            return ""

        words = sorted(words, key=lambda word: (word["top"], word["x0"]))
        lines, current_line, current_top = [], [], None

        for word in words:
            word_top = word["top"]
            if current_top is None:
                current_line, current_top = [word], word_top
                continue

            if abs(word_top - current_top) <= line_tolerance:
                current_line.append(word)
                current_top = (current_top + word_top) / 2
            else:
                line_text = " ".join(
                    w["text"] for w in sorted(current_line, key=lambda item: item["x0"])
                )
                if line_text.strip():
                    lines.append(line_text.strip())
                current_line, current_top = [word], word_top

        if current_line:
            line_text = " ".join(
                w["text"] for w in sorted(current_line, key=lambda item: item["x0"])
            )
            if line_text.strip():
                lines.append(line_text.strip())

        return "\n".join(lines)
