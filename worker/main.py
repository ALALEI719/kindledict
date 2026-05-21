"""KindleDict compile worker — converts HTML+OPF source files to .mobi via kindlegen."""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Response
from pydantic import BaseModel, Field

app = FastAPI(title="KindleDict Compile Worker", version="0.1.0")

WORKER_SECRET = os.environ.get("COMPILE_WORKER_SECRET", "")


class CompileRequest(BaseModel):
    files: dict[str, str] = Field(
        description="Dictionary source files keyed by filename (must include dict.opf)"
    )


def verify_auth(authorization: str | None) -> None:
    if not WORKER_SECRET:
        return
    expected = f"Bearer {WORKER_SECRET}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/compile")
def compile_dictionary(
    payload: CompileRequest,
    authorization: str | None = Header(default=None),
) -> Response:
    verify_auth(authorization)

    if "dict.opf" not in payload.files:
        raise HTTPException(status_code=400, detail="Missing dict.opf in files payload")

    kindlegen = shutil.which("kindlegen")
    if not kindlegen:
        raise HTTPException(status_code=500, detail="kindlegen binary not found")

    with tempfile.TemporaryDirectory(prefix="kindledict-") as tmp:
        work_dir = Path(tmp)
        for name, content in payload.files.items():
            safe_name = Path(name).name
            if safe_name != name or ".." in name:
                raise HTTPException(status_code=400, detail=f"Invalid filename: {name}")
            (work_dir / safe_name).write_text(content, encoding="utf-8")

        opf_path = work_dir / "dict.opf"
        result = subprocess.run(
            [kindlegen, str(opf_path)],
            cwd=work_dir,
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )

        mobi_path = work_dir / "dict.mobi"
        if not mobi_path.exists():
            detail = (result.stderr or result.stdout or "kindlegen failed")[:500]
            raise HTTPException(status_code=500, detail=detail)

        mobi_bytes = mobi_path.read_bytes()

    return Response(
        content=mobi_bytes,
        media_type="application/x-mobipocket-ebook",
        headers={"Content-Disposition": 'attachment; filename="dictionary.mobi"'},
    )
