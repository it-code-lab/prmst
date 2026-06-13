from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import requests
from flask import Flask, abort, jsonify, redirect, render_template, request, send_from_directory
from slugify import slugify
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = BASE_DIR / "projects"
OUTPUTS_DIR = BASE_DIR / "outputs"
REMOTION_DIR = BASE_DIR / "remotion"
REMOTION_PUBLIC_DIR = REMOTION_DIR / "public"
REMOTION_PUBLIC_PROJECTS = REMOTION_DIR / "public" / "projects"
LICENSE_REQUIRED_FLAG = BASE_DIR / "license_required.flag"
LICENSE_FILE = BASE_DIR / "license.json"
RELEASE_FILE = BASE_DIR / "release.json"

ALLOWED_VIDEO_EXTENSIONS = {"mp4", "mov", "webm", "mkv"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "m4a", "aac", "ogg"}
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
ALLOWED_BACKGROUND_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS
CLIP_MODES = {"device-screen", "full-screen", "background", "overlay"}
THUMBNAIL_BUMPER_POSITIONS = {"none", "start", "end"}
THUMBNAIL_BUMPER_FITS = {"cover", "contain"}
MAX_PROJECT_DURATION_SECONDS = 600
DEFAULT_MIN_SCENE_SECONDS = 2.5
DEFAULT_TARGET_SCENE_SECONDS = 4.5
DEFAULT_MAX_SCENE_SECONDS = 7.0
MAX_SCENE_PACING_SECONDS = MAX_PROJECT_DURATION_SECONDS
RENDER_PROGRESS_RE = re.compile(r"(Rendered|Encoded)\s+(\d+)\s*/\s*(\d+)", re.IGNORECASE)
RENDER_PHASE_RE = re.compile(r"^(Bundling|Copying public dir|Getting composition)", re.IGNORECASE)
RENDER_THREADS: dict[str, threading.Thread] = {}
DEFAULT_RENDER_TIMEOUT_MS = 120_000
DEFAULT_RENDER_CONCURRENCY = 2
CAPTION_WORD_MAX = 8
CAPTION_SENTENCE_MAX = 12
TRANSCRIPTION_LANGUAGES = {
    "auto": None,
    "en": "en",
    "hi": "hi",
    "ur": "ur",
    "bn": "bn",
    "ta": "ta",
    "te": "te",
    "mr": "mr",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "pa": "pa",
}
TRANSCRIPTION_PROMPTS = {
    "hi": "यह हिंदी ऑडियो है। केवल देवनागरी हिंदी में सटीक लिप्यंतरण करें। रोमन या उर्दू लिपि का उपयोग न करें।",
    "ur": "یہ اردو آڈیو ہے۔ براہ کرم اردو رسم الخط میں درست متن لکھیں۔",
}
TRANSCRIPTION_HOTWORDS = {
    "hi": "हिंदी देवनागरी कहानी बात पुरानी गांव सुबह रोशनी बाजार बच्चा",
}
LATIN_OR_ARABIC_SCRIPT_RE = re.compile(r"[A-Za-z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")
ARABIC_SCRIPT_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")
DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")
SCRIPT_SENTENCE_END_RE = re.compile(r"[.!?\u0964\u0965]$")
SCRIPT_WORD_STRIP_RE = re.compile(r"^[\s\"'“”‘’([{<]+|[\s\"'“”‘’.,!?;:\u0964\u0965)\]}>]+$")
WHISPERX_DEFAULT_ALIGN_MODELS = {
    "hi": "theainerd/Wav2Vec2-large-xlsr-hindi",
}

DEFAULT_SCENE_DESIGN: dict[str, Any] = {
    "background": "reading-room",
    "device": "tablet-pro",
    "angle": "low-desk-left",
    "motion": "slow-push-in",
    "motionAmount": 2.2,
    "screenZoom": 1,
    "transition": "soft-fade",
    "captionStyle": "white-chip",
    "captionPosition": "auto",
    "captionAnimation": "none",
    "captionSize": "standard",
    "captionAccent": "none",
    "captionAnimationAmount": 1.4,
}

DEVICE_PRESETS = [
    "tablet-pro",
    "laptop-silver",
    "phone-modern",
    "browser-window",
    "full-screen",
]

CAPTION_STYLE_PRESETS = [
    "white-chip",
    "glass-card",
    "bold-bottom",
    "editorial-card",
    "neon-ribbon",
    "kinetic-stack",
    "minimal-subtitle",
    "device-callout",
    "creator-pop",
    "karaoke-card",
]

CAPTION_FONT_PRESETS = {
    "",
    "Inter",
    "Arial",
    "Georgia",
    "Merriweather",
    "Verdana",
    "Trebuchet MS",
    "Tahoma",
    "Comic Sans MS",
    "Hindi Kids",
    "Hindi Story",
    "Hindi Devotional",
    "Hindi Scary",
}

BACKGROUND_PRESETS = [
    "reading-room",
    "office-desk",
    "cafe-table",
    "dark-studio",
    "home-office",
    "classroom",
    "meeting-room",
    "evening-desk",
    "kitchen-counter",
    "creator-studio",
    "story-kids",
    "story-inspirational",
    "story-hindu-devotional",
    "story-diya-glow",
    "story-temple-lamps",
    "story-devotional-aura",
    "story-starry-night",
    "story-moon-magic",
    "story-magic-forest",
    "story-haunted-mist",
    "story-podcast-waves",
    "story-talk",
    "story-scary",
]

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024 * 1024  # 2GB for screen recordings

for path in [PROJECTS_DIR, OUTPUTS_DIR, REMOTION_PUBLIC_PROJECTS]:
    path.mkdir(parents=True, exist_ok=True)


