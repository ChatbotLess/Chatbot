from .filters import (
    LemmaTransform,
    PunctuationFilter,
    SkipSpacesFilter,
    StopWordFilter,
    TokenFilter,
)
from .pipeline import TokenNormalizationPipeline
from .presets import NormalizationPresets
from .processor import PDFTextProcessor


def run_text_processing_flow(path) -> None:
    PDF = path

    processor = PDFTextProcessor(
        pipeline=NormalizationPresets.keep_punctuation()
    )

    custom_pipeline = TokenNormalizationPipeline([
        SkipSpacesFilter(),
        PunctuationFilter(keep=True),   # mantem pontuacao
        StopWordFilter(remove=False),   # mantem stop words
        LemmaTransform(use_lemma=True), # ainda lematiza
    ])

    # Mantido para preservar o fluxo solicitado, mesmo sem uso direto abaixo.
    _ = custom_pipeline

    output = processor.process_pdf(PDF)
    print(f"PDF gerado: {output}")


__all__ = [
    "TokenFilter",
    "SkipSpacesFilter",
    "PunctuationFilter",
    "StopWordFilter",
    "LemmaTransform",
    "TokenNormalizationPipeline",
    "NormalizationPresets",
    "PDFTextProcessor",
    "run_text_processing_flow",
]


if __name__ == "__main__":
    run_text_processing_flow()
