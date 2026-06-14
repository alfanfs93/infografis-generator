import { useState } from "react";

const TUJUAN_OPTIONS = [
  { val: "edukasi", label: "📚 Edukasi" },
  { val: "promosi", label: "📣 Promosi" },
  { val: "tips", label: "💡 Tips & Trik" },
  { val: "awareness", label: "🔔 Awareness" },
  { val: "viral", label: "🔥 Viral" },
  { val: "data", label: "📊 Data & Statistik" },
];

const RASIO_OPTIONS = [
  { val: "1:1 square — Instagram Feed", label: "1:1 — Instagram Feed", w: 512, h: 512 },
  { val: "9:16 vertical — Instagram Reels/Stories", label: "9:16 — Reels/Stories", w: 512, h: 910 },
  { val: "16:9 landscape — LinkedIn/Twitter", label: "16:9 — LinkedIn/Twitter", w: 910, h: 512 },
  { val: "4:5 portrait — Facebook Feed", label: "4:5 — Facebook Feed", w: 512, h: 640 },
];

const GAYA_OPTIONS = [
  { val: "modern minimalist, clean white background, bold typography", label: "Modern Minimalis" },
  { val: "vibrant colorful, gradient background, bold icons", label: "Colorful & Bold" },
  { val: "dark mode, neon accents, futuristic tech style", label: "Dark Mode / Tech" },
  { val: "flat design, pastel colors, friendly illustration", label: "Flat & Pastel" },
  { val: "corporate professional, blue tones, structured layout", label: "Corporate / Profesional" },
  { val: "earthy tones, handdrawn elements, organic texture", label: "Earthy / Natural" },
];

function extractSection(text, startTag, endTag) {
  const start = text.indexOf(startTag);
  if (start === -1) return "";
  const content = text.slice(start + startTag.length);
  if (!endTag) return content.trim();
  const end = content.indexOf(endTag);
  return end === -1 ? content.trim() : content.slice(0, end).trim();
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      style={{
        padding: "5px 12px", fontSize: "12px", borderRadius: "6px",
        border: "1px solid #2a2f40", background: "#1e2230",
        color: copied ? "#34d399" : "#7a7f9a", cursor: "pointer",
        fontWeight: 600, flexShrink: 0
      }}
    >
      {copied ? "✓ Disalin" : "Salin"}
    </button>
  );
}

