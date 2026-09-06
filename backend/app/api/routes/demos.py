"""Demo endpoints (placeholders for interactive demos)."""

import hashlib
import io
from typing import List

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from app.core.rate_limit import limiter

router = APIRouter(prefix="/demos", tags=["demos"])

# Lightweight, dependency-free placeholder predictions.
_PLANT_CLASSES: List[str] = [
    "Healthy Leaf",
    "Tomato — Late Blight",
    "Tomato — Early Blight",
    "Potato — Late Blight",
    "Apple — Scab",
    "Corn — Common Rust",
    "Grape — Black Rot",
]

_MAX_UPLOAD_BYTES = 4 * 1024 * 1024  # 4 MB
_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}


def _mock_prediction(image_bytes: bytes) -> dict:
    """Return a deterministic mock prediction so the UI is testable end-to-end.

    The model would replace this with real inference output. We hash the image
    so the same upload always yields the same answer, which makes the UX feel
    real even without a backing model.
    """
    digest = hashlib.sha256(image_bytes).hexdigest()
    seed = int(digest[:8], 16)
    primary = _PLANT_CLASSES[seed % len(_PLANT_CLASSES)]
    confidence = 0.72 + (seed % 27) / 100.0  # 0.72 - 0.99
    top_k = []
    used = {primary}
    cursor = seed
    for _ in range(3):
        cursor = (cursor * 1103515245 + 12345) & 0x7FFFFFFF
        candidate = _PLANT_CLASSES[cursor % len(_PLANT_CLASSES)]
        if candidate in used:
            continue
        used.add(candidate)
        top_k.append(
            {"label": candidate, "confidence": round(0.4 + (cursor % 30) / 100.0, 3)}
        )
    return {
        "label": primary,
        "confidence": round(min(confidence, 0.99), 3),
        "top_k": top_k,
        "model": "placeholder-cnn-v0",
        "notes": "Replace with the trained PyTorch checkpoint in production.",
    }


@router.post("/plant-disease")
@limiter.limit("10/minute;60/hour")
async def plant_disease_demo(
    request: Request,
    file: UploadFile = File(...),
) -> dict:
    if file.content_type not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, or WebP images are accepted.",
        )

    buffer = io.BytesIO()
    total = 0
    while True:
        chunk = await file.read(64 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > _MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image is too large (max 4 MB).",
            )
        buffer.write(chunk)

    image_bytes = buffer.getvalue()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file uploaded."
        )

    # Verify magic bytes match a real image. We do not rely on the extension.
    head = image_bytes[:12]
    is_jpeg = head[:3] == b"\xff\xd8\xff"
    is_png = head[:8] == b"\x89PNG\r\n\x1a\n"
    is_webp = head[:4] == b"RIFF" and head[8:12] == b"WEBP"
    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File contents do not match an allowed image type.",
        )

    return _mock_prediction(image_bytes)
