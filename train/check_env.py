"""Phase 0 test: verifies that every training package is installed and works.

Run from the repo root:  py train/check_env.py
Every line must say OK. Exit code 0 = environment ready.
"""
import sys

failures = 0


def check(name, fn):
    global failures
    try:
        info = fn()
        print(f"OK    {name:<10} {info}")
    except Skip as e:
        print(f"SKIP  {name:<10} {e}")
    except Exception as e:  # report and keep going, so all problems show at once
        failures += 1
        print(f"FAIL  {name:<10} {type(e).__name__}: {e}")


def py():
    v = sys.version_info
    if v < (3, 10):
        raise RuntimeError(f"Python {v.major}.{v.minor} is too old, need >= 3.10")
    return sys.version.split()[0]


def np_check():
    import numpy as np
    # Tiny numeric test: FFT of a delta is all ones.
    x = np.zeros(8); x[0] = 1.0
    assert np.allclose(np.fft.fft(x), 1.0)
    return np.__version__


def scipy_check():
    import scipy
    from scipy import signal
    b, a = signal.butter(2, 0.1)  # design a filter: proves scipy.signal loads
    assert len(b) == 3
    return scipy.__version__


def sf_check():
    import io
    import numpy as np
    import soundfile as sf
    # Round-trip a 0.1 s, 48 kHz sine through an in-memory WAV.
    t = np.arange(4800) / 48000
    x = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    buf = io.BytesIO()
    sf.write(buf, x, 48000, format="WAV", subtype="FLOAT")
    buf.seek(0)
    y, sr = sf.read(buf, dtype="float32")
    assert sr == 48000 and np.max(np.abs(x - y)) < 1e-7
    return sf.__version__


def torch_check():
    import torch
    # A GRU forward + backward pass: exactly the kind of op Phase 6 needs.
    gru = torch.nn.GRU(input_size=42, hidden_size=24, batch_first=True)
    x = torch.randn(2, 10, 42)
    out, _ = gru(x)
    out.sum().backward()
    assert out.shape == (2, 10, 24)
    return f"{torch.__version__} · threads={torch.get_num_threads()} · cuda={torch.cuda.is_available()}"


class Skip(Exception):
    """Optional package not installed yet: reported, not counted as failure."""


def pesq_check():
    # pesq has no Windows wheel and needs MSVC to compile.
    # Deferred to Phase 8 (evaluation), where it can be installed in the Linux VM.
    try:
        from pesq import pesq  # noqa: F401
    except ImportError:
        raise Skip("not installed (deferred to Phase 8)")
    return "import OK"


def stoi_check():
    from pystoi import stoi  # noqa: F401
    return "import OK"


check("python", py)
check("numpy", np_check)
check("scipy", scipy_check)
check("soundfile", sf_check)
check("torch", torch_check)
check("pesq", pesq_check)
check("pystoi", stoi_check)

print()
print("ENTORNO LISTO" if failures == 0 else f"{failures} FALLO(S): revisa las líneas FAIL")
sys.exit(1 if failures else 0)
