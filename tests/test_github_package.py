import tempfile
import unittest
from pathlib import Path
from scripts.prepare_github_upload import select_files


class GithubPackage(unittest.TestCase):
    def test_only_project_sources_and_public_artifacts_are_selected(self):
        with tempfile.TemporaryDirectory(prefix='primer-upload-test-') as temporary:
            root = Path(temporary).resolve()
            files = ['package.json', '.env.example', '.env.local', '.env',
                     'src/App.tsx', 'src/.env.production', 'src/node_modules/secret.txt',
                     'test/game.test.ts', 'test/images/private.png', 'test/labels/private.txt',
                     'public/ort/runtime.wasm', 'model/model.onnx', 'data/etiket_kalitesi.json',
                     '.github/workflows/pages.yml', '.venv/token', '.review-tools/token',
                     'artifacts/demo/raw/private.webm', 'artifacts/demo/primer-v2-pilot.mp4',
                     'teslim/github-yukleme/.git/config']
            for name in files:
                target = root / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text('fixture', encoding='utf-8')
            selected = {p.relative_to(root).as_posix() for p in select_files(root)}
            self.assertTrue({'.env.example', 'src/App.tsx', 'test/game.test.ts',
                             'public/ort/runtime.wasm', 'model/model.onnx', 'data/etiket_kalitesi.json',
                             '.github/workflows/pages.yml', 'artifacts/demo/primer-v2-pilot.mp4'} <= selected)
            self.assertFalse({'.env.local', '.env', 'src/.env.production', 'src/node_modules/secret.txt',
                              'test/images/private.png', 'test/labels/private.txt', '.venv/token',
                              '.review-tools/token', 'artifacts/demo/raw/private.webm',
                              'teslim/github-yukleme/.git/config'} & selected)


if __name__ == '__main__':
    unittest.main()
