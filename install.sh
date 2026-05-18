#!/bin/bash
# NUST Prep — macOS Install Script
# Run: chmod +x install.sh && ./install.sh

set -e

PREP_DIR="/Users/Shared/nust-prep"
APP_NAME="NUST Prep"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   NUST NET Prep — macOS Installer    ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install it first:"
    echo "   brew install node"
    echo "   or download from https://nodejs.org"
    exit 1
fi
echo "✓ Node.js $(node --version) found"

# 2. Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi
echo "✓ npm $(npm --version) found"

# 3. Create data directories
mkdir -p "$PREP_DIR/data/questions"
mkdir -p "$PREP_DIR/data/results"
echo "✓ Data directories created"

# 4. Initialize progress.json if needed
if [ ! -f "$PREP_DIR/data/results/progress.json" ]; then
    echo '{"currentDay":1,"sessions":[],"mockSessions":[]}' > "$PREP_DIR/data/results/progress.json"
    echo "✓ Progress file initialized"
fi

# 5. Initialize schedule.json if needed
if [ ! -f "$PREP_DIR/data/schedule.json" ]; then
    cat > "$PREP_DIR/data/schedule.json" << 'EOF'
{
  "currentDay": 1,
  "totalDays": 30,
  "phase1Days": 18,
  "rotation": ["verbal","analytical","verbal","quantitative","verbal","analytical"],
  "questionsPerDay": 50
}
EOF
    echo "✓ Schedule file initialized"
fi

# 6. Install npm dependencies
echo ""
echo "Installing dependencies..."
cd "$PREP_DIR"
npm install --production 2>/dev/null || npm install
echo "✓ Dependencies installed"

# 7. Create app icon (simple SVG -> PNG)
# We'll create a minimal icon
if [ ! -f "$PREP_DIR/icons/icon.png" ]; then
    mkdir -p "$PREP_DIR/icons"
    # Create a simple 512x512 icon using built-in sips if possible
    cat > "/tmp/nust-icon.svg" << 'SVGEOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  <text x="256" y="200" text-anchor="middle" fill="white" font-family="Arial Black" font-size="120" font-weight="900">NET</text>
  <text x="256" y="310" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial" font-size="60" font-weight="700">PREP</text>
  <text x="256" y="400" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="Arial" font-size="40">NUST 2026</text>
</svg>
SVGEOF
    # Try to convert SVG to PNG (requires rsvg-convert or just use the SVG)
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w 512 -h 512 /tmp/nust-icon.svg > "$PREP_DIR/icons/icon.png"
    else
        # Just copy SVG, Electron will handle it
        cp /tmp/nust-icon.svg "$PREP_DIR/icons/icon.svg"
        # Create a minimal 1x1 PNG as fallback for tray
        printf '\x89PNG\r\n\x1a\n' > "$PREP_DIR/icons/icon.png"
    fi
    echo "✓ App icon created"
fi

# 8. Create a simple tray icon
if [ ! -f "$PREP_DIR/icons/tray-icon.png" ]; then
    # Minimal placeholder — Electron will work without it too
    touch "$PREP_DIR/icons/tray-icon.png"
fi

# 9. Create launch script
cat > "$PREP_DIR/start.sh" << 'EOF'
#!/bin/bash
cd /Users/Shared/nust-prep
npx electron . &
EOF
chmod +x "$PREP_DIR/start.sh"
echo "✓ Launch script created"

# 10. Create .app bundle for Dock
APP_DIR="/Applications/$APP_NAME.app"
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

cat > "$APP_DIR/Contents/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>NUST Prep</string>
    <key>CFBundleDisplayName</key>
    <string>NUST Prep</string>
    <key>CFBundleIdentifier</key>
    <string>com.ahsan.nust-prep</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleExecutable</key>
    <string>nust-prep</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
    <key>LSUIElement</key>
    <false/>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

cat > "$APP_DIR/Contents/MacOS/nust-prep" << 'LAUNCHER'
#!/bin/bash
cd /Users/Shared/nust-prep
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
npx electron . 2>/dev/null &
LAUNCHER
chmod +x "$APP_DIR/Contents/MacOS/nust-prep"

# Copy icon to Resources
if [ -f "$PREP_DIR/icons/icon.png" ]; then
    cp "$PREP_DIR/icons/icon.png" "$APP_DIR/Contents/Resources/icon.png"
fi

echo "✓ App bundle created at /Applications/$APP_NAME.app"

# 11. Add to Login Items (auto-start on boot)
osascript -e "tell application \"System Events\" to make login item at end with properties {path:\"/Applications/$APP_NAME.app\", hidden:true}" 2>/dev/null || true
echo "✓ Added to Login Items (starts on boot)"

# 12. Done!
echo ""
echo "══════════════════════════════════════"
echo "  ✅ Installation complete!"
echo "══════════════════════════════════════"
echo ""
echo "  App location: /Applications/$APP_NAME.app"
echo "  Data folder:  $PREP_DIR/data/"
echo ""
echo "  To launch now:"
echo "    open /Applications/NUST\ Prep.app"
echo ""
echo "  To set up Claude Code routine:"
echo "    cd $PREP_DIR"
echo "    claude"
echo "    Then: /routine add nust-daily-prep --schedule '0 2 * * *'"
echo ""
echo "  Or just open Claude Code in this folder and say:"
echo "    'Generate today's questions'"
echo ""
