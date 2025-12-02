#!/usr/bin/env python3
"""Final cleanup - remove all remaining claim code"""

import re

# Clean Dungeon Crawler - just remove comments
with open('C:/Users/tcmid/gamehole-games/public/gumbuo-dungeon-crawler.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the two remaining comment lines
content = re.sub(r'\s*// Update claimable AP on game over screen\s*', '', content)
content = re.sub(r'\s*// Show/hide claim button based on if there\'s AP to claim\s*', '', content)

with open('C:/Users/tcmid/gamehole-games/public/gumbuo-dungeon-crawler.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("[OK] Cleaned Dungeon Crawler")

# Clean Invasion - remove the orphaned function body (lines 565-627)
with open('C:/Users/tcmid/gamehole-games/public/gumbuo-invasion.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove lines 564-627 (the claim function body)
# Line 565 is "        // Claim alien points"
# Line 627 is "        }"
start_line = None
end_line = None

for i, line in enumerate(lines):
    if '// Claim alien points' in line and 'Claiming' not in line:
        start_line = i
    if start_line is not None and line.strip() == '}' and 'claimBtn.textContent' in lines[i-2]:
        end_line = i + 1  # Include the closing brace
        break

if start_line is not None and end_line is not None:
    # Remove the lines
    new_lines = lines[:start_line] + lines[end_line:]

    with open('C:/Users/tcmid/gamehole-games/public/gumbuo-invasion.html', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f"[OK] Cleaned Invasion (removed lines {start_line+1}-{end_line})")
else:
    print("[WARN] Could not find claim function body in Invasion")

print("\nDone! All claim code removed.")
