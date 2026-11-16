module.exports = async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed." });
    }

    const address = typeof req.query.address === "string" ? req.query.address.trim() : "";
    const match = address.match(/^([a-zA-Z0-9.-]{1,253})(?::([0-9]{1,5}))?$/);
    if (!match || match[1].startsWith(".") || match[1].endsWith(".")
        || match[1].includes("..")
        || match[1].split(".").some(label => !label || label.startsWith("-") || label.endsWith("-"))
        || (match[2] && (Number(match[2]) < 1 || Number(match[2]) > 65535))) {
        return res.status(400).json({ error: "Enter a valid server address, optionally followed by a port." });
    }

    try {
        const upstream = await fetch("https://api.mcsrvstat.us/3/" + encodeURIComponent(address), {
            headers: { "Accept": "application/json", "User-Agent": "MOTD-Studio/1.0" },
            signal: AbortSignal.timeout(8000)
        });
        if (!upstream.ok) {
            return res.status(502).json({ error: "The server status provider is temporarily unavailable." });
        }

        const data = await upstream.json();
        const cleanMotd = Array.isArray(data.motd && data.motd.clean)
            ? data.motd.clean.slice(0, 2).map(line => String(line).slice(0, 300))
            : [];
        const rawMotd = Array.isArray(data.motd && data.motd.raw)
            ? data.motd.raw.slice(0, 2).map(line => String(line).slice(0, 300))
            : [];

        return res.status(200).json({
            online: data.online === true,
            hostname: typeof data.hostname === "string" ? data.hostname.slice(0, 253) : address,
            ip: typeof data.ip === "string" ? data.ip.slice(0, 100) : "",
            port: Number.isInteger(data.port) ? data.port : null,
            version: typeof data.version === "string" ? data.version.slice(0, 100) : "",
            software: typeof data.software === "string" ? data.software.slice(0, 80) : "",
            players: data.players && Number.isFinite(data.players.online) && Number.isFinite(data.players.max)
                ? { online: data.players.online, max: data.players.max } : null,
            motd: { clean: cleanMotd, raw: rawMotd },
            icon: typeof data.icon === "string" && data.icon.startsWith("data:image/png;base64,")
                && data.icon.length < 100000 ? data.icon : ""
        });
    } catch (error) {
        return res.status(504).json({ error: "Could not reach the server status provider. Please try again." });
    }
};
