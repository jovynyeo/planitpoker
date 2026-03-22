import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

const FIBONACCI = ["?", "0", "0.5", "1", "2", "3", "5", "8", "13", "20", "☕"];

const CARD_INFO = {
  "?":   { label: "Unsure",       desc: "Need more info before estimating. Let's discuss first." },
  "0":   { label: "No effort",    desc: "Already done, or just a config change. Zero dev work needed." },
  "0.5": { label: "~½ day",       desc: "A tiny tweak. Less than half a day's effort." },
  "1":   { label: "~1 day",       desc: "Simple and well-understood. About 1 man-day of work." },
  "2":   { label: "~2 days",      desc: "Straightforward but needs a bit of thought. Around 2 man-days." },
  "3":   { label: "~3 days",      desc: "Moderate complexity with a few moving parts. About 3 man-days." },
  "5":   { label: "~1 week",      desc: "Non-trivial. Some unknowns involved. Roughly a full week." },
  "8":   { label: "~1.5 weeks",   desc: "Complex. Multiple components or dependencies at play." },
  "13":  { label: "~2 weeks",     desc: "Very complex or poorly understood. Consider breaking it down." },
  "20":  { label: "Too big",      desc: "Huge and hard to estimate confidently. Strongly recommend splitting this story." },
  "☕":  { label: "Need a break", desc: "More context needed. Let's talk before we point this one." },
};
const SQUADS = ["PEGA", "QA", "ACM"];
const ROLES = ["PO", "PEGA", "QA", "ACM"];

// 🎨 Balanced palette — solid, clean, fun but professional
const C = {
  purple:     "#6366F1",
  purpleDark: "#4F46E5",
  purpleLight:"#EEF2FF",
  purpleGlow: "rgba(99,102,241,0.18)",
  pink:       "#EC4899",
  pinkLight:  "#FCE7F3",
  orange:     "#F97316",
  orangeLight:"#FFF7ED",
  yellow:     "#FBBF24",
  yellowLight:"#FFFBEB",
  cyan:       "#06B6D4",
  cyanLight:  "#ECFEFF",
  green:      "#10B981",
  greenLight: "#ECFDF5",
  red:        "#EF4444",
  redLight:   "#FEF2F2",
  white:      "#FFFFFF",
  offWhite:   "#F8F9FC",
  silver:     "#E5E7EB",
  steel:      "#D1D5DB",
  slate:      "#6B7280",
  ink:        "#111827",
  inkLight:   "#374151",
};

const ROLE_COLORS = {
  PO:   { bg:"#6366F1", bgLight:"rgba(99,102,241,0.08)",  bgGlow:"rgba(99,102,241,0.18)",  gradient:"#6366F1", squadGradient:"#6366F1" },
  PEGA: { bg:"#10B981", bgLight:"rgba(16,185,129,0.08)",  bgGlow:"rgba(16,185,129,0.18)",  gradient:"#10B981", squadGradient:"#10B981" },
  QA:   { bg:"#06B6D4", bgLight:"rgba(6,182,212,0.08)",   bgGlow:"rgba(6,182,212,0.18)",   gradient:"#06B6D4", squadGradient:"#06B6D4" },
  ACM:  { bg:"#F97316", bgLight:"rgba(249,115,22,0.08)",  bgGlow:"rgba(249,115,22,0.18)",  gradient:"#F97316", squadGradient:"#F97316" },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.offWhite};color:${C.ink};font-family:'Inter',sans-serif;min-height:100vh;}
.app{min-height:100vh;display:flex;flex-direction:column;align-items:center;background:${C.offWhite};}

/* NAV */
.nav{width:100%;background:${C.purpleDark};padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(79,70,229,0.25);}
.nav-brand{display:flex;align-items:center;gap:10px;}
.nav-logo{font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:800;letter-spacing:-0.03em;color:white;letter-spacing:-0.02em;}
.nav-logo span{opacity:0.7;}
.nav-right{display:flex;align-items:center;gap:10px;}
.nav-chip{font-family:'Inter',sans-serif;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:4px 12px;font-size:0.72rem;color:white;font-weight:600;}

/* LAYOUT */
.main{width:100%;max-width:960px;padding:28px 18px 80px;display:flex;flex-direction:column;gap:18px;}

/* SETUP SCREEN */
.setup-container{display:flex;flex-direction:column;align-items:center;padding:36px 18px;gap:22px;}
.setup-hero{text-align:center;max-width:440px;}
.setup-hero h1{font-family:'Inter',sans-serif;font-size:2.2rem;font-weight:800;color:${C.ink};line-height:1.05;margin-bottom:10px;letter-spacing:-0.03em;}
.setup-hero h1 em{color:${C.purpleDark};font-style:normal;}
.setup-hero p{color:${C.slate};font-size:0.9rem;line-height:1.6;}
.setup-card{background:${C.white};border:1px solid ${C.silver};border-radius:20px;width:100%;max-width:460px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
.sc-header{background:${C.purpleDark};padding:22px 28px;}
.sc-header h2{font-family:'Inter',sans-serif;font-size:1rem;font-weight:700;color:white;}
.sc-header p{font-size:0.75rem;color:rgba(255,255,255,0.7);margin-top:3px;}
.sc-body{padding:26px;display:flex;flex-direction:column;gap:16px;}
.field{display:flex;flex-direction:column;gap:6px;}
.label{font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.slate};}
input,select{width:100%;background:${C.offWhite};border:2px solid ${C.silver};border-radius:10px;color:${C.ink};font-family:'Inter',sans-serif;font-size:0.9rem;padding:10px 14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;-webkit-appearance:none;appearance:none;}
input:focus,select:focus{border-color:var(--role-color,${C.purpleDark});box-shadow:0 0 0 3px var(--role-glow,${C.purpleGlow});background:white;}
input::placeholder{color:${C.steel};}

/* ROLE PILLS */
.role-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.role-pill{padding:11px 8px;border-radius:10px;border:2px solid ${C.silver};background:${C.offWhite};text-align:center;cursor:pointer;transition:all 0.15s;font-size:0.78rem;font-weight:700;color:${C.slate};letter-spacing:0.02em;}
.role-pill:hover{border-color:var(--role-color,${C.purpleDark});color:var(--role-color,${C.purpleDark});transform:translateY(-1px);}
.role-pill.selected{background:var(--role-color,${C.purpleDark});border-color:var(--role-color,${C.purpleDark});color:white;box-shadow:0 3px 8px var(--role-glow,rgba(79,70,229,0.2));transform:translateY(-1px);}

/* BUTTONS */
.btn{padding:11px 20px;border-radius:10px;border:none;font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.15s;letter-spacing:0.01em;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;box-shadow:none!important;}
.btn-primary{background:${C.purpleDark};color:white;box-shadow:0 3px 10px rgba(79,70,229,0.3);}
.btn-primary:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(79,70,229,0.4);}
.btn-fun{background:${C.orange};color:white;box-shadow:0 3px 10px rgba(249,115,22,0.3);}
.btn-fun:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(249,115,22,0.4);}
.btn-reveal{background:${C.purpleDark};color:white;box-shadow:0 3px 10px rgba(79,70,229,0.3);}
.btn-reveal:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(79,70,229,0.4);}
.btn-outline{background:transparent;color:${C.slate};border:2px solid ${C.silver};}
.btn-outline:not(:disabled):hover{border-color:${C.purpleDark};color:${C.purpleDark};}
.btn-ghost{background:transparent;color:${C.slate};padding:6px 12px;font-size:0.75rem;}
.btn-ghost:hover{color:${C.purpleDark};}
.btn-danger{background:rgba(255,255,255,0.12);color:white;border:1px solid rgba(255,255,255,0.25);font-size:0.75rem;padding:6px 14px;border-radius:8px;}
.btn-danger:hover{background:rgba(239,68,68,0.25);border-color:rgba(239,68,68,0.5);}
.btn-snap{background:${C.orange};color:white;box-shadow:0 3px 10px rgba(249,115,22,0.25);font-size:0.8rem;}
.btn-snap:not(:disabled):hover{transform:translateY(-2px);}
.btn-share{background:${C.cyan};color:white;font-size:0.75rem;padding:7px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(6,182,212,0.2);}
.btn-share:hover{opacity:0.9;transform:translateY(-1px);}

