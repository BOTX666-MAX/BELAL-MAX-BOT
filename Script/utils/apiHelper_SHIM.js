/**
 * Script/utils/apiHelper.js — Shim
 * ../../utils/apiHelper কাজ না করলে এটা fallback হিসেবে কাজ করে
 */
"use strict";

// Try 3 paths — যেকোনো একটা কাজ করলেই হবে
const PATHS = [
  "../../utils/apiHelper",
  "../utils/apiHelper",
  `${process.cwd()}/utils/apiHelper`,
];

for (const p of PATHS) {
  try { module.exports = require(p); break; } catch {}
}

// সব fail হলে inline fallback
if (!module.exports || !module.exports.safeGet) {
  const axios = require("axios");
  const fs    = require("fs-extra");
  const path  = require("path");

  const getUA = () => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  const jitter = (b=0) => new Promise(r => setTimeout(r, b + Math.random()*500));

  const safeGet = async (url, opts={}) => {
    for (let i=1; i<=3; i++) {
      try { return await axios.get(url, { timeout:30000, ...opts }); } catch(e) {
        if (i===3) throw e;
        await new Promise(r=>setTimeout(r, i*2000));
      }
    }
  };

  const safePost = async (url, data, opts={}) => axios.post(url, data, { timeout:30000, ...opts });

  const downloadToTmp = async (url, filename) => {
    const dir = path.join(process.cwd(), "tmp");
    await fs.ensureDir(dir);
    const out = path.join(dir, filename || `dl_${Date.now()}.mp4`);
    const r   = await axios({ method:"GET", url, responseType:"stream", timeout:40000,
      headers:{"User-Agent":getUA()}, maxRedirects:8 });
    await new Promise((res,rej) => {
      const w = fs.createWriteStream(out);
      r.data.pipe(w); w.on("finish",res); w.on("error",rej);
    });
    return out;
  };

  const cleanTmp = (f, ms=10000) => f && setTimeout(() => fs.remove(f).catch(()=>{}), ms);
  const getBaseApi = async () => null;
  const getGroqKey = () => global.config?.APIKEYS?.GROQ || "";
  const getGeminiKey = () => global.config?.APIKEYS?.GEMINI || "";

  module.exports = { getUA, jitter, safeGet, safePost, downloadToTmp, cleanTmp,
    getBaseApi, getGroqKey, getGeminiKey, isFB: ()=>false,
    safeStream: async(u,f)=>{ const r=await axios({method:"GET",url:u,responseType:"stream",timeout:35000}); if(f)r.data.path=f; return r.data; },
    raceStream: async(urls,f)=>module.exports.safeStream(urls[0],f),
    fetchTikTok: async()=>[], uploadFile: async()=>{ throw new Error("upload unavailable"); },
    batchDownload: async()=>[],
  };
}
