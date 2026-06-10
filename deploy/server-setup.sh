#!/bin/bash
# deploy/server-setup.sh
# Run this ONCE on the EC2 instance after uploading files.
# Copy-paste each block one at a time so you can see any errors.

APP=/var/www/secondhand-books

# ── 1. Install server dependencies ────────────────────────────────────────
cd $APP/server
npm install --omit=dev

# ── 2. Create the .env file ───────────────────────────────────────────────
# Replace each placeholder before running this block.
cat > $APP/server/.env << 'EOF'
PORT=3001
DB_HOST=PASTE_RDS_HOST_FROM_TERRAFORM_OUTPUT
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=PASTE_YOUR_DB_PASSWORD
DB_NAME=secondhand_books
JWT_SECRET=PASTE_A_LONG_RANDOM_STRING_HERE
EOF

# Tip: generate a JWT secret with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# ── 3. Initialize the database ────────────────────────────────────────────
cd $APP/server
npm run db:init

# ── 4. Start the Express server with PM2 ──────────────────────────────────
pm2 start $APP/server/index.js --name secondhand-books

# Make PM2 restart the app automatically if the server reboots
pm2 startup systemd -u ec2-user --hp /home/ec2-user
# ↑ This prints a command starting with "sudo". Copy and run that command now.
pm2 save

# ── 5. Configure Nginx ────────────────────────────────────────────────────
sudo cp ~/nginx.conf /etc/nginx/conf.d/secondhand-books.conf

# Test the config before enabling
sudo nginx -t

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# ── 6. Fix file permissions so Nginx can read the static files ────────────
sudo chmod -R o+rX $APP/client/dist

echo ""
echo "Setup complete! Your app should be live at http://$(curl -s ifconfig.me)"
