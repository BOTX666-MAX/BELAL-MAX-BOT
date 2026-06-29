const axios  = require("axios");
const fs     = require("fs-extra");
const path   = require("path");
const moment = require("moment-timezone");

module.exports.config = {
  name: "leave",
  version: "21.0.0",
  credits: "Belal x Gemini",
  description: "ইউজার leave নোটিফিকেশন — Canvas ছাড়া",
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  if (event.logMessageType !== "log:unsubscribe") return;
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const { threadID } = event;
  const leftID       = event.logMessageData.leftParticipantFbId;
  const isSelf       = event.author == leftID;
  const time         = moment.tz("Asia/Dhaka").format("hh:mm A | DD/MM/YYYY");

  const emojiMax = ["🔱","💎","🛡️","🌀","🦾","🧿","💫","🐉","🔥","👑","✨","🌟","🔮","⚡","🏆","🪬"];
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];

  let name = "Facebook User";
  try {
    name = global.data?.userName?.get(leftID)
        || global.data?.userName?.get(String(leftID))
        || await Users.getNameUser(leftID);
  } catch {}

  const roastTxt = isSelf
    ? `নিজে নিজেই পালালি? ${rand(emojiMax)} রাস্তা মাপ! যা ভাগ! 💩`
    : `থাকার যোগ্যতা নেই তোর! 😡 লাথি মেরে বের করে দেওয়া হলো! 👞💥`;

  const finalMsg =
`┏━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┓
   ⚠️ 𝗟𝗢𝗦𝗘𝗥 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 ⚠️
┗━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┛

আহারে ${name}! ${rand(emojiMax)}
${roastTxt}

👤 𝗡𝗮𝗺𝗲 : ${name}
🆔 𝗜𝗗   : ${leftID}
⏰ 𝗧𝗶𝗺𝗲 : ${time}

👑 𝗔𝗱𝗺𝗶𝗻: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
┈──╼ ┄┉❈${rand(emojiMax)}⋆⃝চাঁদের~পাহাড়${rand(emojiMax)}`;

  try {
    // ✅ Canvas ছাড়া: avatar stream করে পাঠাও
    const avatarUrl = `https://graph.facebook.com/${leftID}/picture?width=512&height=512&type=large`;
    const r = await axios.get(avatarUrl, { responseType: "stream", timeout: 8000 });
    r.data.path = "leave.jpg";

    return api.sendMessage({ body: finalMsg, attachment: r.data }, threadID);
  } catch {
    // fallback: শুধু text
    return api.sendMessage(finalMsg, threadID);
  }
};
