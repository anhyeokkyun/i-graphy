# Architecture

FastAPI serves both the HTML pages and REST API. This avoids a separate frontend server and unnecessary CORS configuration.

```text
Browser
├── HTML/CSS/JS
│       ↓ fetch()
└── FastAPI
        ├── FileResponse / StaticFiles
        └── REST API
                ↓
            SQLAlchemy
                ↓
             psycopg
                ↓
           PostgreSQL
```

The MVP deliberately avoids service/repository/controller layers until actual complexity requires them.
