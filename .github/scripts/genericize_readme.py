#!/usr/bin/env python3
"""Genericize a seeded SleepDiaries README for use as a template.

Called by .github/workflows/init-from-version.yml during repo seeding.
Not part of the seeded output itself — this script lives only in the
SleepDiaries-Protocol template repo.

Usage: genericize_readme.py <path-to-README.md> <seeded-version-tag>
"""
import re
import sys


def genericize(content: str, version: str) -> str:
    # Drop badges that only make sense on the original circadia-bio repo:
    # Tests points at a workflow we strip out during seeding; DOI/Last
    # commit/Issues/PRs reflect the source repo's live stats, not this fork's.
    for pattern in [
        r"\[!\[Tests\]\([^)]*\)\]\([^)]*\)\n",
        r"\[!\[DOI\]\([^)]*\)\]\([^)]*\)\n",
        r"\[!\[Last commit\]\([^)]*\)\]\([^)]*\)\n",
        r"\[!\[Issues\]\([^)]*\)\]\([^)]*\)\n",
        r"\[!\[PRs welcome\]\([^)]*\)\]\([^)]*\)\n",
    ]:
        content = re.sub(pattern, "", content)

    # Un-link the PWA badge instead of pointing at the lab's live site
    content = re.sub(
        r"\[!\[PWA\]\(([^)]*)\)\]\([^)]*\)",
        r"![PWA](\1)",
        content,
    )

    # Drop/replace live-site links that won't resolve for a fresh fork
    content = content.replace(
        "\U0001F310 **Web app:** https://sleepdiaries.circadia-lab.uk\n", ""
    )
    content = content.replace(
        "\U0001F310 **Live web app:** https://sleepdiaries.circadia-lab.uk\n",
        "\U0001F310 **Live web app:** "
        "_add your deployed URL here once you've set up hosting_\n",
    )

    # Drop the "use the template instead" callout and its matching Related
    # Tools bullet — redundant once you're already inside a seeded fork
    content = re.sub(
        r"> \U0001F9EC \*\*Adapting this for your own study\?\*\*[^\n]*\n\n",
        "",
        content,
    )
    content = re.sub(
        r"- \U0001F9EC \[\*\*SleepDiaries Protocol\*\*\][^\n]*\n",
        "",
        content,
    )

    # Insert a banner right after the first heading, noting this README was
    # inherited from the source project and pointing to the setup checklist
    lines = content.split("\n")
    insert_at = next(
        (i + 1 for i, line in enumerate(lines) if line.startswith("# ")), 0
    )
    banner = [
        "",
        (
            "> **SleepDiaries Protocol template**, seeded from "
            f"[SleepDiaries {version}]"
            f"(https://github.com/circadia-bio/SleepDiaries/releases/tag/{version}). "
            "This README was inherited from the source project — update the "
            "app name, links, live URL, and citation below for your own "
            "study. See `TEMPLATE_SETUP.md` for a full setup checklist."
        ),
        "",
    ]
    lines[insert_at:insert_at] = banner
    return "\n".join(lines)


def main() -> None:
    if len(sys.argv) != 3:
        print("usage: genericize_readme.py <README.md> <version>", file=sys.stderr)
        sys.exit(1)

    readme_path, version = sys.argv[1], sys.argv[2]

    with open(readme_path, encoding="utf-8") as f:
        content = f.read()

    content = genericize(content, version)

    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"README genericized for {readme_path}")


if __name__ == "__main__":
    main()
