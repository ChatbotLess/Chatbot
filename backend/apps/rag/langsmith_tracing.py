from functools import wraps
import os

from dotenv import load_dotenv

load_dotenv()

if os.getenv("LANGSMITH_TRACING") and not os.getenv("LANGSMITH_TRACING_V2"):
    os.environ["LANGSMITH_TRACING_V2"] = os.environ["LANGSMITH_TRACING"]

try:
    from langsmith import traceable as _langsmith_traceable
except ImportError:
    _langsmith_traceable = None


def traceable(*args, **kwargs):
    if _langsmith_traceable is None:
        if args and callable(args[0]) and len(args) == 1 and not kwargs:
            return args[0]

        def decorator(func):
            @wraps(func)
            def wrapper(*func_args, **func_kwargs):
                return func(*func_args, **func_kwargs)

            return wrapper

        return decorator

    return _langsmith_traceable(*args, **kwargs)
