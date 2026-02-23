#!/bin/sh
set -e

# Configuration
VAULT_ADDR="http://vault:8200"
# Default root token from initialization - will be updated by init-unseal.sh if needed
VAULT_TOKEN="${VAULT_TOKEN:-hvs.sNYzCusgyVPP9d8fFJ4o1ZpN}"

echo "Starting Vault setup with token: ${VAULT_TOKEN:0:20}..."

# Wait for Vault to be ready and unsealed
echo "Waiting for Vault to be unsealed..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  seal_status=$(curl -s "$VAULT_ADDR/v1/sys/seal-status" 2>/dev/null || echo "")
  is_sealed=$(echo "$seal_status" | grep -o '"sealed":true')
  
  if [ -z "$is_sealed" ] && [ -n "$seal_status" ]; then
    echo "✅ Vault is unsealed and ready"
    break
  fi
  attempt=$((attempt + 1))
  echo "Attempt $attempt: Waiting for Vault to be unsealed..."
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Vault did not become ready, but continuing..."
fi

sleep 2

# Enable KV2 secret engine if not already enabled
echo "Setting up KV2 secret engine..."
enable_response=$(curl -s -X POST \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"kv","version":2}' \
  "$VAULT_ADDR/v1/sys/mounts/secret" 2>/dev/null)

echo "Enable response: $enable_response"

# Check if it's already enabled (path already in use)
if echo "$enable_response" | grep -q "already in use"; then
  echo "Secret engine already enabled"
elif [ -z "$enable_response" ]; then
  echo "Secret engine enabled"
else
  echo "Enable response: $enable_response"
fi

sleep 2

# Create database credentials secret
echo "Creating database credentials secret..."
response=$(curl -s -X POST \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "user": "transcendence_user",
      "password": "transcendence_pass",
      "database": "transcendence_db"
    }
  }' \
  "$VAULT_ADDR/v1/secret/data/db")

echo "Setup response: $response"

# Test if secret was created
echo "Testing secret retrieval..."
test_response=$(curl -s -X GET \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  "$VAULT_ADDR/v1/secret/data/db")

echo "Test response: $test_response"

# Check if the secret was retrieved successfully
if echo "$test_response" | grep -q '"data"'; then
  echo "✅ Vault setup completed successfully"
else
  echo "⚠️  Vault setup may have failed"
fi