/* DIVIDER */
.divider{display:flex;align-items:center;gap:10px;color:${C.steel};font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:${C.silver};}

/* ROOM BAR */
.room-bar{background:${C.white};border:2px solid ${C.silver};border-radius:14px;padding:14px 20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 12px rgba(0,0,0,0.04);}
.room-bar-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
.room-bar-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding-top:10px;border-top:1px solid ${C.silver};}
.room-info{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.room-code{display:flex;align-items:center;gap:8px;background:${C.offWhite};border:2px solid ${C.silver};border-radius:8px;padding:6px 14px;}
.room-code .lbl{font-size:0.6rem;color:${C.slate};text-transform:uppercase;letter-spacing:0.1em;font-weight:700;}
.room-code .val{font-size:0.95rem;font-weight:400;color:${C.purpleDark};letter-spacing:0.06em;font-family:'Inter',sans-serif;}
.copy-btn{background:${C.purpleDark};border:none;color:white;cursor:pointer;font-size:0.65rem;padding:4px 10px;border-radius:5px;font-family:'Inter',sans-serif;font-weight:700;transition:opacity 0.15s;letter-spacing:0.05em;text-transform:uppercase;}
.copy-btn:hover{opacity:0.85;}
.me-badge{display:flex;align-items:center;gap:7px;font-size:0.82rem;color:${C.inkLight};}
.room-meta{display:flex;align-items:center;gap:6px;font-size:0.78rem;color:${C.slate};}
.room-meta-divider{color:${C.steel};}

/* ROLE TAGS */
.role-tag{padding:3px 10px;border-radius:20px;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}
.role-tag.PO{background:rgba(99,102,241,0.1);color:${C.purpleDark};}
.role-tag.PEGA{background:rgba(16,185,129,0.1);color:${C.green};}
.role-tag.QA{background:rgba(6,182,212,0.1);color:${C.cyan};}
.role-tag.ACM{background:rgba(249,115,22,0.1);color:${C.orange};}
.creator-tag{background:linear-gradient(135deg,rgba(251,191,36,0.2),rgba(249,115,22,0.1));color:${C.orange};border:1px solid rgba(251,191,36,0.4);border-radius:20px;padding:3px 10px;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}

/* P ROLE TAGS */
.p-role-tag{font-size:0.6rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:10px;}
.p-role-tag.PO{background:rgba(99,102,241,0.1);color:${C.purpleDark};}
.p-role-tag.PEGA{background:rgba(16,185,129,0.1);color:${C.green};}
.p-role-tag.QA{background:rgba(6,182,212,0.1);color:${C.cyan};}
.p-role-tag.ACM{background:rgba(249,115,22,0.1);color:${C.orange};}

/* SQUAD TABS */
.squad-tabs{display:flex;background:${C.offWhite};border:2px solid ${C.silver};border-radius:12px;padding:4px;gap:0;}
.squad-tab{flex:1;padding:9px 12px;border-radius:9px;border:none;background:transparent;font-family:'Inter',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.2s;color:${C.slate};text-align:center;}
.squad-tab:hover{color:${C.purpleDark};}
.squad-tab.active{background:${C.white};color:${C.purpleDark};box-shadow:0 2px 8px rgba(124,58,237,0.15);}
.squad-tab.complete{color:${C.green};}
.squad-tab.active.complete{color:${C.green};}
.tab-check{font-size:0.7rem;margin-left:4px;}

/* STORY PANEL */
.story-panel{background:${C.white};border:2px solid ${C.silver};border-radius:14px;overflow:hidden;}
.story-hdr{background:${C.purpleDark};padding:13px 18px;display:flex;align-items:center;justify-content:space-between;}
.story-hdr-title{font-size:0.68rem;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:0.12em;font-weight:700;}
.story-body{padding:18px;}
.story-text{font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:600;color:${C.ink};line-height:1.4;}

/* SECTION LABEL */
.section-label{font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.slate};margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.section-label::after{content:'';flex:1;height:2px;background:${C.silver};border-radius:1px;}

/* PLAYER TILES */
.players-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px;}
.player-tile{background:${C.white};border:2px solid ${C.silver};border-radius:12px;padding:14px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all 0.2s;}
.player-tile.voted{border-color:var(--squad-color,${C.green});background:var(--squad-bg,${C.greenLight});}
.player-tile.revealed-tile{border-color:var(--squad-color,${C.green});background:var(--squad-bg,${C.greenLight});}
.player-tile.me-tile{box-shadow:0 0 0 3px var(--squad-color-alpha,rgba(16,185,129,0.25));}
.player-name{font-size:0.75rem;font-weight:700;color:${C.inkLight};max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* CARD SLOTS */
.card-slot{width:52px;height:74px;border-radius:8px;border:2px solid ${C.silver};display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:1.2rem;font-weight:700;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);position:relative;}
.card-slot.empty{background:${C.offWhite};color:${C.steel};}
.card-slot.voted-hidden{background:var(--squad-gradient,linear-gradient(135deg,${C.green},#059669));border-color:var(--squad-color,${C.green});}
.card-slot.voted-hidden::after{content:'●●●';color:rgba(255,255,255,0.45);font-size:0.45rem;letter-spacing:3px;}
.card-slot.revealed-val{background:var(--squad-bg,${C.greenLight});border-color:var(--squad-color,${C.green});color:var(--squad-color,${C.green});transform:scale(1.07);box-shadow:0 4px 16px var(--squad-glow,rgba(16,185,129,0.25));font-size:1.35rem;}

/* STATUS BADGES */
.status-badge{display:inline-flex;align-items:center;gap:4px;font-size:0.62rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:3px 9px;border-radius:20px;}
.badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
.badge-waiting{background:rgba(107,114,128,0.1);color:${C.slate};}
.badge-voted-s{background:rgba(16,185,129,0.12);color:${C.green};}

/* VOTING PANEL */
.voting-panel{background:${C.white};border:2px solid ${C.silver};border-radius:14px;overflow:hidden;}
.voting-hdr{background:var(--role-gradient,${C.purpleDark});padding:14px 18px;display:flex;align-items:center;justify-content:space-between;}
.voting-title{font-size:0.68rem;color:rgba(255,255,255,0.85);text-transform:uppercase;letter-spacing:0.12em;font-weight:700;}
.your-vote{background:rgba(255,255,255,0.2);border-radius:20px;padding:3px 10px;font-size:0.75rem;color:white;font-weight:700;}
.cards-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:18px;}
.vote-card{width:58px;height:82px;border-radius:10px;border:2px solid ${C.silver};background:${C.offWhite};display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:700;cursor:pointer;transition:all 0.15s cubic-bezier(0.34,1.56,0.64,1);color:${C.ink};user-select:none;box-shadow:0 2px 6px rgba(0,0,0,0.06);}
.vote-card:hover{border-color:var(--role-color,${C.purpleDark});color:var(--role-color,${C.purpleDark});transform:translateY(-5px) scale(1.04);box-shadow:0 6px 18px var(--role-glow,rgba(79,70,229,0.18));background:var(--role-bg-light,${C.purpleLight});}
.vote-card.selected{border-color:var(--role-color,${C.purpleDark});background:var(--role-color,${C.purpleDark});color:white;transform:translateY(-7px) scale(1.07);box-shadow:0 8px 22px var(--role-glow,rgba(79,70,229,0.25));}
.card-wrap{position:relative;display:inline-flex;flex-direction:column;align-items:center;}
.card-tooltip-fixed{position:fixed;background:${C.ink};color:white;border-radius:10px;padding:12px 16px;width:210px;pointer-events:none;z-index:9999;box-shadow:0 8px 28px rgba(0,0,0,0.28);text-align:left;}
.card-tooltip-label{font-size:0.68rem;font-weight:700;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:5px;}
.card-tooltip-desc{font-size:0.82rem;line-height:1.5;color:rgba(255,255,255,0.92);}

/* RESULTS */
.results-banner{background:${C.purpleDark};border-radius:12px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;}
.result-stat{text-align:center;}
.result-val{font-family:'Inter',sans-serif;font-size:2rem;font-weight:800;color:white;line-height:1;}
.result-lbl{font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-top:2px;}
.vote-chips{display:flex;gap:7px;flex-wrap:wrap;align-items:center;}
.vote-chip{background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);border-radius:6px;padding:5px 11px;font-size:0.8rem;color:white;font-weight:700;}
.vote-chip .cnt{opacity:0.7;font-weight:400;}

/* AGREED */
.agreed-squads-section{background:${C.white};border:2px solid ${C.silver};border-radius:14px;padding:18px 22px;display:flex;flex-direction:column;gap:13px;}
.agreed-squad-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;background:${C.offWhite};border-radius:10px;}
.agreed-squad-label{font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;padding:4px 10px;border-radius:6px;min-width:52px;text-align:center;}
.agreed-squad-label.PEGA{background:rgba(16,185,129,0.12);color:${C.green};}
.agreed-squad-label.QA{background:rgba(6,182,212,0.12);color:${C.cyan};}
.agreed-squad-label.ACM{background:rgba(249,115,22,0.12);color:${C.orange};}
.agreed-chips{display:flex;gap:5px;flex-wrap:wrap;}
.agreed-chip{padding:6px 12px;border-radius:7px;border:2px solid ${C.silver};background:${C.offWhite};font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all 0.15s;color:${C.ink};}
.agreed-chip:hover{border-color:${C.purpleDark};color:${C.purpleDark};background:${C.purpleLight};}
.agreed-chip.selected{background:${C.purpleDark};border-color:${C.purpleDark};color:white;box-shadow:0 3px 10px rgba(79,70,229,0.2);}
.agreed-chip.readonly{cursor:default;opacity:0.45;}
.agreed-chip.readonly:hover{border-color:${C.silver};color:${C.ink};background:${C.offWhite};}
.agreed-confirmed{font-size:0.78rem;color:${C.green};font-weight:700;white-space:nowrap;}

