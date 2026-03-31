import spacy


class SpacyModelLoader:
    """Load spaCy models with a consistent error message."""

    @staticmethod
    def load(model_name: str):
        try:
            return spacy.load(model_name)
        except Exception as error:
            raise RuntimeError(
                f"Nao foi possivel carregar o modelo spaCy '{model_name}'. "
                f"Instale com: python -m spacy download {model_name}"
            ) from error
