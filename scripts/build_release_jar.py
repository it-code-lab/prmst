from __future__ import annotations

import argparse
import json
import shutil
import zipfile
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DIST_DIR = ROOT / "dist"
STAGE_DIR = DIST_DIR / "_release_stage"
DEFAULT_CONFIG_PATH = ROOT / "release.config.json"

FILES = [
    "app.py",
    "requirements.txt",
    "LICENSE.txt",
]

DIRS = [
    "templates",
    "static",
    "remotion/src",
    "remotion/public/assets",
]

BUYER_DOCS = [
    "docs/USER_GUIDE.md",
    "docs/TROUBLESHOOTING.md",
]

REMOTION_FILES = [
    "remotion/package.json",
    "remotion/package-lock.json",
    "remotion/tsconfig.json",
    "remotion/remotion.config.ts",
]


BUYER_README = """# Advertisement Video Studio Buyer Quick Start

Thank you for purchasing Advertisement Video Studio.

## 1. Extract the archive

Extract the `.zip` download to a normal folder before running.

Use 7-Zip, WinRAR, Windows Explorer, macOS Archive Utility, or any tool that can open zip archives.

## 2. Install requirements

Install:

- Python 3.10+
- Node.js 20+
- npm
- FFmpeg and FFprobe on your system PATH
- A modern browser such as Chrome, Edge, or Firefox

Recommended system:

- 8GB RAM minimum
- 16GB RAM for longer videos
- Several GB of free disk space for dependencies, uploaded recordings, and rendered videos

From the extracted folder:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\\Scripts\\activate
```

Mac/Linux:

```bash
source .venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install Remotion dependencies:

```bash
cd remotion
npm install
cd ..
```

## 3. Start the app

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5055
```

## 4. Activate

Enter the Gumroad buyer email and license key from your receipt.

## 5. Learn the workflow

Read:

- `docs/USER_GUIDE.md`
- `docs/TROUBLESHOOTING.md`
- `LICENSE.txt`
"""


def copy_file(relative_path: str) -> None:
    src = ROOT / relative_path
    dst = STAGE_DIR / relative_path
    if not src.exists():
        raise FileNotFoundError(f"Required file missing: {relative_path}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def copy_dir(relative_path: str) -> None:
    src = ROOT / relative_path
    dst = STAGE_DIR / relative_path
    if not src.exists():
        raise FileNotFoundError(f"Required directory missing: {relative_path}")
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def write_release_metadata(version: str, gumroad_url: str, gumroad_product_permalink: str) -> None:
    metadata = {
        "name": "Advertisement Video Studio",
        "version": version,
        "builtAt": datetime.now().isoformat(timespec="seconds"),
        "gumroadUrl": gumroad_url,
        "gumroadProductPermalink": gumroad_product_permalink,
        "licenseRequired": True,
    }
    (STAGE_DIR / "release.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    (STAGE_DIR / "BUYER_README.md").write_text(BUYER_README, encoding="utf-8")
    (STAGE_DIR / "README.md").write_text(BUYER_README, encoding="utf-8")
    (STAGE_DIR / "license_required.flag").write_text(
        "This Gumroad release requires license activation.\n",
        encoding="utf-8",
    )


def create_archive(version: str) -> Path:
    archive_path = DIST_DIR / f"advertisement-video-studio-{version}.zip"
    if archive_path.exists():
        archive_path.unlink()
    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(STAGE_DIR.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(STAGE_DIR))
    return archive_path


def build_release(version: str, gumroad_url: str, gumroad_product_permalink: str) -> Path:
    if STAGE_DIR.exists():
        shutil.rmtree(STAGE_DIR)
    STAGE_DIR.mkdir(parents=True, exist_ok=True)

    for item in FILES + REMOTION_FILES:
        copy_file(item)
    for item in BUYER_DOCS:
        copy_file(item)
    for item in DIRS:
        copy_dir(item)

    write_release_metadata(version, gumroad_url, gumroad_product_permalink)
    archive_path = create_archive(version)
    shutil.rmtree(STAGE_DIR)
    return archive_path


def load_release_config(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse release config {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise SystemExit(f"Release config must be a JSON object: {path}")
    return {str(key): str(value) for key, value in data.items() if value is not None}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a Gumroad release zip for Advertisement Video Studio.")
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG_PATH),
        help="Optional seller-only JSON config file with release defaults.",
    )
    parser.add_argument("--version", default=None, help="Release version used in the output filename.")
    parser.add_argument(
        "--gumroad-url",
        default=None,
        help="Gumroad product URL recorded in release.json.",
    )
    parser.add_argument(
        "--gumroad-product-permalink",
        default=None,
        help="Optional Gumroad product permalink used for online license verification.",
    )
    args = parser.parse_args()
    config = load_release_config(Path(args.config))
    args.version = args.version or config.get("version") or datetime.now().strftime("%Y.%m.%d")
    args.gumroad_url = args.gumroad_url or config.get("gumroadUrl") or "https://gumroad.com/l/advertisement-video-studio"
    args.gumroad_product_permalink = args.gumroad_product_permalink or config.get("gumroadProductPermalink") or ""
    return args


def main() -> None:
    args = parse_args()
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    archive_path = build_release(args.version, args.gumroad_url, args.gumroad_product_permalink)
    size_mb = archive_path.stat().st_size / (1024 * 1024)
    print(f"Built {archive_path}")
    print(f"Size: {size_mb:.2f} MB")
    print("License gate: enabled in packaged release")
    if args.gumroad_product_permalink:
        print("Gumroad online verification: enabled")
    else:
        print("Gumroad online verification: not configured")


if __name__ == "__main__":
    main()
