## ActTrack Deployment Runbook (AWS Console)

This runbook walks through hosting the entire ActTrack stack in your AWS account using the AWS Console. Use it as a checklist the first time you deploy; afterwards you can automate the same flow with IaC.

---

### 1. Prerequisites

- AWS account with permissions for VPC, EC2, ECS, RDS, IAM, CloudFront, S3, and Certificate Manager
- Domain name managed in Route 53 (or another registrar you can delegate to CloudFront/ACM)
- Local workstation with:
  - AWS CLI v2 configured with administrator credentials
  - Docker Desktop (or any Docker-compatible runtime)
  - `psql` client for running migrations
- Secrets you will need to generate in advance:
  - `DB_PASSWORD` (strong passphrase for the RDS `postgres` user)
  - `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY` (generate with `openssl rand -base64 32` and create the JWT claims using `docs/configuration/environment-variables.md`)
  - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (IAM user or role for Supabase Storage service)

---

### 2. Networking – Create the VPC

1. Open the **VPC Console** → `Create VPC`.
2. Select **VPC and more**.
3. Configure:
   - Name: `acttrack-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - Subnets:
     - Public: `10.0.1.0/24` (AZ a), `10.0.2.0/24` (AZ b)
     - Private: `10.0.10.0/24` (AZ a), `10.0.11.0/24` (AZ b)
   - NAT Gateways: 1 per AZ (or 1 shared to control cost)
   - Enable DNS hostnames/resolution.
4. Finish the wizard. Verify that route tables send:
   - Public subnets → Internet Gateway
   - Private subnets → NAT Gateway

> **Tip**: Tag the subnets `Tier=public|private` for clarity. You will reference these subnets when creating the RDS instance and ECS services.

---

### 3. Database – Amazon RDS for PostgreSQL

1. Open the **RDS Console** → `Create database`.
2. Choose:
   - Engine: **PostgreSQL 15** (latest minor)
   - Templates: **Production** (enables Multi-AZ + backups)
   - DB instance class: `db.t3.medium`
   - Storage: 100 GB gp3 (enable autoscaling if desired)
3. Credentials:
   - Master username: `postgres`
   - Master password: `DB_PASSWORD` (store in Secrets Manager afterwards)
4. Network:
   - VPC: `acttrack-vpc`
   - Subnet group: select the private subnets
   - Public access: **No**
   - Security group: create `acttrack-rds-sg` with inbound **5432** from the ECS security group (create placeholder SG now and update after ECS SG exists).
5. Enable the following parameter group options (create a custom parameter group if required):
   - `shared_preload_libraries = "pg_stat_statements,pg_cron"`
6. After the instance is `Available`, connect using the Query Editor or `psql` (through a bastion/Session Manager) and create the required extensions:

   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_cron";
   CREATE EXTENSION IF NOT EXISTS "pg_net";
   CREATE EXTENSION IF NOT EXISTS "pgjwt";
   ```

---

### 4. Container Registry – Amazon ECR Repositories

Create two repositories:

1. `acttrack-supabase` (stores Supabase service images if you build custom ones; optional when relying on upstream images).
2. `acttrack-frontend` (stores the NGINX image built from `infra/frontend/Dockerfile`).

If you plan to use only upstream Supabase images, you can skip the first repository.

---

### 5. Supabase Stack – ECS Fargate

1. **Build artefacts locally** (optional): use the provided `infra/supabase/docker-compose.yml` to validate everything works with `docker compose up`. Push any custom images to ECR.
2. **Create Secrets**:
   - Use **AWS Secrets Manager** for `DB_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`.
   - Create an **IAM user** `acttrack-storage` with programmatic access limited to the storage bucket (section 7) and store access keys.
3. **Create Security Group** `acttrack-ecs-sg` allowing outbound traffic and inbound **8000** from the ALB.
4. **Task Execution Role**:
   - Attach `AmazonECSTaskExecutionRolePolicy`.
   - Add permissions for Secrets Manager (GetSecretValue) and SSM Parameter Store (if used).
5. **Task Definition**:
   - Launch type: Fargate
   - CPU/Memory: `1024 / 2048` as baseline
   - Networking: `awsvpc`
   - For each container (`studio`, `kong`, `auth`, `rest`, `realtime`, `storage`, `meta`):
     - Image: from `infra/supabase/docker-compose.yml`
     - Map ports as defined (kong → 8000)
     - Inject environment variables via Secrets and plain text values (see `.env.sample`)
   - Mount the `kong.yml` as a volume using AWS Secrets Manager or bake it into a sidecar volume (S3 download on init or EFS).