function OutputCard({ dot, label, content }) {
  const dotColors = { blue: "#5b6ef5", purple: "#a78bfa", green: "#34d399" };
  return (
    <div style={{ background: "#1e2230", border: "1px solid #2a2f40", borderRadius: "12px", marginBottom: "14px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2f40" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "13px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColors[dot], flexShrink: 0 }} />
          {label}
        </div>
        <CopyButton text={content} />
      </div>
      <div style={{ padding: "14px 16px", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "13px", lineHeight: 1.7, color: "#e8eaf2", maxHeight: "220px", overflowY: "auto" }}>
        {content}
      </div>
    </div>
  );
}

function ImagePreview({ prompt, rasioObj, groqKey }) {
  const [status, setStatus] = useState("idle");
  const [imgBlob, setImgBlob] = useState("");
  const [tried, setTried] = useState(0);

  const SOURCES = [
    (p, w, h) => `https://image.pollinations.ai/prompt/${encodeURIComponent(p.slice(0,500))}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random()*99999)}`,
    (p, w, h) => `https://pollinations.ai/p/${encodeURIComponent(p.slice(0,400))}?width=${w}&height=${h}&seed=${Math.floor(Math.random()*99999)}`,
  ];

  const handleGenerate = async () => {
    setStatus("loading");
    setImgBlob("");

    // Try HuggingFace first (fetch as blob to avoid CORS img issues)
    try {
      const hfRes = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: prompt.slice(0, 500) })
        }
      );
      if (hfRes.ok) {
        const blob = await hfRes.blob();
        if (blob.type.startsWith("image/")) {
          setImgBlob(URL.createObjectURL(blob));
          setStatus("loaded");
          return;
        }
      }
    } catch (e) {}

    // Fallback to Pollinations via <img> tag
    const url = SOURCES[tried % SOURCES.length](prompt, rasioObj.w, rasioObj.h);
    setTried(t => t + 1);
    setImgBlob(url);
    // status will be set by onLoad/onError
  };

  return (
    <div style={{ background: "#1e2230", border: "1px solid #2a2f40", borderRadius: "12px", marginBottom: "14px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2f40" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "13px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fb923c", flexShrink: 0 }} />
          Preview Gambar — AI Image Generator
        </div>
        <button
          onClick={handleGenerate}
          disabled={status === "loading"}
          style={{
            padding: "5px 14px", fontSize: "12px", borderRadius: "6px", border: "none",
            background: status === "loading" ? "#2a2f40" : "linear-gradient(135deg, #fb923c, #f472b6)",
            color: status === "loading" ? "#7a7f9a" : "white",
            cursor: status === "loading" ? "not-allowed" : "pointer", fontWeight: 600
          }}
        >
          {status === "loading" ? "Generating..." : status === "loaded" ? "🔄 Regenerate" : "🎨 Generate Gambar"}
        </button>
      </div>
      <div style={{ padding: "16px", textAlign: "center" }}>
        {status === "idle" && (
          <div style={{ color: "#7a7f9a", fontSize: "13px", padding: "32px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🖼️</div>
            Klik "Generate Gambar" untuk membuat preview visual
            <div style={{ fontSize: "11px", marginTop: "6px", color: "#4a4f6a" }}>Preview saja — untuk final pakai Midjourney / Ideogram</div>
          </div>
        )}
        {status === "loading" && (
          <div style={{ color: "#7a7f9a", fontSize: "13px", padding: "32px 0" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⏳</div>
            Render gambar... (bisa 15–40 detik)
          </div>
        )}
        {imgBlob && status !== "loading" && (
          <img
            src={imgBlob} alt="Generated preview"
            style={{ maxWidth: "100%", maxHeight: "480px", borderRadius: "8px", display: "block", margin: "0 auto", border: "1px solid #2a2f40" }}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        )}
        {status === "error" && (
          <div style={{ fontSize: "13px", padding: "16px 0" }}>
            <div style={{ color: "#f87171", marginBottom: "12px" }}>
              Preview gambar tidak tersedia (server diblokir ISP/jaringan).
            </div>
            <div style={{ color: "#7a7f9a", fontSize: "12px", lineHeight: 1.7 }}>
              Gunakan prompt visual di atas dan paste ke:<br/>
              <a href="https://ideogram.ai" target="_blank" rel="noreferrer" style={{ color: "#a78bfa" }}>ideogram.ai</a>
              {" · "}
              <a href="https://leonardo.ai" target="_blank" rel="noreferrer" style={{ color: "#a78bfa" }}>leonardo.ai</a>
              {" · "}
              <a href="https://www.canva.com/ai-image-generator/" target="_blank" rel="noreferrer" style={{ color: "#a78bfa" }}>Canva AI</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("groq_key") || "");
  const [apiKeySaved, setApiKeySaved] = useState(!!localStorage.getItem("groq_key"));
  const [topik, setTopik] = useState("");
  const [audiens, setAudiens] = useState("");
  const [tujuan, setTujuan] = useState("edukasi");
  const [rasioIdx, setRasioIdx] = useState(0);
  const [gaya, setGaya] = useState(GAYA_OPTIONS[0].val);
  const [poin, setPoin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const rasioObj = RASIO_OPTIONS[rasioIdx];

  const saveKey = () => {
    localStorage.setItem("groq_key", apiKey);
    setApiKeySaved(true);
  };

  const generate = async () => {
    if (!topik.trim() || !apiKey.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const prompt = `Kamu adalah ahli konten marketing & desain infografis Indonesia.

Buat 3 output TERPISAH untuk infografis:
- Topik: ${topik}
- Target audiens: ${audiens || "umum"}
- Tujuan konten: ${tujuan}
- Rasio/platform: ${rasioObj.val}
- Gaya visual: ${gaya}
${poin ? `- Catatan tambahan: ${poin}` : ""}

OUTPUT 1 - PROMPT KONTEN (untuk AI text generator):
Prompt lengkap Bahasa Indonesia untuk menghasilkan teks infografis: judul utama, subjudul, 5-7 poin konten singkat, call-to-action, caption media sosial.

OUTPUT 2 - PROMPT VISUAL (untuk Midjourney/DALL-E/Ideogram):
Prompt Bahasa Inggris, detail, maksimal 400 karakter. Komposisi layout infographic poster, palet warna, tipografi, gaya artistik, mood. Siap copy-paste.

OUTPUT 3 - SARAN EKSEKUSI DI CANVA:
4-6 saran praktis: kategori template, font pairing, hex palette, elemen yang ditambahkan.

Format HARUS persis:
[OUTPUT 1]
(isi)

[OUTPUT 2]
(isi)

[OUTPUT 3]
(isi)`;

    try {
      const res = await fetch(
        `https://api.groq.com/openai/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Groq API error");

      const text = data.choices?.[0]?.message?.content || "";
      if (!text) throw new Error("Response kosong dari Groq");

      setResult({
        content: extractSection(text, "[OUTPUT 1]", "[OUTPUT 2]"),
        visual: extractSection(text, "[OUTPUT 2]", "[OUTPUT 3]"),
        canva: extractSection(text, "[OUTPUT 3]", null),
      });
    } catch (err) {
      setError("Gagal generate: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const c = {
    page: { background: "#0d0f14", minHeight: "100vh", padding: "24px 16px", color: "#e8eaf2", fontFamily: "system-ui, sans-serif", fontSize: "14px" },
    wrap: { maxWidth: "760px", margin: "0 auto" },
    badge: { display: "inline-block", background: "linear-gradient(135deg, #5b6ef5, #a78bfa)", color: "white", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 12px", borderRadius: "20px", marginBottom: "12px" },
    h1: { fontSize: "26px", fontWeight: 700, background: "linear-gradient(135deg, #e8eaf2, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "6px" },
    sub: { color: "#7a7f9a", fontSize: "13px", marginBottom: "28px" },
    card: { background: "#161920", border: "1px solid #2a2f40", borderRadius: "12px", padding: "20px", marginBottom: "16px" },
    sectionTitle: { fontSize: "11px", fontWeight: 700, color: "#7a7f9a", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" },
    label: { display: "block", fontSize: "13px", fontWeight: 500, color: "#c8cae0", marginBottom: "6px" },
    input: { width: "100%", background: "#1e2230", border: "1px solid #2a2f40", borderRadius: "8px", color: "#e8eaf2", fontFamily: "system-ui, sans-serif", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box" },
    select: { width: "100%", background: "#1e2230", border: "1px solid #2a2f40", borderRadius: "8px", color: "#e8eaf2", fontFamily: "system-ui, sans-serif", fontSize: "14px", padding: "10px 14px", outline: "none" },
    chip: (active) => ({ background: active ? "#5b6ef5" : "#1e2230", border: `1px solid ${active ? "#5b6ef5" : "#2a2f40"}`, borderRadius: "20px", color: active ? "white" : "#7a7f9a", cursor: "pointer", fontSize: "12px", fontWeight: 600, padding: "5px 12px", userSelect: "none" }),
    btn: (dis) => ({ width: "100%", padding: "13px", border: "none", borderRadius: "12px", cursor: dis ? "not-allowed" : "pointer", fontFamily: "system-ui, sans-serif", fontSize: "15px", fontWeight: 700, background: dis ? "#2a2f40" : "linear-gradient(135deg, #5b6ef5, #a78bfa)", color: dis ? "#7a7f9a" : "white" }),
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
    field: { marginBottom: "14px" },
    chips: { display: "flex", flexWrap: "wrap", gap: "8px" },
    divider: { height: "1px", background: "#2a2f40", margin: "20px 0" },
    error: { color: "#f87171", fontSize: "13px", textAlign: "center", padding: "12px" },
  };

  return (
    <div style={c.page}>
      <div style={c.wrap}>
        <div style={{ textAlign: "center" }}>
          <div style={c.badge}>✦ AI Prompt Generator</div>
          <div style={c.h1}>Infografis Prompt Generator</div>
          <div style={c.sub}>Ketik topik → prompt konten, visual prompt & preview gambar</div>
        </div>

        {/* API Key Section */}
        <div style={{ ...c.card, borderColor: apiKeySaved ? "#1a3a2a" : "#2a2f40", background: apiKeySaved ? "#111a15" : "#161920" }}>
          <div style={c.sectionTitle}>🔑 Groq API Key</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="password"
              style={{ ...c.input, flex: 1 }}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setApiKeySaved(false); }}
              placeholder="Paste API key kamu di sini..."
            />
            <button
              onClick={saveKey}
              disabled={!apiKey.trim()}
              style={{ padding: "10px 18px", border: "none", borderRadius: "8px", cursor: apiKey.trim() ? "pointer" : "not-allowed", background: apiKeySaved ? "#34d399" : "#5b6ef5", color: "white", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}
            >
              {apiKeySaved ? "✓ Tersimpan" : "Simpan"}
            </button>
          </div>
          <div style={{ fontSize: "11px", color: "#4a4f6a", marginTop: "8px" }}>
            API key disimpan di browser kamu (localStorage) — tidak dikirim ke server manapun selain Google.
          </div>
        </div>

        {/* Input Section */}
        <div style={c.card}>
          <div style={c.sectionTitle}>Input</div>

          <div style={c.field}>
            <label style={c.label}>Topik Infografis *</label>
            <input style={c.input} value={topik} onChange={e => setTopik(e.target.value)}
              placeholder="Contoh: bahaya begadang, cara hemat listrik, tips UMKM..." />
          </div>

          <div style={c.field}>
            <label style={c.label}>Target Audiens</label>
            <input style={c.input} value={audiens} onChange={e => setAudiens(e.target.value)}
              placeholder="Contoh: ibu rumah tangga, mahasiswa, pemilik UMKM..." />
          </div>

          <div style={c.field}>
            <label style={c.label}>Tujuan Konten</label>
            <div style={c.chips}>
              {TUJUAN_OPTIONS.map(o => (
                <div key={o.val} style={c.chip(tujuan === o.val)} onClick={() => setTujuan(o.val)}>{o.label}</div>
              ))}
            </div>
          </div>

          <div style={c.grid}>
            <div style={c.field}>
              <label style={c.label}>Rasio / Platform</label>
              <select style={c.select} value={rasioIdx} onChange={e => setRasioIdx(Number(e.target.value))}>
                {RASIO_OPTIONS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
              </select>
            </div>
            <div style={c.field}>
              <label style={c.label}>Gaya Visual</label>
              <select style={c.select} value={gaya} onChange={e => setGaya(e.target.value)}>
                {GAYA_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ ...c.field, marginBottom: 0 }}>
            <label style={c.label}>Catatan Tambahan <span style={{ color: "#4a4f6a" }}>(opsional)</span></label>
            <textarea style={{ ...c.input, minHeight: "64px", resize: "none" }}
              value={poin} onChange={e => setPoin(e.target.value)}
              placeholder="Contoh: sertakan statistik, fokus 5 poin utama, bahasa santai..." />
          </div>
        </div>

        <button style={c.btn(loading || !topik.trim() || !apiKey.trim())}
          onClick={generate} disabled={loading || !topik.trim() || !apiKey.trim()}>
          {loading ? "⏳ Sedang generate..." : "⚡ Generate Prompt & Preview"}
        </button>

        {!apiKey.trim() && (
          <div style={{ textAlign: "center", color: "#7a7f9a", fontSize: "12px", marginTop: "8px" }}>
            Isi API key dulu sebelum generate
          </div>
        )}

        {error && <div style={c.error}>{error}</div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "28px", color: "#7a7f9a", fontSize: "13px" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>✨</div>
            Menghasilkan prompt...
          </div>
        )}

        {result && (
          <>
            <div style={c.divider} />
            <div style={{ ...c.sectionTitle, marginBottom: "14px" }}>Hasil Generate</div>
            <OutputCard dot="blue" label="Prompt Konten — untuk AI text generator" content={result.content} />
            <OutputCard dot="purple" label="Prompt Visual — untuk Midjourney / DALL-E / Ideogram" content={result.visual} />
            <ImagePreview prompt={result.visual} rasioObj={rasioObj} />
            <OutputCard dot="green" label="Saran Eksekusi di Canva" content={result.canva} />
          </>
        )}
      </div>
    </div>
  );
}
