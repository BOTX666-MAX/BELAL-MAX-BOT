"use strict";
/*
╔══════════════════════════════════════════════════════════╗
║  💬 baby.js v8.0 — BELAL BOTX666                         ║
║  ✅ Safe URL builder — কখনো Invalid URL crash হবে না    ║
║  ✅ Fallback API list — একটা fail হলে পরেরটা চলবে        ║
║  ✅ teach/remove/edit/list/msg সব function অক্ষত          ║
╚══════════════════════════════════════════════════════════╝
*/

// ── apiHelper safe loader ──────────────────────────────────────
const _apiHelper = (() => {
  try { return require("../../utils/apiHelper"); } catch {}
  try { return require("../utils/apiHelper"); } catch {}
  try { return require(`${process.cwd()}/utils/apiHelper`); } catch {}
  return global._apiHelper || global.apiHelper || {};
})();
const { safeGet = async(u,o)=>(await require("axios").get(u,{timeout:30000,...(o||{})})),
        getBaseApi = ()=>(_apiHelper.getBaseApi?_apiHelper.getBaseApi():null),
      } = _apiHelper;
// ────────────────────────────────────────────────────────────

const axios = require("axios");

// ── FALLBACK API SOURCES — baseApiUrl fail করলে এগুলো চেষ্টা করবে ──
const FALLBACK_BASES = [
  "https://kaiz-apis.gleeze.com/api",
  "https://www.noobs-api.rf.gd/dipto",
  "https://api-aroniix.koyeb.app",
];

// ── Safe URL builder — কখনো null/undefined/"Invalid URL" হবে না ──
async function getSafeLink() {
  // Step 1: baseApiUrl চেষ্টা করো
  try {
    const base = await getBaseApi();
    if (base && typeof base === "string" && base.startsWith("http")) {
      return `${base}/baby`;
    }
  } catch {}

  // Step 2: fallback list থেকে চেষ্টা করো (ping test)
  for (const base of FALLBACK_BASES) {
    try {
      await axios.get(`${base}/baby?text=ping&senderID=0`, { timeout: 5000 });
      return `${base}/baby`;
    } catch {}
  }

  // Step 3: সব fail হলেও fallback URL দাও (crash না করে)
  return FALLBACK_BASES[0] + "/baby";
}

// ── Safe GET wrapper — link malformed হলেও crash করবে না ──
async function safeBabyGet(link, params) {
  try {
    if (!link || typeof link !== "string" || !link.startsWith("http")) {
      throw new Error("Invalid base link");
    }
    const url = `${link}?${params}`;
    const res = await axios.get(url, { timeout: 20000 });
    return res?.data || {};
  } catch (e) {
    return { reply: null, message: null, error: e.message };
  }
}

