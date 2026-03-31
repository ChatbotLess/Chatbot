from .filters import LemmaTransform, PunctuationFilter, SkipSpacesFilter, StopWordFilter
from .pipeline import TokenNormalizationPipeline


class NormalizationPresets:
    """Factory with common token normalization configurations."""

    @staticmethod
    def full_normalization() -> TokenNormalizationPipeline:
        return TokenNormalizationPipeline(
            [
                SkipSpacesFilter(),
                PunctuationFilter(keep=False),
                StopWordFilter(remove=True),
                LemmaTransform(use_lemma=True),
            ]
        )

    @staticmethod
    def keep_punctuation() -> TokenNormalizationPipeline:
        return TokenNormalizationPipeline(
            [
                SkipSpacesFilter(),
                PunctuationFilter(keep=True),
                StopWordFilter(remove=True),
                LemmaTransform(use_lemma=True),
            ]
        )

    @staticmethod
    def keep_stopwords() -> TokenNormalizationPipeline:
        return TokenNormalizationPipeline(
            [
                SkipSpacesFilter(),
                PunctuationFilter(keep=False),
                StopWordFilter(remove=False),
                LemmaTransform(use_lemma=True),
            ]
        )

    @staticmethod
    def minimal() -> TokenNormalizationPipeline:
        return TokenNormalizationPipeline(
            [
                SkipSpacesFilter(),
                PunctuationFilter(keep=True),
                StopWordFilter(remove=False),
                LemmaTransform(use_lemma=True),
            ]
        )

    @staticmethod
    def no_lemma() -> TokenNormalizationPipeline:
        return TokenNormalizationPipeline(
            [
                SkipSpacesFilter(),
                PunctuationFilter(keep=False),
                StopWordFilter(remove=True),
                LemmaTransform(use_lemma=False),
            ]
        )
