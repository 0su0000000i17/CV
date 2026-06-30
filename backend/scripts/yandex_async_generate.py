#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys
import traceback
from dataclasses import asdict, is_dataclass
from typing import Any

try:
    from yandex_ai_studio_sdk import AIStudio
except Exception as import_error:  # pragma: no cover
    print(
        json.dumps(
            {
                "error": "Failed to import yandex_ai_studio_sdk. Install it with: pip install yandex-ai-studio-sdk",
                "details": str(import_error),
            },
            ensure_ascii=False,
        ),
        file=sys.stderr,
    )
    sys.exit(1)


def get_required_env(*names: str) -> str:
    for name in names:
        value = os.environ.get(name, "").strip()
        if value:
            return value
    raise RuntimeError(f"One of these environment variables is required: {', '.join(names)}")


def normalize_model_name(model: str) -> str:
    value = model.strip()
    if value.startswith("gpt://"):
        parts = value.split("/")
        return "/".join(parts[3:]) or value
    return value


def to_plain(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if is_dataclass(value):
        return asdict(value)
    if isinstance(value, dict):
        return {str(key): to_plain(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_plain(item) for item in value]
    if hasattr(value, "__dict__"):
        return {key: to_plain(item) for key, item in vars(value).items() if not key.startswith("_")}
    return str(value)


def extract_text(result: Any) -> str:
    alternatives = getattr(result, "alternatives", None)
    if alternatives:
        first = alternatives[0]
        text = getattr(first, "text", "")
        if isinstance(text, str) and text.strip():
            return text.strip()

    text = getattr(result, "text", "")
    if isinstance(text, str) and text.strip():
        return text.strip()

    raise RuntimeError("Yandex async result does not contain text")


def configure_model(model: Any, temperature: float, max_tokens: int) -> Any:
    kwargs = {"temperature": temperature}
    if max_tokens > 0:
        kwargs["max_tokens"] = max_tokens

    try:
        return model.configure(**kwargs)
    except TypeError:
        kwargs.pop("max_tokens", None)
        return model.configure(**kwargs)


def main() -> None:
    payload = json.load(sys.stdin)

    folder_id = get_required_env("YANDEX_CLOUD_FOLDER_ID", "YANDEX_AI_FOLDER_ID")
    api_key = get_required_env("YANDEX_AI_API_KEY")
    model_name = normalize_model_name(str(payload.get("model") or "yandexgpt"))
    temperature = float(payload.get("temperature") or 0)
    max_tokens = int(payload.get("maxTokens") or 0)

    raw_messages = payload.get("messages") or []
    messages = []
    for item in raw_messages:
        role = str(item.get("role") or "user")
        text = str(item.get("text") or "")
        if text.strip():
            messages.append({"role": role, "text": text})

    if not messages:
        raise RuntimeError("messages are required")

    sdk = AIStudio(folder_id=folder_id, auth=api_key)
    completion_model = sdk.models.completions(model_name)
    configured_model = configure_model(completion_model, temperature, max_tokens)
    operation = configured_model.run_deferred(messages)
    result = operation.wait()

    output = {
        "text": extract_text(result),
        "provider": "yandex-async",
        "model": model_name,
        "usage": to_plain(getattr(result, "usage", None)),
        "modelVersion": to_plain(getattr(result, "model_version", None)),
    }
    print(json.dumps(output, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(
            json.dumps(
                {
                    "error": str(error),
                    "trace": traceback.format_exc(limit=8),
                },
                ensure_ascii=False,
            ),
            file=sys.stderr,
        )
        sys.exit(1)
