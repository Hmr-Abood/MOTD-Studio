<div align="center">

<img src="https://raw.githubusercontent.com/Hmr-Abood/MOTD-Studio/main/assets/icons/logo.gif" alt="MOTD Studio logo" width="96">

# MOTD Studio

**The Minecraft Server Toolkit.**

Create and customize MOTDs, explore community templates, and test Minecraft servers — all in your browser.

[Open MOTD Studio](https://motdedtior.vercel.app/) · [Server Tester](https://motdedtior.vercel.app/server-tester) · [Community Templates](https://motdedtior.vercel.app/templates)

![Status](https://img.shields.io/badge/status-active-78a9f5?style=flat-square)
![Platform](https://img.shields.io/badge/platform-web-78a9f5?style=flat-square)
![License](https://img.shields.io/badge/license-see%20repository-lightgrey?style=flat-square)

</div>

---

## Overview

MOTD Studio is a browser-based toolkit for Minecraft server owners. It combines a live MOTD editor, a community template library, and a Minecraft Java Edition server tester. No installation is required.

## Features

### MOTD Editor
- Live Minecraft server-list preview with multiple Minecraft-themed backgrounds.
- Two-line MOTD editor with character counters and legacy formatting codes.
- Hex colors, gradient generation, and obfuscated text preview.
- Custom preview background uploads, saved locally in your browser.
- Copy and share MOTDs.

### Community Templates
- Browse and filter built-in and community templates.
- Sign in to submit templates for review.
- Private pending submissions and administrator moderation.

### Server Tester
- Check Minecraft Java Edition server status by hostname and optional port.
- View online status, player count, version, software, server icon, and formatted MOTD.
- Uses a Vercel serverless endpoint to query the external status provider.

## Run locally

The project uses browser ES modules. Serve the repository with a local web server rather than opening index.html directly.

    git clone https://github.com/Hmr-Abood/MOTD-Studio.git
    cd MOTD-Studio
    python -m http.server 8000

Open http://localhost:8000. The community library requires the Supabase project configuration. The server tester's /api/server-status endpoint requires deployment on Vercel.

## Repository layout

    MOTD-Studio/
    ├── api/                    # Vercel serverless endpoints
    ├── assets/
    │   ├── fonts/              # Minecraft preview font
    │   ├── icons/              # App logo and navigation icons
    │   └── images/             # Preview backgrounds and server icon
    ├── css/                    # Stylesheets, separated by feature
    ├── js/                     # Browser modules, separated by feature
    ├── presets/                # Built-in MOTD templates
    ├── supabase/
    │   └── migrations/         # Database schema and security policies
    ├── index.html              # MOTD editor
    ├── templates.html          # Community template library
    ├── server-tester.html      # Java server tester
    ├── SUPABASE_SETUP.md       # Supabase configuration guide
    ├── vercel.json             # Routes and security headers
    └── README.md

## Technology

- HTML, CSS, and vanilla JavaScript (ES modules)
- Supabase Auth and Postgres with Row Level Security
- Vercel hosting and serverless functions
- MCSrvStat server status API

## Security

The browser uses a Supabase publishable key; it is designed to be public. Database permissions must be enforced by Row Level Security. Never commit a Supabase secret/service-role key, database password, or SMTP app password. See SUPABASE_SETUP.md for configuration guidance.

## Contributing

Issues and pull requests are welcome. Keep the project lightweight, preserve the feature-based file organization, and avoid unnecessary dependencies.

---

<div align="center">

Made for Minecraft server owners.

**[Open MOTD Studio](https://motdedtior.vercel.app/)**

</div>
