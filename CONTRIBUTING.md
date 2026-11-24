# Contributing

This guide covers how we work on this repository: running its tools, changing the brand and releasing a new version.
For what the package is and how a project uses it, start with the [README](README.md).

## Running the tools

The tools behind the git hooks and the project scripts run in [Docker](https://www.docker.com/), so you need nothing
else installed.

Clone the repository and install the tools once. This also turns on the git hooks:

```bash
git clone git@github.com:monetyo/monetyo-brand.git
cd monetyo-brand
docker compose run --rm app bun install
```

Every project script then runs in a throwaway container:

| Command                                                       | What it does                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `docker compose run --rm python python scripts/draw-logos.py` | Draw every logo variant from the mark and the font                         |
| `docker compose run --rm app bun run export`                  | Render the logos into `exports/`, and the tokens into `tokens/tokens.json` |
| `docker compose run --rm app bun run lint`                    | Check that every logo is valid SVG and that the tokens compile             |
| `docker compose run --rm app bun run format`                  | Format every file with [Prettier](https://prettier.io/)                    |
| `docker compose run --rm app bun run format:check`            | Check formatting without changing anything                                 |

`lint` compiles [`checks/theme.css`](checks/theme.css), which imports the tokens the way a project does. If they build
there, they build in every project that uses them.

## Changing the brand

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), enforced by
[commitlint](https://commitlint.js.org/). Alongside the standard types, `ai` is for AI-related configuration such as
`CLAUDE.md` and `.claude/`. Commit scopes aren't used.

A change here reaches every product and website, so check it in at least one of them before pushing. Each commit
should be one coherent change that passes every check below.

Renaming or removing a token, a logo file or an import path breaks every project that uses it. Commit it as `feat!:`,
with a `BREAKING CHANGE:` footer saying what to update, and release it as a new major version. Changing a value, such
as a shade of blue, doesn't break anything but changes every product at once, so it is always a commit of its own.

### Changing a logo

Only `logos/mark.svg` is drawn by hand. Every other file in `logos/` and `exports/`, the favicon included, is
generated from it, so never edit one directly:

1. Change the mark, or [`scripts/draw-logos.py`](scripts/draw-logos.py) for the favicon, the name, the lockups and the
   one-colour versions, or [`scripts/export-logos.ts`](scripts/export-logos.ts) for the PNG and ICO sizes.
2. Run both generators, in this order:

   ```bash
   docker compose run --rm python python scripts/draw-logos.py
   docker compose run --rm app bun run export
   ```

3. Commit the change and every regenerated file together.

`draw-logos.py` lays the name out with [HarfBuzz](https://harfbuzz.github.io/) and draws it with
[fontTools](https://fonttools.readthedocs.io/), in a [Python](https://www.python.org/) container with pinned versions.
`export-logos.ts` renders with [resvg](https://github.com/linebender/resvg), which gives the same files on every
machine.

## Git hooks and CI

[Husky](https://typicode.github.io/husky/) manages two [git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks),
each running in a throwaway container.

| Hook         | Checks                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| `pre-commit` | [lint-staged](https://github.com/lint-staged/lint-staged), running Prettier on staged files |
| `commit-msg` | Commit message validation with commitlint                                                   |

If Docker isn't running, the hooks fail and the commit is aborted rather than skipping the checks.

Every push to `main` and every pull request also run [GitHub Actions](https://docs.github.com/en/actions) workflows:

| Workflow   | What it does                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Commitlint | Checks every pushed commit message                                                                           |
| Format     | Runs `format:check`                                                                                          |
| Lint       | Runs `lint`                                                                                                  |
| Generated  | Runs both generators and fails if any committed logo, export or `tokens.json` differs from what they produce |
| Release    | On a version tag, publishes to npm and creates the release, see below                                        |

## Releasing a new version

1. Bump `version` in [`package.json`](package.json), following [Semantic Versioning](https://semver.org/).
2. Tag the commit with the same version and push the tag:

   ```bash
   git tag -s v0.2.0 -m "v0.2.0"
   git push origin v0.2.0
   ```

3. The Release workflow checks that the tag matches `package.json` and runs `lint`, publishes the package to
   [npm](https://www.npmjs.com/package/@monetyo/brand) with provenance, and creates the GitHub release, listing the
   pull requests merged since the previous version, or its commits when no pull request was merged.
4. Update the projects that should use it to the new version.

### How publishing works

The Release workflow publishes through npm [trusted publishing](https://docs.npmjs.com/trusted-publishers/): npm
trusts this repository's `release.yml` directly, so no npm token exists anywhere. The trusted publisher is set up in
the package's settings on npm, and only accepts a workflow with that exact filename, so renaming `release.yml` stops
releases until the trusted publisher is updated.
