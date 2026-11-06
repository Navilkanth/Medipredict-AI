"""Google Gemini integration.

Flow for one analysis:
1. Read the API key from the server environment. Refuse to run if it is missing.
2. Build a prompt that contains only the three lab values.
3. Ask Gemini for a JSON object with five observation fields.
4. Parse that object. If parsing fails, raise an error.
5. Return the five strings to the caller.

The caller decides whether to store them. This module never writes to
the database and never substitutes a canned remark when the API fails.
"""

from __future__ import annotations

import json
import re

from config import Config

REQUIRED_FIELDS = (
    "glucose_observation",
    "haemoglobin_observation",
    "cholesterol_observation",
    "overall_remarks",
    "recommendations",
)

_client = None


class GeminiServiceError(Exception):
    """A safe, user-facing AI failure.

    `code` is a short machine value. `public_message` is what the API
    returns. It must not include the API key or a raw stack trace.
    """

    def __init__(self, public_message: str, code: str, http_status: int = 502):
        super().__init__(public_message)
        self.public_message = public_message
        self.code = code
        self.http_status = http_status


def gemini_is_configured() -> bool:
    return bool(Config.GEMINI_API_KEY)


def build_prompt(glucose: float, haemoglobin: float, cholesterol: float) -> str:
    return f"""You are an AI health information assistant.

Analyse the following patient blood test values:

Glucose: {glucose}
Haemoglobin: {haemoglobin}
Cholesterol: {cholesterol}

Provide preliminary observations based on commonly used adult reference ranges.

For each parameter:
- Explain whether the value appears within or outside a commonly used reference range.
- Explain possible health implications.
- Mention when further clinical evaluation may be appropriate.

Return structured JSON containing:

{{
  "glucose_observation": "",
  "haemoglobin_observation": "",
  "cholesterol_observation": "",
  "overall_remarks": "",
  "recommendations": ""
}}

Important:
- Do not provide a definitive medical diagnosis.
- Do not invent patient information.
- Mention that interpretation depends on age, sex, units, clinical history and laboratory reference ranges.
- Clearly communicate uncertainty.
- Recommend professional medical consultation where appropriate.
- Treat glucose and cholesterol as mg/dL and haemoglobin as g/dL, and say that the source record did not explicitly confirm the units.
- Return JSON only. Do not wrap the JSON in markdown.
"""


def _get_client():
    global _client
    if not gemini_is_configured():
        raise GeminiServiceError(
            "Clinical analysis service is not configured. Add credentials to backend .env.",
            "missing_config",
            503,
        )
    if _client is not None:
        return _client

    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:
        raise GeminiServiceError(
            "Clinical intelligence engine dependencies are missing.",
            "missing_sdk",
            503,
        ) from exc

    timeout_ms = max(Config.GEMINI_TIMEOUT_SECONDS, 1) * 1000
    try:
        _client = genai.Client(
            api_key=Config.GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=timeout_ms),
        )
    except Exception as exc:
        raise GeminiServiceError(
            "The Gemini client could not be started. Check the API key and model settings.",
            "connection",
            502,
        ) from exc
    return _client


def _classify_sdk_error(exc: Exception) -> GeminiServiceError:
    text = str(exc).lower()
    status = getattr(exc, "code", None) or getattr(exc, "status_code", None)
    status_text = str(status).lower() if status is not None else ""

    if "timeout" in text or "timed out" in text or "deadline" in text:
        return GeminiServiceError(
            "The clinical assessment request timed out. You can retry the evaluation.",
            "timeout",
            504,
        )
    if (
        status == 429
        or "429" in text
        or "resource_exhausted" in text
        or "quota" in text
        or "rate limit" in text
    ):
        return GeminiServiceError(
            "Clinical assessment service capacity reached. Please retry shortly.",
            "quota",
            429,
        )
    if (
        status in {401, 403}
        or "api key" in text
        or "permission" in text
        or "unauthenticated" in text
        or status_text in {"401", "403", "permission_denied", "unauthenticated"}
    ):
        return GeminiServiceError(
            "Clinical intelligence credentials invalid. Please check backend configuration.",
            "auth",
            502,
        )
    if (
        "connection" in text
        or "unavailable" in text
        or "name resolution" in text
        or "getaddrinfo" in text
        or status in {500, 502, 503}
    ):
        return GeminiServiceError(
            "Clinical intelligence service could not be reached. You can retry the evaluation.",
            "connection",
            502,
        )
    return GeminiServiceError(
        "Clinical assessment could not be generated. You can retry the evaluation.",
        "api_error",
        502,
    )


def _extract_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise GeminiServiceError(
            "Clinical service returned an unparseable response. No remarks were saved.",
            "invalid_response",
            502,
        ) from exc

    if not isinstance(parsed, dict):
        raise GeminiServiceError(
            "Clinical response format was invalid. No remarks were saved.",
            "invalid_response",
            502,
        )

    observations = {}
    for field in REQUIRED_FIELDS:
        value = parsed.get(field)
        if not isinstance(value, str) or not value.strip():
            raise GeminiServiceError(
                "Incomplete clinical observations received. No remarks were saved.",
                "invalid_response",
                502,
            )
        observations[field] = value.strip()[:5000]
    return observations


def analyze_blood_tests(glucose: float, haemoglobin: float, cholesterol: float) -> dict:
    """Call Gemini and return the five observation strings."""
    client = _get_client()
    prompt = build_prompt(glucose, haemoglobin, cholesterol)

    from google.genai import types

    # Prioritize the configured model, then fallback candidates if Google reports high demand / 503
    candidates = [Config.GEMINI_MODEL]
    for fallback in ("gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"):
        if fallback not in candidates:
            candidates.append(fallback)

    last_exc = None
    response = None

    for model_name in candidates:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                ),
            )
            if response and getattr(response, "text", None):
                break
        except GeminiServiceError:
            raise
        except Exception as exc:
            last_exc = exc
            err_str = str(exc).lower()
            # If 401/403 or missing auth, do not retry other models as keys are invalid
            if "401" in err_str or "403" in err_str or "unauthenticated" in err_str or "permission" in err_str:
                raise _classify_sdk_error(exc) from exc
            # Otherwise continue to next candidate if transient (503, 504, 404, quota spike)
            continue

    if response is None:
        if last_exc is not None:
            raise _classify_sdk_error(last_exc) from last_exc
        raise GeminiServiceError(
            "The Gemini request could not be completed.", "api_error", 502
        )

    raw_text = getattr(response, "text", None)
    if not raw_text or not str(raw_text).strip():
        raise GeminiServiceError(
            "Gemini returned an empty response. No remarks were saved.",
            "invalid_response",
            502,
        )
    return _extract_json(str(raw_text))
