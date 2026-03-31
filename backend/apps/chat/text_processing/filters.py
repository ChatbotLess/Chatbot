from abc import ABC, abstractmethod
from typing import Optional


class TokenFilter(ABC):
    """Base interface for token filter strategies."""

    @abstractmethod
    def should_skip(self, token) -> bool:
        """Return True when token must be ignored."""

    @abstractmethod
    def transform(self, token) -> Optional[str]:
        """Return transformed token text or None."""


class SkipSpacesFilter(TokenFilter):
    """Ignore tokens that are only whitespace."""

    def should_skip(self, token) -> bool:
        return token.is_space

    def transform(self, token) -> Optional[str]:
        return None


class PunctuationFilter(TokenFilter):
    """
    Punctuation strategy.
    - keep=True: keep punctuation.
    - keep=False: remove punctuation.
    """

    def __init__(self, keep: bool = True):
        self.keep = keep

    def should_skip(self, token) -> bool:
        return token.is_punct and not self.keep

    def transform(self, token) -> Optional[str]:
        if token.is_punct:
            return token.text_with_ws
        return None


class StopWordFilter(TokenFilter):
    """
    Stop word strategy.
    - remove=True: remove stop words.
    - remove=False: keep stop words.
    """

    def __init__(self, remove: bool = True):
        self.remove = remove

    def should_skip(self, token) -> bool:
        return token.is_stop and self.remove

    def transform(self, token) -> Optional[str]:
        return None


class LemmaTransform(TokenFilter):
    """
    Lemma strategy.
    - use_lemma=True: use lemma in lowercase.
    - use_lemma=False: use original token in lowercase.
    """

    def __init__(self, use_lemma: bool = True):
        self.use_lemma = use_lemma

    def should_skip(self, token) -> bool:
        return False

    def transform(self, token) -> Optional[str]:
        if self.use_lemma:
            lemma = token.lemma_.strip().lower()
            if not lemma or lemma == "-pron-":
                lemma = token.text.lower()
            return lemma + token.whitespace_
        return token.text.lower() + token.whitespace_
