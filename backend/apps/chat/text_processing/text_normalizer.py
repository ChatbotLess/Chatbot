import re
import unicodedata


class TextNormalizer:
    """Text sanitization utilities used before and after lemmatization."""

    @staticmethod
    def normalize_text(text: str) -> str:
        if not text:
            return ""
        normalized = unicodedata.normalize("NFKC", text)
        return "".join(
            character if character.isprintable() or character in "\n\r\t" else " "
            for character in normalized
        )

    @staticmethod
    def remove_whitespace(text: str) -> str:
        return re.sub(r"\s+", "", text) if text else ""
