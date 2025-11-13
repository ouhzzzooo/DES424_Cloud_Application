## Environment Variables Reference

Use this reference when configuring ActTrack locally, in CI/CD, or on AWS. Store secrets in AWS Secrets Manager or SSM Parameter Store—avoid checking real values into Git.

### Frontend (Vite)

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Public URL to Supabase gateway (ALB HTTPS endpoint) | `https://api.acttrack.example.com` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (JWT signed with `JWT_SECRET`) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SUPABASE_PROJECT_ID` | Internal project identifier used in analytics/logging | `acttrack-prod` |

Front-end vars are baked at build time. For local runs place them in `.env.local`. For CloudFront deployments, rebuild the site with production values before uploading the `dist/` folder.

### Backend (Supabase Containers)

| Variable | Description |
| --- | --- |
| `JWT_SECRET` | Base64 secret shared by all Supabase services; generate with `openssl rand -base64 32`. |
| `ANON_KEY` | JWT signed with `JWT_SECRET` for unauthenticated clients. Include `"role":"anon"` claim. |
| `SERVICE_ROLE_KEY` | Elevated JWT signed with `JWT_SECRET`. Include `"role":"service_role"` claim. Store securely. |
| `DB_PASSWORD` | PostgreSQL password for the `postgres` user (`postgresql://postgres:<DB_PASSWORD>@<RDS_ENDPOINT>:5432/postgres`). |
| `RDS_ENDPOINT` | RDS instance endpoint hostname. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Credentials for the IAM principal with scoped access to the storage bucket. |
| `AWS_DEFAULT_REGION` | Region of the S3 bucket (e.g., `us-east-1`). |
| `S3_BUCKET` | Name of the Supabase storage bucket (e.g., `acttrack-supabase-storage`). |
| `SITE_URL` | Base URL of the frontend used for auth email redirects (e.g., `https://app.acttrack.example.com`). |
| `GOTRUE_EXTERNAL_EMAIL_ENABLED` | Set to `true` if SMTP is configured. Provide SMTP settings as additional environment variables. |

### Generating JWT Keys

```sh
export JWT_SECRET=$(openssl rand -base64 32)

# anon key (role: anon)
node -e "const crypto=require('crypto');const secret=process.env.JWT_SECRET;const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');const payload=Buffer.from(JSON.stringify({role:'anon',aud:'authenticated',exp:Math.floor(Date.now()/1000)+60*60*24*365})).toString('base64url');const signature=crypto.createHmac('sha256',secret).update(\`\${header}.\${payload}\`).digest('base64url');console.log(\`\${header}.\${payload}.\${signature}\`);"

# service role key (role: service_role)
node -e "const crypto=require('crypto');const secret=process.env.JWT_SECRET;const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');const payload=Buffer.from(JSON.stringify({role:'service_role',aud:'service_role',exp:Math.floor(Date.now()/1000)+60*60*24*365})).toString('base64url');const signature=crypto.createHmac('sha256',secret).update(\`\${header}.\${payload}\`).digest('base64url');console.log(\`\${header}.\${payload}.\${signature}\`);"
```

Alternatively, use the Supabase CLI (`supabase secrets set`) or any JWT generator able to sign with HS256. Never commit generated tokens.

### Local `.env` Samples

- `infra/supabase/env.sample` (created in this repo) includes the variables expected by the Docker Compose stack.
- Copy to `.env` and fill values before running `docker compose up`.

### Secrets Storage Recommendations

- **AWS Secrets Manager** for `DB_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`.
- **SSM Parameter Store** for non-secret config like `SITE_URL`, `RDS_ENDPOINT`.
- Grant ECS task execution roles only the minimum required `GetSecretValue` permissions.


