# AWS Infrastructure Setup Script for destinlmincy.com
# Usage: .\setup-aws.ps1 -Region us-east-1 -Profile default
# This script sets up BOTH Development and Production infrastructure.

param (
    [string]$Region = "us-east-1",
    [string]$Profile = "default",
    [string]$ProjectName = "destinlmincy.com",
    [string]$DomainName = "destinlmincy.com",
    [switch]$SetupComingSoon = $false # Use this to deploy a static Coming Soon page via S3
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param ([string]$Message, [string]$Color = "White")
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

function Check-Command {
    param ([string]$Command)
    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        Write-Log "Error: $Command is not installed. Please install AWS CLI." "Red"
        exit 1
    }
}

Check-Command "aws"

# Set AWS Profile and Region
$env:AWS_PROFILE = $Profile
$env:AWS_DEFAULT_REGION = $Region
# Ensure Account ID is retrievable
try {
    $AccountId = aws sts get-caller-identity --query "Account" --output text
} catch {
    Write-Log "Error: Unable to get AWS Account ID. Check credentials." "Red"
    exit 1
}

Write-Log "Starting AWS Setup for $ProjectName in $Region (Account: $AccountId)..." "Cyan"

# --- 0. IAM Roles ---
Write-Log "`n--- 0. IAM Roles & Permissions ---" "Cyan"

# Amplify Service Role
$AmplifyRoleName = "$ProjectName-amplify-role"
try {
    $AmplifyRoleArn = aws iam get-role --role-name $AmplifyRoleName --query "Role.Arn" --output text 2>$null
} catch { $AmplifyRoleArn = $null }

if (-not $AmplifyRoleArn) {
    Write-Log "Creating Amplify Service Role..." "Yellow"
    $TrustPolicy = @{
        Version = "2012-10-17"
        Statement = @(
            @{
                Effect = "Allow"
                Principal = @{ Service = "amplify.amazonaws.com" }
                Action = "sts:AssumeRole"
            }
        )
    } | ConvertTo-Json -Depth 4
    
    try {
        $AmplifyRoleArn = aws iam create-role --role-name $AmplifyRoleName --assume-role-policy-document $TrustPolicy --query "Role.Arn" --output text
        aws iam attach-role-policy --role-name $AmplifyRoleName --policy-arn "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
        Write-Log "Amplify Role Created: $AmplifyRoleArn" "Green"
    } catch {
        Write-Log "Failed to create Amplify Role: $_" "Red"
    }
} else {
    Write-Log "Amplify Role exists: $AmplifyRoleArn" "Green"
}

# --- 1. VPC Setup ---
Write-Log "`n--- 1. Network Infrastructure (VPC) ---" "Cyan"
$VpcId = aws ec2 describe-vpcs --filters "Name=tag:Project,Values=$ProjectName" --query "Vpcs[0].VpcId" --output text

