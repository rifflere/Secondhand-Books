# deploy/upload.ps1
# Run from the project root after "terraform apply" has finished.
# Usage: .\deploy\upload.ps1 -IP <your-ec2-ip>

param(
    [Parameter(Mandatory=$true)]
    [string]$IP
)

$KEY  = "$env:USERPROFILE\.ssh\secondhand-books"
$DEST = "ec2-user@${IP}"
$APP  = "/var/www/secondhand-books"

Write-Host "`n[1/4] Building the React frontend..." -ForegroundColor Cyan
Set-Location client
npm run build
Set-Location ..

Write-Host "`n[2/4] Uploading server source files..." -ForegroundColor Cyan
# Upload each source folder individually to skip node_modules
$serverFolders = @("config", "controllers", "middleware", "repositories", "routes", "services")
foreach ($folder in $serverFolders) {
    scp -i $KEY -r "server\$folder" "${DEST}:${APP}/server/"
}
scp -i $KEY server\index.js      "${DEST}:${APP}/server/index.js"
scp -i $KEY server\package.json  "${DEST}:${APP}/server/package.json"
scp -i $KEY server\package-lock.json "${DEST}:${APP}/server/package-lock.json"

Write-Host "`n[3/4] Uploading built frontend..." -ForegroundColor Cyan
scp -i $KEY -r client\dist "${DEST}:${APP}/client/"

Write-Host "`n[4/4] Uploading Nginx config..." -ForegroundColor Cyan
scp -i $KEY deploy\nginx.conf "${DEST}:~/nginx.conf"

Write-Host "`nDone! Now SSH in and run the server setup script:" -ForegroundColor Green
Write-Host "  ssh -i $KEY ec2-user@$IP" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then on the server, paste and run the contents of deploy/server-setup.sh"
