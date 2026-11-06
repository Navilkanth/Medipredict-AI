"""Screening bands for charts and the high-glucose dashboard card.

These cut-offs are commonly published adult ranges. They group numbers
that are already stored. They are not a diagnosis.

Standard clinical measurement units:
- glucose: mg/dL
- cholesterol: mg/dL
- haemoglobin: g/dL

A clinician still needs age, sex, fasting state, units, and the
laboratory's own reference interval.
"""

GLUCOSE_LOW_BELOW = 70
GLUCOSE_TYPICAL_MAX = 99
GLUCOSE_HIGH_FROM = 126

CHOLESTEROL_BORDERLINE_FROM = 200
CHOLESTEROL_HIGH_FROM = 240

HAEMOGLOBIN_LOW_BELOW = 12.0
HAEMOGLOBIN_HIGH_FROM = 17.5


def glucose_band(value: float) -> str:
    if value < GLUCOSE_LOW_BELOW:
        return "Below 70"
    if value <= GLUCOSE_TYPICAL_MAX:
        return "70–99"
    if value < GLUCOSE_HIGH_FROM:
        return "100–125"
    return "126 and above"


def cholesterol_band(value: float) -> str:
    if value < CHOLESTEROL_BORDERLINE_FROM:
        return "Below 200"
    if value < CHOLESTEROL_HIGH_FROM:
        return "200–239"
    return "240 and above"


def haemoglobin_band(value: float) -> str:
    if value < HAEMOGLOBIN_LOW_BELOW:
        return "Below 12"
    if value < HAEMOGLOBIN_HIGH_FROM:
        return "12–17.4"
    return "17.5 and above"


GLUCOSE_BANDS = ["Below 70", "70–99", "100–125", "126 and above"]
CHOLESTEROL_BANDS = ["Below 200", "200–239", "240 and above"]
HAEMOGLOBIN_BANDS = ["Below 12", "12–17.4", "17.5 and above"]
