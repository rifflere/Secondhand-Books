# Deployment Guide

Secondhand Books runs on AWS Free Tier: one EC2 t3.micro (app server) and one RDS db.t3.micro (MySQL).  
Infrastructure is managed by Terraform. The app is served by Nginx (static frontend) + PM2 (Express backend).

---

## Quick Redeploy

Use this when you've made code changes and want to push them to the live server.

```powershell
# From the project root
.\deploy\upload.ps1 -IP <YOUR_EC2_IP>
```

Then SSH in and restart the server:

```powershell
ssh -i "$env:USERPROFILE\.ssh\secondhand-books" ec2-user@<YOUR_EC2_IP>
```

```bash
pm2 restart secondhand-books
```

That's it. Changes are live.

> Your EC2 IP is in `terraform/terraform.tfvars` or run `terraform output` from the `terraform/` folder.

---

## First-Time Setup

### Prerequisites

| Tool | Install |
|------|---------|
| AWS CLI | Download [AWSCLIV2.msi](https://awscli.amazonaws.com/AWSCLIV2.msi) and run the installer |
| Terraform | `winget install Hashicorp.Terraform` then open a new PowerShell window |

### 1 — AWS Account

1. Create an account at [aws.amazon.com](https://aws.amazon.com) (credit card required; won't be charged on free tier)
2. In the AWS Console, go to **Billing → Budgets → Create budget** and set a **Zero spend budget** so you get emailed if any charge appears

### 2 — IAM User (API credentials for Terraform)

1. AWS Console → **IAM → Users → Create user**
2. Skip console access; go straight to **Security credentials → Create access key**
3. Choose **Command Line Interface (CLI)** and copy both the Access Key ID and Secret Access Key

### 3 — Configure the AWS CLI

```powershell
aws configure
# Enter: Access Key ID, Secret Access Key, region (us-east-1), output format (json)
```

Verify: `aws sts get-caller-identity` should return your account info as JSON.

### 4 — Generate SSH Key

```powershell
ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\secondhand-books"
# Press Enter twice for no passphrase
```

### 5 — Configure Terraform Variables

```powershell
cd terraform
copy terraform.tfvars.example terraform.tfvars
```

Edit `terraform/terraform.tfvars`:

```hcl
region              = "us-east-1"
db_password         = "SomethingStrong123!"
ssh_public_key_path = "C:/Users/<your-username>/.ssh/secondhand-books.pub"
```

> Use forward slashes in the key path. This file is in `.gitignore` — never commit it.

### 6 — Provision Infrastructure

```powershell
terraform init
terraform apply   # type "yes" when prompted
```

Takes 5–10 minutes (RDS is slow to start). When it finishes, note the outputs:

```
ec2_public_ip = "1.2.3.4"
rds_host      = "secondhand-books.abc123.us-east-1.rds.amazonaws.com"
ssh_command   = "ssh -i ~/.ssh/secondhand-books ec2-user@1.2.3.4"
```

### 7 — Upload App Files

Wait ~2 minutes for the EC2 startup script to finish installing Node/Nginx/PM2, then from the project root:

```powershell
cd ..   # back to project root if still in terraform/
.\deploy\upload.ps1 -IP <EC2_IP>
```

### 8 — Server Setup (run once on EC2)

SSH in:
```powershell
ssh -i "$env:USERPROFILE\.ssh\secondhand-books" ec2-user@<EC2_IP>
# Type "yes" when asked about the host fingerprint — this is normal for a new server
```

On the server, run each block and watch for errors:

```bash
# Install dependencies
cd /var/www/secondhand-books/server
npm install --omit=dev
```

```bash
# Generate a JWT secret (copy the output)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

```bash
# Create the .env file — fill in all three placeholders
cat > /var/www/secondhand-books/server/.env << 'EOF'
PORT=3001
DB_HOST=PASTE_RDS_HOST_FROM_TERRAFORM_OUTPUT
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=PASTE_YOUR_DB_PASSWORD
DB_NAME=secondhand_books
JWT_SECRET=PASTE_THE_HEX_STRING_FROM_ABOVE
EOF
```

```bash
# Initialize the database tables
npm run db:init
```

```bash
# Start the app with PM2 (keeps it running, auto-restarts on crash)
pm2 start /var/www/secondhand-books/server/index.js --name secondhand-books

# Enable PM2 to survive a server reboot
pm2 startup systemd -u ec2-user --hp /home/ec2-user
# ↑ This prints a "sudo ..." command — copy and run it, then:
pm2 save
```

```bash
# Configure Nginx
sudo cp ~/nginx.conf /etc/nginx/conf.d/secondhand-books.conf
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx

# Allow Nginx to read the static frontend files
sudo chmod -R o+rX /var/www/secondhand-books/client/dist
```

The app is now live at `http://<EC2_IP>`.

---

## Infrastructure Notes

| Resource | Type | Free tier |
|----------|------|-----------|
| EC2 | t3.micro | 750 hrs/month |
| RDS MySQL 8.0 | db.t3.micro | 750 hrs/month, 20 GB SSD |
| Elastic IP | — | Free while EC2 is running |

**Important:** If you stop the EC2 instance, the Elastic IP incurs a small charge (~$0.005/hr) while idle. Either keep the instance running (it fits within free-tier hours) or run `terraform destroy` when fully done.

Free tier lasts **12 months** from account creation. Monitor usage at **Billing → Free Tier** in the AWS Console.

---

## Tear Down / Undeploy

### Optional: back up your data first

The RDS database is permanently deleted by `terraform destroy`. If you want to keep your books data, export it first. SSH into the server and run:

```bash
# On the EC2 instance — dumps the database to a SQL file
mysqldump -h $DB_HOST -u admin -p secondhand_books > ~/secondhand_books_backup.sql
```

Then copy it to your laptop (run this locally in PowerShell, not on the server):

```powershell
scp -i "$env:USERPROFILE\.ssh\secondhand-books" ec2-user@<EC2_IP>:~/secondhand_books_backup.sql .
```

### Destroy all AWS resources

From the `terraform/` folder on your laptop:

```powershell
cd "C:\Users\rebec\Desktop\Secondhand-Books\terraform"
terraform destroy
```

Type `yes` when prompted. Terraform will delete in order:
- EC2 instance
- Elastic IP
- RDS instance (and all data in it)
- Security groups
- DB subnet group
- SSH key pair

Takes 5–10 minutes. When it finishes you should see `Destroy complete!` with a count of destroyed resources.

### Verify nothing is left running

Log into the AWS Console and check:

- **EC2 → Instances** — should show no running instances
- **RDS → Databases** — should be empty
- **EC2 → Elastic IPs** — should be empty (an orphaned EIP costs money)

If anything is still showing, you can delete it manually from the console.

### Clean up local Terraform state

The `terraform.tfstate` file (gitignored) holds the record of what Terraform created. After a successful destroy it's effectively empty, but you can delete it if you want a clean slate:

```powershell
Remove-Item terraform\terraform.tfstate
Remove-Item terraform\terraform.tfstate.backup
```

This means Terraform has no memory of the old infrastructure, so a future `terraform apply` will start completely fresh.

---

## File Map

```
terraform/
  main.tf                  # all AWS resources (EC2, RDS, security groups, etc.)
  variables.tf             # input variable declarations
  terraform.tfvars         # your values (gitignored — contains secrets)
  terraform.tfvars.example # safe to commit, shows what's needed

deploy/
  upload.ps1       # builds frontend and SCPs files to EC2
  server-setup.sh  # reference for the one-time EC2 setup steps
  nginx.conf       # Nginx config (proxies /api to Express, serves React build)
```
