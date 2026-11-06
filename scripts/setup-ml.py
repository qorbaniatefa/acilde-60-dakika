"""Create an isolated ML environment, install fixed versions, train once."""
import os
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
environment = root / '.venv'
python = environment / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
if not python.exists():
    subprocess.run([sys.executable, '-m', 'venv', str(environment)], check=True)
subprocess.run([str(python), '-m', 'pip', 'install', '-r', 'requirements-ml.txt'], cwd=root, check=True)
subprocess.run([str(python), 'train.py'], cwd=root, check=True)