if ($VpcId -eq "None") {
    Write-Log "Creating VPC..." "Yellow"
    $VpcId = aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$ProjectName-vpc},{Key=Project,Value=$ProjectName}]" --query "Vpc.VpcId" --output text
    aws ec2 modify-vpc-attribute --vpc-id $VpcId --enable-dns-hostnames "{\`"Value\`":true}"
    Write-Log "VPC Created: $VpcId" "Green"
} else {
    Write-Log "VPC exists: $VpcId" "Green"
}

# Internet Gateway
$IgwId = aws ec2 describe-internet-gateways --filters "Name=tag:Project,Values=$ProjectName" --query "InternetGateways[0].InternetGatewayId" --output text
if ($IgwId -eq "None") {
    Write-Log "Creating Internet Gateway..." "Yellow"
    $IgwId = aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$ProjectName-igw},{Key=Project,Value=$ProjectName}]" --query "InternetGateway.InternetGatewayId" --output text
    aws ec2 attach-internet-gateway --internet-gateway-id $IgwId --vpc-id $VpcId
    Write-Log "IGW Created: $IgwId" "Green"
} else {
    Write-Log "IGW exists: $IgwId" "Green"
}

# Subnet (Public) - us-east-1a
$SubnetId = aws ec2 describe-subnets --filters "Name=tag:Project,Values=$ProjectName" "Name=tag:Type,Values=Public" --query "Subnets[0].SubnetId" --output text
if ($SubnetId -eq "None") {
    Write-Log "Creating Public Subnet (10.0.1.0/24)..." "Yellow"
    $SubnetId = aws ec2 create-subnet --vpc-id $VpcId --cidr-block 10.0.1.0/24 --availability-zone "${Region}a" --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$ProjectName-public-subnet},{Key=Project,Value=$ProjectName},{Key=Type,Value=Public}]" --query "Subnet.SubnetId" --output text
    aws ec2 modify-subnet-attribute --subnet-id $SubnetId --map-public-ip-on-launch
    Write-Log "Subnet Created: $SubnetId" "Green"
} else {
    Write-Log "Subnet exists: $SubnetId" "Green"
}

# Subnet (Private/RDS 1) - us-east-1b
$SubnetId2 = aws ec2 describe-subnets --filters "Name=tag:Project,Values=$ProjectName" "Name=tag:Type,Values=Private1" --query "Subnets[0].SubnetId" --output text
if ($SubnetId2 -eq "None") {
    Write-Log "Creating Private Subnet 1 (10.0.2.0/24)..." "Yellow"
    $SubnetId2 = aws ec2 create-subnet --vpc-id $VpcId --cidr-block 10.0.2.0/24 --availability-zone "${Region}b" --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$ProjectName-private-subnet-1},{Key=Project,Value=$ProjectName},{Key=Type,Value=Private1}]" --query "Subnet.SubnetId" --output text
    Write-Log "Private Subnet 1 Created: $SubnetId2" "Green"
} else {
    Write-Log "Private Subnet 1 exists: $SubnetId2" "Green"
}

# Subnet (Private/RDS 2) - us-east-1c (For High Availability/Prod)
$SubnetId3 = aws ec2 describe-subnets --filters "Name=tag:Project,Values=$ProjectName" "Name=tag:Type,Values=Private2" --query "Subnets[0].SubnetId" --output text
if ($SubnetId3 -eq "None") {
    Write-Log "Creating Private Subnet 2 (10.0.3.0/24)..." "Yellow"
    $SubnetId3 = aws ec2 create-subnet --vpc-id $VpcId --cidr-block 10.0.3.0/24 --availability-zone "${Region}c" --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$ProjectName-private-subnet-2},{Key=Project,Value=$ProjectName},{Key=Type,Value=Private2}]" --query "Subnet.SubnetId" --output text
    Write-Log "Private Subnet 2 Created: $SubnetId3" "Green"
} else {
    Write-Log "Private Subnet 2 exists: $SubnetId3" "Green"
}

# Route Table
$RouteTableId = aws ec2 describe-route-tables --filters "Name=tag:Project,Values=$ProjectName" --query "RouteTables[0].RouteTableId" --output text
if ($RouteTableId -eq "None") {
    Write-Log "Creating Route Table..." "Yellow"
    $RouteTableId = aws ec2 create-route-table --vpc-id $VpcId --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$ProjectName-rt},{Key=Project,Value=$ProjectName}]" --query "RouteTable.RouteTableId" --output text
    aws ec2 create-route --route-table-id $RouteTableId --destination-cidr-block 0.0.0.0/0 --gateway-id $IgwId | Out-Null
    aws ec2 associate-route-table --route-table-id $RouteTableId --subnet-id $SubnetId | Out-Null
    Write-Log "Route Table Created: $RouteTableId" "Green"
} else {
    # Ensure route exists and association is correct
    aws ec2 create-route --route-table-id $RouteTableId --destination-cidr-block 0.0.0.0/0 --gateway-id $IgwId 2>$null | Out-Null
    Write-Log "Route Table exists: $RouteTableId" "Green"
}

# Security Group
$SgId = aws ec2 describe-security-groups --filters "Name=group-name,Values=$ProjectName-sg" --query "SecurityGroups[0].GroupId" --output text
if ($SgId -eq "None") {
    Write-Log "Creating Security Group..." "Yellow"
    $SgId = aws ec2 create-security-group --group-name "$ProjectName-sg" --description "Security group for $ProjectName" --vpc-id $VpcId --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$ProjectName-sg},{Key=Project,Value=$ProjectName}]" --query "GroupId" --output text
    # Ingress rules
    aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 22 --cidr 0.0.0.0/0 | Out-Null # SSH
    aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 80 --cidr 0.0.0.0/0 | Out-Null # HTTP
    aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 443 --cidr 0.0.0.0/0 | Out-Null # HTTPS
    aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 5432 --cidr 0.0.0.0/0 | Out-Null # Postgres
    Write-Log "Security Group Created: $SgId" "Green"
} else {
    Write-Log "Security Group exists: $SgId" "Green"
}

# --- 2. Repositories (CodeCommit) ---
Write-Log "`n--- 2. Version Control (CodeCommit) ---" "Cyan"
$RepoName = $ProjectName
try {
    $RepoArn = aws codecommit get-repository --repository-name $RepoName --query "repositoryMetadata.Arn" --output text 2>$null
} catch { $RepoArn = $null }

