#!/usr/bin/env python3
"""Remove alien points claim buttons from gamehole.games HTML files"""

import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the claimableAP display div (in-game)
    content = re.sub(
        r'<!--\s*Claimable Alien Points Display\s*-->.*?</div>\s*</div>',
        '',
        content,
        flags=re.DOTALL
    )

    # Remove gameOverClaimBtn button
    content = re.sub(
        r'<button\s+id="gameOverClaimBtn"[^>]*>.*?</button>',
        '',
        content,
        flags=re.DOTALL
    )

    # Remove the claimAlienPoints function
    content = re.sub(
        r'function\s+claimAlienPoints\s*\([^)]*\)\s*\{[^}]*?\}(?:\s*catch[^}]*\})?(?:\s*finally[^}]*\})?',
        '',
        content,
        flags=re.DOTALL
    )

    # Remove claimableAP calculations and displays
    content = re.sub(
        r"const\s+claimableAP\s*=\s*kills\s*\*\s*10;[^\n]*\n",
        '',
        content
    )
    content = re.sub(
        r"document\.getElementById\('claimableAPAmount'\)\.textContent\s*=\s*claimableAP;[^\n]*\n",
        '',
        content
    )
    content = re.sub(
        r"document\.getElementById\('gameOverClaimableAP'\)\.textContent\s*=\s*claimableAP;[^\n]*\n",
        '',
        content
    )
    content = re.sub(
        r"document\.getElementById\('killCount'\)\.textContent\s*=\s*kills;[^\n]*\n",
        '',
        content
    )

    # Remove claim display show/hide logic
    content = re.sub(
        r"const\s+claimDisplay\s*=\s*document\.getElementById\('claimableAP'\);[^\n]*\n",
        '',
        content
    )
    content = re.sub(
        r"const\s+gameOverClaimBtn\s*=\s*document\.getElementById\('gameOverClaimBtn'\);[^\n]*\n",
        '',
        content
    )
    content = re.sub(
        r"if\s*\(claimDisplay\)\s*\{[^}]*\}",
        '',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"if\s*\(claimableAP\s*>\s*0\)\s*\{[^}]*gameOverClaimBtn[^}]*\}(?:\s*else\s*\{[^}]*\})?",
        '',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"if\s*\(gameOverClaimBtn\)\s*\{[^}]*\}",
        '',
        content,
        flags=re.DOTALL
    )

    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] Cleaned {filepath}")

# Clean both files
clean_file('C:/Users/tcmid/gamehole-games/public/gumbuo-dungeon-crawler.html')
clean_file('C:/Users/tcmid/gamehole-games/public/gumbuo-invasion.html')

print("Done! Claim buttons removed from both games.")
