#Requires -Version 5.1
<#
.SYNOPSIS
  Creates the private S3 bucket and a locked-down IAM user for destinlmincy.com
  contract PDFs, then writes the values into .env.local.

.NOTES
  Run from the repo root with an AWS CLI profile that can create buckets and
  IAM users (your admin identity, not the app user this creates):
    powershell -ExecutionPolicy Bypass -File .\aws-s3-setup.ps1
  The secret key is never printed. It goes only into .env.local, which is
  gitignored.
#>

$ErrorActionPreference = "Stop"

$Bucket  = "destinlmincy-contracts-private"   # globally unique; change if taken
$Region  = "us-east-1"
$User    = "destinlmincy-app-s3"
$EnvFile = ".env.local"

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw "AWS CLI not found. Install from https://aws.amazon.com/cli/ and run 'aws configure' first."
}
if (-not (Test-Path $EnvFile)) {
    throw "$EnvFile not found. Run this from the repo root after copying .env.example to .env.local."
}

aws sts get-caller-identity | Out-Null

# 1. Private bucket: all public access blocked, SSE-S3 by default, versioned.
Write-Host "Creating bucket $Bucket in $Region"
if ($Region -eq "us-east-1") {
    aws s3api create-bucket --bucket $Bucket --region $Region | Out-Null
} else {
    aws s3api create-bucket --bucket $Bucket --region $Region `
        --create-bucket-configuration LocationConstraint=$Region | Out-Null
}

aws s3api put-public-access-block --bucket $Bucket `
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

$encryption = '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
$encFile = New-TemporaryFile
Set-Content -Path $encFile -Value $encryption -NoNewline
aws s3api put-bucket-encryption --bucket $Bucket --server-side-encryption-configuration "file://$encFile"
Remove-Item $encFile

aws s3api put-bucket-versioning --bucket $Bucket --versioning-configuration Status=Enabled

# 2. IAM user limited to PutObject/GetObject on this one bucket.
Write-Host "Creating IAM user $User"
aws iam create-user --user-name $User | Out-Null

$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject"],
    "Resource": "arn:aws:s3:::$Bucket/*"
  }]
}
"@
$policyFile = New-TemporaryFile
Set-Content -Path $policyFile -Value $policy -NoNewline
aws iam put-user-policy --user-name $User --policy-name "$Bucket-rw" --policy-document "file://$policyFile"
Remove-Item $policyFile

# 3. Access key, written only to .env.local.
Write-Host "Creating access key"
$keyJson = aws iam create-access-key --user-name $User | ConvertFrom-Json
$AccessKeyId = $keyJson.AccessKey.AccessKeyId
$SecretKey   = $keyJson.AccessKey.SecretAccessKey

$keep = Get-Content $EnvFile | Where-Object {
    $_ -notmatch '^(AWS_REGION|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|S3_PRIVATE_BUCKET)='
}
$keep += @(
    "AWS_REGION=$Region",
    "AWS_ACCESS_KEY_ID=$AccessKeyId",
    "AWS_SECRET_ACCESS_KEY=$SecretKey",
    "S3_PRIVATE_BUCKET=$Bucket"
)
Set-Content -Path $EnvFile -Value $keep -Encoding UTF8

Write-Host ""
Write-Host "Done."
Write-Host "  Bucket : $Bucket"
Write-Host "  User   : $User"
Write-Host "  Values written to $EnvFile (secret not displayed)."
Write-Host "Verify in the console: the bucket should read 'Bucket and objects not public'."