if (-not $RepoArn) {
    Write-Log "Creating CodeCommit Repository..." "Yellow"
    $RepoArn = aws codecommit create-repository --repository-name $RepoName --repository-description "Repository for $ProjectName" --tags "Project=$ProjectName" --query "repositoryMetadata.Arn" --output text
    Write-Log "Repository Created: $RepoName" "Green"
} else {
    Write-Log "Repository exists: $RepoName" "Green"
}

# --- 3. Databases (RDS) ---
Write-Log "`n--- 3. Databases (RDS) ---" "Cyan"

# DB Subnet Group
$DbSubnetGroup = "$ProjectName-db-subnet-group".Replace(".", "-")
try {
    aws rds create-db-subnet-group --db-subnet-group-name $DbSubnetGroup --db-subnet-group-description "Group for $ProjectName" --subnet-ids $SubnetId $SubnetId2 $SubnetId3 2>$null | Out-Null
} catch {
    # Ignore if exists
}

# Function to create/check DB
function Ensure-RDS {
    param ($Identifier, $Class, $AllocatedStorage, $EnvName)
    
    $Identifier = $Identifier.Replace(".", "-")
    try {
        $DbStatus = aws rds describe-db-instances --db-instance-identifier $Identifier --query "DBInstances[0].DBInstanceStatus" --output text 2>$null
    } catch { $DbStatus = $null }

    if (-not $DbStatus) {
        Write-Log "Creating $EnvName RDS Instance ($Identifier)..." "Yellow"
        aws rds create-db-instance `
            --db-instance-identifier $Identifier `
            --db-instance-class $Class `
            --engine postgres `
            --master-username postgres `
            --master-user-password "ChangeMe123!" `
            --allocated-storage $AllocatedStorage `
            --vpc-security-group-ids $SgId `
            --db-subnet-group-name $DbSubnetGroup `
            --publicly-accessible `
            --tags "Key=Project,Value=$ProjectName,Key=Environment,Value=$EnvName" `
            --query "DBInstance.DBInstanceIdentifier" --output text | Out-Null
        Write-Log "$EnvName RDS ($Class) Creation Initiated." "Green"
    } else {
        Write-Log "$EnvName RDS exists: $Identifier ($DbStatus)" "Green"
    }
}

# Dev Database
Ensure-RDS -Identifier "$ProjectName-db-dev" -Class "db.t4g.micro" -AllocatedStorage 20 -EnvName "Development"
# Prod Database
Ensure-RDS -Identifier "$ProjectName-db-prod" -Class "db.t4g.small" -AllocatedStorage 20 -EnvName "Production"


# --- 4. Storage (S3) ---
Write-Log "`n--- 4. Storage (S3) ---" "Cyan"
$Buckets = @("$ProjectName-assets", "$ProjectName-backups", "$ProjectName-uploads", "$ProjectName-client-downloads")
foreach ($Bucket in $Buckets) {
    $Bucket = $Bucket.Replace(".", "-")
    try {
        aws s3api head-bucket --bucket $Bucket 2>$null
        Write-Log "Bucket exists: $Bucket" "Green"
    } catch {
        Write-Log "Creating Bucket: $Bucket" "Yellow"
        aws s3api create-bucket --bucket $Bucket --region $Region 2>$null | Out-Null
        Write-Log "Bucket Created: $Bucket" "Green"
    }
}

# --- 5. Auth (Cognito) ---
Write-Log "`n--- 5. Authentication (Cognito) ---" "Cyan"
$UserPoolName = "$ProjectName-users"
$UserPoolId = aws cognito-idp list-user-pools --max-results 10 --query "UserPools[?Name=='$UserPoolName'].Id | [0]" --output text

if ($UserPoolId -eq "None") {
    Write-Log "Creating User Pool..." "Yellow"
    $UserPoolId = aws cognito-idp create-user-pool --pool-name $UserPoolName --auto-verified-attributes email --query "UserPool.Id" --output text
    Write-Log "User Pool Created: $UserPoolId" "Green"
} else {
    Write-Log "User Pool exists: $UserPoolId" "Green"
}

$ClientId = aws cognito-idp list-user-pool-clients --user-pool-id $UserPoolId --query "UserPoolClients[0].ClientId" --output text
if ($ClientId -eq "None") {
    Write-Log "Creating App Client..." "Yellow"
    $ClientId = aws cognito-idp create-user-pool-client --user-pool-id $UserPoolId --client-name "$ProjectName-app" --generate-secret --query "UserPoolClient.ClientId" --output text
    Write-Log "App Client Created: $ClientId" "Green"
} else {
    Write-Log "App Client exists: $ClientId" "Green"
}

# --- 6. Backend API (AppSync) ---
Write-Log "`n--- 6. Real-time API (AppSync) ---" "Cyan"
$ApiName = "$ProjectName-api"
$ApiId = aws appsync list-graphql-apis --query "graphqlApis[?name=='$ApiName'].apiId | [0]" --output text

if ($ApiId -eq "None") {
    Write-Log "Creating AppSync API (Shell)..." "Yellow"
    $ApiId = aws appsync create-graphql-api --name $ApiName --authentication-type "AMAZON_COGNITO_USER_POOLS" --user-pool-config "userPoolId=$UserPoolId,awsRegion=$Region,defaultAction=ALLOW" --query "graphqlApi.apiId" --output text
    Write-Log "AppSync API Created: $ApiId" "Green"
} else {
    Write-Log "AppSync API exists: $ApiId" "Green"
}

# --- 7. Deployment (Amplify) ---
Write-Log "`n--- 7. Hosting (Amplify) ---" "Cyan"
$AmplifyAppName = $ProjectName
try {
    $AmplifyAppId = aws amplify list-apps --query "apps[?name=='$AmplifyAppName'].appId | [0]" --output text 2>$null
} catch { $AmplifyAppId = "None" }

if ($AmplifyAppId -eq "None") {
    Write-Log "Creating Amplify App..." "Yellow"
    # Requires Repository to be connected manually or via token usually, but we can create the container
    # Using 'destinlmincy.com' as the name
    if ($RepoArn) {
        # Note: Connecting CodeCommit to Amplify via CLI often requires oauth token or complex setup. 
        # We create the App container and link it to the repo.
        $AmplifyAppId = aws amplify create-app --name $AmplifyAppName --repository $RepoArn --platform WEB --iam-service-role-arn $AmplifyRoleArn --query "app.appId" --output text
        Write-Log "Amplify App Created: $AmplifyAppId" "Green"
    } else {
        Write-Log "Skipping Amplify Creation: CodeCommit Repo not found." "Red"
    }
} else {
    Write-Log "Amplify App exists: $AmplifyAppId" "Green"
}

# --- 8. Email (SES) ---
Write-Log "`n--- 8. Email (SES) ---" "Cyan"
$EmailIdentity = "noreply@$DomainName"
$IdentityStatus = aws ses get-identity-verification-attributes --identities $EmailIdentity --query "VerificationAttributes.\`$EmailIdentity\`.VerificationStatus" --output text 2>$null

if ($IdentityStatus -ne "Success") {
    Write-Log "Verifying SES Identity ($EmailIdentity)..." "Yellow"
    aws ses verify-email-identity --email-address $EmailIdentity 2>$null | Out-Null
    Write-Log "Verification email sent to $EmailIdentity (Check inbox if valid)" "Green"
} else {
    Write-Log "SES Identity Verified: $EmailIdentity" "Green"
}

# --- 9. DNS (Route 53) & Coming Soon ---
Write-Log "`n--- 9. DNS (Route 53) ---" "Cyan"
$HostedZoneId = aws route53 list-hosted-zones --query "HostedZones[?Name=='$DomainName.'].Id | [0]" --output text

if ($HostedZoneId -ne "None") {
    Write-Log "Hosted Zone found: $HostedZoneId" "Green"
    
    if ($SetupComingSoon) {
        Write-Log "Setting up 'Coming Soon' page on S3..." "Yellow"
        $ComingSoonBucket = "$DomainName-coming-soon"
        aws s3api create-bucket --bucket $ComingSoonBucket --region $Region 2>$null | Out-Null
        aws s3 website "s3://$ComingSoonBucket/" --index-document index.html
        
        $HtmlContent = @"
<!DOCTYPE html>
<html>
<head><title>Coming Soon - $DomainName</title></head>
<body style='display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f2f5;font-family:sans-serif;'>
    <div style='text-align:center;'>
        <h1 style='color:#2776EA;'>$DomainName</h1>
        <p>Something great is being built here.</p>
        <p>Contact: dlmincy@$DomainName</p>
    </div>
</body>
</html>
"@
        $HtmlContent | Set-Content "index.html"
        aws s3 cp "index.html" "s3://$ComingSoonBucket/index.html" --acl public-read
        Remove-Item "index.html"

        # Point Route53 to S3 (Region dependent hosted zone IDs for S3)
        # For us-east-1 S3 website endpoint: Z3AQBSTDXQSR5 (Fixed S3 Zone ID)
        $JsonContent = @"
{
    "Comment": "Coming Soon S3 Record",
    "Changes": [
        {
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "$DomainName",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "Z3AQBSTDXQSR5",
                    "DNSName": "s3-website-us-east-1.amazonaws.com",
                    "EvaluateTargetHealth": false
                }
            }
        }
    ]
}
"@
        $JsonFile = "$env:TEMP\route53-change-coming-soon.json"
        $JsonContent | Out-File -FilePath $JsonFile -Encoding ASCII
        aws route53 change-resource-record-sets --hosted-zone-id $HostedZoneId --change-batch file://$JsonFile 2>$null | Out-Null
        Remove-Item $JsonFile
        Write-Log "Route 53 updated to point to Coming Soon page." "Green"
    }
} else {
    Write-Log "Hosted Zone for $DomainName not found. Skipping DNS update." "Red"
}