/* CONTROLS */
.controls-row{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;}

/* COUNTDOWN */
.countdown-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;}
.countdown-badge{display:inline-flex;align-items:center;padding:8px 20px;border-radius:10px;background:${C.purpleDark};color:white;font-family:'Inter',sans-serif;font-size:1.3rem;font-weight:800;box-shadow:0 3px 10px rgba(79,70,229,0.25);transition:background 0.3s;}
.countdown-badge.urgent{background:${C.red};box-shadow:0 4px 14px rgba(239,68,68,0.4);animation:urgentPulse 0.5s infinite alternate;}
@keyframes urgentPulse{from{transform:scale(1);}to{transform:scale(1.05);}}
.countdown-bar-wrap{width:100%;max-width:300px;height:7px;background:${C.silver};border-radius:4px;overflow:hidden;}
.countdown-bar{height:100%;border-radius:4px;transition:width 0.5s linear,background 0.3s;}

/* PENDING */
.pending-box{background:${C.yellowLight};border:2px solid rgba(251,191,36,0.35);border-radius:12px;padding:14px 18px;}
.pending-title{font-size:0.7rem;font-weight:800;color:${C.orange};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;}
.pending-list{display:flex;flex-wrap:wrap;gap:7px;}
.pending-tag{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;border:2px solid transparent;}
.pending-tag.PEGA{background:rgba(16,185,129,0.1);color:${C.green};border-color:rgba(16,185,129,0.25);}
.pending-tag.QA{background:rgba(6,182,212,0.1);color:${C.cyan};border-color:rgba(6,182,212,0.25);}
.pending-tag.ACM{background:rgba(249,115,22,0.1);color:${C.orange};border-color:rgba(249,115,22,0.25);}
.pending-role{font-weight:500;opacity:0.75;}

/* OBSERVER */
.po-observer{background:${C.offWhite};border:2px solid ${C.silver};border-radius:10px;padding:13px 18px;color:${C.slate};font-size:0.83rem;font-weight:500;}

/* HISTORY */
.history-panel{background:${C.white};border:2px solid ${C.silver};border-radius:14px;overflow:hidden;}
.panel-header{background:${C.purpleDark};padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}
.panel-title{font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:700;color:white;}
.history-row{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid ${C.silver}66;font-size:0.82rem;}
.history-row:last-child{border-bottom:none;}
.h-story{flex:1;color:${C.inkLight};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}
.h-squad-tags{display:flex;gap:6px;}
.h-sq{font-size:0.64rem;font-weight:700;padding:2px 8px;border-radius:5px;letter-spacing:0.04em;}
.h-sq.PEGA{background:rgba(16,185,129,0.1);color:${C.green};}
.h-sq.QA{background:rgba(6,182,212,0.1);color:${C.cyan};}
.h-sq.ACM{background:rgba(249,115,22,0.1);color:${C.orange};}
.h-agreed{font-family:'Inter',sans-serif;font-size:1rem;color:${C.purpleDark};font-weight:700;min-width:28px;text-align:right;}

/* SNAPSHOT */
.snap-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);}
.snap-modal{background:white;border-radius:20px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.3);}
.snap-modal-hdr{background:${C.purpleDark};padding:20px 26px;display:flex;align-items:center;justify-content:space-between;border-radius:20px 20px 0 0;}
.snap-modal-hdr h2{font-family:'Inter',sans-serif;color:white;font-size:1rem;font-weight:700;}
#snap-card{background:white;padding:30px;font-family:'Inter',sans-serif;}
.snap-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;padding-bottom:14px;border-bottom:2px solid ${C.silver};}
.snap-brand{display:flex;align-items:center;gap:10px;}
.snap-logo{width:36px;height:36px;background:${C.purpleDark};border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:800;}
.snap-brand-name{font-family:'Inter',sans-serif;color:${C.purpleDark};font-size:1rem;font-weight:800;letter-spacing:-0.02em;}
.snap-date{font-size:0.72rem;color:${C.slate};}
.snap-sl{font-size:0.64rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.slate};margin-bottom:6px;}
.snap-story{font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:600;color:${C.ink};margin-bottom:18px;padding:12px 16px;background:${C.purpleLight};border-left:4px solid ${C.purpleDark};border-radius:0 8px 8px 0;}
.snap-agreed-box{background:${C.purpleDark};border-radius:12px;padding:16px 22px;display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.snap-al{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7);}
.snap-av{font-family:'Inter',sans-serif;font-size:2.4rem;font-weight:800;color:white;line-height:1;}
.snap-squads{display:flex;flex-direction:column;gap:12px;}
.snap-squad{border:2px solid ${C.silver};border-radius:10px;overflow:hidden;}
.snap-sq-hdr{padding:10px 14px;font-size:0.72rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between;}
.snap-sq-hdr.PEGA{background:rgba(16,185,129,0.1);color:${C.green};}
.snap-sq-hdr.QA{background:rgba(6,182,212,0.1);color:${C.cyan};}
.snap-sq-hdr.ACM{background:rgba(249,115,22,0.1);color:${C.orange};}
.snap-sq-avg{font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:600;}
.snap-participants{padding:10px 14px;display:flex;flex-direction:column;gap:4px;}
.snap-p{display:flex;align-items:center;justify-content:space-between;font-size:0.82rem;padding:6px 8px;border-radius:6px;}
.snap-p:nth-child(odd){background:${C.offWhite};}
.snap-p-name{color:${C.inkLight};font-weight:600;}
.snap-p-role{color:${C.slate};font-size:0.7rem;}
.snap-p-vote{font-family:'Inter',sans-serif;font-size:0.95rem;color:${C.purpleDark};font-weight:700;min-width:32px;text-align:right;}
.snap-footer{margin-top:18px;padding-top:12px;border-top:2px solid ${C.silver};display:flex;justify-content:space-between;font-size:0.7rem;color:${C.steel};}
.snap-actions{padding:14px 26px 22px;display:flex;gap:10px;justify-content:flex-end;}

