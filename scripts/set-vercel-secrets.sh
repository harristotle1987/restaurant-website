#!/usr/bin/env bash
set -euo pipefail

# Interactive script to set Vercel-related GitHub repository secrets.
# Usage: run this locally. It will prompt for values and optionally echo them for verification,
# then set them on the repository harristotle1987/restaurant-website using gh CLI.

REPO="harristotle1987/restaurant-website"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install from https://cli.github.com/ and authenticate (gh auth login)."
  exit 1
fi

echo "This will set repository secrets for: $REPO"
read -rp "Continue? [y/N]: " confirm
if [[ "${confirm,,}" != "y" ]]; then
  echo "Aborted by user."
  exit 0
fi

# Prompt (hidden) for the token. Others are visible by default.
read -rsp "Enter VERCEL_TOKEN (input hidden): " VERCEL_TOKEN
echo
read -rp "Enter VERCEL_ORG_ID: " VERCEL_ORG_ID
read -rp "Enter VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
read -rp "Enter RUN_MIGRATIONS (true/false) [false]: " RUN_MIGRATIONS
RUN_MIGRATIONS=${RUN_MIGRATIONS:-false}

read -rp "Do you want to display the values you entered for verification on this terminal? [y/N]: " show
if [[ "${show,,}" == "y" ]]; then
  echo "\n--- Entered values (visible) ---"
  echo "VERCEL_TOKEN: $VERCEL_TOKEN"
  echo "VERCEL_ORG_ID: $VERCEL_ORG_ID"
  echo "VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
  echo "RUN_MIGRATIONS: $RUN_MIGRATIONS"
  echo "--------------------------------\n"
else
  echo "(Values will not be printed)"
fi

read -rp "Set these as GitHub repo secrets now? [y/N]: " setnow
if [[ "${setnow,,}" != "y" ]]; then
  echo "Secrets not set. You can re-run the script when ready."
  exit 0
fi

# Set secrets using gh. We avoid printing secret values in the script output except by user choice above.
echo "Setting secrets on GitHub repository $REPO..."

gh secret set VERCEL_TOKEN --repo "$REPO" --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --repo "$REPO" --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --repo "$REPO" --body "$VERCEL_PROJECT_ID"
gh secret set RUN_MIGRATIONS --repo "$REPO" --body "$RUN_MIGRATIONS"

echo "Secrets set. Verifying secret names (values are hidden):"

gh secret list --repo "$REPO"

echo "Done. If the names appear above, the workflow will be able to access them."

echo "Next: run the manual deploy workflow (via GitHub Actions UI or using gh) after confirming the values are correct."

echo "To dispatch the manual deploy now using gh (optional), run:"
cat <<'EOF'
# dispatch the manual workflow (interactive confirmation will still be required by GitHub)
# replace vercel-deploy-now.yml with the workflow filename if different
gh workflow run vercel-deploy-now.yml --repo "harristotle1987/restaurant-website"
EOF

exit 0
