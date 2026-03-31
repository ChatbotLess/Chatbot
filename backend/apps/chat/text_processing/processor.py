from pathlib import Path
from typing import Optional

from .pdf_extractor import PDFTextExtractor
from .pdf_writer import PDFOutputWriter
from .pipeline import TokenNormalizationPipeline
from .presets import NormalizationPresets
from .spacy_loader import SpacyModelLoader
from .text_normalizer import TextNormalizer


class PDFTextProcessor:
    """Main orchestrator for PDF text extraction and normalization."""

    def __init__(
        self,
        spacy_model: str = "pt_core_news_lg",
        pipeline: Optional[TokenNormalizationPipeline] = None,
    ):
        self.nlp = self._load_spacy_model(spacy_model)
        self.font_name = "Times-Roman"
        self.pipeline = pipeline or NormalizationPresets.full_normalization()

        self.extractor = PDFTextExtractor()
        self.normalizer = TextNormalizer()
        self.writer = PDFOutputWriter(font_name=self.font_name)

    def _load_spacy_model(self, model_name: str):
        return SpacyModelLoader.load(model_name)

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        return self.extractor.extract_text_from_pdf(pdf_path)

    def _get_table_bboxes(self, page):
        return self.extractor._get_table_bboxes(page)

    def _is_inside_any_bbox(self, word, bboxes):
        return self.extractor._is_inside_any_bbox(word, bboxes)

    def _rebuild_text(self, words, line_tolerance: float = 3.0) -> str:
        return self.extractor._rebuild_text(words, line_tolerance=line_tolerance)

    def normalize_text(self, text: str) -> str:
        return self.normalizer.normalize_text(text)

    def remove_whitespace(self, text: str) -> str:
        return self.normalizer.remove_whitespace(text)

    def lemmatize_text(self, text: str) -> str:
        if not text:
            return ""
        doc = self.nlp(text)
        return self.pipeline.apply(doc)

    def process_pdf(
        self,
        input_pdf_path: str,
        output_pdf_path: Optional[str] = None,
    ) -> str:
        input_path = Path(input_pdf_path)
        if not input_path.exists():
            raise FileNotFoundError(f"Arquivo nao encontrado: {input_pdf_path}")

        if output_pdf_path is None:
            output_pdf_path = str(
                input_path.with_name(f"{input_path.stem}_processado.pdf")
            )

        raw_text = self.extract_text_from_pdf(str(input_path))
        normalized_text = self.normalize_text(raw_text)
        lemmatized_text = self.lemmatize_text(normalized_text)
        print(lemmatized_text[:500])
        final_text = self.remove_whitespace(lemmatized_text)

        self.writer.write_pdf(final_text, output_pdf_path)
        return output_pdf_path

    def _write_pdf(self, text: str, output_pdf_path: str) -> None:
        self.writer.write_pdf(text, output_pdf_path)

    def _wrap_text(self, text: str, max_chars: int):
        return self.writer._wrap_text(text, max_chars=max_chars)