/* MODALS */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);}
.modal-box{background:white;border-radius:20px;padding:32px 28px;max-width:390px;width:100%;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.2);display:flex;flex-direction:column;gap:14px;}
.modal-icon{font-size:2.8rem;line-height:1;}
.modal-title{font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:700;color:${C.ink};}
.modal-body{font-size:0.85rem;color:${C.slate};line-height:1.65;}
.modal-actions{display:flex;gap:10px;margin-top:4px;}
.modal-actions .btn{flex:1;justify-content:center;}

/* MISC */
.error-box{background:${C.redLight};border:2px solid rgba(239,68,68,0.25);border-radius:10px;padding:12px 16px;color:${C.red};font-size:0.82rem;font-weight:500;}
.prefilled-banner{background:${C.purpleLight};border:2px solid rgba(99,102,241,0.2);border-radius:10px;padding:12px 16px;font-size:0.83rem;color:${C.purpleDark};line-height:1.55;font-weight:500;}
@keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
.slide-up{animation:slideUp 0.3s ease forwards;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.fade-in{animation:fadeIn 0.25s ease forwards;}
.pulse{animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
.notif-container{position:fixed;bottom:20px;right:20px;z-index:500;display:flex;flex-direction:column;gap:8px;align-items:flex-end;}
.notif{background:${C.white};border:1px solid ${C.silver};border-radius:10px;padding:10px 14px;box-shadow:0 4px 16px rgba(0,0,0,0.1);font-size:0.82rem;font-weight:500;color:${C.inkLight};display:flex;align-items:center;gap:8px;min-width:200px;max-width:280px;animation:notifIn 0.3s ease forwards;}
.notif.leaving{animation:notifOut 0.3s ease forwards;}
.notif-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
@keyframes notifIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
@keyframes notifOut{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(20px);}}
@media(max-width:600px){.main{padding:14px 12px 60px;}.role-grid{grid-template-columns:repeat(2,1fr);}.snap-av{font-size:2rem;}.modal-actions{flex-direction:column;}.notif-container{bottom:12px;right:12px;}}
`;

// ── HELPERS ──────────────────────────────────────────────────
function genId() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2;
}
function avg(nums) {
  if (!nums.length) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}
function squadStats(players, squad, revealed) {
  if (!revealed) return null;
  const votes = Object.values(players)
    .filter(p => p.squad === squad && p.vote !== null)
    .map(p => parseFloat(p.vote)).filter(v => !isNaN(v));
  return { avg: avg(votes), median: median(votes), count: votes.length };
}
async function fetchRoom(id) {
  const { data, error } = await supabase.from("rooms").select("data").eq("id", id).single();
  if (error) return null;
  return data?.data || null;
}
async function upsertRoom(id, roomData) {
  await supabase.from("rooms").upsert({ id, data: roomData, updated_at: new Date().toISOString() });
}

// ── SNAPSHOT ─────────────────────────────────────────────────
function SnapshotModal({ room, onClose }) {
  const snapRef = useRef(null);
  function printSnap() {
    const el = snapRef.current; if (!el) return;
    const w = window.open("", "_blank", "width=700,height=900");
    w.document.write(`<html><head><title>Estimation Snapshot</title><style>body{margin:0;font-family:sans-serif;}</style></head><body>${el.outerHTML}</body></html>`);
    w.document.close(); setTimeout(() => w.print(), 600);
  }
  const players = room.players || {};
  const story = room.story || "(No story set)";
  const squadAgreedPoints = room.squadAgreedPoints || {};
  const date = new Date().toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" });
  const squadsWithVotes = SQUADS.filter(sq => Object.values(players).some(p => p.squad === sq && p.vote !== null));
  return (
    <div className="snap-overlay fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="snap-modal slide-up">
        <div className="snap-modal-hdr">
          <h2>📸 Estimation Snapshot</h2>
          <button className="btn btn-ghost" style={{ color: "rgba(255,255,255,0.75)" }} onClick={onClose}>✕ Close</button>
        </div>
        <div id="snap-card" ref={snapRef}>
          <div className="snap-hdr">
            <div className="snap-brand"><div className="snap-logo">P</div><div className="snap-brand-name">Planit Poker 🃏</div></div>
            <div className="snap-date">{date}</div>
          </div>
          <div className="snap-sl">Story / Feature</div>
          <div className="snap-story">{story}</div>
          <div className="snap-agreed-box">
            <div>
              <div className="snap-al">Agreed Story Points</div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
                {SQUADS.map(sq => squadAgreedPoints[sq] ? (
                  <div key={sq} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{sq}</div>
                    <div style={{ fontFamily: 'Inter',sans-serif, fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{squadAgreedPoints[sq]}</div>
                  </div>
                ) : null)}
                {!SQUADS.some(sq => squadAgreedPoints[sq]) && <div className="snap-av" style={{ opacity: 0.5, fontSize: "1.8rem" }}>Not set yet</div>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Squads</div>
              <div style={{ display: "flex", gap: 5 }}>
                {squadsWithVotes.map(sq => <span key={sq} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 5, padding: "2px 8px", fontSize: "0.7rem", color: "white", fontWeight: 700 }}>{sq}</span>)}
              </div>
            </div>
          </div>
          <div className="snap-squads">
            {SQUADS.map(sq => {
              const stats = squadStats(players, sq, true);
              const sqPlayers = Object.entries(players).filter(([, p]) => p.squad === sq).sort((a, b) => a[1].name.localeCompare(b[1].name));
              if (sqPlayers.length === 0) return null;
              return (
                <div key={sq} className="snap-squad">
                  <div className={`snap-sq-hdr ${sq}`}>
                    <span>{sq} Squad</span>
                    <span className="snap-sq-avg">Avg: {stats?.avg ?? "—"} · Median: {stats?.median ?? "—"}</span>
                  </div>
                  <div className="snap-participants">
                    {sqPlayers.map(([pid, p]) => (
                      <div key={pid} className="snap-p">
                        <div><span className="snap-p-name">{p.name}</span><span className="snap-p-role"> · {p.role}</span></div>
                        <div className="snap-p-vote">{p.vote ?? "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="snap-footer"><span>Made with Planit Poker 🃏</span><span>Points = vibes, not promises 😄</span></div>
        </div>
        <div className="snap-actions">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={printSnap}>🖨 Print / Save PDF</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function PlanningPoker() {
  const [screen, setScreen] = useState("home");
  const [myName, setMyName] = useState("");
  const [myRole, setMyRole] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [myId] = useState(() => genId() + genId());
  const [room, setRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [storyInput, setStoryInput] = useState("");
  const [editingStory, setEditingStory] = useState(false);
  const [activeSquad, setActiveSquad] = useState(null);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [isNewCreator, setIsNewCreator] = useState(false);
  const [originalCreatorReclaimed, setOriginalCreatorReclaimed] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCreatorWelcome, setShowCreatorWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  function handleCardMouseEnter(val, e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCard(val);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom + 12 });
  }
  function handleCardMouseLeave() { setHoveredCard(null); }
  const [notifications, setNotifications] = useState([]);
  const prevPlayersRef = useRef(null);

  function addNotif(msg, color) {
    const id = Date.now() + Math.random();
    setNotifications(n => [...n, { id, msg, color, leaving: false }]);
    setTimeout(() => {
      setNotifications(n => n.map(x => x.id === id ? { ...x, leaving: true } : x));
      setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 320);
    }, 3500);
  }

  // Detect join/leave events by diffing players
  useEffect(() => {
    if (!room || !roomId) return;
    const prev = prevPlayersRef.current;
    const curr = room.players || {};
    if (prev !== null) {
      // Someone joined
      for (const [pid, p] of Object.entries(curr)) {
        if (!prev[pid] && pid !== myId) addNotif(`${p.name} joined (${p.role}) 👋`, ROLE_COLORS[p.role]?.bg || "#6366F1");
      }
      // Someone left
      for (const [pid, p] of Object.entries(prev)) {
        if (!curr[pid] && pid !== myId) addNotif(`${p.name} (${p.role}) left the room 👋`, "#9CA3AF");
      }
    }
    prevPlayersRef.current = curr;
  }, [room?.players]);

  // Read ?room= from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rp = params.get("room");
    if (rp) setRoomInput(rp.toUpperCase());
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase.channel(`room-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => { if (payload.new?.data) setRoom(payload.new.data); })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") { const r = await fetchRoom(roomId); if (r) setRoom(r); }
      });
    const fallback = setInterval(async () => { const r = await fetchRoom(roomId); if (r) setRoom(r); }, 3000);
    return () => { supabase.removeChannel(channel); clearInterval(fallback); };
  }, [roomId]);

  const mutateRoom = useCallback(async (updater) => {
    const current = await fetchRoom(roomId);
    const next = updater(current || {});
    setRoom(next);
    await upsertRoom(roomId, next);
  }, [roomId]);

  async function createRoom() {
    if (!myName.trim() || !myRole) return;
    setLoading(true); setError("");
    const id = genId();
    const effectiveSquad = myRole === "PO" ? null : myRole;
    const creatorKey = `${myName.trim().toLowerCase()}:${myRole}`;
    const initial = {
      id, story: "", revealed: false, votingStarted: false,
      agreedPoints: null, squadAgreedPoints: {},
      creatorId: myId, originalCreatorId: myId, originalCreatorKey: creatorKey,
      players: { [myId]: { name: myName.trim(), role: myRole, squad: effectiveSquad, vote: null, joinedAt: Date.now() } },
      history: [],
    };
    try {
      await upsertRoom(id, initial);
      setActiveSquad(effectiveSquad || "PEGA"); setRoomId(id); setRoom(initial); setScreen("game"); setShowCreatorWelcome(true);
      window.history.replaceState(null, "", `?room=${id}`);
    } catch { setError("Couldn't create the room — check your connection and try again!"); }
    setLoading(false);
  }

  const [roomCodeError, setRoomCodeError] = useState("");

  async function joinRoom() {
    if (!myName.trim() || !myRole || !roomInput.trim()) return;
    setLoading(true); setError(""); setRoomCodeError("");
    const id = roomInput.trim().toUpperCase();
    const effectiveSquad = myRole === "PO" ? null : myRole;
    try {
      const r = await fetchRoom(id);
      if (!r) {
        setRoomCodeError(`Room "${id}" doesn't exist. Check the code and try again!`);
        setLoading(false);
        return;
      }
      // Check for duplicate name:role combo (excluding own myId in case of rejoin)
      const dupKey = `${myName.trim().toLowerCase()}:${myRole}`;
      const duplicate = Object.entries(r.players || {}).find(([pid, p]) =>
        pid !== myId && `${p.name.toLowerCase()}:${p.role}` === dupKey
      );
      if (duplicate) {
        setRoomCodeError(`"${myName.trim()}" as ${myRole} is already in this room. Try a different name or role.`);
        setLoading(false);
        return;
      }
      r.players[myId] = { name: myName.trim(), role: myRole, squad: effectiveSquad, vote: null, joinedAt: Date.now() };
      const joiningKey = `${myName.trim().toLowerCase()}:${myRole}`;
      if (r.originalCreatorKey && joiningKey === r.originalCreatorKey && r.creatorId !== myId) r.creatorId = myId;
      await upsertRoom(id, r);
      setActiveSquad(effectiveSquad || "PEGA"); setRoomId(id); setRoom(r); setScreen("game");
      window.history.replaceState(null, "", `?room=${id}`);
    } catch { setError("Something went wrong — check your connection and try again."); }
    setLoading(false);
  }

  async function castVote(val) {
    if (room?.revealed || myRole === "PO") return;
    setRoom(r => ({ ...r, players: { ...r.players, [myId]: { ...r.players[myId], vote: val } } }));
    const current = await fetchRoom(roomId); if (!current) return;
    await upsertRoom(roomId, { ...current, players: { ...current.players, [myId]: { ...current.players[myId], vote: val } } });
  }

  async function startVoting() {
    await mutateRoom(r => ({ ...r, votingStarted: true, votingStartedAt: Date.now() }));
  }

  useEffect(() => {
    if (!room?.votingStarted || !room?.votingStartedAt || room?.revealed) { setCountdown(null); return; }
    function tick() { setCountdown(Math.max(0, 15 - Math.floor((Date.now() - room.votingStartedAt) / 1000))); }
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [room?.votingStarted, room?.votingStartedAt, room?.revealed]);

  async function revealVotes() { await mutateRoom(r => ({ ...r, revealed: true })); }

  async function setSquadAgreedPoints(squad, val) {
    await mutateRoom(r => {
      const squadAgreedPoints = { ...(r.squadAgreedPoints || {}) };
      squadAgreedPoints[squad] = squadAgreedPoints[squad] === val ? null : val;
      return { ...r, squadAgreedPoints };
    });
  }

  async function newRound() {
    await mutateRoom(r => {
      const numericVotes = Object.values(r.players).map(p => parseFloat(p.vote)).filter(v => !isNaN(v));
      const squads = {};
      SQUADS.forEach(sq => { const s = squadStats(r.players, sq, true); if (s && s.count > 0) squads[sq] = s; });
      const history = r.revealed && r.story
        ? [{ story: r.story, squadAgreedPoints: r.squadAgreedPoints || {}, avg: avg(numericVotes), squads, ts: Date.now() }, ...(r.history || [])].slice(0, 10)
        : (r.history || []);
      const players = {};
      for (const [pid, p] of Object.entries(r.players)) players[pid] = { ...p, vote: null };
      return { ...r, story: "", revealed: false, votingStarted: false, agreedPoints: null, squadAgreedPoints: {}, players, history };
    });
    setStoryInput("");
  }

  async function setStory() { await mutateRoom(r => ({ ...r, story: storyInput.trim() })); setEditingStory(false); }

  const roomIdRef = useRef(roomId);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

  async function doLeave() {
    const rid = roomIdRef.current;
    if (!rid) { setRoomId(null); setRoom(null); setScreen("home"); return; }
    try {
      const current = await fetchRoom(rid);
      if (current) {
        const players = { ...current.players }; delete players[myId];
        let newCreatorId = current.creatorId;
        if (current.creatorId === myId) {
          const remaining = Object.entries(players).sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0));
          newCreatorId = remaining.length > 0 ? remaining[0][0] : null;
        }
        await upsertRoom(rid, { ...current, players, creatorId: newCreatorId });
      }
    } catch(e) { console.error("leaveRoom error", e); }
    setRoomId(null); setRoom(null); setScreen("home"); setShowLeaveConfirm(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function leaveRoom() { setShowLeaveConfirm(true); }

  // Detect creator changes
  const prevCreatorIdRef = useRef(null);
  useEffect(() => {
    if (!room || !roomId) return;
    const prevId = prevCreatorIdRef.current;
    const currId = room.creatorId;
    if (currId === myId && prevId !== null && prevId !== myId) setIsNewCreator(true);
    if (prevId === myId && currId !== null && currId !== myId) setOriginalCreatorReclaimed(true);
    prevCreatorIdRef.current = currId;
  }, [room?.creatorId]);

  // Keep a snapshot of the latest room data for use in beforeunload
  const roomSnapshotRef = useRef(null);
  useEffect(() => { roomSnapshotRef.current = room; }, [room]);

  // Tab/browser close — use keepalive fetch to PATCH Supabase directly
  useEffect(() => {
    if (!roomId) return;
    const handleUnload = () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) return;
      const currentRoom = roomSnapshotRef.current;
      if (!currentRoom) return;
      // Remove self from players
      const players = { ...currentRoom.players };
      delete players[myId];
      // Hand off creator if needed
      let creatorId = currentRoom.creatorId;
      if (creatorId === myId) {
        const remaining = Object.entries(players).sort((a, b) => (a[1].joinedAt||0)-(b[1].joinedAt||0));
        creatorId = remaining.length > 0 ? remaining[0][0] : null;
      }
      const updatedData = { ...currentRoom, players, creatorId };
      // Use keepalive fetch — fires reliably on tab close
      fetch(`${supabaseUrl}/rest/v1/rooms?id=eq.${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ data: updatedData, updated_at: new Date().toISOString() }),
        keepalive: true,
      });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [roomId, myId]);

  function copyRoomId() { navigator.clipboard.writeText(roomId).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  function shareUrl() {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000);
  }

  // Computed
  const players = room?.players || {};
  const me = players[myId];
  const myVote = me?.vote ?? null;
  const revealed = room?.revealed || false;
  const effectiveSquad = myRole === "PO" ? null : myRole;
  const resolvedSquad = activeSquad || "PEGA";
  const squadPlayers = Object.entries(players).filter(([, p]) => p.squad === resolvedSquad);
  const anyVoted = Object.values(players).some(p => p.vote !== null);
  const activeStats = squadStats(players, resolvedSquad, revealed);
  const voteCounts = revealed
    ? Object.values(players).filter(p => p.squad === resolvedSquad)
        .reduce((acc, p) => { if (p.vote !== null) acc[p.vote] = (acc[p.vote] || 0) + 1; return acc; }, {})
    : {};
  const squadComplete = sq => revealed && Object.values(players).some(p => p.squad === sq && p.vote !== null);
  const isPO = myRole === "PO";
  const hasDevJoined = Object.values(players).some(p => ["PEGA","QA","ACM"].includes(p.role) && p.squad !== null);
  const isMySquadTab = effectiveSquad === resolvedSquad;
  const isCreator = room?.creatorId === myId;
  const canControl = isCreator || isPO;
  const votingStarted = room?.votingStarted || false;
  const squadAgreedPoints = room?.squadAgreedPoints || {};
  const SQUAD_ORDER = { PEGA: 0, QA: 1, ACM: 2 };
  const pendingVoters = Object.values(players)
    .filter(p => p.role !== "PO" && p.vote === null)
    .sort((a, b) => { const sa = SQUAD_ORDER[a.squad] ?? 99, sb = SQUAD_ORDER[b.squad] ?? 99; return sa !== sb ? sa - sb : a.name.localeCompare(b.name); });

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-logo">Planit<span> Poker</span></div>
          </div>
          <div className="nav-right">
            {screen === "game" && me && (
              <>
                <button className="btn btn-danger" onClick={leaveRoom}>Peace out ✌️</button>
              </>
            )}
          </div>
        </nav>

        <div className="main">
          {/* ── HOME ── */}
          {screen === "home" && (
            <div className="setup-container slide-up">
              <div className="setup-hero">
                <h1>Estimate together,<br /><em>ship with confidence.</em></h1>
                <p>Because "how long will this take?" deserves a real answer — from the whole team. 1 point = 1 man-day. 🙌</p>
              </div>
              <div className="setup-card">
                <div className="sc-header">
                  <h2>{roomInput ? "🎉 You're invited!" : "Jump in!"}</h2>
                  <p>{roomInput ? `Room ${roomInput} is waiting for you` : "Create a room or join one with a code"}</p>
                </div>
                <div className="sc-body">
                  {error && <div className="error-box">😬 {error}</div>}
                  {roomInput && (
                    <div className="prefilled-banner fade-in">
                      🎉 You've been invited to room <strong>{roomInput}</strong> — fill in your name and role to jump in!
                    </div>
                  )}
                  <div className="field">
                    <div className="label">Your Name</div>
                    <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="e.g. Sarah, the QA wizard 🧙" autoFocus />
                  </div>
                  <div className="field">
                    <div className="label">Your Role</div>
                    <div className="role-grid">
                      {ROLES.map(r => (
                        <div key={r} style={{ "--role-color": ROLE_COLORS[r]?.bg, "--role-glow": ROLE_COLORS[r]?.bgGlow }}
                          className={`role-pill ${myRole === r ? "selected" : ""}`}
                          onClick={() => setMyRole(r)}>{r}</div>
                      ))}
                    </div>
                  </div>
                  {myRole && myRole !== "PO" && (
                    <div className="fade-in" style={{ fontSize: "0.8rem", color: ROLE_COLORS[myRole]?.bg, background: ROLE_COLORS[myRole]?.bgLight, padding: "10px 14px", borderRadius: 10, border: `2px solid ${ROLE_COLORS[myRole]?.bg}33`, fontWeight: 600 }}>
                      You'll be voting with the <strong>{myRole}</strong> squad. Let's goooo 🚀
                    </div>
                  )}
                  {myRole === "PO" && (
                    <div className="fade-in" style={{ fontSize: "0.8rem", color: C.purple, background: C.purpleLight, padding: "10px 14px", borderRadius: 10, border: `2px solid rgba(124,58,237,0.2)`, fontWeight: 600 }}>
                      PO mode 🎯 — you're the referee. Watch the chaos, pick the number.
                    </div>
                  )}
                  {!roomInput ? (
                    <>
                      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={createRoom}
                        disabled={!myName.trim() || !myRole || loading}>
                        {loading ? "Spinning up..." : "🚀 Create New Room"}
                      </button>
                      <div className="divider">already have a code?</div>
                      <div className="field">
                        <div className="label">Room Code</div>
                        <input value={roomInput} onChange={e => { setRoomInput(e.target.value.toUpperCase()); setRoomCodeError(""); }}
                          placeholder="Paste code here, e.g. A1B2C3" maxLength={12}
                          style={roomCodeError ? {"borderColor": C.red, "boxShadow": `0 0 0 3px rgba(239,68,68,0.12)`} : {}}
                          onKeyDown={e => e.key === "Enter" && joinRoom()} />
                      {roomCodeError && <div style={{fontSize:"0.78rem",color:C.red,fontWeight:500,marginTop:2}}>❌ {roomCodeError}</div>}
                      </div>
                      <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={joinRoom}
                        disabled={!myName.trim() || !myRole || !roomInput.trim() || loading}>
                        {loading ? "Joining..." : "Join Room →"}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="field">
                        <div className="label">Room Code</div>
                        <input value={roomInput} onChange={e => { setRoomInput(e.target.value.toUpperCase()); setRoomCodeError(""); }}
                          placeholder="e.g. A1B2C3" maxLength={12}
                          style={roomCodeError ? {"borderColor": C.red, "boxShadow": `0 0 0 3px rgba(239,68,68,0.12)`} : {}}
                          onKeyDown={e => e.key === "Enter" && joinRoom()} />
                      {roomCodeError && <div style={{fontSize:"0.78rem",color:C.red,fontWeight:500,marginTop:2}}>❌ {roomCodeError}</div>}
                      </div>
                      <button className="btn btn-fun" style={{ width: "100%", justifyContent: "center" }} onClick={joinRoom}
                        disabled={!myName.trim() || !myRole || !roomInput.trim() || loading}>
                        {loading ? "Jumping in..." : "🎉 Jump into the Room!"}
                      </button>
                      <div className="divider">or</div>
                      <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setRoomInput(""); createRoom(); }}
                        disabled={!myName.trim() || !myRole || loading}>
                        {loading ? "Creating..." : "Start a fresh room"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── GAME ── */}
          {screen === "game" && room && (
            <>
              <div style={{
                "--role-color": ROLE_COLORS[myRole]?.bg || C.purpleDark,
                "--role-gradient": ROLE_COLORS[myRole]?.gradient || C.purpleDark,
                "--role-glow": ROLE_COLORS[myRole]?.bgGlow || C.purpleGlow,
                "--role-bg-light": ROLE_COLORS[myRole]?.bgLight || C.purpleLight,
                display: "contents",
              }}>
              <div className="room-bar slide-up">
                {/* Top row: room code + actions */}
                <div className="room-bar-top">
                  <div className="room-info">
                    <div className="room-code">
                      <div className="lbl">Room</div>
                      <div className="val">{roomId}</div>
                      <button className="copy-btn" onClick={copyRoomId}>{copied ? "✓" : "Copy"}</button>
                    </div>
                    <button className="btn btn-share" onClick={shareUrl}>
                      {copiedUrl ? "✓ Copied!" : "🔗 Invite"}
                    </button>
                  </div>
                  <div className="room-meta">
                    <span>{Object.keys(players).length} in room</span>
                    <span className="room-meta-divider">·</span>
                    {room?.creatorId && players[room.creatorId] ? (
                      <span>👑 {isCreator ? <strong style={{color: C.inkLight}}>You're the creator</strong> : <><strong style={{color: C.inkLight}}>{players[room.creatorId].name}</strong> is the creator</>}</span>
                    ) : null}
                  </div>
                </div>
                {/* Bottom row: your identity + snapshot */}
                <div className="room-bar-bottom">
                  <div className="me-badge">
                    <span style={{ fontWeight: 600 }}>{me?.name}</span>
                    <span className={`role-tag ${myRole}`}>{myRole}</span>
                    {isCreator && <span className="creator-tag">👑 Creator</span>}
                  </div>
                  {revealed && <button className="btn btn-snap" onClick={() => setShowSnapshot(true)}>📸 Snapshot</button>}
                </div>
              </div>

              {/* Modals */}
              {showLeaveConfirm && (
                <div className="modal-overlay fade-in">
                  <div className="modal-box slide-up">
                    <div className="modal-icon">🏃💨</div>
                    <div className="modal-title">Bailing already?</div>
                    <div className="modal-body">
                      Your team might miss you! Are you sure you want to leave this session? {isCreator && "You're the creator — someone else will take over. 👑"}
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-outline" onClick={() => setShowLeaveConfirm(false)}>Nah, I'll stay 😅</button>
                      <button className="btn" style={{background:C.red,color:"white",flex:1,justifyContent:"center"}} onClick={doLeave}>Yeah, I'm out ✌️</button>
                    </div>
                  </div>
                </div>
              )}
              {originalCreatorReclaimed && (
                <div className="modal-overlay fade-in">
                  <div className="modal-box slide-up">
                    <div className="modal-icon">🫡</div>
                    <div className="modal-title">The OG is back in town</div>
                    <div className="modal-body">The original creator just walked back in and reclaimed their throne. You were a fantastic temp — truly — but the crown goes back where it belongs. Carry on, soldier! 👑</div>
                    <div className="modal-actions">
                      <button className="btn btn-outline" style={{ justifyContent: "center" }} onClick={() => setOriginalCreatorReclaimed(false)}>Fair enough 😄</button>
                    </div>
                  </div>
                </div>
              )}
              {isNewCreator && (
                <div className="modal-overlay fade-in">
                  <div className="modal-box slide-up">
                    <div className="modal-icon">👑</div>
                    <div className="modal-title">You're the boss now!</div>
                    <div className="modal-body">The previous creator dipped and you've been promoted! You can now set the story, fire the starting gun, and reveal those spicy votes. Don't let the power go to your head... or do. 😈</div>
                    <div className="modal-actions">
                      <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => setIsNewCreator(false)}>Let's gooo 🚀</button>
                    </div>
                  </div>
                </div>
              )}

              {showCreatorWelcome && (
                <div className="modal-overlay fade-in">
                  <div className="modal-box slide-up" style={{maxWidth:420,textAlign:"left"}}>
                    <div className="modal-icon" style={{textAlign:"center"}}>🎯</div>
                    <div className="modal-title" style={{textAlign:"center"}}>Room created! Here's how to get started</div>
                    <div style={{display:"flex",flexDirection:"column",gap:14,margin:"4px 0"}}>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{background:C.purpleLight,color:C.purpleDark,borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",flexShrink:0}}>1</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:"0.88rem",color:C.ink,marginBottom:2}}>Set the story title</div>
                          <div style={{fontSize:"0.82rem",color:C.slate,lineHeight:1.5}}>Enter the name of the feature or story your team will be estimating. Be specific so everyone's on the same page.</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{background:C.purpleLight,color:C.purpleDark,borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",flexShrink:0}}>2</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:"0.88rem",color:C.ink,marginBottom:2}}>Share the invite link</div>
                          <div style={{fontSize:"0.82rem",color:C.slate,lineHeight:1.5}}>Click <strong>🔗 Invite</strong> to copy a link and send it to your team. At least one engineer from PEGA, QA or ACM must join before voting can begin.</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{background:C.purpleLight,color:C.purpleDark,borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",flexShrink:0}}>3</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:"0.88rem",color:C.ink,marginBottom:2}}>Start voting when ready</div>
                          <div style={{fontSize:"0.82rem",color:C.slate,lineHeight:1.5}}>Once the story is set and at least one dev has joined, hit <strong>🎲 Start Voting</strong> to kick things off. Votes stay hidden until you reveal them.</div>
                        </div>
                      </div>
                    </div>
                    <div style={{background:C.purpleLight,borderRadius:8,padding:"10px 14px",fontSize:"0.78rem",color:C.purpleDark,lineHeight:1.5,marginTop:4}}>
                      💡 <strong>Remember:</strong> 1 point = 1 man-day. Points reflect both effort and complexity — not just time.
                    </div>
                    <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={() => setShowCreatorWelcome(false)}>
                      Got it, let's go! 🚀
                    </button>
                  </div>
                </div>
              )}

              {/* Story */}
              <div className="story-panel slide-up">
                <div className="story-hdr">
                  <div className="story-hdr-title">🗒️ What are we estimating?</div>
                  {room.story && !editingStory && canControl && (
                    <button className="btn btn-ghost" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem" }}
                      onClick={() => { setStoryInput(room.story); setEditingStory(true); }}>Edit ✏️</button>
                  )}
                </div>
                <div className="story-body">
                  {(editingStory || !room.story) && canControl ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      <input value={storyInput} onChange={e => setStoryInput(e.target.value)}
                        placeholder="Drop the story title here..." autoFocus
                        onKeyDown={e => { if (e.key === "Enter") setStory(); if (e.key === "Escape") setEditingStory(false); }} />
                      <button className="btn btn-primary" onClick={setStory} disabled={!storyInput.trim()}>Set it!</button>
                      {room.story && <button className="btn btn-outline" onClick={() => setEditingStory(false)}>✕</button>}
                    </div>
                  ) : room.story ? (
                    <div className="story-text">{room.story}</div>
                  ) : (
                    <div style={{ color: C.steel, fontStyle: "italic", fontSize: "0.9rem" }}>⏳ Waiting for the creator to drop the story...</div>
                  )}
                </div>
              </div>

              {/* Squad Tabs */}
              <div className="squad-tabs slide-up">
                {SQUADS.map(sq => (
                  <button key={sq} className={`squad-tab ${resolvedSquad === sq ? "active" : ""} ${squadComplete(sq) ? "complete" : ""}`}
                    onClick={() => setActiveSquad(sq)}>
                    {sq}{squadComplete(sq) && <span className="tab-check">✓</span>}
                    <span style={{ fontSize: "0.62rem", marginLeft: 4, opacity: 0.6 }}>({Object.values(players).filter(p => p.squad === sq).length})</span>
                  </button>
                ))}
              </div>

              {/* Players */}
              <div className="slide-up">
                <div className="section-label">{resolvedSquad} Crew</div>
                {squadPlayers.length === 0 ? (
                  <div style={{ color: C.steel, fontSize: "0.83rem", padding: "12px 0" }}>👻 No {resolvedSquad} folks yet — share the invite link!</div>
                ) : (
                  <div className="players-grid">
                    {squadPlayers.map(([pid, p]) => (
                      <div key={pid}
                        style={{
                          "--squad-color": ROLE_COLORS[p.squad]?.bg || C.green,
                          "--squad-bg": ROLE_COLORS[p.squad]?.bgLight || C.greenLight,
                          "--squad-gradient": ROLE_COLORS[p.squad]?.squadGradient || `linear-gradient(135deg,${C.green},#059669)`,
                          "--squad-glow": ROLE_COLORS[p.squad]?.bgGlow || "rgba(16,185,129,0.2)",
                          "--squad-color-alpha": (ROLE_COLORS[p.squad]?.bg || C.green) + "30",
                        }}
                        className={`player-tile ${p.vote && !revealed ? "voted" : ""} ${p.vote && revealed ? "revealed-tile" : ""} ${pid === myId ? "me-tile" : ""}`}>
                        <div className="player-name">{p.name}{pid === myId ? " ⭐" : ""}</div>
                        <span className={`p-role-tag ${p.role}`}>{p.role}</span>
                        <div className={`card-slot ${p.vote === null ? "empty" : revealed ? "revealed-val" : "voted-hidden"}`}>
                          {revealed && p.vote !== null ? p.vote : ""}
                        </div>
                        {p.vote !== null && !revealed && <span className="status-badge badge-voted-s"><span className="badge-dot" />voted!</span>}
                        {p.vote === null && votingStarted && !revealed && <span className="status-badge badge-waiting pulse"><span className="badge-dot" />thinking...</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Results */}
              {revealed && activeStats && activeStats.count > 0 && (
                <div className="results-banner slide-up">
                  <div className="result-stat"><div className="result-val">{activeStats.avg}</div><div className="result-lbl">Average</div></div>
                  <div className="result-stat"><div className="result-val">{activeStats.median}</div><div className="result-lbl">Median</div></div>
                  <div className="vote-chips">
                    {Object.entries(voteCounts).sort((a, b) => b[1] - a[1]).map(([v, c]) => (
                      <div key={v} className="vote-chip">{v} <span className="cnt">×{c}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agreed Points */}
              {revealed && (
                <div className="agreed-squads-section slide-up">
                  <div className="section-label">Lock in the points 🔒</div>
                  {SQUADS.map(sq => {
                    const sqHasVotes = Object.values(players).some(p => p.squad === sq && p.vote !== null);
                    if (!sqHasVotes) return null;
                    return (
                      <div key={sq} className="agreed-squad-row">
                        <div className={`agreed-squad-label ${sq}`}>{sq}</div>
                        <div className="agreed-chips">
                          {FIBONACCI.filter(v => v !== "?").map(v => (
                            <div key={v} className={`agreed-chip ${squadAgreedPoints[sq] === v ? "selected" : ""} ${!canControl ? "readonly" : ""}`}
                              onClick={() => canControl && setSquadAgreedPoints(sq, v)}>{v}</div>
                          ))}
                        </div>
                        {squadAgreedPoints[sq] && <span className="agreed-confirmed">✅ {squadAgreedPoints[sq]} pts locked!</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Countdown Timer */}
              {votingStarted && !revealed && countdown !== null && (
                <div className="countdown-wrap slide-up">
                  <div className={`countdown-badge ${countdown <= 5 ? "urgent" : ""}`}>
                    {countdown <= 5 ? "⚡" : "⏱"} {countdown}s
                  </div>
                  <div className="countdown-bar-wrap">
                    <div className="countdown-bar" style={{ width: `${(countdown / 15) * 100}%`, background: countdown <= 5 ? C.red : "var(--role-color," + C.purple + ")" }} />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="controls-row slide-up">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {!votingStarted && canControl && (
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <button className="btn btn-fun" onClick={startVoting}
                        disabled={!room?.story || (isPO && !hasDevJoined)}>
                        🎲 Start Voting!
                      </button>
                      {isPO && !hasDevJoined && (
                        <div style={{fontSize:"0.71rem",color:C.steel,fontStyle:"italic",letterSpacing:"0.01em"}}>
                          Waiting on at least one dev to join
                        </div>
                      )}
                      {!room?.story && hasDevJoined && (
                        <div style={{fontSize:"0.71rem",color:C.steel,fontStyle:"italic",letterSpacing:"0.01em"}}>
                          Set a story title first
                        </div>
                      )}
                    </div>
                  )}
                  {!votingStarted && !canControl && (
                    <div className="po-observer">⏳ Waiting for the creator to kick things off...</div>
                  )}
                  {votingStarted && !revealed && canControl && (
                    <button className="btn btn-reveal" onClick={revealVotes} disabled={!anyVoted}>
                      {anyVoted ? "🔥 Reveal the Cards!" : "⏳ Waiting on votes..."}
                    </button>
                  )}
                  {votingStarted && !revealed && !canControl && (
                    <div className="po-observer">🃏 Voting is live — pick your card below!</div>
                  )}
                  {revealed && canControl && (
                    <button className="btn btn-fun" onClick={newRound}>🔄 Next Round!</button>
                  )}
                </div>
                {revealed && <button className="btn btn-snap" onClick={() => setShowSnapshot(true)}>📸 Snapshot</button>}
              </div>

              {/* Voting Cards */}
              {!revealed && !isPO && isMySquadTab && votingStarted && (
                <div className="voting-panel slide-up">
                  <div className="voting-hdr">
                    <div className="voting-title">🃏 Your Turn — {resolvedSquad}</div>
                    {myVote && <div className="your-vote">You picked: {myVote}</div>}
                  </div>
                  <div className="cards-row">
                    {FIBONACCI.map(val => (
                      <div key={val} className="card-wrap"
                        onMouseEnter={e => handleCardMouseEnter(val, e)}
                        onMouseLeave={handleCardMouseLeave}>
                        <div className={`vote-card ${myVote === val ? "selected" : ""}`} onClick={() => castVote(val)}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Voters */}
              {!revealed && votingStarted && pendingVoters.length > 0 && (
                <div className="pending-box slide-up">
                  <div className="pending-title">👀 Still waiting on these folks:</div>
                  <div className="pending-list">
                    {pendingVoters.map((p, i) => (
                      <span key={i} className={`pending-tag ${p.squad || "PEGA"}`}>{p.name} <span className="pending-role">· {p.role}</span></span>
                    ))}
                  </div>
                </div>
              )}

              {!revealed && isPO && votingStarted && (
                <div className="po-observer">👁️ In stealth mode — watching everyone's poker face. Votes hidden until reveal!</div>
              )}
              {!revealed && !isPO && !isMySquadTab && votingStarted && (
                <div className="po-observer">👆 Switch to the <strong>{effectiveSquad}</strong> tab to cast your vote!</div>
              )}

              {/* History */}
              {(room.history || []).length > 0 && (
                <div className="history-panel slide-up">
                  <div className="panel-header"><div className="panel-title">📜 Round History</div></div>
                  {room.history.map((h, i) => (
                    <div key={i} className="history-row">
                      <div className="h-story">{h.story || "(untitled round)"}</div>
                      <div className="h-squad-tags">
                        {Object.keys(h.squads || {}).map(sq => (
                          <span key={sq} className={`h-sq ${sq}`}>{sq}: {h.squads[sq].avg}</span>
                        ))}
                      </div>
                      <div className="h-agreed">{h.agreedPoints ?? "—"}</div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </>
          )}
        </div>
      </div>

      {showSnapshot && room && <SnapshotModal room={room} onClose={() => setShowSnapshot(false)} />}
      {hoveredCard && CARD_INFO[hoveredCard] && (
        <div className="card-tooltip-fixed" style={{
          left: Math.min(tooltipPos.x - 105, window.innerWidth - 230),
          top: tooltipPos.y,
        }}>
          <div className="card-tooltip-label">{CARD_INFO[hoveredCard].label}</div>
          <div className="card-tooltip-desc">{CARD_INFO[hoveredCard].desc}</div>
        </div>
      )}
      <div className="notif-container">
        {notifications.map(n => (
          <div key={n.id} className={`notif${n.leaving ? " leaving" : ""}`}>
            <div className="notif-dot" style={{ background: n.color }} />
            {n.msg}
          </div>
        ))}
      </div>
    </>
  );
}
