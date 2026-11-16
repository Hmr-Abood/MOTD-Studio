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

MOTD Studio is a browser-based toolkit for Minecraft server owners. It brings useful server customization and testing tools together in one place, starting with a live MOTD editor, a community template library, and a Java Edition server tester.

No installation is required. Open the website and use the tools directly in your browser.

## Tools

### MOTD Editor
- Live Minecraft server-list preview.
- Two-line MOTD editor with character counters.
- Legacy color and formatting codes.
- Hex colors and gradient tools.
- Obfuscated text preview with `&k`.
- Multiple preview backgrounds and custom background uploads.
- Copy the formatted MOTD for your server configuration.

### Community Templates
- Browse and filter built-in and community templates.
- Sign in to submit your own designs.
- Submissions are reviewed before public listing.
- Moderation tools for approved administrators.

### Server Tester
- Look up a Minecraft Java server by address.
- Check online status, player count, version, and software.
- View the server icon and formatted MOTD.
- Supports custom ports.

MOTD Studio is designed to grow with more practical Minecraft server tools over time.

## Getting started

Use the hosted version at **[motdedtior.vercel.app](https://motdedtior.vercel.app/)**.

To run the project locally, clone the repository and serve the folder with a local web server. The project uses browser ES modules, so opening `index.html` directly as a `file://` URL is not recommended.

```bash
git clone https://github.com/Hmr-Abood/MOTD-Studio.git
cd MOTD-Studio
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

The community template and authentication features require the Supabase project configuration. The server tester uses the included Vercel serverless endpoint, so that endpoint is available when deployed to Vercel.

## Project structure

```text
MOTD-Studio/
├── api/
│   └── server-status.js
├── assets/
│   └── images/
├── css/
│   ├── editor.css
│   ├── main.css
│   ├── preview.css
│   ├── sidebar.css
│   ├── templates-page.css
│   └── server-tester.css
├── js/
│   ├── colors.js
│   ├── editor.js
│   ├── preview.js
│   ├── server-tester.js
│   ├── supabase-config.js
│   └── templates-page.js
├── presets/
├── supabase/
│   └── migrations/
├── index.html
├── templates.html
├── server-tester.html
└── vercel.json
```

## Technology

- HTML, CSS, and vanilla JavaScript
- Supabase Auth and Postgres with Row Level Security for community templates
- Vercel hosting and serverless functions
- MCSrvStat server status API

## Security notes

The browser uses a Supabase publishable key. Database access is protected by Row Level Security policies.

**Never commit private credentials** such as a Supabase service-role/secret key, database password, or SMTP app password. SMTP credentials belong in the Supabase dashboard, not in this repository.

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first to discuss the proposed feature.

When contributing, keep the project lightweight, preserve the existing file organization, and avoid adding unnecessary dependencies.

---

<div align="center">

Made for Minecraft server owners.

**[Open MOTD Studio](https://motdedtior.vercel.app/)**

</div>
