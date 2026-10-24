"""Reference vectors for web/io/wav.js (plan step F1.5).

Each case is a float32 signal and a sample rate. The expected 16-bit codes use
the plan's scale (clip to [-1, 1], times 32767, round half up as JavaScript's
Math.round). The expected file is written by soundfile (libsndfile), an
independent implementation of the WAV format, so the hand-written header in
web/io/wav.js is checked against it byte for byte.

Usage:
    python tests/ref/wav_ref.py           writes tests/ref/vectors/wav.json
    python tests/ref/wav_ref.py --check   compares a fresh run with the file
"""

import io
import json
import sys
from pathlib import Path
from typing import Any

import numpy as np
import soundfile

VECTORS_PATH = Path(__file__).parent / "vectors" / "wav.json"
SOURCE = "tests/ref/wav_ref.py"

INT16_SCALE = 32767  # the plan's scale: 1.0 -> 32767, -1.0 -> -32767
RANDOM_SEED = 20261024
RANDOM_COUNT = 1000
RANDOM_PEAK = 1.2  # above 1, so the random case also exercises clipping
RATE_48K_HZ = 48000
RATE_44K_HZ = 44100


def build_cases() -> list[dict[str, Any]]:
    """Returns the reference cases, in the order the JS tests expect."""
    rng = np.random.default_rng(RANDOM_SEED)
    edge_values = [
        0,
        1,
        -1,
        0.5,
        -0.5,
        1.5,
        -1.5,
        0.5 / INT16_SCALE,
        -0.5 / INT16_SCALE,
        1.5 / INT16_SCALE,
        -1.5 / INT16_SCALE,
        1e-9,
        -1e-9,
    ]
    random_values = rng.uniform(-RANDOM_PEAK, RANDOM_PEAK, RANDOM_COUNT)
    return [
        make_case("edge values at 48 kHz", edge_values, RATE_48K_HZ),
        make_case("seeded random, peak 1.2, at 48 kHz", random_values, RATE_48K_HZ),
        make_case("one sample at 44.1 kHz (sample rate field)", [0.25], RATE_44K_HZ),
        make_case("empty signal (header only)", [], RATE_48K_HZ),
    ]


def make_case(name: str, values: Any, sample_rate_hz: int) -> dict[str, Any]:
    """Builds one case and checks that soundfile reads its own file back unchanged."""
    signal = np.asarray(values, dtype=np.float32)
    # floor(x + 0.5) mirrors Math.round; numpy's round would send halves to even.
    clipped = np.clip(signal.astype(np.float64), -1, 1)
    expected = np.floor(clipped * INT16_SCALE + 0.5).astype(np.int16)
    wav_bytes = write_wav(expected, sample_rate_hz)
    read_back, read_rate = soundfile.read(io.BytesIO(wav_bytes), dtype="int16")
    if read_rate != sample_rate_hz or not np.array_equal(read_back, expected):
        raise AssertionError(f"soundfile did not read back its own file: {name}")
    return {
        "name": name,
        "sampleRateHz": sample_rate_hz,
        "input": [float(value) for value in signal],
        "expectedInt16": [int(code) for code in expected],
        "expectedWavHex": wav_bytes.hex(),
    }


def write_wav(codes: np.ndarray, sample_rate_hz: int) -> bytes:
    """Writes 16-bit mono PCM codes as a WAV file in memory with soundfile."""
    buffer = io.BytesIO()
    soundfile.write(buffer, codes, sample_rate_hz, subtype="PCM_16", format="WAV")
    return buffer.getvalue()


def build_document() -> dict[str, Any]:
    """Returns the whole JSON document."""
    return {
        "source": SOURCE,
        "library": (
            f"soundfile {soundfile.__version__}, libsndfile {soundfile.__libsndfile_version__}"
        ),
        "cases": build_cases(),
    }


def main(arguments: list[str]) -> int:
    """Writes the vectors, or with --check compares only `cases` with the committed file."""
    document = build_document()
    if arguments == ["--check"]:
        committed = json.loads(VECTORS_PATH.read_text(encoding="utf-8"))
        matches = committed["cases"] == document["cases"]
        print("OK" if matches else "FAIL")
        return 0 if matches else 1
    if arguments:
        print(f"unknown arguments: {arguments}", file=sys.stderr)
        return 2
    VECTORS_PATH.parent.mkdir(parents=True, exist_ok=True)
    VECTORS_PATH.write_text(json.dumps(document, indent=1) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
