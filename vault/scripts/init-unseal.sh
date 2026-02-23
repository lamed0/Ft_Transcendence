#!/bin/sh
set -e

VAULT_ADDR="http://vault:8200"

# Wait for Vault to start
echo "Waiting for Vault to start..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
  response=$(curl -s -w "\n%{http_code}" "$VAULT_ADDR/v1/sys/seal-status" 2>/dev/null || echo "")
  http_code=$(echo "$response" | tail -1)
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "503" ]; then
    echo "✅ Vault is responding"
    break
  fi
  attempt=$((attempt + 1))
  echo "Attempt $attempt: Waiting for Vault... (HTTP $http_code)"
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Vault failed to start"
  exit 1
fi

# Get seal status
echo "Checking Vault status..."
seal_response=$(curl -s "$VAULT_ADDR/v1/sys/seal-status" 2>/dev/null)
echo "Seal status: $seal_response"

# Check if initialized
is_initialized=$(echo "$seal_response" | grep -o '"initialized":true')
if [ -z "$is_initialized" ]; then
  echo "Vault is not initialized. Initializing..."
  
  # Initialize Vault
  init_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "secret_shares": 5,
      "secret_threshold": 3
    }' \
    "$VAULT_ADDR/v1/sys/init")
  
  echo "Init response: $init_response"
  
  # Extract keys using awk (more portable than jq)
  unseal_key_1=$(echo "$init_response" | grep -o '"keys":\[\("[^"]*"' | head -1 | cut -d'"' -f4)
  unseal_key_2=$(echo "$init_response" | grep -o '"keys":' -A 1000 | grep -o '"[^"]*"' | sed -n '2p' | cut -d'"' -f2)
  unseal_key_3=$(echo "$init_response" | grep -o '"keys":' -A 1000 | grep -o '"[^"]*"' | sed -n '3p' | cut -d'"' -f2)
  
  echo "Extracted unseal key 1: ${unseal_key_1:0:20}..."
  echo "Extracted unseal key 2: ${unseal_key_2:0:20}..."
  echo "Extracted unseal key 3: ${unseal_key_3:0:20}..."
else
  echo "✅ Vault is already initialized"
  # Use the keys from .vault_pass
  unseal_key_1="ex2wcIi39X2ViV3/9RJV7IJmrw85ms5uXlqST9iPJ2q3"
  unseal_key_2="Xd8wdDmiAMwlowOGXxLYJXOSFP3Jgixe+RN06M47HPfQ"
  unseal_key_3="i9c6HZGPKcLUspO/KJyYkEQZR4COGcuZUqHonPLKmzap"
fi

# Check if sealed
is_sealed=$(echo "$seal_response" | grep -o '"sealed":true')
if [ -n "$is_sealed" ]; then
  echo "Vault is sealed, applying unseal keys..."
  
  for i in 1 2 3; do
    eval "key=\$unseal_key_$i"
    echo "Applying unseal key $i..."
    response=$(curl -s -X PUT \
      -H "Content-Type: application/json" \
      -d "{\"key\":\"$key\"}" \
      "$VAULT_ADDR/v1/sys/unseal")
    echo "Response: $response"
    sleep 1
  done
  
  # Wait for vault to actually unseal
  echo "Waiting for Vault to unseal..."
  for i in 1 2 3 4 5 6 7 8 9 10; do
    sleep 2
    seal_status=$(curl -s "$VAULT_ADDR/v1/sys/seal-status")
    is_sealed=$(echo "$seal_status" | grep -o '"sealed":true')
    
    if [ -z "$is_sealed" ]; then
      echo "✅ Vault is now unsealed"
      break
    fi
    echo "Attempt $i: Still waiting for unsealing..."
  done
else
  echo "✅ Vault is already unsealed"
fi

# Give it a moment
sleep 2

# Run setup script
echo "Running vault setup..."
sh /scripts/setup-vault.sh