module.exports.config = {
  name: "baby",
  version: "8.0.0",
  credits: "dipto x BELAL BOTX666",
  cooldowns: 0,
  hasPermssion: 0,
  description: "better than all sim simi — কখনো crash হবে না",
  commandCategory: "chat",
  category: "chat",
  usePrefix: true,
  prefix: true,
  usages: `[anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2]...\nteach react [YourMessage] - [react1], [react2]...\nremove [YourMessage]\nrm [YourMessage] - [indexNumber]\nmsg [YourMessage]\nlist OR list all\nedit [YourMessage] - [NewMessage]`,
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;

  try {
    const link  = await getSafeLink();
    const dipto = args.join(" ").toLowerCase();
    const uid   = senderID;

    if (!args[0]) {
      const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], threadID, messageID);
    }

    // ── REMOVE ──────────────────────────────────────────────
    if (args[0] === "remove") {
      const fina = dipto.replace("remove ", "");
      const data = await safeBabyGet(link, `remove=${encodeURIComponent(fina)}&senderID=${uid}`);
      return api.sendMessage(data.message || "❌ মুছতে পারিনি, আবার চেষ্টা করো।", threadID, messageID);
    }

    // ── REMOVE by index ───────────────────────────────────────
    if (args[0] === "rm" && dipto.includes("-")) {
      const [fi, f] = dipto.replace("rm ", "").split(" - ");
      const data = await safeBabyGet(link, `remove=${encodeURIComponent(fi)}&index=${f}`);
      return api.sendMessage(data.message || "❌ মুছতে পারিনি।", threadID, messageID);
    }

    // ── LIST ──────────────────────────────────────────────────
    if (args[0] === "list") {
      if (args[1] === "all") {
        const data = await safeBabyGet(link, "list=all");
        const list = data?.teacher?.teacherList || [];
        if (!list.length) return api.sendMessage("📋 কোনো teach করা message নেই।", threadID, messageID);

        const teachers = await Promise.all(list.map(async (item) => {
          const number = Object.keys(item)[0];
          const value  = item[number];
          let name = "unknown";
          try { name = await Users.getName(number) || "unknown"; } catch {}
          return { name, value };
        }));
        teachers.sort((a, b) => b.value - a.value);
        const output = teachers.map((t, i) => `${i+1}/ ${t.name}: ${t.value}`).join("\n");
        return api.sendMessage(`Total Teach = ${list.length}\n\n👑 | List of Teachers of baby\n${output}`, threadID, messageID);
      } else {
        const data = await safeBabyGet(link, "list=all");
        const list = data?.teacher?.teacherList || [];
        return api.sendMessage(`Total Teach = ${list.length}`, threadID, messageID);
      }
    }

    // ── MESSAGE ───────────────────────────────────────────────
    if (args[0] === "msg" || args[0] === "message") {
      const fuk  = dipto.replace(/^(msg|message) /, "");
      const data = await safeBabyGet(link, `list=${encodeURIComponent(fuk)}`);
      return api.sendMessage(`Message ${fuk} = ${data.data || "পাওয়া যায়নি"}`, threadID, messageID);
    }

    // ── EDIT ──────────────────────────────────────────────────
    if (args[0] === "edit") {
      const [oldMsg, newMsg] = dipto.replace("edit ", "").split(" - ");
      if (!oldMsg || !newMsg)
        return api.sendMessage("❌ | Invalid format! Use edit [YourMessage] - [NewReply]", threadID, messageID);
      const data = await safeBabyGet(link, `edit=${encodeURIComponent(oldMsg)}&replace=${encodeURIComponent(newMsg)}`);
      return api.sendMessage(`✅ Changed: ${data.message || "সম্পন্ন"}`, threadID, messageID);
    }

    // ── TEACH normal ──────────────────────────────────────────
    if (args[0] === "teach" && args[1] !== "amar" && args[1] !== "react") {
      const [comd, command] = dipto.split(" - ");
      const final = (comd || "").replace("teach ", "");
      if (!command || command.length < 2)
        return api.sendMessage("❌ | Invalid format! Use [YourMessage] - [Reply1], [Reply2]...", threadID, messageID);

      const data = await safeBabyGet(link, `teach=${encodeURIComponent(final)}&reply=${encodeURIComponent(command)}&senderID=${uid}`);
      let name = "unknown";
      try { name = await Users.getName(data.teacher) || "unknown"; } catch {}
      return api.sendMessage(`✅ Replies added: ${data.message || "সম্পন্ন"}\nTeacher: ${name}\nTeachs: ${data.teachs || "?"}`, threadID, messageID);
    }

    // ── TEACH intro ───────────────────────────────────────────
    if (args[0] === "teach" && args[1] === "amar") {
      const [comd, command] = dipto.split(" - ");
      const final = (comd || "").replace("teach ", "");
      if (!command || command.length < 2)
        return api.sendMessage("❌ | Invalid format! Use teach amar [YourMessage] - [Reply]", threadID, messageID);

      const data = await safeBabyGet(link, `teach=${encodeURIComponent(final)}&senderID=${uid}&reply=${encodeURIComponent(command)}&key=intro`);
      return api.sendMessage(`✅ Replies added ${data.message || "সম্পন্ন"}`, threadID, messageID);
    }

    // ── TEACH react ───────────────────────────────────────────
    if (args[0] === "teach" && args[1] === "react") {
      const [comd, command] = dipto.split(" - ");
      const final = (comd || "").replace("teach react ", "");
      if (!command || command.length < 1)
        return api.sendMessage("❌ | Invalid format! Use teach react [YourMessage] - [react1], [react2]...", threadID, messageID);

      const data = await safeBabyGet(link, `teach=${encodeURIComponent(final)}&react=${encodeURIComponent(command)}`);
      return api.sendMessage(`✅ Reacts added ${data.message || "সম্পন্ন"}`, threadID, messageID);
    }

    // ── Special keyword ───────────────────────────────────────
    if (["amar name ki", "amr nam ki", "amar nam ki", "amr name ki"].some(p => dipto.includes(p))) {
      const data = await safeBabyGet(link, `text=amar name ki&senderID=${uid}&key=intro`);
      return api.sendMessage(data.reply || "আমি BELAL BOTX666 🪬", threadID, messageID);
    }

    // ── DEFAULT CHAT ──────────────────────────────────────────
    const data  = await safeBabyGet(link, `text=${encodeURIComponent(dipto)}&senderID=${uid}&font=1`);
    const reply = data.reply || "🤔 বুঝতে পারিনি, আবার বলো!";

    return api.sendMessage(reply, threadID, (error, info) => {
      if (error || !info) return;
      global.client.handleReply.push({
        name: "baby",
        type: "reply",
        messageID: info.messageID,
        author: senderID,
        lnk: reply,
        apiUrl: link,
      });
    }, messageID);

  } catch (e) {
    console.error("baby.js error:", e.message);
    return api.sendMessage("⚠️ এই মুহূর্তে চ্যাট সার্ভিস ব্যস্ত আছে। আবার চেষ্টা করো!", threadID, messageID);
  }
};

// ── HANDLE REPLY ──────────────────────────────────────────────
module.exports.handleReply = async function ({ api, event }) {
  try {
    if (event.type !== "message_reply") return;
    const reply = event.body?.toLowerCase();
    if (!reply || !isNaN(reply)) return;

    const link = await getSafeLink();
    const data = await safeBabyGet(link, `text=${encodeURIComponent(reply)}&senderID=${event.senderID}&font=1`);
    const text = data.reply || "🤔 বুঝতে পারিনি!";

    return api.sendMessage(text, event.threadID, (error, info) => {
      if (error || !info) return;
      global.client.handleReply.push({
        name: "baby",
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        lnk: text,
        apiUrl: link,
      });
    }, event.messageID);
  } catch (e) {
    console.error("baby.js handleReply error:", e.message);
  }
};
