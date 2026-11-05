"""Consistent JSON envelopes for every API response."""

from __future__ import annotations

from flask import jsonify


def ok(data=None, message: str | None = None, status: int = 200, **extra):
    payload = {"success": True}
    if message:
        payload["message"] = message
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return jsonify(payload), status


def fail(message: str, status: int = 400, errors: dict | None = None, code: str | None = None):
    payload = {"success": False, "message": message}
    if errors:
        payload["errors"] = errors
    if code:
        payload["code"] = code
    return jsonify(payload), status
