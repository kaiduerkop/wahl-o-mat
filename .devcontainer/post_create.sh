#!/bin/bash

echo "Running post-create script..."


# Configure SSH commit signing if an ed25519 key is available.
# The key is bind-mounted from the host (~/.ssh) so it is always present after
# the container starts.  Using SSH signing avoids the need for a separate GPG
# setup and produces the green "Verified" badge on GitHub once the same public
# key is registered there as a Signing Key.
configure_git_signing() {
    local pubkey=""
    # Prefer ed25519, fall back to RSA
    if [ -f "$HOME/.ssh/id_ed25519.pub" ]; then
        pubkey="$HOME/.ssh/id_ed25519.pub"
    elif [ -f "$HOME/.ssh/id_rsa.pub" ]; then
        pubkey="$HOME/.ssh/id_rsa.pub"
    else
        echo "No SSH signing key found (tried id_ed25519.pub, id_rsa.pub), skipping git signing setup."
        return
    fi

    git config --global gpg.format ssh
    git config --global user.signingkey "$pubkey"
    git config --global commit.gpgsign true
    git config --global tag.gpgsign true
    echo "Git SSH commit signing configured (key: $pubkey)."
    echo "Remember to add this public key as a 'Signing Key' in GitHub → Settings → SSH and GPG keys."
}

# Install Angular CLI globally and project dependencies if package.json exists
# Using --legacy-peer-deps to avoid potential peer dependency issues in Angular projects.
install_npm() {
    npm install -g @angular/cli 
    [ -f package.json ] && npm install --legacy-peer-deps || true
}


configure_git_signing
install_npm


echo "Post-create script completed."