variable "region" {
  description = "AWS region to deploy into"
  default     = "us-east-1"
}

variable "db_password" {
  description = "Password for the MySQL database user"
  sensitive   = true
}

variable "ssh_public_key_path" {
  description = "Path to your SSH public key file (the .pub file)"
  default     = "~/.ssh/secondhand-books.pub"
}
