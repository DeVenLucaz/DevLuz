import re

path = '/data/data/com.termux/files/home/DevLuz/LLAMdrop-landing/src/pages/home.tsx'

with open(path, 'r') as f:
    content = f.read()

# 1. Version and Author URLs
content = content.replace('0.9.1', '0.10.0')
content = content.replace('ypatole035-ai', 'DeVenLucaz')

# 2. Tiers
content = content.replace('7 device tiers', '5 device tiers')
content = content.replace('7 Device Tiers', '5 Device Tiers')
content = re.sub(r'\s*\{ name: "Desktop"[^\}]+\},', '', content)

# 3. macOS and Windows dropping
content = re.sub(r"\s*else if \(/Win/i\.test\(ua\)\) \{ os = 'Windows'; platform = 'x86_64'; \}", "", content)
content = re.sub(r"\s*else if \(/Mac/i\.test\(ua\)\) \{ os = 'macOS'; platform = 'Apple Silicon / x86_64'; \}", "", content)

# remove macOS specific detection logic from detectBackend
# It's lines 153 to 159 approx
content = re.sub(r"\s*if \(os === 'macOS'\) \{[\s\S]*?\}", "", content)

# 4. Remove TerminalBlock for Windows and modify macOS ones
content = re.sub(r'\s*<TerminalBlock label="Windows \(PowerShell as Admin\)".*?/>', '', content)
content = content.replace('Linux / Android (Termux) / macOS', 'Linux / Android (Termux) / SBCs')

# Remove Windows and macOS from the feature list at bottom
content = re.sub(r'\s*\{\s*icon:\s*Globe,\s*label:\s*"macOS \(Apple Silicon & Intel\)".*?\},', '', content)
content = re.sub(r'\s*\{\s*icon:\s*TerminalSquare,\s*label:\s*"Windows \(native\)".*?\},', '', content)

# 5. Features Update
content = content.replace('Check your install for issues', 'Auto-Healing: Repairs broken configs or corrupted binaries with a single keystroke')
content = content.replace('"7 auto-selected backends"', '"Dynamic Backend Probing"')

with open(path, 'w') as f:
    f.write(content)

print("Updates applied.")
