"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const THEME = {
  bg: "#0b0c10",
  headerGradient: "linear-gradient(to bottom, #1f2833, #0b0c10)",
  primary: "#66fcf1",
  secondary: "#45a29e",
  accent: "#4ade80",
  cardBg: "rgba(31, 40, 51, 0.8)",
  font: "Orbitron, sans-serif",
  textMuted: "#c5c6c7",
};

type FarmLink = {
  label: string;
  url: string;
  count?: number;
  note?: string;
};

type Section = {
  id: string;
  title: string;
  color: string;
  links: FarmLink[];
};

const SECTIONS: Section[] = [
  {
    id: "my-land",
    title: "My Land",
    color: "#66fcf1",
    links: [
      { label: "fox-hole / home", url: "https://nomstead.com/fox-hole" },
      { label: "fox-hole / wine tile", url: "https://nomstead.com/fox-hole/6979ec3f24abb84a34c52a02", count: 4 },
      { label: "fox-hole / 69869c10", url: "https://nomstead.com/fox-hole/69869c10ee56d377117996b7" },
      { label: "fox-hole / 694a4ff3", url: "https://nomstead.com/fox-hole/694a4ff330cf4ef6f6381cb3" },
      { label: "fox-hole / 694b511b", url: "https://nomstead.com/fox-hole/694b511b8aa74b012c424e94" },
      { label: "fox-hole / 6963db26", url: "https://nomstead.com/fox-hole/6963db267760c9b34d2a079f" },
    ],
  },
  {
    id: "open-farms",
    title: "Open Farms",
    color: "#4ade80",
    links: [
      { label: "goldv / 68c7b9f1", url: "https://nomstead.com/goldv/68c7b9f1791656b0bc384abf" },
      { label: "goldv / 6979ebcf", url: "https://nomstead.com/goldv/6979ebcf24abb84a34c511b6" },
      { label: "mbt / 6948864e", url: "https://nomstead.com/mbt/6948864e2f87c02ee30a2aba" },
      { label: "mbt / 69477191", url: "https://nomstead.com/mbt/69477191e9b4f164c2b41fd3" },
      { label: "mbt / 69234cfe", url: "https://nomstead.com/mbt/69234cfebd7614ed911ae1fa" },
      { label: "algerian-kingdom", url: "https://nomstead.com/algerian-kingdom/667e92766ffeedef849f44a1" },
      { label: "clear-crossing-academy / 64ae902e", url: "https://nomstead.com/clear-crossing-academy/64ae902e72d58ade1b34ecd7" },
      { label: "falconia", url: "https://nomstead.com/falconia/68c7bb7fc0d978301fad29f4" },
      { label: "nullland", url: "https://nomstead.com/nullland/68c7ba776ff5961fef12e44c" },
      { label: "gabyluky1904 / 69204469", url: "https://nomstead.com/gabyluky1904/692044693ad1775f8441df47" },
      { label: "gabyluky1904 / 69077f8f", url: "https://nomstead.com/gabyluky1904/69077f8f1deed8fd9acddae7" },
      { label: "gabyluky1904 / 68b01910", url: "https://nomstead.com/gabyluky1904/68b019104afc277d427618bb" },
      { label: "gabyluky1904 / 688b8ae8", url: "https://nomstead.com/gabyluky1904/688b8ae8eef426de5535a490" },
      { label: "wfh365days", url: "https://nomstead.com/wfh365days/68d2cbfc80b9dc2c85fec7cf" },
      { label: "charazy-world (A)", url: "https://nomstead.com/charazy-world/6890e2b029877c5fad6ad189" },
      { label: "charazy-world (B)", url: "https://nomstead.com/charazy-world/6890e2b029877c5fad6ad18c" },
      { label: "velania", url: "https://nomstead.com/velania/68c7baf56ff5961fef12e60c" },
      { label: "nanto / 6919d5e8", url: "https://nomstead.com/nanto/6919d5e879757ff165ad7dc6", note: "🍄 mushrooms near forest pond" },
      { label: "nanto / 68c7bbbb", url: "https://nomstead.com/nanto/68c7bbbbc0d978301fad2acc" },
      { label: "clear-crossing-academy / 68c7b9d9", url: "https://nomstead.com/clear-crossing-academy/68c7b9d9791656b0bc384a6b" },
      { label: "logg", url: "https://nomstead.com/logg/68c7bc30c0d978301fad2c6c" },
      { label: "khris", url: "https://nomstead.com/khris/68c7bb89c0d978301fad2a18" },
      { label: "lorztwitch-empire", url: "https://nomstead.com/lorztwitch-empire/68c7bbe8c0d978301fad2b68" },
      { label: "lk / 6913101a", url: "https://nomstead.com/lk/6913101a19dee60a43a3c4d8" },
      { label: "lk / 688b88ac (A)", url: "https://nomstead.com/lk/688b88ac824d90422c6ef0e4" },
      { label: "lk / 688b88ac (B)", url: "https://nomstead.com/lk/688b88ac824d90422c6ef0dd" },
      { label: "lk / 664062ef", url: "https://nomstead.com/lk/664062efaed3071e0cbf8b86" },
      { label: "lk / 6941435c", url: "https://nomstead.com/lk/6941435c0dbaac1c4498ddab" },
      { label: "lk / 688ba7fe", url: "https://nomstead.com/lk/688ba7fe9b194d2ee238f1d9" },
      { label: "lk / 69414350", url: "https://nomstead.com/lk/69414350e9b4f164c20eb2ca" },
      { label: "lk / 690ce13d", url: "https://nomstead.com/lk/690ce13d4a50130682afd101" },
      { label: "lk / 693034aa", url: "https://nomstead.com/lk/693034aab7fef9264eeebb99" },
      { label: "darkside", url: "https://nomstead.com/darkside/688d5ca96f9089549597f7c4" },
      { label: "root", url: "https://nomstead.com/root/688b9778eef426de55401180" },
      { label: "sbhan / 688b8d92 (A)", url: "https://nomstead.com/sbhan/688b8d92eef426de55378ffe" },
      { label: "m@lik / 68c7ba92", url: "https://nomstead.com/m@lik/68c7ba926ff5961fef12e4ac" },
      { label: "sbhan / 68c7ba95", url: "https://nomstead.com/sbhan/68c7ba956ff5961fef12e4b8" },
      { label: "m@lik / 68bf2d30", url: "https://nomstead.com/m@lik/68bf2d30f0767fabff4900f6" },
      { label: "sbhan / 6979ec00", url: "https://nomstead.com/sbhan/6979ec0024abb84a34c51c5b" },
      { label: "sbhan / 688b8d92 (B)", url: "https://nomstead.com/sbhan/688b8d92eef426de55378ffb" },
      { label: "geto-dacia", url: "https://nomstead.com/geto-dacia/68c7bad56ff5961fef12e59c" },
      { label: "huyen", url: "https://nomstead.com/huyen/68b02c8937f6d81482857890" },
      { label: "usop-empire", url: "https://nomstead.com/usop-empire/688b88946845397e4973227d" },
      { label: "kalentong / 69093f93", url: "https://nomstead.com/kalentong/69093f93b5fe037716593feb" },
      { label: "kalentong / 68c7bbc5", url: "https://nomstead.com/kalentong/68c7bbc5c0d978301fad2af0" },
      { label: "kalentong / 68c49bff", url: "https://nomstead.com/kalentong/68c49bff34c18c4ba26fdd16" },
      { label: "kalentong / 688b8a9a", url: "https://nomstead.com/kalentong/688b8a9a8656cded28fd5abb" },
      { label: "kalentong / 693f0b35", url: "https://nomstead.com/kalentong/693f0b35ef3330f4950aeea8" },
      { label: "kalentong / 6979ebeb", url: "https://nomstead.com/kalentong/6979ebeb24abb84a34c5179c" },
      { label: "kiethcath-land / 68f6e25c (A)", url: "https://nomstead.com/kiethcath-land/68f6e25c6efb8522e44a6bd7" },
      { label: "kiethcath-land / 68f6e25c (B)", url: "https://nomstead.com/kiethcath-land/68f6e25c6efb8522e44a6bd4" },
      { label: "kiethcath-land / 693258df", url: "https://nomstead.com/kiethcath-land/693258df425202d08014c4c5" },
      { label: "kiethcath-land / 692066a2", url: "https://nomstead.com/kiethcath-land/692066a27b32330db3b7d1d0" },
      { label: "kiethcath-land / 6979ec21", url: "https://nomstead.com/kiethcath-land/6979ec2124abb84a34c523a4" },
      { label: "ashling", url: "https://nomstead.com/ashling/68f3c03b37d4d5c64efb4b89", note: "~12 pond tiles" },
      { label: "turkiye", url: "https://nomstead.com/turkiye/68f117ea8a0edfe1c615bb5e" },
      { label: "owlnite", url: "https://nomstead.com/owlnite/68c7bb9dc0d978301fad2a60", note: "few ponds, no doil yet" },
      { label: "dyespinning-wheel", url: "https://nomstead.com/dyespinning-wheel/688b88dae48988acd89b012f" },
      { label: "fsg-4", url: "https://nomstead.com/fsg-4/688b889464eac5c413e9dfc7" },
      { label: "dulba", url: "https://nomstead.com/dulba/68bf2787470072a8574dbc76", note: "~5 tiles" },
      { label: "rogue", url: "https://nomstead.com/rogue/69205f0d3ad1775f8479fdc3", note: "10+ tiles" },
      { label: "asperitas", url: "https://nomstead.com/asperitas/68c7bbc0c0d978301fad2adc" },
    ],
  },
  {
    id: "wine",
    title: "Wine",
    color: "#c084fc",
    links: [
      { label: "fox-hole / wine tile", url: "https://nomstead.com/fox-hole/6979ec3f24abb84a34c52a02", count: 4 },
      { label: "kunafool", url: "https://nomstead.com/kunafool/68c7baaa6ff5961fef12e500", count: 1 },
      { label: "pardisland", url: "https://nomstead.com/pardisland/6979ec3924abb84a34c528d1", count: 1 },
      { label: "nihil", url: "https://nomstead.com/nihil/66c60a2c55ca2290ac767a84", count: 1 },
      { label: "gabyluky1904", url: "https://nomstead.com/gabyluky1904/69078027b1f7c6772abaa94b", count: 1 },
      { label: "wfh365days", url: "https://nomstead.com/wfh365days/68d2cbfc80b9dc2c85fec7cf", count: 1 },
      { label: "the-greatest-estate", url: "https://nomstead.com/the-greatest-estate", count: 1 },
      { label: "waltz7809 / tile", url: "https://nomstead.com/waltz7809/690e7ce1da2482e1103a5258", count: 2 },
      { label: "waltz7809 / home", url: "https://nomstead.com/waltz7809", count: 1 },
      { label: "la-terra-dei-cachi", url: "https://nomstead.com/la-terra-dei-cachi/61c1e894f016c29f48d9cdd4", count: 2 },
      { label: "sbhan", url: "https://nomstead.com/sbhan/688b8d92eef426de55378ffb" },
      { label: "algerian-kingdom", url: "https://nomstead.com/algerian-kingdom" },
    ],
  },
  {
    id: "bread-ovens",
    title: "Bread Ovens",
    color: "#fb923c",
    links: [
      { label: "usop-empire", url: "https://nomstead.com/usop-empire/6586c17984e117ad477d68c2", count: 6 },
      { label: "marben", url: "https://nomstead.com/marben", count: 10 },
      { label: "black-hole", url: "https://nomstead.com/black-hole/688b8ac0824d90422c6fe80c", count: 2 },
      { label: "bread-oven", url: "https://nomstead.com/bread-oven", count: 4 },
      { label: "la-terra-dei-cachi", url: "https://nomstead.com/la-terra-dei-cachi/61b7f8dcc5c5332553b750f3", count: 5 },
      { label: "moonz", url: "https://nomstead.com/moonz/66f638e6dda9cf2e408b022f" },
      { label: "cocineros", url: "https://nomstead.com/cocineros/6979ebcc24abb84a34c510f3", count: 3 },
      { label: "hasishi / 688bbc4e", url: "https://nomstead.com/hasishi/688bbc4e9b194d2ee247de97", count: 8 },
      { label: "pardisland", url: "https://nomstead.com/pardisland/6985e0b0d8fb0c26f67f3b45" },
      { label: "jam", url: "https://nomstead.com/jam/68c805230864317123534675", count: 1 },
      { label: "carotandia", url: "https://nomstead.com/carotandia/61b916dabfb0aad6838a0f06", count: 1 },
      { label: "laizen", url: "https://nomstead.com/laizen/688ee6254470af38c4df0a09", count: 4 },
      { label: "geto-dacia", url: "https://nomstead.com/geto-dacia", count: 2 },
      { label: "l3l", url: "https://nomstead.com/l3l/62a33d835103e8e6490ff6fb", count: 2 },
      { label: "trung-thc", url: "https://nomstead.com/trung-thc/68aec146c53034996eb6bdf9", count: 6 },
      { label: "clear-crossing-academy", url: "https://nomstead.com/clear-crossing-academy/637465873369a0c6d1a10c6f", count: 1 },
      { label: "nihil", url: "https://nomstead.com/nihil", count: 5 },
      { label: "funjunkmans-lair", url: "https://nomstead.com/funjunkmans-lair", count: 1 },
      { label: "sbhan", url: "https://nomstead.com/sbhan" },
      { label: "m@lik", url: "https://nomstead.com/m@lik" },
      { label: "kalentong", url: "https://nomstead.com/kalentong/688b886f1585b148c6a36384", count: 1 },
      { label: "dyespinning-wheel", url: "https://nomstead.com/dyespinning-wheel/688b88eae48988acd89b0584" },
      { label: "hasishi / 66766518", url: "https://nomstead.com/hasishi/667665184dfc220fc8340766", count: 8 },
    ],
  },
  {
    id: "mills",
    title: "Mills",
    color: "#fbbf24",
    links: [
      { label: "chainers-land", url: "https://nomstead.com/chainers-land/6968c8d45810521f9b2f16b2", count: 1 },
      { label: "sembawang", url: "https://nomstead.com/sembawang/691878c2a8ceee6de5c5e158", count: 2 },
      { label: "laizen", url: "https://nomstead.com/laizen/68a52828486df650e3411db7", count: 1 },
      { label: "pardisland", url: "https://nomstead.com/pardisland/690ca9969247d04106b82de0", count: 1 },
      { label: "goldv", url: "https://nomstead.com/goldv/6519ce1376805122fa9fa3c3", count: 1 },
      { label: "nihil", url: "https://nomstead.com/nihil/66c60a2c55ca2290ac767a84", count: 2 },
      { label: "hilmyron", url: "https://nomstead.com/hilmyron/665f41dbf46670cb14ff5cec", count: 1 },
      { label: "the-47th-society", url: "https://nomstead.com/the-47th-society/65c106417d8c2c075d336757", count: 1 },
      { label: "la-terra-dei-cachi", url: "https://nomstead.com/la-terra-dei-cachi/61b7f8dcc5c5332553b750f3", count: 1 },
      { label: "trung-thc", url: "https://nomstead.com/trung-thc/68aec146c53034996eb6bdf9", count: 1 },
      { label: "lk", url: "https://nomstead.com/lk/688b94d864eac5c413f29d4a", count: 1 },
      { label: "cocineros", url: "https://nomstead.com/cocineros/6979ebcc24abb84a34c510f3", count: 1 },
      { label: "black-hole", url: "https://nomstead.com/black-hole/688b8ac0824d90422c6fe80c", count: 1 },
      { label: "sbhan", url: "https://nomstead.com/sbhan" },
      { label: "m@lik", url: "https://nomstead.com/m@lik" },
      { label: "l3l", url: "https://nomstead.com/l3l/64b5b71c9a0293d21d8c720b" },
      { label: "kalentong", url: "https://nomstead.com/kalentong/688b886f1585b148c6a36384", count: 1 },
      { label: "moonland", url: "https://nomstead.com/moonland/6686de4de33932506bc30f4f" },
    ],
  },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i + 1);