6. **Application Load Balancer**:
   - Create `acttrack-alb` (internet-facing).
   - Listeners:
     - 80 → redirect to 443
     - 443 → target group `acttrack-kong-tg` (port 8000, type IP, health check `/health` or `/` depending on Kong config)
   - Security group should allow 80/443 from the world and 8000 to the ECS tasks.
7. **ECS Service**:
   - Cluster: `acttrack-backend`
   - Service type: Fargate
  - Subnets: private ones (with NAT access)
  - Associate the ALB target group
  - Desired count: 2 for HA (scale later based on load)
8. Update the RDS security group inbound rule to allow PostgreSQL traffic from `acttrack-ecs-sg`.

---

### 6. Database Migrations

1. From a workstation or CI runner with network access to RDS (via VPN, bastion, or Systems Manager port forwarding), run:

   ```sh
   export DATABASE_URL="postgres://postgres:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/postgres"
   psql "$DATABASE_URL" -f supabase/migrations/<timestamp>.sql
   ```

2. Apply all files in `supabase/migrations/` sequentially.
3. Verify tables and policies exist as expected.

---

### 7. Supabase Storage – Amazon S3

1. Create bucket `acttrack-supabase-storage`.
2. Block public access (default). Fine-grain access will be through signed URLs.
3. Attach the following CORS configuration:

   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": ["https://app.acttrack.example.com"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 3000
       }
     ]
   }
   ```

4. Update the IAM user from section 5 with permissions limited to this bucket (`s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`).

---

### 8. Frontend – Option A (S3 + CloudFront)

1. Build locally:

   ```sh
   npm run build
   ```

2. Create bucket `acttrack-frontend` (static website hosting enabled).
3. Upload the `dist/` folder via AWS CLI or Console:

   ```sh
   aws s3 sync dist/ s3://acttrack-frontend
   ```

4. Request an ACM certificate in `us-east-1` for `app.acttrack.example.com`.
5. Create CloudFront distribution:
   - Origin: `acttrack-frontend.s3.amazonaws.com`
   - Origin access: use OAC (origin access control) and update bucket policy.
   - Default root object: `index.html`
   - Viewer protocol: Redirect to HTTPS
   - Alternate domain names: `app.acttrack.example.com`
   - Attach the ACM certificate.
6. Update Route 53 record to point the domain alias to the CloudFront distribution.
7. Set production environment variables (see section 10) and redeploy the frontend when ALB/Supabase endpoints are ready.

---

### 9. Frontend – Option B (ECS Fargate with Docker)

1. Build the container image using `infra/frontend/Dockerfile`:

   ```sh
   docker build -t acttrack-frontend:latest -f infra/frontend/Dockerfile .
   ```

2. Authenticate to ECR and push:

   ```sh
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com
   docker tag acttrack-frontend:latest <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/acttrack-frontend:latest
   docker push <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/acttrack-frontend:latest
   ```

3. Create an ECS Fargate service in the same cluster or a dedicated cluster:
   - Container port: 80
   - Connect to the ALB (separate target group, listener rule for `/` or subdomain)
   - Store frontend environment variables in ECS task definition (Vite build-time variables must be injected during build; runtime variables can be served via rewrite rules or `window.__ENV` pattern).

Option B is useful if you need SSR-like control or want to co-locate frontend and backend networking.

---

### 10. Environment Variables

Populate ECS task definitions, Secrets Manager, and CI/CD pipelines using the canonical list in `docs/configuration/environment-variables.md`. Key highlights:

- **Frontend**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
- **Backend**: `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `DB_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`

See the configuration doc for generation commands and recommended storage mechanisms.

---

### 11. Post-Deployment Checklist

- [ ] Kong `/rest/v1/` endpoint reachable via ALB HTTPS URL
- [ ] Supabase Studio accessible (protected to VPN or administration IPs)
- [ ] Realtime websockets functioning (check browser console)
- [ ] Storage uploads succeed (test via app)
- [ ] CloudFront distribution issues no cache errors
- [ ] Observability (CloudWatch Logs, RDS Performance Insights) enabled
- [ ] Enforce automated backups + rotation for access keys

---

### 12. Automation Next Steps

- Export the VPC, ECS, RDS, and CloudFront configurations via CloudFormation drift detection or AWS CDK to codify infrastructure.
- Integrate CI/CD (GitHub Actions) to build Docker images, run migrations, and deploy to ECS.
- Add health checks and alarms (CloudWatch) for Kong, GoTrue auth errors, and database replication lag.