# --- 10. Dev Workstation (Optional/Legacy) ---
# Preserving EC2 logic for Dev Environment/Jumphost if needed
Write-Log "`n--- 10. Dev Workstation (EC2) ---" "Cyan"
$InstanceId = aws ec2 describe-instances --filters "Name=tag:Name,Values=$ProjectName-dev" "Name=instance-state-name,Values=running,stopped" --query "Reservations[0].Instances[0].InstanceId" --output text
if ($InstanceId -eq "None") {
    # Only create if explicitly needed or maintain legacy behavior
    Write-Log "Dev Workstation not found. Skipping creation to save cost (Use Amplify for App)." "Gray"
    # Uncomment below to restore EC2 creation
    # ... (EC2 creation logic)
} else {
    Write-Log "Dev Workstation exists: $InstanceId" "Green"
    $PublicIp = aws ec2 describe-instances --instance-ids $InstanceId --query "Reservations[0].Instances[0].PublicIpAddress" --output text
    Write-Log "Workstation IP: $PublicIp" "White"
}

Write-Log "`n--- Setup Complete ---" "Green"
Write-Log "Infrastructure Summary:" "White"
Write-Log "1. Network: VPC $VpcId" "Gray"
Write-Log "2. Storage: S3 Buckets created" "Gray"
Write-Log "3. Database: Dev & Prod RDS instances initializing" "Gray"
Write-Log "4. Auth: User Pool $UserPoolId" "Gray"
Write-Log "5. API: AppSync $ApiId" "Gray"
Write-Log "6. Hosting: Amplify App $AmplifyAppId" "Gray"

Write-Log "`n*** MANUAL STEPS REQUIRED ***" "Magenta"
Write-Log "1. [DNS] Update Namecheap Name Servers to match Route 53 Hosted Zone." "White"
Write-Log "2. [Amplify] Connect 'main' branch to Amplify Console for auto-deployment." "White"
Write-Log "3. [SES] Check email inbox for $EmailIdentity and verify." "White"
Write-Log "4. [SES] Request Production Access in AWS Console (Support Ticket) to send to non-verified emails." "White"
Write-Log "5. [DocuSign] Create Integration Key in DocuSign Admin." "White"
Write-Log "6. [Google] Create GA4 Property and OAuth Credentials." "White"
Write-Log "7. [Polar] Setup Polar.sh account." "White"
if ($SetupComingSoon) {
    Write-Log "8. [Coming Soon] Page deployed to S3. Visit http://$DomainName (after DNS propagates)." "Yellow"
}
