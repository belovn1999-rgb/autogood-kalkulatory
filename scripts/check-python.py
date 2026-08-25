from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IGNORED_DIRECTORIES = {".git", ".github", "__pycache__", "node_modules", "output", "outputs", "tmp"}


def python_sources() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.py")
        if not any(part in IGNORED_DIRECTORIES for part in path.relative_to(ROOT).parts)
    )


for source in python_sources():
    compile(source.read_text(encoding="utf-8"), str(source), "exec")

print(f"Python syntax check passed for {len(python_sources())} files.")
