Vendored copy of the shared toolkit from the Lemo-Opuscar library (code: MIT, see LICENSE and LICENSES/).
Large model and sample files are NOT included; the runbook downloads them at run time:
  sh tools/fetch.sh voice            (Kokoro TTS model)
  sh tools/fetch.sh instruments all  (or only the libraries a score needs; see core/audio/sampler.py --need)
Install: npm install ; python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -r requirements-voice.txt -r requirements-music.txt
