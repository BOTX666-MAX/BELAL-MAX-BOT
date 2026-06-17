"use strict";
/*
╔══════════════════════════════════════════════════════════╗
║  🪦 rip.js v2.0 — BELAL BOTX666                          ║
║  ✅ Safe URL builder — কখনো Invalid URL crash হবে না    ║
║  ✅ Fallback API list                                     ║
╚══════════════════════════════════════════════════════════╝
*/

// ── apiHelper safe loader ──────────────────────────────────────
const _apiHelper = (() => {
  try { return require("../../utils/apiHelper"); } catch {}
  try { return require("../utils/apiHelper"); } catch {}
  try { return require(`${process.cwd()}/utils/apiHelper`); } catch {}
  return global._apiHelper || global.apiHelper || {};
})();
const { downloadToTmp, cleanTmp,
        getBaseApi = ()=>(_apiHelper.getBaseApi?_apiHelper.getBaseApi():null),
      } = _apiHelper;
// ────────────────────────────────────────────────────────────

const axios = require("axios");
const fs    = require("fs-extra");
const path  = require("path");

// ── FALLBACK API SOURCES ──────────────────────────────────────
const FALLBACK_BASES = [
  "https://kaiz-apis.gleeze.com/api",
  "https://www.noobs-api.rf.gd/dipto",
  "https://api-aroniix.koyeb.app",
];

// ── Safe URL builder — কখনো null/undefined হবে না ──────────────
async function getSafeBase() {
  try {
    const base = await getBaseApi();
    if (base && typeof base === "string" && base.startsWith("http")) return base;
  } catch {}
  return FALLBACK_BASES[0];
}

module.exports = {
  config: {
    name: "rip",
    aliases: [],
    version: "2.0",
    author: "MahMUD x BELAL BOTX666",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "rip [mention/reply/UID]",
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, mentions } = event;

    let id2;
    if (messageReply) id2 = messageReply.senderID;
    else if (Object.keys(mentions).length > 0) id2 = Object.keys(mentions)[0];
    else if (args[0]) id2 = args[0];
    else return api.sendMessage("⚠️ কাউকে mention, reply করো বা UID দাও।", threadID, messageID);

    let tmpFile = null;
    try {
      const base = await getSafeBase();
      const url  = `${base}/api/dig?type=rip&user=${id2}`;

      tmpFile = path.join(process.cwd(), "tmp", `rip_${id2}_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(tmpFile));

      const response = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
      if (!response?.data || response.data.length < 100) throw new Error("খালি response");

      fs.writeFileSync(tmpFile, response.data);

      api.sendMessage(
        { attachment: fs.createReadStream(tmpFile), body: "🪦 rip" },
        threadID,
        () => fs.remove(tmpFile).catch(() => {}),
        messageID
      );
    } catch (err) {
      console.error("rip.js:", err.message);
      if (tmpFile) fs.remove(tmpFile).catch(() => {});
      api.sendMessage("⚠️ ছবি তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো!", threadID, messageID);
    }
  },
};
