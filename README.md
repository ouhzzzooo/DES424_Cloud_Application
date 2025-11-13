# ActTrack

ActTrack is a Supabase-powered activity tracking platform with a Vite + React frontend. This repository contains the application source plus end-to-end deployment guidance for running everything in your own AWS account.

## Repository Structure

- `src/`, `public/`, `index.html` – Vite + React frontend
- `supabase/` – Supabase configuration, Deno edge functions, database migrations
- `infra/` – Docker assets and infrastructure deployment guides
- `docs/` – Additional documentation (AWS console runbooks, environment setup, etc.)

## Quick Start (Local Development)

```sh
npm install
npm run dev
```

Environment variables used during local development live in `.env.local` (see `docs/configuration/environment-variables.md` for details).

## Deployment Overview

ActTrack assumes the following AWS-hosted architecture:

- **Frontend**: React static assets served via Amazon S3 + CloudFront *or* via an NGINX container on ECS/Fargate
- **Backend**: Self-hosted Supabase stack on ECS/Fargate backed by Amazon RDS (PostgreSQL), Amazon S3 (storage API), and an Application Load Balancer
- **Networking**: Dedicated VPC with public/private subnets, Internet Gateway, and NAT Gateway

Step-by-step deployment instructions covering AWS Console workflows, Docker assets, and Supabase configuration live in `docs/deployment/aws-console-self-hosted-supabase.md`.

## Docker Assets

- `infra/supabase/docker-compose.yml` – Supabase service definitions for ECS deployments
- `infra/supabase/kong.yml` – Kong declarative configuration used by Supabase
- `infra/frontend/Dockerfile` – Multi-stage build producing an NGINX container for the React frontend
- `infra/frontend/nginx.conf` – Default NGINX configuration serving the built SPA with health check endpoint

## Automated Infrastructure

Infrastructure as code isn’t yet provided; use the AWS Console runbook and Docker assets above. You can translate the same steps into Terraform/CloudFormation once validated.

## Testing & Linting

```sh
npm run lint
```

## Contributing

1. Create a branch
2. Make your changes
3. Run lint/tests
4. Open a pull request

## License

Proprietary – ActTrack internal use only.