def read_release_info() -> dict[str, Any]:
    if not RELEASE_FILE.exists():
        return {}
    try:
        data = json.loads(RELEASE_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def license_required() -> bool:
    env_value = str(os.environ.get("PROMO_STUDIO_REQUIRE_LICENSE", "")).strip().lower()
    if env_value in {"1", "true", "yes", "on"}:
        return True
    return bool(read_release_info().get("licenseRequired")) or LICENSE_REQUIRED_FLAG.exists()


def read_license() -> dict[str, Any]:
    if not LICENSE_FILE.exists():
        return {}
    try:
        data = json.loads(LICENSE_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def license_is_valid(data: dict[str, Any] | None = None) -> bool:
    data = data if isinstance(data, dict) else read_license()
    key = str(data.get("licenseKey") or "").strip()
    email = str(data.get("email") or "").strip()
    accepted = bool(data.get("acceptedTerms"))
    return accepted and len(key) >= 12 and "@" in email and "." in email.rsplit("@", 1)[-1]


def gumroad_product_permalink() -> str:
    env_value = str(os.environ.get("PROMO_STUDIO_GUMROAD_PRODUCT_PERMALINK", "")).strip()
    if env_value:
        return env_value
    return str(read_release_info().get("gumroadProductPermalink") or "").strip()


def verify_gumroad_license(license_key: str) -> dict[str, Any]:
    product_permalink = gumroad_product_permalink()
    if not product_permalink:
        return {"enabled": False, "verified": False}

    try:
        response = requests.post(
            "https://api.gumroad.com/v2/licenses/verify",
            data={
                "product_permalink": product_permalink,
                "license_key": license_key,
                "increment_uses": "true",
            },
            timeout=12,
        )
        payload = response.json()
    except Exception as exc:
        return {
            "enabled": True,
            "verified": False,
            "error": f"Could not contact Gumroad to verify this license. Please check your internet connection and try again. ({exc})",
        }

    if response.ok and payload.get("success") is True:
        purchase = payload.get("purchase") if isinstance(payload.get("purchase"), dict) else {}
        return {
            "enabled": True,
            "verified": True,
            "uses": payload.get("uses"),
            "purchaseEmail": purchase.get("email"),
            "productName": purchase.get("product_name"),
            "saleTimestamp": purchase.get("created_at"),
        }

    return {
        "enabled": True,
        "verified": False,
        "error": str(payload.get("message") or "Gumroad could not verify this license key."),
    }


def wants_json_response() -> bool:
    return request.path.startswith("/api/") or request.accept_mimetypes.best == "application/json"


@app.before_request
def enforce_license_gate():
    if not license_required() or license_is_valid():
        return None
    allowed_prefixes = ("/license", "/api/license", "/static/")
    if request.path.startswith(allowed_prefixes):
        return None
    if wants_json_response():
        return jsonify({"error": "License activation required.", "licenseUrl": "/license"}), 402
    return redirect("/license")


def file_ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def is_allowed(filename: str, allowed: set[str]) -> bool:
    return file_ext(filename) in allowed


def now_id() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def read_project(project_id: str) -> dict[str, Any]:
    project_file = PROJECTS_DIR / project_id / "project.json"
    if not project_file.exists():
        raise FileNotFoundError(f"Project not found: {project_id}")
    return normalize_project(json.loads(project_file.read_text(encoding="utf-8")))


def write_project(project_id: str, data: dict[str, Any]) -> None:
    project_dir = PROJECTS_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "project.json").write_text(json.dumps(data, indent=2), encoding="utf-8")


def child_path(root: Path, *parts: str) -> Path:
    root_resolved = root.resolve()
    target = (root / Path(*parts)).resolve()
    if target != root_resolved and root_resolved not in target.parents:
        raise ValueError("Resolved path is outside the expected directory.")
    return target


def normalize_project(project: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(project)
    normalized_assets = dict(normalized.get("assets", {})) if isinstance(normalized.get("assets"), dict) else {}
    stored_project_type = normalized.get("projectType")
    normalized["projectType"] = (
        stored_project_type
        if stored_project_type in {"screen-promo", "audio-video"}
        else ("audio-video" if normalized_assets.get("voiceover") and not normalized_assets.get("screen") else "screen-promo")
    )
    screen_info = screen_asset_info(normalized_assets)
    if screen_info:
        normalized_assets.setdefault("screenDurationSeconds", screen_info.get("duration"))
        normalized_assets.setdefault("screenWidth", screen_info.get("width"))
        normalized_assets.setdefault("screenHeight", screen_info.get("height"))
        normalized["assets"] = normalized_assets
    voiceover_duration = voiceover_asset_duration(normalized_assets)
    if voiceover_duration:
        normalized_assets["voiceoverDurationSeconds"] = voiceover_duration
        normalized["assets"] = normalized_assets
        normalized["durationSeconds"] = bounded_duration(max(
            float(normalized.get("durationSeconds") or 0),
            float(voiceover_duration),
        ))
    scenes = normalized.get("scenes", [])
    if isinstance(scenes, list):
        normalized["scenes"] = [
            (
                normalize_audio_video_scene(scene, index, bool(normalized_assets.get("screen")))
                if normalized["projectType"] == "audio-video"
                else with_scene_design(scene, index)
            ) if isinstance(scene, dict) else scene
            for index, scene in enumerate(scenes)
        ]
    if normalized.get("template") in {None, "tablet", "laptop", "phone"}:
        normalized["template"] = "lifestyle"
    clips = normalized.get("clips", [])
    normalized["clips"] = normalize_clips(clips) if isinstance(clips, list) else []
    normalized["thumbnailBumper"] = normalize_thumbnail_bumper(
        normalized.get("thumbnailBumper"),
        normalized_assets.get("thumbnail"),
    )
    normalized["layout"] = normalize_layout_settings(normalized.get("layout"))
    normalized["previewSettings"] = normalize_preview_settings(normalized.get("previewSettings"))
    return normalized


def normalize_audio_video_scene(scene: dict[str, Any], index: int, has_screen: bool) -> dict[str, Any]:
    designed = with_scene_design(scene, index)
    if has_screen:
        return designed
    return {
        **designed,
        "device": "full-screen",
        "captionPosition": designed.get("captionPosition") if designed.get("captionPosition") not in {"device", "auto"} else "center",
        "captionStyle": designed.get("captionStyle") or "karaoke-card",
    }


def normalize_preview_settings(settings: Any) -> dict[str, Any]:
    data = settings if isinstance(settings, dict) else {}
    captions = data.get("captions") if isinstance(data.get("captions"), dict) else {}
    audio = data.get("audio") if isinstance(data.get("audio"), dict) else {}
    try:
        words_per_group = int(float(captions.get("wordsPerGroup", 3)))
    except (TypeError, ValueError):
        words_per_group = 3
    try:
        sentences_per_group = int(float(captions.get("sentencesPerGroup", 1)))
    except (TypeError, ValueError):
        sentences_per_group = 1
    try:
        font_size_percent = int(float(captions.get("fontSizePercent", 100)))
    except (TypeError, ValueError):
        font_size_percent = 100
    try:
        playback_rate = float(data.get("playbackRate", 1))
    except (TypeError, ValueError):
        playback_rate = 1
    try:
        voiceover_volume = float(audio.get("voiceoverVolume", 1.0))
    except (TypeError, ValueError):
        voiceover_volume = 1.0
    try:
        voiceover_default_version = int(float(audio.get("voiceoverDefaultVersion", 1)))
    except (TypeError, ValueError):
        voiceover_default_version = 1
    if voiceover_default_version < 2 and voiceover_volume == 0.9:
        voiceover_volume = 1.0
    try:
        music_volume = float(audio.get("musicVolume", 0.18))
    except (TypeError, ValueError):
        music_volume = 0.18

    style = str(captions.get("style") or "")
    position = str(captions.get("position") or "")
    size = str(captions.get("size") or "")
    highlight_mode = str(captions.get("highlightMode") or "word")
    group_mode = str(captions.get("groupMode") or "words")
    box_mode = str(captions.get("boxMode") or "single")
    paragraph_align = str(captions.get("paragraphAlign") or "center")
    font_family = str(captions.get("fontFamily") or "")
    font_weight = str(captions.get("fontWeight") or "")
    font_color = normalize_hex_color(captions.get("fontColor"))
    active_style = str(captions.get("activeStyle") or "color")
    active_color = normalize_hex_color(captions.get("activeColor")) or "#facc15"

    return {
        "captions": {
            "style": style if style in CAPTION_STYLE_PRESETS else "",
            "position": position if position in {"", "auto", "top", "center", "bottom", "device"} else "",
            "groupMode": group_mode if group_mode in {"words", "sentences"} else "words",
            "wordsPerGroup": min(CAPTION_WORD_MAX, max(1, words_per_group)),
            "sentencesPerGroup": min(CAPTION_SENTENCE_MAX, max(1, sentences_per_group)),
            "highlightMode": highlight_mode if highlight_mode in {"word", "trail", "pulse", "none"} else "word",
            "size": size if size in {"", "compact", "standard", "large", "hero"} else "",
            "boxMode": box_mode if box_mode in {"single", "lines"} else "single",
            "paragraphAlign": paragraph_align if paragraph_align in {"left", "center", "right", "justify"} else "center",
            "fontFamily": font_family if font_family in CAPTION_FONT_PRESETS else "",
            "fontColor": font_color,
            "fontSizePercent": min(180, max(70, font_size_percent)),
            "fontWeight": font_weight if font_weight in {"", "500", "650", "800", "950"} else "",
            "activeStyle": active_style if active_style in {"color", "pill", "underline", "glow", "none"} else "color",
            "activeColor": active_color,
        },
        "audio": {
            "voiceoverEnabled": bool(audio.get("voiceoverEnabled", True)),
            "voiceoverVolume": min(1, max(0, voiceover_volume)),
            "voiceoverDefaultVersion": 2,
            "musicEnabled": bool(audio.get("musicEnabled", True)),
            "musicVolume": min(1, max(0, music_volume)),
        },
        "playbackRate": min(1.5, max(0.75, playback_rate)),
    }


def normalize_hex_color(value: Any) -> str:
    color = str(value or "").strip()
    if re.fullmatch(r"#[0-9a-fA-F]{6}", color):
        return color.lower()
    return ""


def ensure_render_state(project: dict[str, Any]) -> dict[str, Any]:
    render = project.get("render") if isinstance(project.get("render"), dict) else {}
    defaults = {
        "lastStartedAt": None,
        "lastFinishedAt": None,
        "lastError": None,
        "logFile": None,
        "secondsElapsed": None,
        "progress": 0,
        "phase": "idle",
        "framesDone": 0,
        "framesTotal": None,
    }
    project["render"] = {**defaults, **render}
    return project["render"]


def render_duration_frames(project: dict[str, Any]) -> int:
    fps = int(project.get("fps") or 30)
    duration_seconds = total_project_duration_seconds(project)
    playback_rate = float(project.get("previewSettings", {}).get("playbackRate") or 1)
    playback_rate = min(1.5, max(0.75, playback_rate))
    return max(5 * fps, min(MAX_PROJECT_DURATION_SECONDS * fps, round((duration_seconds / playback_rate) * fps)))


def update_project_render(project_id: str, updates: dict[str, Any], status: str | None = None, output_url: str | None = None) -> None:
    try:
        project = read_project(project_id)
    except FileNotFoundError:
        return
    render = ensure_render_state(project)
    render.update(updates)
    if status:
        project["status"] = status
    if output_url:
        project["outputUrl"] = output_url
    write_project(project_id, project)


def reconcile_render_status(project_id: str, project: dict[str, Any]) -> dict[str, Any]:
    render = ensure_render_state(project)
    output_path = OUTPUTS_DIR / f"{project_id}.mp4"
    render["active"] = bool(RENDER_THREADS.get(project_id) and RENDER_THREADS[project_id].is_alive())
    render["outputExists"] = output_path.exists()
    render["outputSizeBytes"] = output_path.stat().st_size if output_path.exists() else 0

    if project.get("status") == "rendering" and not render["active"] and output_path.exists() and output_path.stat().st_size > 0:
        render.update({
            "lastFinishedAt": render.get("lastFinishedAt") or datetime.now().isoformat(timespec="seconds"),
            "progress": 100,
            "phase": "done",
        })
        project["status"] = "rendered"
        project["outputUrl"] = f"/outputs/{project_id}.mp4"
        write_project(project_id, project)
    return render


def parse_render_progress(line: str) -> dict[str, Any] | None:
    clean = re.sub(r"\x1b\[[0-9;]*m", "", line).strip()
    progress_match = RENDER_PROGRESS_RE.search(clean)
    if progress_match:
        phase = progress_match.group(1).lower()
        done = int(progress_match.group(2))
        total = max(1, int(progress_match.group(3)))
        base = 10 if phase == "rendered" else 82
        span = 72 if phase == "rendered" else 18
        return {
            "phase": "rendering" if phase == "rendered" else "encoding",
            "framesDone": done,
            "framesTotal": total,
            "progress": min(99, round(base + span * (done / total))),
        }
    phase_match = RENDER_PHASE_RE.search(clean)
    if phase_match:
        return {"phase": phase_match.group(1).lower(), "progress": 4}
    return None


def render_timeout_ms() -> int:
    try:
        value = int(os.environ.get("PROMO_STUDIO_RENDER_TIMEOUT_MS", DEFAULT_RENDER_TIMEOUT_MS))
    except (TypeError, ValueError):
        value = DEFAULT_RENDER_TIMEOUT_MS
    return max(30_000, min(600_000, value))


def render_concurrency() -> int:
    try:
        value = int(os.environ.get("PROMO_STUDIO_RENDER_CONCURRENCY", DEFAULT_RENDER_CONCURRENCY))
    except (TypeError, ValueError):
        value = DEFAULT_RENDER_CONCURRENCY
    return max(1, min(8, value))


def run_remotion_render(project_id: str, cmd: list[str], log_path: Path, output_path: Path, started: float) -> None:
    log_tail: list[str] = []
    try:
        with log_path.open("w", encoding="utf-8") as log_file:
            log_file.write("COMMAND:\n" + " ".join(cmd) + "\n\nOUTPUT:\n")
            log_file.flush()
            proc = subprocess.Popen(
                cmd,
                cwd=str(REMOTION_DIR),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                log_file.write(line)
                log_file.flush()
                log_tail.append(line)
                log_tail = log_tail[-80:]
                progress = parse_render_progress(line)
                if progress:
                    update_project_render(project_id, progress, status="rendering")
            return_code = proc.wait(timeout=30)

        if return_code != 0:
            update_project_render(
                project_id,
                {
                    "lastError": "".join(log_tail)[-4000:] or "Render failed.",
                    "lastFinishedAt": datetime.now().isoformat(timespec="seconds"),
                    "logFile": str(log_path.relative_to(BASE_DIR)),
                    "secondsElapsed": round(time.time() - started, 1),
                    "progress": 0,
                    "phase": "failed",
                },
                status="failed",
            )
            return

        update_project_render(
            project_id,
            {
                "lastFinishedAt": datetime.now().isoformat(timespec="seconds"),
                "logFile": str(log_path.relative_to(BASE_DIR)),
                "secondsElapsed": round(time.time() - started, 1),
                "progress": 100,
                "phase": "done",
            },
            status="rendered",
            output_url=f"/outputs/{project_id}.mp4",
        )
    except FileNotFoundError:
        update_project_render(
            project_id,
            {
                "lastError": "npx was not found. Install Node.js, then run npm install in the remotion folder.",
                "lastFinishedAt": datetime.now().isoformat(timespec="seconds"),
                "progress": 0,
                "phase": "failed",
            },
            status="failed",
        )
    except Exception as exc:
        update_project_render(
            project_id,
            {
                "lastError": str(exc),
                "lastFinishedAt": datetime.now().isoformat(timespec="seconds"),
                "logFile": str(log_path.relative_to(BASE_DIR)),
                "secondsElapsed": round(time.time() - started, 1),
                "progress": 0,
                "phase": "failed",
            },
            status="failed",
        )
    finally:
        RENDER_THREADS.pop(project_id, None)


def voiceover_asset_duration(assets: dict[str, Any]) -> float | None:
    if assets.get("voiceoverDurationSeconds"):
        try:
            return float(assets.get("voiceoverDurationSeconds") or 0)
        except (TypeError, ValueError):
            return None
    voiceover_asset = str(assets.get("voiceover") or "")
    if not voiceover_asset:
        return None
    voiceover_path = REMOTION_PUBLIC_DIR / voiceover_asset
    if not voiceover_path.exists():
        return None
    return probe_media_duration(voiceover_path)


def screen_asset_info(assets: dict[str, Any]) -> dict[str, Any] | None:
    if assets.get("screenWidth") and assets.get("screenHeight"):
        return {
            "duration": assets.get("screenDurationSeconds"),
            "width": assets.get("screenWidth"),
            "height": assets.get("screenHeight"),
        }
    screen_asset = str(assets.get("screen") or "")
    if not screen_asset:
        return None
    screen_path = REMOTION_PUBLIC_DIR / screen_asset
    if not screen_path.exists():
        return None
    return probe_media_info(screen_path)


def normalize_clips(clips: list[Any]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for clip in clips:
        if not isinstance(clip, dict):
            continue
        try:
            start = max(0.0, float(clip.get("start", 0) or 0))
            end = max(start, float(clip.get("end", 0) or 0))
        except (TypeError, ValueError):
            continue
        asset = str(clip.get("asset") or "").strip()
        mode = str(clip.get("mode") or "device-screen")
        if not asset or end <= start:
            continue
        normalized.append({
            "start": round(start, 3),
            "end": round(end, 3),
            "mode": mode if mode in CLIP_MODES else "device-screen",
            "label": str(clip.get("label") or "Clip").strip()[:120],
            "asset": asset,
            "durationSeconds": clip.get("durationSeconds"),
        })
    return normalized


def normalize_thumbnail_bumper(value: Any, thumbnail_asset: Any = None) -> dict[str, Any]:
    data = value if isinstance(value, dict) else {}
    position = str(data.get("position") or "none")
    if position not in THUMBNAIL_BUMPER_POSITIONS:
        position = "none"
    fit = str(data.get("fit") or "cover")
    if fit not in THUMBNAIL_BUMPER_FITS:
        fit = "cover"
    try:
        duration_seconds = float(data.get("durationSeconds", 0.5) or 0.5)
    except (TypeError, ValueError):
        duration_seconds = 0.5
    duration_seconds = round(min(2.0, max(0.1, duration_seconds)), 2)
    if not thumbnail_asset:
        position = "none"
    return {
        "position": position,
        "durationSeconds": duration_seconds,
        "fit": fit,
    }


def normalize_layout_settings(value: Any) -> dict[str, Any]:
    data = value if isinstance(value, dict) else {}

    def lift(key: str, maximum: float) -> float:
        try:
            number = float(data.get(key, 0) or 0)
        except (TypeError, ValueError):
            number = 0
        return round(min(maximum, max(0.0, number)), 2)

    return {
        "deviceLift": lift("deviceLift", 16),
        "ctaLift": lift("ctaLift", 12),
    }


def thumbnail_bumper_duration(project: dict[str, Any]) -> float:
    assets = project.get("assets") if isinstance(project.get("assets"), dict) else {}
    bumper = normalize_thumbnail_bumper(project.get("thumbnailBumper"), assets.get("thumbnail"))
    if bumper.get("position") in {"start", "end"}:
        return float(bumper.get("durationSeconds") or 0.5)
    return 0.0


def total_project_duration_seconds(project: dict[str, Any]) -> float:
    return min(MAX_PROJECT_DURATION_SECONDS, float(project.get("durationSeconds") or 30) + thumbnail_bumper_duration(project))


def bounded_duration(seconds: float, minimum: int = 5, maximum: int = MAX_PROJECT_DURATION_SECONDS) -> int:
    return int(min(maximum, max(minimum, float(seconds))) + 0.999)


def scene_end_seconds(scenes: list[Any]) -> float:
    ends: list[float] = []
    for scene in scenes:
        if not isinstance(scene, dict):
            continue
        try:
            ends.append(float(scene.get("end", 0) or 0))
        except (TypeError, ValueError):
            continue
    return max(ends, default=0.0)


def clip_end_seconds(clips: list[Any]) -> float:
    ends: list[float] = []
    for clip in clips:
        if not isinstance(clip, dict):
            continue
        try:
            ends.append(float(clip.get("end", 0) or 0))
        except (TypeError, ValueError):
            continue
    return max(ends, default=0.0)


def ensure_scene_coverage(scenes: list[dict[str, Any]], duration_seconds: int, product_name: str, cta: str) -> list[dict[str, Any]]:
    if not scenes:
        return scenes
    target_end = float(duration_seconds)
    last_end = scene_end_seconds(scenes)
    if target_end - last_end <= 0.25:
        return scenes

    if target_end - last_end <= 2.5:
        scenes[-1]["end"] = round(target_end, 2)
        return scenes

    scenes.append({
        "start": round(max(0.0, last_end), 2),
        "end": round(target_end, 2),
        "caption": cta or product_name,
        "narration": cta or f"Start creating with {product_name}.",
    })
    return scenes


def save_upload(file_storage, destination_dir: Path, prefix: str, allowed: set[str]) -> str | None:
    if not file_storage or not file_storage.filename:
        return None
    original = secure_filename(file_storage.filename)
    if not original or not is_allowed(original, allowed):
        raise ValueError(f"Unsupported file type: {original}")
    ext = file_ext(original)
    filename = f"{prefix}.{ext}"
    destination_dir.mkdir(parents=True, exist_ok=True)
    file_storage.save(destination_dir / filename)
    return filename


def save_clip_upload(file_storage, destination_dir: Path, index: int) -> str:
    if not file_storage or not file_storage.filename:
        raise ValueError("Clip row is missing a video file.")
    original = secure_filename(file_storage.filename)
    if not original or not is_allowed(original, ALLOWED_VIDEO_EXTENSIONS):
        raise ValueError(f"Unsupported clip file type: {original}")
    ext = file_ext(original)
    filename = f"clip_{index:02d}.{ext}"
    destination_dir.mkdir(parents=True, exist_ok=True)
    file_storage.save(destination_dir / filename)
    return filename


def probe_media_duration(path: Path) -> float | None:
    info = probe_media_info(path)
    return info.get("duration") if info else None


def probe_media_info(path: Path) -> dict[str, Any] | None:
    ffprobe = "ffprobe.exe" if os.name == "nt" else "ffprobe"
    try:
        proc = subprocess.run(
            [
                ffprobe,
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height:format=duration",
                "-of",
                "json",
                str(path),
            ],
            capture_output=True,
            text=True,
            timeout=20,
        )
        if proc.returncode != 0:
            return None
        data = json.loads(proc.stdout or "{}")
        stream = (data.get("streams") or [{}])[0]
        duration = data.get("format", {}).get("duration")
        return {
            "duration": round(float(duration), 3) if duration not in {None, "N/A"} else None,
            "width": int(stream.get("width") or 0) or None,
            "height": int(stream.get("height") or 0) or None,
        }
    except Exception:
        return None


def caption_audio_preprocess_filter() -> str:
    return ",".join([
        "pan=mono|c0=0.5*c0+0.5*c1",
        "highpass=f=120",
        "lowpass=f=7600",
        "afftdn=nf=-25",
        "dynaudnorm=f=150:g=15",
        "loudnorm=I=-18:TP=-1.5:LRA=11",
    ])


def prepare_caption_audio(input_path: Path, temp_dir: Path) -> Path:
    ffmpeg = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
    output_path = temp_dir / f"{input_path.stem}_speech.wav"
    proc = subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(input_path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-af",
            caption_audio_preprocess_filter(),
            str(output_path),
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0 or not output_path.exists() or output_path.stat().st_size <= 0:
        details = (proc.stderr or proc.stdout or "").strip().splitlines()
        reason = details[-1] if details else "FFmpeg could not create speech-focused audio."
        raise RuntimeError(f"Could not reduce music before caption generation: {reason}")
    return output_path


def with_scene_design(scene: dict[str, Any], index: int) -> dict[str, Any]:
    defaults = {
        **DEFAULT_SCENE_DESIGN,
        "background": BACKGROUND_PRESETS[index % len(BACKGROUND_PRESETS)],
        "device": DEVICE_PRESETS[index % 4],
        "angle": ["low-desk-left", "front-center", "floating-hero", "low-desk-right"][index % 4],
        "motion": ["slow-push-in", "screen-focus", "device-tilt", "pan-left"][index % 4],
        "motionAmount": [2.2, 2.2, 2.2, 2.2][index % 4],
        "screenZoom": 1,
        "transition": ["soft-fade", "soft-fade", "slide-up", "clean-cut"][index % 4],
        "captionStyle": CAPTION_STYLE_PRESETS[index % len(CAPTION_STYLE_PRESETS)],
        "captionPosition": ["top", "top", "top", "bottom", "bottom", "device"][index % 6],
        "captionAnimation": "none",
        "captionSize": ["large", "standard", "compact", "hero", "standard", "large"][index % 6],
        "captionAccent": ["last-word", "none", "first-word", "last-word", "none", "first-word"][index % 6],
        "captionAnimationAmount": 1.4,
    }
    return {**defaults, **scene}


def caption_text(text: str, max_chars: int = 38) -> str:
    words = text.strip().split()
    if not words:
        return ""
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join([*current, word])
        if current and len(candidate) > max_chars:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return "\n".join(lines[:2])


def transcript_word_dict(word: Any, scene_start: float, scene_end: float) -> dict[str, Any] | None:
    word_text = " ".join(str(getattr(word, "word", "") or "").split())
    if not word_text:
        return None
    word_start = max(scene_start, float(getattr(word, "start", scene_start) or scene_start))
    word_end = min(scene_end, float(getattr(word, "end", word_start + 0.2) or word_start + 0.2))
    return {
        "text": word_text,
        "start": round(word_start, 3),
        "end": round(max(word_start + 0.04, word_end), 3),
        "source": "voiceover",
    }


def parse_scene_pacing(form: Any) -> tuple[float, float, float]:
    def parse_number(name: str, default: float) -> float:
        try:
            return float(form.get(name, default) or default)
        except (TypeError, ValueError):
            return default

    min_seconds = min(120.0, max(1.0, parse_number("minSceneSeconds", DEFAULT_MIN_SCENE_SECONDS)))
    target_seconds = min(MAX_SCENE_PACING_SECONDS, max(min_seconds, parse_number("targetSceneSeconds", DEFAULT_TARGET_SCENE_SECONDS)))
    max_seconds = min(MAX_SCENE_PACING_SECONDS, max(target_seconds, parse_number("maxSceneSeconds", DEFAULT_MAX_SCENE_SECONDS)))
    return min_seconds, target_seconds, max_seconds


def merge_transcript_scene_group(group: list[dict[str, Any]]) -> dict[str, Any]:
    first = group[0]
    last = group[-1]
    narration = " ".join(
        " ".join(str(scene.get("narration") or scene.get("caption") or "").split())
        for scene in group
    ).strip()
    words = sorted(
        [word for scene in group for word in (scene.get("words") or []) if isinstance(word, dict)],
        key=lambda word: float(word.get("start", 0) or 0),
    )
    return {
        **first,
        "start": round(float(first.get("start", 0) or 0), 2),
        "end": round(float(last.get("end", first.get("end", 0)) or 0), 2),
        "caption": caption_text(narration),
        "narration": narration,
        "words": words,
        "wordTimingSource": "voiceover" if words else "estimated",
    }


def word_timing_source(words: list[dict[str, Any]]) -> str:
    sources = {str(word.get("source") or "") for word in words if isinstance(word, dict)}
    for source in ("whisperx", "voiceover", "script"):
        if source in sources:
            return source
    return "estimated"


def merge_transcript_scenes_into_one(scenes: list[dict[str, Any]], duration_seconds: float) -> list[dict[str, Any]]:
    if not scenes:
        return scenes
    narration = " ".join(
        " ".join(str(scene.get("narration") or scene.get("caption") or "").split())
        for scene in scenes
    ).strip()
    words = sorted(
        [word for scene in scenes for word in (scene.get("words") or []) if isinstance(word, dict)],
        key=lambda word: float(word.get("start", 0) or 0),
    )
    end = max(
        float(duration_seconds or 0),
        max((float(scene.get("end", 0) or 0) for scene in scenes), default=0.0),
        max((float(word.get("end", 0) or 0) for word in words), default=0.0),
        0.5,
    )
    return [with_scene_design({
        **scenes[0],
        "start": 0,
        "end": round(min(MAX_PROJECT_DURATION_SECONDS, end), 2),
        "caption": caption_text(narration),
        "narration": narration,
        "words": words,
        "wordTimingSource": word_timing_source(words),
    }, 0)]


def pace_transcript_scenes(
    scenes: list[dict[str, Any]],
    min_scene_seconds: float,
    target_scene_seconds: float,
    max_scene_seconds: float,
) -> list[dict[str, Any]]:
    if not scenes:
        return scenes

    groups: list[list[dict[str, Any]]] = []
    buffer: list[dict[str, Any]] = []
    sorted_scenes = sorted(scenes, key=lambda scene: float(scene.get("start", 0) or 0))

    for scene in sorted_scenes:
        if buffer:
            current_start = float(buffer[0].get("start", 0) or 0)
            current_end = float(buffer[-1].get("end", current_start) or current_start)
            scene_end = float(scene.get("end", current_end) or current_end)
            current_duration = max(0.0, current_end - current_start)
            projected_duration = max(0.0, scene_end - current_start)
            if current_duration >= min_scene_seconds and projected_duration > max_scene_seconds:
                groups.append(buffer)
                buffer = []

        buffer.append(scene)
        start = float(buffer[0].get("start", 0) or 0)
        end = float(buffer[-1].get("end", start) or start)
        duration = max(0.0, end - start)
        text = str(scene.get("narration") or scene.get("caption") or "").strip()
        ends_sentence = bool(re.search(r"[.!?]$", text))
        if duration >= max_scene_seconds or (duration >= target_scene_seconds and ends_sentence):
            groups.append(buffer)
            buffer = []

    if buffer:
        start = float(buffer[0].get("start", 0) or 0)
        end = float(buffer[-1].get("end", start) or start)
        if groups and max(0.0, end - start) < min_scene_seconds:
            groups[-1].extend(buffer)
        else:
            groups.append(buffer)

    return [merge_transcript_scene_group(group) for group in groups if group]


def normalize_original_script(value: Any) -> str:
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    return re.sub(r"[ \t]+", " ", text)


def script_word_weight(word: str) -> float:
    clean = SCRIPT_WORD_STRIP_RE.sub("", word)
    base = max(0.7, len(clean) ** 0.72)
    if SCRIPT_SENTENCE_END_RE.search(word):
        base += 0.75
    elif re.search(r"[,;:।]$", word):
        base += 0.28
    return base


def script_word_tokens(script: str) -> list[str]:
    return [word for word in re.split(r"\s+", normalize_original_script(script)) if word]


def script_words_with_timing(script: str, duration_seconds: float) -> list[dict[str, Any]]:
    tokens = script_word_tokens(script)
    if not tokens:
        return []
    safe_duration = max(0.5, float(duration_seconds or 0))
    weights = [script_word_weight(word) for word in tokens]
    total_weight = sum(weights) or float(len(tokens))
    cursor = 0.0
    words: list[dict[str, Any]] = []
    for token, weight in zip(tokens, weights):
        start = cursor
        cursor += safe_duration * (weight / total_weight)
        words.append({
            "text": token,
            "start": round(min(safe_duration, start), 3),
            "end": round(min(safe_duration, max(start + 0.04, cursor)), 3),
            "source": "script",
        })
    if words:
        words[-1]["end"] = round(safe_duration, 3)
    return words


def script_chunk_scene(words: list[dict[str, Any]], indexes: list[int]) -> dict[str, Any]:
    selected_words = [words[index] for index in indexes]
    narration = " ".join(str(word.get("text") or "") for word in selected_words).strip()
    return {
        "start": round(float(selected_words[0].get("start", 0) or 0), 2),
        "end": round(float(selected_words[-1].get("end", selected_words[0].get("start", 0)) or 0), 2),
        "caption": caption_text(narration),
        "narration": narration,
        "words": selected_words,
        "wordTimingSource": "script",
    }


def script_to_scenes(
    script: str,
    duration_seconds: float,
    min_scene_seconds: float,
    target_scene_seconds: float,
    max_scene_seconds: float,
) -> list[dict[str, Any]]:
    words = script_words_with_timing(script, duration_seconds)
    if not words:
        raise RuntimeError("Paste the original story/script before generating exact captions.")

    scenes: list[dict[str, Any]] = []
    chunk: list[int] = []
    for index, word in enumerate(words):
        if not chunk:
            chunk = [index]
        else:
            chunk.append(index)
        start = float(words[chunk[0]].get("start", 0) or 0)
        end = float(word.get("end", start) or start)
        duration = max(0.0, end - start)
        ends_sentence = bool(SCRIPT_SENTENCE_END_RE.search(str(word.get("text") or "")))
        if duration >= max_scene_seconds or (duration >= target_scene_seconds and ends_sentence):
            scenes.append(script_chunk_scene(words, chunk))
            chunk = []
    if chunk:
        if scenes:
            start = float(words[chunk[0]].get("start", 0) or 0)
            end = float(words[chunk[-1]].get("end", start) or start)
            if max(0.0, end - start) < min_scene_seconds:
                scenes[-1]["end"] = round(end, 2)
                scenes[-1]["words"] = [*scenes[-1].get("words", []), *[words[index] for index in chunk]]
                scenes[-1]["narration"] = " ".join(word["text"] for word in scenes[-1]["words"]).strip()
                scenes[-1]["caption"] = caption_text(scenes[-1]["narration"])
            else:
                scenes.append(script_chunk_scene(words, chunk))
        else:
            scenes.append(script_chunk_scene(words, chunk))
    return [with_scene_design(scene, index) for index, scene in enumerate(scenes)]


def truthy_form_value(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def whisperx_alignment_device() -> str:
    device = str(os.environ.get("PROMO_STUDIO_WHISPERX_DEVICE") or "cpu").strip().lower()
    return device if device in {"cpu", "cuda", "mps"} else "cpu"


def whisperx_align_model_name(language: str | None) -> str | None:
    if language:
        env_key = f"PROMO_STUDIO_WHISPERX_ALIGN_MODEL_{language.upper()}"
        model_name = str(os.environ.get(env_key) or "").strip()
        if model_name:
            return model_name
        return WHISPERX_DEFAULT_ALIGN_MODELS.get(language)
    return None


def guess_script_language(script: str) -> str | None:
    if DEVANAGARI_RE.search(script):
        return "hi"
    if ARABIC_SCRIPT_RE.search(script):
        return "ur"
    if re.search(r"[A-Za-z]", script):
        return "en"
    return None


def script_alignment_segments(
    scenes: list[dict[str, Any]],
    duration_seconds: float,
) -> list[dict[str, Any]]:
    segments: list[dict[str, Any]] = []
    for scene in scenes:
        text = " ".join(str(scene.get("narration") or scene.get("caption") or "").split())
        if not text:
            continue
        try:
            start = float(scene.get("start", 0) or 0)
            end = float(scene.get("end", start) or start)
        except (TypeError, ValueError):
            continue
        segments.append({
            "start": round(max(0.0, start - 0.75), 3),
            "end": round(min(duration_seconds, max(start + 0.6, end + 0.75)), 3),
            "text": text,
        })
    return segments


def flatten_scene_words(scenes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    words: list[dict[str, Any]] = []
    for scene in scenes:
        words.extend([word for word in scene.get("words", []) if isinstance(word, dict)])
    return words


def usable_aligned_words(result: dict[str, Any]) -> list[dict[str, Any]]:
    words = result.get("word_segments") if isinstance(result, dict) else None
    if not isinstance(words, list):
        words = [
            word
            for segment in (result.get("segments") or []) if isinstance(segment, dict)
            for word in (segment.get("words") or []) if isinstance(word, dict)
        ]
    aligned: list[dict[str, Any]] = []
    for word in words or []:
        try:
            start = float(word.get("start"))
            end = float(word.get("end"))
        except (TypeError, ValueError):
            continue
        if end <= start:
            continue
        aligned.append({
            "text": " ".join(str(word.get("word") or word.get("text") or "").split()),
            "start": round(max(0.0, start), 3),
            "end": round(max(start + 0.04, end), 3),
            "score": word.get("score"),
        })
    return sorted(aligned, key=lambda item: float(item.get("start", 0) or 0))


def normalized_alignment_token(value: Any) -> str:
    return SCRIPT_WORD_STRIP_RE.sub("", str(value or "")).casefold()


def apply_aligned_word_times(
    scenes: list[dict[str, Any]],
    aligned_words: list[dict[str, Any]],
    duration_seconds: float,
) -> list[dict[str, Any]]:
    fallback_words = flatten_scene_words(scenes)
    if not fallback_words:
        raise RuntimeError("No script words were available for alignment.")
    coverage = len(aligned_words) / max(1, len(fallback_words))
    if coverage < 0.8:
        raise RuntimeError(
            f"WhisperX aligned {len(aligned_words)} of {len(fallback_words)} script words, which is too incomplete to use."
        )
    sequential_only = not any(str(word.get("text") or "").strip() for word in aligned_words)

    cursor = 0
    rebuilt: list[dict[str, Any]] = []
    for scene_index, scene in enumerate(scenes):
        scene_words = [word for word in scene.get("words", []) if isinstance(word, dict)]
        rebuilt_words: list[dict[str, Any]] = []
        for fallback_word in scene_words:
            aligned_word = None
            if cursor < len(aligned_words):
                target = normalized_alignment_token(fallback_word.get("text"))
                candidate = aligned_words[cursor]
                candidate_text = normalized_alignment_token(candidate.get("text"))
                if sequential_only or not target or not candidate_text or candidate_text == target:
                    aligned_word = candidate
                    cursor += 1
                else:
                    for lookahead in range(cursor + 1, min(len(aligned_words), cursor + 6)):
                        if normalized_alignment_token(aligned_words[lookahead].get("text")) == target:
                            aligned_word = aligned_words[lookahead]
                            cursor = lookahead + 1
                            break
            if aligned_word:
                start = float(aligned_word.get("start", fallback_word.get("start", 0)) or 0)
                end = float(aligned_word.get("end", fallback_word.get("end", start + 0.2)) or start + 0.2)
            else:
                start = float(fallback_word.get("start", 0) or 0)
                end = float(fallback_word.get("end", start + 0.2) or start + 0.2)
            rebuilt_words.append({
                "text": str(fallback_word.get("text") or ""),
                "start": round(min(duration_seconds, max(0.0, start)), 3),
                "end": round(min(duration_seconds, max(start + 0.04, end)), 3),
                "source": "whisperx" if aligned_word else "script",
                **({"score": aligned_word.get("score")} if aligned_word and aligned_word.get("score") is not None else {}),
            })
        if not rebuilt_words:
            continue
        narration = " ".join(str(word.get("text") or "") for word in rebuilt_words).strip()
        rebuilt.append(with_scene_design({
            **scene,
            "start": round(float(rebuilt_words[0].get("start", 0) or 0), 2),
            "end": round(float(rebuilt_words[-1].get("end", rebuilt_words[0].get("start", 0)) or 0), 2),
            "caption": caption_text(narration),
            "narration": narration,
            "words": rebuilt_words,
            "wordTimingSource": "whisperx",
        }, scene_index))
    return rebuilt


def align_script_with_whisperx(
    audio_path: Path,
    script: str,
    duration_seconds: float,
    min_scene_seconds: float,
    target_scene_seconds: float,
    max_scene_seconds: float,
    language: str | None,
) -> list[dict[str, Any]]:
    language = language or guess_script_language(script)
    if not language:
        raise RuntimeError("Choose a caption language before using WhisperX script alignment.")
    try:
        import whisperx
    except ImportError as exc:
        raise RuntimeError(
            "WhisperX is not installed. Install it with: pip install whisperx"
        ) from exc

    scenes = script_to_scenes(
        script,
        duration_seconds,
        min_scene_seconds,
        target_scene_seconds,
        max_scene_seconds,
    )
    segments = script_alignment_segments(scenes, duration_seconds)
    if not segments:
        raise RuntimeError("No script segments were available for WhisperX alignment.")

    device = whisperx_alignment_device()
    model_name = whisperx_align_model_name(language)
    model, metadata = whisperx.load_align_model(
        language_code=language,
        device=device,
        model_name=model_name,
    )
    audio = whisperx.load_audio(str(audio_path))
    aligned = whisperx.align(
        segments,
        model,
        metadata,
        audio,
        device,
        return_char_alignments=False,
    )
    return apply_aligned_word_times(scenes, usable_aligned_words(aligned), duration_seconds)


def transcribe_audio_to_scenes(
    audio_path: Path,
    duration_seconds: float,
    min_scene_seconds: float = DEFAULT_MIN_SCENE_SECONDS,
    target_scene_seconds: float = DEFAULT_TARGET_SCENE_SECONDS,
    max_scene_seconds: float = DEFAULT_MAX_SCENE_SECONDS,
    language: str | None = None,
) -> list[dict[str, Any]]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError(
            "Local transcription requires faster-whisper. Install it with: pip install faster-whisper"
        ) from exc

    model, model_name = load_whisper_model(WhisperModel, language)
    transcribe_options: dict[str, Any] = {
        "vad_filter": True,
        "word_timestamps": True,
        "task": "transcribe",
    }
    if language:
        transcribe_options["language"] = language
        if language in TRANSCRIPTION_PROMPTS:
            transcribe_options["initial_prompt"] = TRANSCRIPTION_PROMPTS[language]
        if language in TRANSCRIPTION_HOTWORDS:
            transcribe_options["hotwords"] = TRANSCRIPTION_HOTWORDS[language]
    if language == "hi":
        transcribe_options.update({
            "condition_on_previous_text": False,
            "temperature": 0.0,
            "suppress_tokens": hindi_devanagari_suppress_tokens(model),
        })
    segments, _info = model.transcribe(str(audio_path), **transcribe_options)

    scenes: list[dict[str, Any]] = []
    for segment in segments:
        text = " ".join(str(segment.text or "").split())
        if not text:
            continue
        start = max(0.0, float(segment.start))
        if duration_seconds > 0 and start >= duration_seconds:
            continue
        end = max(start + 0.35, float(segment.end))
        if duration_seconds > 0:
            end = min(end, duration_seconds)
        if end <= start:
            continue
        words: list[dict[str, Any]] = []
        for word in getattr(segment, "words", None) or []:
            word_data = transcript_word_dict(word, start, end)
            if word_data:
                words.append(word_data)
        scenes.append({
            "start": round(start, 2),
            "end": round(end, 2),
            "caption": caption_text(text),
            "narration": text,
            "words": words,
            "wordTimingSource": "voiceover" if words else "estimated",
        })

    if not scenes:
        raise RuntimeError("No speech was detected in the uploaded audio.")
    scenes = pace_transcript_scenes(scenes, min_scene_seconds, target_scene_seconds, max_scene_seconds)
    return [with_scene_design(scene, index) for index, scene in enumerate(scenes)]


def whisper_model_candidates(language: str | None) -> list[str]:
    names: list[str] = []
    if language == "hi":
        names.append(os.environ.get("PROMO_STUDIO_WHISPER_HI_MODEL", "small"))
    names.append(os.environ.get("PROMO_STUDIO_WHISPER_MODEL", "base"))
    unique: list[str] = []
    for name in names:
        model_name = str(name or "").strip()
        if model_name and model_name not in unique:
            unique.append(model_name)
    return unique or ["base"]


def load_whisper_model(model_class: Any, language: str | None) -> tuple[Any, str]:
    errors: list[str] = []
    for model_name in whisper_model_candidates(language):
        try:
            return model_class(model_name, device="cpu", compute_type="int8"), model_name
        except Exception as exc:
            errors.append(f"{model_name}: {exc}")
    raise RuntimeError("Could not load a Whisper model. " + " | ".join(errors))


def hindi_devanagari_suppress_tokens(model: Any) -> list[int]:
    token_ids = {-1}
    tokenizer = getattr(model, "hf_tokenizer", None)
    get_vocab = getattr(tokenizer, "get_vocab", None)
    if not callable(get_vocab):
        return sorted(token_ids)
    try:
        vocab = get_vocab()
    except Exception:
        return sorted(token_ids)
    for token, token_id in vocab.items():
        token_text = str(token)
        if token_text.startswith("<|"):
            continue
        if LATIN_OR_ARABIC_SCRIPT_RE.search(token_text):
            try:
                token_ids.add(int(token_id))
            except (TypeError, ValueError):
                continue
    return sorted(token_ids)


def normalize_transcription_language(value: Any) -> str | None:
    key = str(value or "auto").strip().lower()
    return TRANSCRIPTION_LANGUAGES.get(key)


def transcription_script_warning(scenes: list[dict[str, Any]], language: str | None) -> str | None:
    if language != "hi":
        return None
    text = " ".join(str(scene.get("narration") or scene.get("caption") or "") for scene in scenes)
    devanagari_count = len(DEVANAGARI_RE.findall(text))
    mixed_script_count = len(LATIN_OR_ARABIC_SCRIPT_RE.findall(text))
    if mixed_script_count and mixed_script_count / max(1, devanagari_count + mixed_script_count) > 0.12:
        return (
            "Hindi transcription still contains Roman or Urdu-script text. "
            "For cleaner Hindi, set PROMO_STUDIO_WHISPER_HI_MODEL=medium before starting the app."
        )
    return None


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/license")
def license_page():
    return render_template("license.html", license_required=license_required(), activated=license_is_valid(), license_data=read_license())


@app.post("/api/license")
def activate_license():
    payload = request.get_json(silent=True) or request.form
    license_key = str(payload.get("licenseKey") or "").strip()
    email = str(payload.get("email") or "").strip()
    accepted_terms = str(payload.get("acceptedTerms") or "").lower() in {"1", "true", "yes", "on"} or bool(payload.get("acceptedTerms") is True)
    data = {
        "licenseKey": license_key,
        "email": email,
        "acceptedTerms": accepted_terms,
        "activatedAt": datetime.now().isoformat(timespec="seconds"),
        "source": "gumroad",
    }
    if not license_is_valid(data):
        return jsonify({"error": "Enter the Gumroad license key, buyer email, and accept the license terms."}), 400
    verification = verify_gumroad_license(license_key)
    if verification.get("enabled") and not verification.get("verified"):
        return jsonify({"error": verification.get("error") or "Gumroad could not verify this license key."}), 400
    data["gumroadVerification"] = verification
    LICENSE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return jsonify({"ok": True, "redirectUrl": "/"})


@app.get("/preview/<project_id>")
def preview_project(project_id: str):
    try:
        project = read_project(project_id)
    except FileNotFoundError:
        abort(404)
    static_version = int(max(
        (BASE_DIR / "static" / "preview.js").stat().st_mtime,
        (BASE_DIR / "static" / "preview.css").stat().st_mtime,
    ))
    return render_template("preview.html", project=project, static_version=static_version)


@app.get("/api/projects")
def list_projects():
    projects: list[dict[str, Any]] = []
    for project_json in sorted(PROJECTS_DIR.glob("*/project.json"), reverse=True):
        try:
            data = json.loads(project_json.read_text(encoding="utf-8"))
            projects.append({
                "id": data.get("id"),
                "title": data.get("title"),
                "productName": data.get("productName"),
                "projectType": data.get("projectType", "screen-promo"),
                "format": data.get("format"),
                "template": data.get("template"),
                "status": data.get("status", "draft"),
                "render": data.get("render") if isinstance(data.get("render"), dict) else {},
                "createdAt": data.get("createdAt"),
                "updatedAt": data.get("updatedAt"),
                "outputUrl": data.get("outputUrl"),
            })
        except Exception:
            continue
    return jsonify({"projects": projects})


def uploaded_asset(field_name: str, public_dir: Path, project_id: str, prefix: str, allowed: set[str], existing_asset: Any = None) -> str | None:
    filename = save_upload(request.files.get(field_name), public_dir, prefix, allowed)
    if filename:
        return f"projects/{project_id}/{filename}"
    return str(existing_asset) if existing_asset else None


def public_asset_path(asset: Any) -> Path | None:
    asset_text = str(asset or "").strip()
    if not asset_text:
        return None
    return REMOTION_PUBLIC_DIR / asset_text


def project_payload_from_form(project_id: str, existing_project: dict[str, Any] | None = None) -> dict[str, Any]:
    existing_assets = (
        dict(existing_project.get("assets", {}))
        if isinstance(existing_project, dict) and isinstance(existing_project.get("assets"), dict)
        else {}
    )
    now = datetime.now().isoformat(timespec="seconds")
    title = request.form.get("title", "Untitled Promo").strip() or "Untitled Promo"
    product_name = request.form.get("productName", title).strip() or title
    target_url = request.form.get("targetUrl", "").strip()
    cta = request.form.get("cta", "Try it free").strip() or "Try it free"
    project_type = request.form.get("projectType", "screen-promo")
    if project_type not in {"screen-promo", "audio-video"}:
        project_type = "screen-promo"
    video_format = request.form.get("format", "vertical")
    template_name = request.form.get("template", "lifestyle")
    requested_duration_seconds = bounded_duration(float(request.form.get("durationSeconds", "30") or "30"))
    duration_seconds = requested_duration_seconds

    try:
        scenes = json.loads(request.form.get("scenes", "[]"))
    except json.JSONDecodeError as exc:
        raise ValueError("Scenes JSON is invalid.") from exc
    try:
        clip_rows = json.loads(request.form.get("clips", "[]"))
    except json.JSONDecodeError as exc:
        raise ValueError("Clips JSON is invalid.") from exc

    if not scenes:
        scenes = [
            {"start": 0, "end": 5, "caption": f"{product_name}\njust got smarter", "narration": f"{product_name} just got smarter."},
            {"start": 5, "end": 11, "caption": "show the real product experience", "narration": "Show the real product experience from your own screen recording."},
            {"start": 11, "end": 18, "caption": "highlight the moments that matter", "narration": "Highlight the moments that matter with polished captions and motion."},
            {"start": 18, "end": 24, "caption": "turn walkthroughs into ads", "narration": "Turn everyday walkthroughs into polished advertisement videos."},
            {"start": 24, "end": 30, "caption": cta, "narration": cta},
        ]

    public_dir = REMOTION_PUBLIC_PROJECTS / project_id
    public_dir.mkdir(parents=True, exist_ok=True)
    screen_asset = uploaded_asset("screenRecording", public_dir, project_id, "screen", ALLOWED_VIDEO_EXTENSIONS, existing_assets.get("screen"))
    voiceover_asset = uploaded_asset("voiceover", public_dir, project_id, "voiceover", ALLOWED_AUDIO_EXTENSIONS, existing_assets.get("voiceover"))
    if project_type == "screen-promo" and not screen_asset:
        raise ValueError("Please upload a screen recording video.")
    if project_type == "audio-video" and not voiceover_asset:
        raise ValueError("Please upload an audio track for audio-to-video projects.")

    screen_path = public_asset_path(screen_asset)
    voiceover_path = public_asset_path(voiceover_asset)
    screen_info = probe_media_info(screen_path) if screen_path and screen_path.exists() else None
    voiceover_duration = probe_media_duration(voiceover_path) if voiceover_path and voiceover_path.exists() else None
    if voiceover_duration:
        duration_seconds = bounded_duration(voiceover_duration)

    scenes = ensure_scene_coverage(scenes, duration_seconds, product_name, cta)
    scenes = [
        normalize_audio_video_scene(scene, index, bool(screen_asset))
        if project_type == "audio-video"
        else with_scene_design(scene, index)
        for index, scene in enumerate(scenes)
    ]

    background_music_asset = uploaded_asset("backgroundMusic", public_dir, project_id, "background-music", ALLOWED_AUDIO_EXTENSIONS, existing_assets.get("backgroundMusic"))
    custom_background_asset = uploaded_asset("customBackground", public_dir, project_id, "custom-background", ALLOWED_BACKGROUND_EXTENSIONS, existing_assets.get("customBackground"))
    custom_background_path = public_asset_path(custom_background_asset)
    custom_background_info = probe_media_info(custom_background_path) if custom_background_path and custom_background_path.exists() else None
    logo_asset = uploaded_asset("logo", public_dir, project_id, "logo", ALLOWED_IMAGE_EXTENSIONS, existing_assets.get("logo"))
    thumbnail_asset = uploaded_asset("thumbnailImage", public_dir, project_id, "thumbnail", ALLOWED_IMAGE_EXTENSIONS, existing_assets.get("thumbnail"))
    thumbnail_bumper = normalize_thumbnail_bumper({
        "position": request.form.get("thumbnailBumperPosition", "none"),
        "durationSeconds": request.form.get("thumbnailBumperDuration", 0.5),
        "fit": request.form.get("thumbnailBumperFit", "cover"),
    }, thumbnail_asset)
    layout = normalize_layout_settings({
        "deviceLift": request.form.get("layoutDeviceLift", 0),
        "ctaLift": request.form.get("layoutCtaLift", 0),
    })

    clips: list[dict[str, Any]] = []
    if isinstance(clip_rows, list):
        clips_dir = public_dir / "clips"
        for index, clip in enumerate(clip_rows, start=1):
            if not isinstance(clip, dict):
                continue
            try:
                start = max(0.0, float(clip.get("start", 0) or 0))
                end = max(start, float(clip.get("end", 0) or 0))
            except (TypeError, ValueError):
                continue
            if end <= start:
                continue
            file_field = str(clip.get("fileField") or "")
            clip_file = request.files.get(file_field)
            if clip_file and clip_file.filename:
                clip_filename = save_clip_upload(clip_file, clips_dir, index)
                asset = f"projects/{project_id}/clips/{clip_filename}"
                label = str(clip.get("label") or clip_file.filename or "Clip").strip()[:120]
            else:
                asset = str(clip.get("asset") or "").strip()
                if not asset.startswith(f"projects/{project_id}/clips/"):
                    continue
                label = str(clip.get("label") or "Clip").strip()[:120]
            mode = str(clip.get("mode") or "device-screen")
            clips.append({
                "start": round(start, 3),
                "end": round(end, 3),
                "mode": mode if mode in CLIP_MODES else "device-screen",
                "label": label,
                "asset": asset,
                "durationSeconds": probe_media_duration(REMOTION_PUBLIC_DIR / asset),
            })

    duration_seconds = bounded_duration(max(duration_seconds, scene_end_seconds(scenes), clip_end_seconds(clips)))
    scenes = ensure_scene_coverage(scenes, duration_seconds, product_name, cta)
    if project_type == "audio-video":
        scenes = [normalize_audio_video_scene(scene, index, bool(screen_asset)) for index, scene in enumerate(scenes)]

    return {
        "id": project_id,
        "projectType": project_type,
        "title": title,
        "productName": product_name,
        "targetUrl": target_url,
        "cta": cta,
        "format": video_format,
        "template": template_name,
        "durationSeconds": duration_seconds,
        "fps": int(existing_project.get("fps", 30)) if isinstance(existing_project, dict) else 30,
        "status": "draft",
        "createdAt": existing_project.get("createdAt", now) if isinstance(existing_project, dict) else now,
        "updatedAt": now,
        "outputUrl": None,
        "assets": {
            "screen": screen_asset,
            "screenDurationSeconds": screen_info.get("duration") if screen_info else None,
            "screenWidth": screen_info.get("width") if screen_info else None,
            "screenHeight": screen_info.get("height") if screen_info else None,
            "voiceover": voiceover_asset,
            "voiceoverDurationSeconds": voiceover_duration,
            "backgroundMusic": background_music_asset,
            "customBackground": custom_background_asset,
            "customBackgroundDurationSeconds": custom_background_info.get("duration") if custom_background_info else None,
            "customBackgroundWidth": custom_background_info.get("width") if custom_background_info else None,
            "customBackgroundHeight": custom_background_info.get("height") if custom_background_info else None,
            "logo": logo_asset,
            "thumbnail": thumbnail_asset,
        },
        "scenes": scenes,
        "clips": normalize_clips(clips),
        "thumbnailBumper": thumbnail_bumper,
        "layout": layout,
        "previewSettings": normalize_preview_settings(existing_project.get("previewSettings") if isinstance(existing_project, dict) else None),
        "render": {
            "lastStartedAt": None,
            "lastFinishedAt": None,
            "lastError": None,
            "logFile": None,
            "progress": 0,
            "phase": "idle",
        },
    }


@app.post("/api/projects")
def create_project():
    try:
        title = request.form.get("title", "Untitled Promo").strip() or "Untitled Promo"
        project_id = f"{now_id()}_{slugify(title)[:60] or 'promo'}"
        project = project_payload_from_form(project_id)
        write_project(project_id, project)
        return jsonify({"project": project})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Could not create project: {exc}"}), 500


@app.patch("/api/projects/<project_id>")
def update_project(project_id: str):
    try:
        existing_project = read_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Project not found."}), 404
    try:
        project = project_payload_from_form(project_id, existing_project)
        write_project(project_id, project)
        return jsonify({"project": project})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Could not update project: {exc}"}), 500


@app.get("/api/projects/<project_id>")
def get_project(project_id: str):
    try:
        return jsonify({"project": read_project(project_id)})
    except FileNotFoundError:
        return jsonify({"error": "Project not found."}), 404


@app.get("/api/projects/<project_id>/render-status")
def render_status(project_id: str):
    try:
        project = read_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Project not found."}), 404
    render = reconcile_render_status(project_id, project)
    return jsonify({
        "id": project_id,
        "status": project.get("status", "draft"),
        "render": render,
        "outputUrl": project.get("outputUrl"),
    })


@app.patch("/api/projects/<project_id>/preview-settings")
def update_preview_settings(project_id: str):
    try:
        project = read_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Project not found."}), 404

    payload = request.get_json(silent=True) or {}
    project["previewSettings"] = normalize_preview_settings(payload.get("previewSettings", payload))
    write_project(project_id, project)
    return jsonify({"previewSettings": project["previewSettings"]})


@app.post("/api/transcribe")
def transcribe_voiceover():
    audio = request.files.get("audio")
    if not audio or not audio.filename:
        return jsonify({"error": "Upload a voiceover audio file first."}), 400
    if not is_allowed(audio.filename, ALLOWED_AUDIO_EXTENSIONS):
        return jsonify({"error": f"Unsupported audio file type: {secure_filename(audio.filename)}"}), 400

    try:
        requested_duration_seconds = float(request.form.get("durationSeconds", "30") or 30)
    except ValueError:
        requested_duration_seconds = 30
    language = normalize_transcription_language(request.form.get("transcriptionLanguage"))
    original_script = normalize_original_script(request.form.get("originalScript"))
    use_whisperx_alignment = truthy_form_value(request.form.get("useWhisperxAlignment"), True)
    reduce_music_for_captions = truthy_form_value(request.form.get("reduceMusicForCaptions"), False)
    single_scene_mode = truthy_form_value(request.form.get("singleSceneMode"), False)

    temp_dir = PROJECTS_DIR / "_transcription_uploads"
    temp_dir.mkdir(parents=True, exist_ok=True)
    suffix = file_ext(audio.filename)
    temp_path = temp_dir / f"{now_id()}_{secure_filename(audio.filename) or 'voiceover'}.{suffix}"
    audio.save(temp_path)
    cleanup_paths = [temp_path]

    try:
        duration_seconds = probe_media_duration(temp_path) or requested_duration_seconds
        duration_seconds = min(MAX_PROJECT_DURATION_SECONDS, max(5, float(duration_seconds)))
        min_scene_seconds, target_scene_seconds, max_scene_seconds = parse_scene_pacing(request.form)
        transcription_audio_path = temp_path
        warnings: list[str] = []
        if reduce_music_for_captions:
            try:
                transcription_audio_path = prepare_caption_audio(temp_path, temp_dir)
                cleanup_paths.append(transcription_audio_path)
            except RuntimeError as exc:
                warnings.append(f"{exc} Used the original audio for captions instead.")
        if original_script:
            transcript_source = "script"
            if use_whisperx_alignment:
                try:
                    scenes = align_script_with_whisperx(
                        transcription_audio_path,
                        original_script,
                        duration_seconds,
                        min_scene_seconds,
                        target_scene_seconds,
                        max_scene_seconds,
                        language,
                    )
                    transcript_source = "script-whisperx"
                except RuntimeError as exc:
                    scenes = script_to_scenes(
                        original_script,
                        duration_seconds,
                        min_scene_seconds,
                        target_scene_seconds,
                        max_scene_seconds,
                    )
                    warnings.append(f"{exc} Used estimated script timing instead.")
            else:
                scenes = script_to_scenes(
                    original_script,
                    duration_seconds,
                    min_scene_seconds,
                    target_scene_seconds,
                    max_scene_seconds,
                )
        else:
            scenes = transcribe_audio_to_scenes(
                transcription_audio_path,
                duration_seconds,
                min_scene_seconds,
                target_scene_seconds,
                max_scene_seconds,
                language,
            )
            script_warning = transcription_script_warning(scenes, language)
            if script_warning:
                warnings.append(script_warning)
            transcript_source = "voiceover"
        if single_scene_mode:
            scenes = merge_transcript_scenes_into_one(scenes, duration_seconds)
        return jsonify({
            "scenes": scenes,
            "durationSeconds": round(duration_seconds, 2),
            "transcriptionLanguage": language or "auto",
            "transcriptSource": transcript_source,
            "audioPreprocessed": reduce_music_for_captions and transcription_audio_path != temp_path,
            "singleSceneMode": single_scene_mode,
            "warning": "\n\n".join(warnings) if warnings else None,
        })
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 501
    except Exception as exc:
        return jsonify({"error": f"Could not transcribe audio: {exc}"}), 500
    finally:
        for path in cleanup_paths:
            try:
                path.unlink(missing_ok=True)
            except Exception:
                pass


@app.delete("/api/projects/<project_id>")
def delete_project(project_id: str):
    try:
        project_dir = child_path(PROJECTS_DIR, project_id)
        public_dir = child_path(REMOTION_PUBLIC_PROJECTS, project_id)
        output_file = child_path(OUTPUTS_DIR, f"{project_id}.mp4")
    except ValueError:
        return jsonify({"error": "Invalid project id."}), 400

    if not project_dir.exists():
        return jsonify({"error": "Project not found."}), 404

    shutil.rmtree(project_dir)
    if public_dir.exists():
        shutil.rmtree(public_dir)
    if output_file.exists():
        output_file.unlink()

    return jsonify({"deleted": True, "id": project_id})


@app.get("/preview-assets/<path:filename>")
def preview_asset(filename: str):
    return send_from_directory(REMOTION_PUBLIC_DIR, filename, as_attachment=False)


@app.post("/api/projects/<project_id>/render")
def render_project(project_id: str):
    try:
        project = read_project(project_id)
    except FileNotFoundError:
        return jsonify({"error": "Project not found."}), 404

    payload = request.get_json(silent=True) or {}
    if isinstance(payload.get("previewSettings"), dict):
        project["previewSettings"] = normalize_preview_settings(payload.get("previewSettings"))
        write_project(project_id, project)

    if not (REMOTION_DIR / "node_modules").exists():
        return jsonify({
            "error": "Remotion dependencies are not installed yet. Run: cd remotion && npm install"
        }), 400

    if project.get("status") == "rendering" and project_id in RENDER_THREADS:
        return jsonify({
            "message": "Render is already running.",
            "project": project,
            "statusUrl": f"/api/projects/{project_id}/render-status",
        }), 202

    output_path = OUTPUTS_DIR / f"{project_id}.mp4"
    props_path = PROJECTS_DIR / project_id / "remotion-props.json"
    log_path = PROJECTS_DIR / project_id / "render.log"
    render = ensure_render_state(project)
    assets = project.get("assets", {}) if isinstance(project.get("assets"), dict) else {}
    screen_asset = assets.get("screen")
    screen_duration = assets.get("screenDurationSeconds")
    if screen_asset and not screen_duration:
        screen_duration = probe_media_duration(REMOTION_PUBLIC_DIR / str(screen_asset))
    custom_background_asset = assets.get("customBackground")
    custom_background_duration = assets.get("customBackgroundDurationSeconds")
    if custom_background_asset and not custom_background_duration:
        custom_background_duration = probe_media_duration(REMOTION_PUBLIC_DIR / str(custom_background_asset))

    props = {
        "title": project.get("title"),
        "productName": project.get("productName"),
        "targetUrl": project.get("targetUrl"),
        "cta": project.get("cta"),
        "format": project.get("format"),
        "template": project.get("template"),
        "durationSeconds": project.get("durationSeconds", 30),
        "fps": project.get("fps", 30),
        "screenAsset": screen_asset,
        "screenDurationSeconds": screen_duration,
        "voiceoverAsset": assets.get("voiceover"),
        "backgroundMusicAsset": assets.get("backgroundMusic"),
        "customBackgroundAsset": custom_background_asset,
        "customBackgroundDurationSeconds": custom_background_duration,
        "logoAsset": assets.get("logo"),
        "thumbnailAsset": assets.get("thumbnail"),
        "thumbnailBumper": project.get("thumbnailBumper"),
        "layout": project.get("layout"),
        "scenes": project.get("scenes", []),
        "clips": project.get("clips", []),
        "previewSettings": project.get("previewSettings"),
    }
    props_path.write_text(json.dumps(props, indent=2), encoding="utf-8")

    project["status"] = "rendering"
    render.update({
        "lastStartedAt": datetime.now().isoformat(timespec="seconds"),
        "lastFinishedAt": None,
        "lastError": None,
        "logFile": str(log_path.relative_to(BASE_DIR)),
        "secondsElapsed": None,
        "progress": 1,
        "phase": "queued",
        "framesDone": 0,
        "framesTotal": render_duration_frames(project),
    })
    write_project(project_id, project)

    npx = "npx.cmd" if os.name == "nt" else "npx"
    composition_id = "PromoVertical"
    if project.get("format") == "landscape":
        composition_id = "PromoLandscape"
    elif project.get("format") == "square":
        composition_id = "PromoSquare"

    cmd = [
        npx,
        "remotion",
        "render",
        "src/index.ts",
        composition_id,
        str(output_path),
        f"--props={props_path}",
        f"--timeout={render_timeout_ms()}",
        f"--concurrency={render_concurrency()}",
        "--overwrite",
    ]

    started = time.time()
    thread = threading.Thread(
        target=run_remotion_render,
        args=(project_id, cmd, log_path, output_path, started),
        daemon=True,
        name=f"render-{project_id}",
    )
    RENDER_THREADS[project_id] = thread
    thread.start()
    return jsonify({
        "message": "Render started.",
        "project": project,
        "statusUrl": f"/api/projects/{project_id}/render-status",
    }), 202


@app.get("/outputs/<path:filename>")
def download_output(filename: str):
    return send_from_directory(OUTPUTS_DIR, filename, as_attachment=False)


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5055)
