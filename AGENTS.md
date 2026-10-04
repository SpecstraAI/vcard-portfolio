```orchestra-runtime-profile
{
  "schema_version": 1,
  "profile_id": "default",
  "tools": [{"id": "python", "executable": "python3", "version_args": ["--version"], "version_constraint": ">=3.10"}],
  "commands": [],
  "qa_start": [
    {"id": "web", "run": "python3 -m http.server 5173", "cwd": ".", "ready_url": "http://localhost:5173", "preview": true}
  ]
}
```
