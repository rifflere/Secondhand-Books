terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ---------------------------------------------------------------------------
# Networking — use the default VPC so we don't have to create one
# ---------------------------------------------------------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ---------------------------------------------------------------------------
# Security group for EC2: allow SSH (22) and HTTP (80) from anywhere
# ---------------------------------------------------------------------------
resource "aws_security_group" "ec2" {
  name        = "secondhand-books-ec2"
  description = "Allow SSH and HTTP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "secondhand-books-ec2" }
}

# ---------------------------------------------------------------------------
# Security group for RDS: only accept MySQL connections from the EC2 server
# ---------------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "secondhand-books-rds"
  description = "Allow MySQL only from EC2"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "MySQL from EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  tags = { Name = "secondhand-books-rds" }
}

# ---------------------------------------------------------------------------
# Latest Amazon Linux 2023 AMI (free, maintained by Amazon)
# ---------------------------------------------------------------------------
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ---------------------------------------------------------------------------
# SSH key pair — Terraform uploads your public key so you can SSH in
# ---------------------------------------------------------------------------
resource "aws_key_pair" "app" {
  key_name   = "secondhand-books"
  public_key = file(var.ssh_public_key_path)
}

# ---------------------------------------------------------------------------
# EC2 t2.micro — free tier (750 hrs/month for 12 months)
# The user_data script runs once on first boot and installs the runtime.
# ---------------------------------------------------------------------------
resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.app.key_name
  vpc_security_group_ids = [aws_security_group.ec2.id]

  user_data = <<-SHELL
    #!/bin/bash
    set -e
    dnf update -y
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs nginx
    npm install -g pm2
    mkdir -p /var/www/secondhand-books/server
    mkdir -p /var/www/secondhand-books/client/dist
    chown -R ec2-user:ec2-user /var/www/secondhand-books
  SHELL

  tags = { Name = "secondhand-books" }
}

# ---------------------------------------------------------------------------
# Elastic IP — gives you a stable address that survives reboots.
# Note: EIPs are free while the instance is RUNNING. If you stop the
# instance, AWS charges ~$0.005/hr for the idle EIP. Just keep it running
# (it's already using free-tier hours anyway).
# ---------------------------------------------------------------------------
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
  tags     = { Name = "secondhand-books" }
}

# ---------------------------------------------------------------------------
# RDS subnet group — RDS needs at least 2 subnets (uses the default VPC ones)
# ---------------------------------------------------------------------------
resource "aws_db_subnet_group" "app" {
  name       = "secondhand-books"
  subnet_ids = data.aws_subnets.default.ids
  tags       = { Name = "secondhand-books" }
}

# ---------------------------------------------------------------------------
# RDS MySQL — db.t3.micro is free tier (750 hrs/month, 20 GB SSD)
# If your region doesn't support db.t3.micro, change to db.t2.micro.
# ---------------------------------------------------------------------------
resource "aws_db_instance" "app" {
  identifier     = "secondhand-books"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  storage_type          = "gp2"
  max_allocated_storage = 20  # prevents accidental storage auto-scaling

  db_name  = "secondhand_books"
  username = "admin"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = false  # single-AZ = free tier
  publicly_accessible = false  # only EC2 can reach it
  skip_final_snapshot = true   # lets terraform destroy clean up without a manual step
  deletion_protection = false

  backup_retention_period = 0  # disables automated backups to stay on free tier

  tags = { Name = "secondhand-books" }
}

# ---------------------------------------------------------------------------
# Outputs — printed after terraform apply so you know where everything is
# ---------------------------------------------------------------------------
output "ec2_public_ip" {
  value       = aws_eip.app.public_ip
  description = "Public IP of your server"
}

output "ssh_command" {
  value       = "ssh -i ~/.ssh/secondhand-books ec2-user@${aws_eip.app.public_ip}"
  description = "Run this to SSH into your server"
}

output "rds_host" {
  value       = aws_db_instance.app.address
  description = "RDS hostname (use this as DB_HOST in your .env)"
}