const DAYS = [1, 2, 3, 4, 5];
const MOD_HOURS = Array.from({ length: 24 }, (_, i) => i);

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "READY";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (h > 0 ? h + "h " : "") + (m > 0 || h > 0 ? m + "m " : "") + s + "s";
}

export default function FarmsPage() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookInput, setWebhookInput] = useState("");
  const [webhookStatus, setWebhookStatus] = useState("");
  const notifiedTimers = useRef<Set<string>>(new Set());
  const [, setTick] = useState(0);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("nomstead_timers") || "{}");
      setTimers(stored);
    } catch {}
    try {
      const storedNotes = JSON.parse(localStorage.getItem("nomstead_notes") || "{}");
      setNotes(storedNotes);
    } catch {}
    const saved = localStorage.getItem("nomstead_webhook") || "";
    setWebhookUrl(saved);
    setWebhookInput(saved);

    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  function handleSetTimer(url: string, ms: number) {
    const next = { ...timers, [url]: Date.now() + ms };
    setTimers(next);
    localStorage.setItem("nomstead_timers", JSON.stringify(next));
  }

  function handleSetNote(url: string, text: string) {
    const next = { ...notes, [url]: text };
    setNotes(next);
    localStorage.setItem("nomstead_notes", JSON.stringify(next));
  }

  function handleClearNote(url: string) {
    const next = { ...notes };
    delete next[url];
    setNotes(next);
    localStorage.setItem("nomstead_notes", JSON.stringify(next));
  }

  function saveWebhook() {
    const val = webhookInput.trim();
    localStorage.setItem("nomstead_webhook", val);
    setWebhookUrl(val);
    setWebhookStatus(val ? "✓ Saved" : "Cleared");
    setTimeout(() => setWebhookStatus(""), 2000);
  }

  async function testWebhook() {
    if (!webhookUrl) { alert("No webhook URL saved yet."); return; }
    setWebhookStatus("Sending…");
    try {
      const r = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "✅ NomStead Navigator webhook is working!" }),
      });
      setWebhookStatus(r.ok ? "✓ Ping sent!" : `✗ Error ${r.status}`);
    } catch { setWebhookStatus("✗ Failed (check URL)"); }
    setTimeout(() => setWebhookStatus(""), 3000);
  }

  function handleClearTimer(url: string) {
    const next = { ...timers };
    delete next[url];
    setTimers(next);
    localStorage.setItem("nomstead_timers", JSON.stringify(next));
    notifiedTimers.current.delete(url);
  }

  // Check timers each tick and fire webhook on first ready
  useEffect(() => {
    const now = Date.now();
    Object.entries(timers).forEach(([url, expiry]) => {
      if (expiry - now <= 0 && !notifiedTimers.current.has(url) && webhookUrl) {
        notifiedTimers.current.add(url);
        // Find label from SECTIONS data
        let label = url;
        for (const sec of SECTIONS) {
          const found = sec.links.find((l) => l.url === url);
          if (found) { label = found.label; break; }
        }
        const note = notes[url];
        const msg = `⏱ **Timer ready!** ${label}${note ? " — " + note : ""}\n<${url}>`;
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: msg }),
        }).catch(() => {});
      }
    });
  });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: THEME.bg, color: THEME.textMuted, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", background: THEME.headerGradient, borderBottom: `2px solid ${THEME.secondary}` }}>
        <Link href="/nomstead" style={{ display: "flex", alignItems: "center", gap: "8px", color: THEME.primary, textDecoration: "none", fontFamily: THEME.font, fontSize: "14px", padding: "8px 16px", background: "rgba(102, 252, 241, 0.1)", border: `1px solid ${THEME.secondary}`, borderRadius: "8px" }}>
          ← NomStead
        </Link>
        <h1 style={{ fontFamily: THEME.font, fontSize: "20px", color: THEME.accent, margin: 0, textShadow: "0 0 10px rgba(74,222,128,0.5)" }}>
          Farm Navigator
        </h1>
        <div style={{ width: "120px" }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
        <p style={{ fontSize: "13px", color: THEME.secondary, marginBottom: "16px" }}>
          Click any tile to open it. Last visited stays <strong style={{ color: "#afffcf" }}>highlighted</strong>. Use <strong style={{ color: "#f90" }}>⏱</strong> to set a cooldown timer — click the countdown to clear it.
        </p>

        {/* Discord Webhook Settings */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", background: "#0d1a2e", border: "1px solid #2a3a5a", borderRadius: "6px", padding: "8px 12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#7df", whiteSpace: "nowrap" }}>Discord Webhook:</span>
          <input
            type="text"
            placeholder="Paste your Discord webhook URL here…"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            style={{ flex: 1, minWidth: "200px", background: "#060e1a", color: "#c8d8e8", border: "1px solid #2a4a6a", borderRadius: "4px", padding: "5px 8px", fontSize: "12px" }}
          />
          <button onClick={saveWebhook} style={{ background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "4px", padding: "5px 12px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>Save</button>
          <button onClick={testWebhook} style={{ background: "transparent", color: "#6d9", border: "1px solid #6d9440", borderRadius: "4px", padding: "5px 12px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>Test ping</button>
          {webhookStatus && <span style={{ fontSize: "11px", color: "#7a9" }}>{webhookStatus}</span>}
        </div>

        {SECTIONS.map((section) => (
          <FarmSection
            key={section.id}
            section={section}
            activeUrl={activeUrl}
            setActiveUrl={setActiveUrl}
            timers={timers}
            onSetTimer={handleSetTimer}
            onClearTimer={handleClearTimer}
            notes={notes}
            onSetNote={handleSetNote}
            onClearNote={handleClearNote}
          />
        ))}
      </div>
    </div>
  );
}

type FarmSectionProps = {
  section: Section;
  activeUrl: string | null;
  setActiveUrl: (url: string) => void;
  timers: Record<string, number>;
  onSetTimer: (url: string, ms: number) => void;
  onClearTimer: (url: string) => void;
  notes: Record<string, string>;
  onSetNote: (url: string, text: string) => void;
  onClearNote: (url: string) => void;
};

function FarmSection({ section, activeUrl, setActiveUrl, timers, onSetTimer, onClearTimer, notes, onSetNote, onClearNote }: FarmSectionProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", borderBottom: `1px solid ${section.color}44`, paddingBottom: "8px" }}>
        <h2 style={{ fontFamily: THEME.font, fontSize: "15px", color: section.color, margin: 0, letterSpacing: "1px" }}>
          {section.title}
        </h2>
        <span style={{ fontSize: "12px", color: THEME.secondary }}>{section.links.length} tiles</span>
        <OpenAllButton links={section.links} color={section.color} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "6px" }}>
        {section.links.map((link) => (
          <FarmLink
            key={link.url + link.label}
            link={link}
            accentColor={section.color}
            isActive={activeUrl === link.url}
            onVisit={() => setActiveUrl(link.url)}
            expiry={timers[link.url]}
            onSetTimer={(ms) => onSetTimer(link.url, ms)}
            onClearTimer={() => onClearTimer(link.url)}
            noteText={notes[link.url]}
            onSetNote={(text) => onSetNote(link.url, text)}
            onClearNote={() => onClearNote(link.url)}
          />
        ))}
      </div>
    </div>
  );
}

type FarmLinkProps = {
  link: FarmLink;
  accentColor: string;
  isActive: boolean;
  onVisit: () => void;
  expiry?: number;
  onSetTimer: (ms: number) => void;
  onClearTimer: () => void;
  noteText?: string;
  onSetNote: (text: string) => void;
  onClearNote: () => void;
};

function FarmLink({ link, accentColor, isActive, onVisit, expiry, onSetTimer, onClearTimer, noteText, onSetNote, onClearNote }: FarmLinkProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customHrs, setCustomHrs] = useState("");
  const [selDay, setSelDay] = useState(0);
  const [selHour, setSelHour] = useState(0);
  const [notePickerOpen, setNotePickerOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const remaining = expiry ? expiry - Date.now() : null;
  const hasTimer = remaining !== null;
  const isReady = hasTimer && remaining! <= 0;

  function closePicker() { setPickerOpen(false); setSelDay(0); setSelHour(0); setCustomHrs(""); }
  function applyTimer(ms: number) { onSetTimer(ms); closePicker(); }

  const bg = isActive ? "#0d3320" : THEME.cardBg;
  const borderColor = isActive ? "#4af080" : hasTimer ? (isReady ? "#4af08088" : "#2a3a5a") : "#1a3050";
  const textColor = isActive ? "#afffcf" : "#9cf";

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "4px" }}>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onVisit}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: bg, border: `1px solid ${borderColor}`, borderRadius: "6px", padding: "7px 10px", textDecoration: "none", color: textColor, fontSize: "13px", gap: "6px", flex: 1, minWidth: 0, transition: "border-color 0.15s, background 0.15s" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{link.label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          {link.note && <span style={{ fontSize: "10px", color: "#f90" }} title={link.note}>{link.note}</span>}
          {link.count !== undefined && (
            <span style={{ background: "#1a3a20", color: "#6d9", border: "1px solid #2a5a30", borderRadius: "3px", padding: "1px 5px", fontSize: "11px" }}>×{link.count}</span>
          )}
        </span>
      </a>

      {/* Timer display — click to clear */}
      {hasTimer && (
        <span onClick={onClearTimer} title="Click to clear timer"
          style={{ fontSize: "11px", padding: "3px 6px", borderRadius: "3px", border: `1px solid ${isReady ? "#4af080" : "#2a3a5a"}`, background: isReady ? "#0d3320" : "#0d1020", color: isReady ? "#4af080" : "#7a9", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {isReady ? "READY ✓" : fmtCountdown(remaining!)}
        </span>
      )}

      {/* Timer set button */}
      <button onClick={(e) => { e.stopPropagation(); pickerOpen ? closePicker() : setPickerOpen(true); }} title="Set cooldown timer"
        style={{ background: "#0d1e33", border: "1px solid #1a3050", color: pickerOpen ? "#f90" : "#567", borderRadius: "3px", padding: "4px 6px", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>
        ⏱
      </button>

      {/* Note display */}
      {noteText && (
        <span title={noteText} style={{ fontSize: "11px", color: "#f90", fontStyle: "italic", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1 }}>
          📝 {noteText}
        </span>
      )}

      {/* Note button */}
      <button onClick={(e) => { e.stopPropagation(); if (notePickerOpen) { setNotePickerOpen(false); } else { setNoteDraft(noteText || ""); setNotePickerOpen(true); closePicker(); } }} title="Add/edit note"
        style={{ background: "#0d1e33", border: "1px solid #1a3050", color: notePickerOpen || noteText ? "#f90" : "#567", borderRadius: "3px", padding: "4px 6px", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>
        ✎
      </button>

      {/* Note picker — opens upward, left of note button */}
      {notePickerOpen && (
        <div style={{ position: "absolute", bottom: "calc(100% + 4px)", right: 0, zIndex: 200, background: "#0d1a2e", border: "1px solid #2a5a8c", borderRadius: "6px", padding: "10px", boxShadow: "0 4px 16px #000a", width: "240px" }}
          onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: "11px", color: "#7a9", marginBottom: "6px" }}>Note for this link</div>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="e.g. cotton planted, mushrooms nearby..."
            rows={3}
            autoFocus
            style={{ width: "100%", background: "#060e1a", color: "#c8d8e8", border: "1px solid #2a4a6a", borderRadius: "4px", padding: "6px", fontSize: "12px", resize: "vertical", boxSizing: "border-box", marginBottom: "8px" }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => { const v = noteDraft.trim(); if (v) onSetNote(v); else onClearNote(); setNotePickerOpen(false); }}
              style={{ flex: 1, background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "4px", padding: "4px", cursor: "pointer", fontSize: "12px" }}>
              Save
            </button>
            <button onClick={() => { onClearNote(); setNotePickerOpen(false); }}
              style={{ background: "transparent", color: "#f66", border: "1px solid #f664", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}>
              Clear
            </button>
            <button onClick={() => setNotePickerOpen(false)}
              style={{ background: "transparent", color: "#567", border: "1px solid #2a3a5a", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Timer picker — opens upward, right-aligned */}
      {pickerOpen && (
        <div style={{ position: "absolute", bottom: "calc(100% + 4px)", right: 0, zIndex: 100, background: "#0d1e33", border: "1px solid #2a5a8c", borderRadius: "6px", padding: "10px", boxShadow: "0 4px 16px #000a", width: "236px" }}
          onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: "11px", color: "#9cf", marginBottom: "6px", fontWeight: "bold" }}>Set cooldown:</div>

          {/* Hours 1–24 instant set */}
          <div style={{ fontSize: "10px", color: "#7a9", marginBottom: "4px" }}>Hours — click to set instantly</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px", marginBottom: "8px" }}>
            {HOURS.map((h) => (
              <button key={h} onClick={() => applyTimer(h * 3600000)}
                style={{ background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "3px", padding: "3px 2px", cursor: "pointer", fontSize: "11px" }}>
                {h}h
              </button>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #1a3050", margin: "2px 0 8px" }} />

          {/* Days 1–5 (select then pick +hours) */}
          <div style={{ fontSize: "10px", color: "#7a9", marginBottom: "4px" }}>Days</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "3px", marginBottom: "6px" }}>
            {DAYS.map((d) => (
              <button key={d}
                onClick={() => { if (selDay === d) { setSelDay(0); setSelHour(0); } else { setSelDay(d); setSelHour(0); } }}
                style={{ background: selDay === d ? "#2a4a8c" : "#1a2a4c", color: "#adf", border: "1px solid #2a4a7c", borderRadius: "3px", padding: "4px 2px", cursor: "pointer", fontSize: "11px" }}>
                {d}d
              </button>
            ))}
          </div>

          {/* +Hours modifier when day selected */}
          {selDay > 0 && (
            <>
              <div style={{ fontSize: "10px", color: "#7a9", marginBottom: "4px" }}>+ Extra hours</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px", marginBottom: "8px" }}>
                {MOD_HOURS.map((h) => (
                  <button key={h} onClick={() => setSelHour(h)}
                    style={{ background: selHour === h ? "#2a4a8c" : "#0a1428", color: "#adf", border: "1px solid #2a4a7c", borderRadius: "3px", padding: "2px 1px", cursor: "pointer", fontSize: "10px" }}>
                    +{h}h
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <span style={{ flex: 1, color: "#adf", fontSize: "11px" }}>
                  {selDay}d{selHour > 0 ? ` +${selHour}h` : ""}
                </span>
                <button onClick={() => applyTimer(selDay * 86400000 + selHour * 3600000)}
                  style={{ background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "3px", padding: "4px 14px", cursor: "pointer", fontSize: "12px" }}>
                  Set
                </button>
              </div>
            </>
          )}

          <div style={{ borderTop: "1px solid #1a3050", margin: "2px 0 8px" }} />

          {/* Custom input */}
          <div style={{ display: "flex", gap: "4px", marginBottom: hasTimer ? "8px" : "0" }}>
            <input type="number" placeholder="custom hrs" min="0.5" step="0.5" value={customHrs}
              onChange={(e) => setCustomHrs(e.target.value)}
              style={{ flex: 1, background: "#0a1a2e", border: "1px solid #2a5a8c", color: "#9cf", borderRadius: "3px", padding: "4px 6px", fontSize: "12px" }} />
            <button onClick={() => { const v = parseFloat(customHrs); if (v > 0) applyTimer(v * 3600000); }}
              style={{ background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "3px", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}>
              Set
            </button>
          </div>

          {hasTimer && (
            <button onClick={() => { onClearTimer(); closePicker(); }}
              style={{ width: "100%", background: "transparent", color: "#f66", border: "1px solid #f664", borderRadius: "3px", padding: "4px", cursor: "pointer", fontSize: "11px" }}>
              Clear timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OpenAllButton({ links, color }: { links: FarmLink[]; color: string }) {
  const handleClick = () => {
    if (links.length > 10) {
      if (!window.confirm(`Open ${links.length} tabs at once?`)) return;
    }
    links.forEach((l) => window.open(l.url, "_blank"));
  };

  return (
    <button
      onClick={handleClick}
      style={{ background: "transparent", color, border: `1px solid ${color}66`, borderRadius: "4px", padding: "3px 10px", fontSize: "11px", cursor: "pointer", fontFamily: THEME.font, marginLeft: "auto" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = color + "22")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
    >
      Open All
    </button>
  );
}
