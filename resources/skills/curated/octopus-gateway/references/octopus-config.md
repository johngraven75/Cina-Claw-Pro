# Octopus configuration reference

Verify this baseline against the release, tag, or commit being operated.

## Application defaults

- Upstream image: `bestrui/octopus`
- Service: `0.0.0.0:8080`
- SQLite database: `data/data.db`
- Container data path: `/app/data`
- Initial management login: `admin` / `admin`; change it immediately.
- Default configuration: `data/config.json`
- Environment prefix: `OCTOPUS_`; dots become underscores.
- Database types in source: SQLite, MySQL, PostgreSQL.
- Binary start: `./octopus start`; optional `--config` selects a file.

The relay API is under `/v1` and includes `chat/completions`, `responses`, `messages`, `embeddings`, and image-generation/edit/variation routes. Relay keys begin with `sk-octopus-` and may use `Authorization: Bearer <key>` or `x-api-key: <key>`.

## Secure Docker baseline

```bash
docker run -d --name octopus --restart unless-stopped \
  -v /absolute/path/octopus-data:/app/data \
  -p 127.0.0.1:8080:8080 \
  bestrui/octopus:<verified-tag>
```

For remote access, keep the management UI behind a restricted TLS reverse proxy.

## Claude Code template

Merge into `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:8080",
    "ANTHROPIC_AUTH_TOKEN": "sk-octopus-<redacted>",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "ANTHROPIC_MODEL": "<group-name>",
    "ANTHROPIC_SMALL_FAST_MODEL": "<group-name>",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "<group-name>",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "<group-name>",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "<group-name>"
  }
}
```

## Codex template

Merge into `~/.codex/config.toml`:

```toml
model = "<group-name>"
model_provider = "octopus"

[model_providers.octopus]
name = "octopus"
base_url = "http://127.0.0.1:8080/v1"
```

The upstream README demonstrates `~/.codex/auth.json`:

```json
{
  "OPENAI_API_KEY": "sk-octopus-<redacted>"
}
```

Prefer the credential mechanism supported by the installed Codex version and protect credential files with user-only permissions. Do not replace an existing `OPENAI_API_KEY` silently.
