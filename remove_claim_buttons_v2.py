#!/usr/bin/env python3
"""Remove ALL alien points claim functionality from gamehole.games HTML files"""

import re

def clean_dungeon_crawler(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Cleaning {filepath}...")

    # Remove claimableAP div from game over screen (line 204-207)
    content = re.sub(
        r'<p style="color: #00ffff; font-size: 1\.4em; margin: 20px;">Claimable AP:.*?</p>\s*',
        '',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r'⚠️ Claim your AP to record your stats on the leaderboard!\s*',
        '',
        content
    )

    # Remove updateClaimableAP() function call
    content = re.sub(r'\s*updateClaimableAP\(\);\s*', '', content)

    # Remove entire updateClaimableAP function (lines 763-856)
    content = re.sub(
        r'function updateClaimableAP\(\).*?(?=\n\s*function|\n\s*</script>)',
        '',
        content,
        flags=re.DOTALL
    )

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] Cleaned {filepath}")


def clean_invasion(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Cleaning {filepath}...")

    # Remove CSS for claimableAP (lines 52-60, 74-91)
    content = re.sub(
        r'#claimableAP\s*\{[^}]+\}',
        '',
        content
    )
    content = re.sub(
        r'#claimBtn\s*\{[^}]+\}',
        '',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r'#claimBtn:hover\s*\{[^}]+\}',
        '',
        content
    )
    content = re.sub(
        r'#claimBtn:disabled\s*\{[^}]+\}',
        '',
        content
    )

    # Remove #startBtn, #restartBtn, #claimBtn selector and replace with just the first two
    content = re.sub(
        r'#startBtn,\s*#restartBtn,\s*#claimBtn\s*\{',
        '#startBtn, #restartBtn {',
        content
    )

    # Remove claimableAP div from HUD (line 114)
    content = re.sub(
        r'<div id="claimableAP">.*?</div>\s*',
        '',
        content
    )

    # Remove claim AP display from game over (lines 120-122)
    content = re.sub(
        r'<p>Claimable AP:.*?</p>\s*',
        '',
        content
    )
    content = re.sub(
        r'⚠️ Remember to CLAIM your AP below to record your stats on the leaderboard!\s*',
        '',
        content
    )

    # Remove claim button element (line 127)
    content = re.sub(
        r'<button id="claimBtn"[^>]*>.*?</button>\s*',
        '',
        content
    )

    # Remove JavaScript const declarations for claim elements
    content = re.sub(
        r'const claimBtn = document\.getElementById\(\'claimBtn\'\);\s*',
        '',
        content
    )
    content = re.sub(
        r'const claimableAPDisplay = document\.getElementById\(\'claimableAP\'\);\s*',
        '',
        content
    )
    content = re.sub(
        r'const finalClaimableSpan = document\.getElementById\(\'finalClaimable\'\);\s*',
        '',
        content
    )

    # Remove claimableAP display updates (line 544)
    content = re.sub(
        r'claimableAPDisplay\.textContent = [^;]+;\s*',
        '',
        content
    )

    # Remove claim button show/hide logic (lines 546-548)
    content = re.sub(
        r'// Show claim button if there\'s claimable AP\s*if \(score > 0\) \{\s*claimBtn\.classList\.remove\(\'hidden\'\);\s*\}',
        '',
        content
    )
    content = re.sub(
        r'if \(score > 0\) \{\s*claimBtn\.classList\.remove\(\'hidden\'\);\s*\}',
        '',
        content
    )

    # Remove claim button hide on restart (line 605)
    content = re.sub(
        r'claimBtn\.classList\.add\(\'hidden\'\);\s*',
        '',
        content
    )

    # Remove finalClaimableSpan update (line 616)
    content = re.sub(
        r'finalClaimableSpan\.textContent = score;\s*',
        '',
        content
    )

    # Remove entire claimAlienPoints function (lines 621-686)
    content = re.sub(
        r'// Claim alien points\s*async function claimAlienPoints\(\).*?(?=\n\s*// |claimBtn\.addEventListener)',
        '',
        content,
        flags=re.DOTALL
    )

    # Remove event listener for claim button (line 744)
    content = re.sub(
        r'claimBtn\.addEventListener\(\'click\', claimAlienPoints\);\s*',
        '',
        content
    )

    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] Cleaned {filepath}")


# Clean both files
clean_dungeon_crawler('C:/Users/tcmid/gamehole-games/public/gumbuo-dungeon-crawler.html')
clean_invasion('C:/Users/tcmid/gamehole-games/public/gumbuo-invasion.html')

print("\nDone! All claim functionality removed from both games.")
