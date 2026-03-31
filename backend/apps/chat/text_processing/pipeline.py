from typing import List

from .filters import TokenFilter


class TokenNormalizationPipeline:
    """Apply a chain of token filters to a spaCy doc."""

    def __init__(self, filters: List[TokenFilter]):
        self.filters = filters

    def apply(self, doc) -> str:
        output = []

        for token in doc:
            if any(token_filter.should_skip(token) for token_filter in self.filters):
                continue

            result = None
            for token_filter in self.filters:
                result = token_filter.transform(token)
                if result is not None:
                    break

            if result is not None:
                output.append(result)

        return "".join(output).strip()
