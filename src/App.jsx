import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

const FIBONACCI = ["?", "0", "0.5", "1", "2", "3", "5", "8", "13", "20", "☕"];
const SQUADS = ["RTIM", "QA", "ACM"];
const ROLES = ["PO", "RTIM", "QA", "ACM"];

const ROLE_COLORS = {
  PO:   { bg: "#003087", bgLight: "rgba(0,48,135,0.08)", bgGlow: "rgba(0,48,135,0.15)", border: "#003087", text: "#003087", gradient: "linear-gradient(135deg,#003087,#004DB3)", squadGradient: "linear-gradient(135deg,#003087,#004DB3)" },
  RTIM: { bg: "#00847F", bgLight: "rgba(0,132,127,0.08)", bgGlow: "rgba(0,132,127,0.15)", border: "#00847F", text: "#00847F", gradient: "linear-gradient(135deg,#00847F,#005F5B)", squadGradient: "linear-gradient(135deg,#00847F,#005F5B)" },
  QA:   { bg: "#1565C0", bgLight: "rgba(21,101,192,0.08)", bgGlow: "rgba(21,101,192,0.15)", border: "#1565C0", text: "#1565C0", gradient: "linear-gradient(135deg,#1565C0,#003087)", squadGradient: "linear-gradient(135deg,#1565C0,#003087)" },
  ACM:  { bg: "#c47f00", bgLight: "rgba(240,165,0,0.08)", bgGlow: "rgba(240,165,0,0.15)", border: "#c47f00", text: "#c47f00", gradient: "linear-gradient(135deg,#c47f00,#f0a500)", squadGradient: "linear-gradient(135deg,#c47f00,#f0a500)" },
};

const SC = {
  teal:"#00847F",tealDark:"#005F5B",tealLight:"#00A99D",tealGlow:"rgba(0,132,127,0.12)",
  blue:"#003087",blueMid:"#004DB3",blueLight:"#1565C0",
  white:"#FFFFFF",offWhite:"#F4F7FA",silver:"#E8EDF2",steel:"#C5CED8",slate:"#6B7A8D",
  ink:"#1A2B3C",inkLight:"#2D3F52",greenLight:"#E6F5F4",red:"#C0392B",redLight:"#FDECEA",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${SC.offWhite};color:${SC.ink};font-family:'DM Sans',sans-serif;min-height:100vh;}
.app{min-height:100vh;display:flex;flex-direction:column;align-items:center;background:${SC.offWhite};}
.nav{width:100%;background:${SC.blue};padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,48,135,0.25);}
.nav-brand{display:flex;align-items:center;gap:12px;}
.nav-logo{width:32px;height:32px;background:linear-gradient(135deg,${SC.teal},${SC.tealLight});border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:1rem;color:white;}
.nav-title{font-family:'DM Serif Display',serif;font-size:1.1rem;color:white;}
.nav-title span{color:${SC.tealLight};}
.nav-right{display:flex;align-items:center;gap:10px;}
.nav-badge{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:4px 12px;font-size:0.7rem;color:rgba(255,255,255,0.8);letter-spacing:0.05em;text-transform:uppercase;}
.main{width:100%;max-width:960px;padding:32px 20px 80px;display:flex;flex-direction:column;gap:20px;}
.panel{background:${SC.white};border:1px solid ${SC.silver};border-radius:12px;overflow:hidden;}
.panel-header{background:linear-gradient(135deg,${SC.blue},${SC.blueMid});padding:16px 24px;display:flex;align-items:center;justify-content:space-between;}
.panel-title{font-family:'DM Serif Display',serif;font-size:1rem;color:white;}
.setup-container{display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:24px;}
.setup-hero{text-align:center;max-width:440px;}
.setup-hero h1{font-family:'DM Serif Display',serif;font-size:2.2rem;color:${SC.blue};line-height:1.1;margin-bottom:8px;}
.setup-hero h1 em{color:${SC.teal};font-style:italic;}
.setup-hero p{color:${SC.slate};font-size:0.9rem;line-height:1.6;}
.setup-card{background:${SC.white};border:1px solid ${SC.silver};border-radius:16px;width:100%;max-width:460px;overflow:hidden;box-shadow:0 4px 24px rgba(0,48,135,0.08);}
.sc-header{background:linear-gradient(135deg,${SC.blue},${SC.blueMid});padding:20px 28px;}
.sc-header h2{font-family:'DM Serif Display',serif;font-size:1.1rem;color:white;}
.sc-header p{font-size:0.75rem;color:rgba(255,255,255,0.65);margin-top:2px;}
.sc-body{padding:28px;display:flex;flex-direction:column;gap:18px;}
.field{display:flex;flex-direction:column;gap:6px;}
.label{font-size:0.7rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${SC.slate};}
input,select{width:100%;background:${SC.offWhite};border:1.5px solid ${SC.silver};border-radius:8px;color:${SC.ink};font-family:'DM Sans',sans-serif;font-size:0.9rem;padding:10px 14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;-webkit-appearance:none;appearance:none;}
input:focus,select:focus{border-color:var(--role-color,${SC.teal});box-shadow:0 0 0 3px var(--role-glow,${SC.tealGlow});background:white;}
input::placeholder{color:${SC.steel};}
.role-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.role-pill{padding:10px 8px;border-radius:8px;border:1.5px solid ${SC.silver};background:${SC.offWhite};text-align:center;cursor:pointer;transition:all 0.15s;font-size:0.75rem;font-weight:600;color:${SC.slate};letter-spacing:0.03em;}
.role-pill:hover{border-color:var(--role-color,${SC.teal});color:var(--role-color,${SC.teal});}
.role-pill.selected{background:var(--role-color,${SC.teal});border-color:var(--role-color,${SC.teal});color:white;box-shadow:0 2px 8px var(--role-glow,rgba(0,132,127,0.3));}

.btn{padding:11px 22px;border-radius:8px;border:none;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all 0.15s;letter-spacing:0.02em;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;box-shadow:none!important;}
.btn-primary{background:linear-gradient(135deg,${SC.teal},${SC.tealDark});color:white;box-shadow:0 2px 8px rgba(0,132,127,0.3);}
.btn-primary:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,132,127,0.4);}
.btn-blue{background:linear-gradient(135deg,${SC.blue},${SC.blueMid});color:white;box-shadow:0 2px 8px rgba(0,48,135,0.25);}
.btn-blue:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,48,135,0.35);}
.btn-outline{background:transparent;color:${SC.slate};border:1.5px solid ${SC.silver};}
.btn-outline:not(:disabled):hover{border-color:${SC.teal};color:${SC.teal};}
.btn-ghost{background:transparent;color:${SC.slate};padding:6px 12px;font-size:0.75rem;}
.btn-ghost:hover{color:${SC.teal};}
.btn-danger{background:transparent;color:${SC.red};border:1.5px solid rgba(192,57,43,0.25);font-size:0.75rem;padding:6px 14px;}
.btn-danger:hover{background:${SC.redLight};}
.btn-snap{background:linear-gradient(135deg,#c47f00,#f0a500);color:white;box-shadow:0 2px 8px rgba(240,165,0,0.3);font-size:0.8rem;}
.btn-snap:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(240,165,0,0.4);}
.divider{display:flex;align-items:center;gap:10px;color:${SC.steel};font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:${SC.silver};}
.room-bar{background:${SC.white};border:1px solid ${SC.silver};border-radius:10px;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;box-shadow:0 2px 8px rgba(0,48,135,0.05);}
.room-info{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.room-code{display:flex;align-items:center;gap:8px;background:${SC.offWhite};border:1px solid ${SC.silver};border-radius:6px;padding:6px 12px;}
.room-code .lbl{font-size:0.65rem;color:${SC.slate};text-transform:uppercase;letter-spacing:0.1em;}
.room-code .val{font-size:0.9rem;font-weight:700;color:${SC.blue};letter-spacing:0.1em;}
.copy-btn{background:${SC.teal};border:none;color:white;cursor:pointer;font-size:0.65rem;padding:3px 8px;border-radius:4px;font-family:'DM Sans',sans-serif;font-weight:600;transition:opacity 0.15s;letter-spacing:0.05em;text-transform:uppercase;}
.copy-btn:hover{opacity:0.85;}
.me-badge{display:flex;align-items:center;gap:8px;font-size:0.8rem;color:${SC.inkLight};}
.role-tag{padding:3px 10px;border-radius:20px;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;}
.role-tag.PO{background:rgba(0,48,135,0.1);color:${SC.blue};}
.role-tag.RTIM{background:rgba(0,132,127,0.1);color:${SC.teal};}
.role-tag.QA{background:rgba(21,101,192,0.1);color:${SC.blueLight};}
.role-tag.ACM{background:rgba(240,165,0,0.12);color:#c47f00;}
.squad-tabs{display:flex;gap:0;background:${SC.offWhite};border:1px solid ${SC.silver};border-radius:10px;padding:4px;}
.squad-tab{flex:1;padding:9px 14px;border-radius:7px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s;color:${SC.slate};letter-spacing:0.04em;text-align:center;}
.squad-tab:hover{color:${SC.blue};}
.squad-tab.active{background:${SC.white};color:${SC.blue};box-shadow:0 1px 4px rgba(0,48,135,0.12);}
.squad-tab.complete{color:${SC.teal};}
.squad-tab.active.complete{color:${SC.teal};}
.tab-check{font-size:0.7rem;margin-left:4px;}
.story-panel{background:${SC.white};border:1px solid ${SC.silver};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,48,135,0.04);}
.story-hdr{background:linear-gradient(135deg,${SC.blue},${SC.blueMid});padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}
.story-hdr-title{font-size:0.7rem;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.1em;font-weight:600;}
.story-body{padding:20px;}
.story-text{font-family:'DM Serif Display',serif;font-size:1.3rem;color:${SC.ink};line-height:1.45;}
.section-label{font-size:0.7rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${SC.slate};margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.section-label::after{content:'';flex:1;height:1px;background:${SC.silver};}
.players-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;}
.player-tile{background:${SC.white};border:1.5px solid ${SC.silver};border-radius:10px;padding:14px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;transition:border-color 0.2s,box-shadow 0.2s;}
.player-tile.voted{border-color:var(--squad-color,${SC.teal});background:var(--squad-bg,${SC.greenLight});}
.player-tile.revealed-tile{border-color:var(--squad-color,${SC.teal});background:var(--squad-bg,${SC.greenLight});}
.player-tile.me-tile{box-shadow:0 0 0 2px var(--squad-color-alpha,${SC.teal}40);}
.player-name{font-size:0.75rem;font-weight:600;color:${SC.inkLight};max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.p-role-tag{font-size:0.6rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:10px;}
.p-role-tag.PO{background:rgba(0,48,135,0.1);color:${SC.blue};}
.p-role-tag.RTIM{background:rgba(0,132,127,0.1);color:${SC.teal};}
.p-role-tag.QA{background:rgba(21,101,192,0.1);color:${SC.blueLight};}
.p-role-tag.ACM{background:rgba(240,165,0,0.12);color:#c47f00;}
.card-slot{width:52px;height:74px;border-radius:7px;border:1.5px solid ${SC.silver};display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:1.3rem;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);position:relative;}
.card-slot.empty{background:${SC.offWhite};color:${SC.steel};}
.card-slot.voted-hidden{background:var(--squad-gradient,linear-gradient(135deg,${SC.teal},${SC.tealDark}));border-color:var(--squad-color,${SC.teal});}
.card-slot.voted-hidden::after{content:'●●●';color:rgba(255,255,255,0.4);font-size:0.45rem;letter-spacing:3px;}
.card-slot.revealed-val{background:var(--squad-bg,linear-gradient(135deg,${SC.greenLight},#c8ece9));border-color:var(--squad-color,${SC.teal});color:var(--squad-color,${SC.tealDark});transform:scale(1.06);box-shadow:0 4px 16px var(--squad-glow,rgba(0,132,127,0.2));font-size:1.4rem;}
.voting-panel{background:${SC.white};border:1px solid ${SC.silver};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,48,135,0.04);}
.voting-hdr{background:var(--role-gradient,linear-gradient(135deg,${SC.teal},${SC.tealDark}));padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}
.voting-title{font-size:0.7rem;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.1em;font-weight:600;}
.your-vote{background:rgba(255,255,255,0.15);border-radius:20px;padding:3px 10px;font-size:0.75rem;color:white;font-weight:600;}
.cards-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:20px;}
.vote-card{width:58px;height:82px;border-radius:8px;border:1.5px solid ${SC.silver};background:${SC.offWhite};display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:1.35rem;cursor:pointer;transition:all 0.15s cubic-bezier(0.34,1.56,0.64,1);color:${SC.ink};user-select:none;box-shadow:0 2px 4px rgba(0,0,0,0.06);}
.vote-card:hover{border-color:var(--role-color,${SC.teal});color:var(--role-color,${SC.teal});transform:translateY(-5px) scale(1.04);box-shadow:0 6px 20px var(--role-glow,rgba(0,132,127,0.2));background:var(--role-bg-light,${SC.greenLight});}
.vote-card.selected{border-color:var(--role-color,${SC.teal});background:var(--role-color,${SC.teal});color:white;transform:translateY(-7px) scale(1.07);box-shadow:0 8px 24px var(--role-glow,rgba(0,132,127,0.35));}
.results-banner{background:linear-gradient(135deg,${SC.teal},${SC.tealDark});border-radius:10px;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
.result-stat{text-align:center;}
.result-val{font-family:'DM Serif Display',serif;font-size:2rem;color:white;line-height:1;}
.result-lbl{font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-top:2px;}
.vote-chips{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.vote-chip{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:6px;padding:5px 12px;font-size:0.8rem;color:white;font-weight:600;}
.vote-chip .cnt{opacity:0.7;font-weight:400;}
.agreed-section{background:${SC.white};border:1px solid ${SC.silver};border-radius:12px;padding:20px 24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;box-shadow:0 2px 8px rgba(0,48,135,0.04);}
.agreed-label{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${SC.slate};white-space:nowrap;}
.agreed-chips{display:flex;gap:6px;flex-wrap:wrap;}
.agreed-chip{padding:7px 14px;border-radius:6px;border:1.5px solid ${SC.silver};background:${SC.offWhite};font-family:'DM Serif Display',serif;font-size:1rem;cursor:pointer;transition:all 0.15s;color:${SC.ink};}
.agreed-chip:hover{border-color:${SC.blue};color:${SC.blue};background:rgba(0,48,135,0.04);}
.agreed-chip.selected{background:${SC.blue};border-color:${SC.blue};color:white;box-shadow:0 2px 8px rgba(0,48,135,0.25);}
.status-badge{display:inline-flex;align-items:center;gap:5px;font-size:0.65rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:3px 9px;border-radius:20px;}
.badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
.badge-waiting{background:rgba(107,122,141,0.1);color:${SC.slate};}
.badge-voted-s{background:rgba(0,132,127,0.1);color:${SC.teal};}
.controls-row{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;}
.history-panel{background:${SC.white};border:1px solid ${SC.silver};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,48,135,0.04);}
.history-row{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid ${SC.silver}88;font-size:0.82rem;}
.history-row:last-child{border-bottom:none;}
.h-story{flex:1;color:${SC.inkLight};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.h-squad-tags{display:flex;gap:6px;}
.h-sq{font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:0.05em;}
.h-sq.RTIM{background:rgba(0,132,127,0.1);color:${SC.teal};}
.h-sq.QA{background:rgba(21,101,192,0.1);color:${SC.blueLight};}
.h-sq.ACM{background:rgba(240,165,0,0.12);color:#c47f00;}
.h-agreed{font-family:'DM Serif Display',serif;font-size:1.1rem;color:${SC.blue};font-weight:700;min-width:28px;text-align:right;}
.snap-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);}
.snap-modal{background:white;border-radius:16px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);}
.snap-modal-hdr{background:linear-gradient(135deg,${SC.blue},${SC.blueMid});padding:20px 28px;display:flex;align-items:center;justify-content:space-between;border-radius:16px 16px 0 0;}
.snap-modal-hdr h2{font-family:'DM Serif Display',serif;color:white;font-size:1.1rem;}
#snap-card{background:white;padding:32px;font-family:'DM Sans',sans-serif;}
.snap-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid ${SC.silver};}
.snap-brand{display:flex;align-items:center;gap:10px;}
.snap-logo{width:36px;height:36px;background:linear-gradient(135deg,${SC.blue},${SC.teal});border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-family:'DM Serif Display',serif;font-size:1rem;}
.snap-brand-name{font-family:'DM Serif Display',serif;color:${SC.blue};font-size:1rem;}
.snap-date{font-size:0.72rem;color:${SC.slate};}
.snap-sl{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${SC.slate};margin-bottom:6px;}
.snap-story{font-family:'DM Serif Display',serif;font-size:1.35rem;color:${SC.ink};margin-bottom:20px;padding:12px 16px;background:${SC.offWhite};border-left:4px solid ${SC.teal};border-radius:0 6px 6px 0;}
.snap-agreed-box{background:linear-gradient(135deg,${SC.blue},${SC.blueMid});border-radius:10px;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.snap-al{font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7);}
.snap-av{font-family:'DM Serif Display',serif;font-size:2.8rem;color:white;line-height:1;}
.snap-squads{display:flex;flex-direction:column;gap:14px;}
.snap-squad{border:1px solid ${SC.silver};border-radius:10px;overflow:hidden;}
.snap-sq-hdr{padding:10px 16px;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between;}
.snap-sq-hdr.RTIM{background:rgba(0,132,127,0.1);color:${SC.teal};}
.snap-sq-hdr.QA{background:rgba(21,101,192,0.1);color:${SC.blueLight};}
.snap-sq-hdr.ACM{background:rgba(240,165,0,0.12);color:#c47f00;}
.snap-sq-avg{font-family:'DM Serif Display',serif;font-size:1rem;}
.snap-participants{padding:12px 16px;display:flex;flex-direction:column;gap:4px;}
.snap-p{display:flex;align-items:center;justify-content:space-between;font-size:0.82rem;padding:6px 8px;border-radius:6px;}
.snap-p:nth-child(odd){background:${SC.offWhite};}
.snap-p-name{color:${SC.inkLight};font-weight:500;}
.snap-p-role{color:${SC.slate};font-size:0.7rem;}
.snap-p-vote{font-family:'DM Serif Display',serif;font-size:1rem;color:${SC.teal};font-weight:700;min-width:32px;text-align:right;}
.snap-footer{margin-top:20px;padding-top:14px;border-top:1px solid ${SC.silver};display:flex;justify-content:space-between;font-size:0.7rem;color:${SC.steel};}
.snap-actions{padding:16px 28px 24px;display:flex;gap:10px;justify-content:flex-end;}
.loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:12px;color:${SC.slate};}
.spinner{width:36px;height:36px;border:3px solid ${SC.silver};border-top-color:${SC.teal};border-radius:50%;animation:spin 0.8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.error-box{background:#fdecea;border:1px solid rgba(192,57,43,0.3);border-radius:8px;padding:12px 16px;color:${SC.red};font-size:0.82rem;}
@keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
.slide-up{animation:slideUp 0.3s ease forwards;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.fade-in{animation:fadeIn 0.25s ease forwards;}
.pulse{animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
.po-observer{background:${SC.offWhite};border:1px solid ${SC.silver};border-radius:10px;padding:14px 20px;color:${SC.slate};font-size:0.82rem;}
.creator-tag{background:rgba(240,165,0,0.15);color:#c47f00;border:1px solid rgba(240,165,0,0.3);border-radius:20px;padding:3px 10px;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}
.new-creator-toast{background:linear-gradient(135deg,rgba(240,165,0,0.12),rgba(240,165,0,0.06));border:1px solid rgba(240,165,0,0.35);border-radius:10px;padding:14px 20px;color:#c47f00;font-size:0.85rem;font-weight:500;}
.creator-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);}
.creator-modal{background:white;border-radius:16px;padding:32px 28px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25);display:flex;flex-direction:column;gap:14px;}
.creator-modal-icon{font-size:2.5rem;line-height:1;}
.creator-modal-title{font-family:'DM Serif Display',serif;font-size:1.3rem;color:#003087;}
.creator-modal-body{font-size:0.85rem;color:#6B7A8D;line-height:1.6;}
.countdown-badge{display:inline-flex;align-items:center;padding:8px 18px;border-radius:8px;background:${SC.blue};color:white;font-family:'DM Serif Display',serif;font-size:1.3rem;font-weight:700;letter-spacing:0.02em;box-shadow:0 2px 8px rgba(0,48,135,0.25);transition:background 0.3s;}
.countdown-badge.urgent{background:${SC.red};box-shadow:0 2px 12px rgba(192,57,43,0.4);animation:urgentPulse 0.5s infinite alternate;}
@keyframes urgentPulse{from{transform:scale(1);}to{transform:scale(1.04);}}
.pending-box{background:#fffbeb;border:1px solid rgba(240,165,0,0.3);border-radius:10px;padding:14px 20px;}
.pending-title{font-size:0.72rem;font-weight:700;color:#c47f00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;}
.pending-list{display:flex;flex-wrap:wrap;gap:8px;}
.pending-tag{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:20px;font-size:0.78rem;font-weight:600;border:1px solid transparent;}
.pending-tag.RTIM{background:rgba(0,132,127,0.1);color:${SC.teal};border-color:rgba(0,132,127,0.2);}
.pending-tag.QA{background:rgba(21,101,192,0.1);color:${SC.blueLight};border-color:rgba(21,101,192,0.2);}
.pending-tag.ACM{background:rgba(240,165,0,0.12);color:#c47f00;border-color:rgba(240,165,0,0.25);}
.pending-role{font-weight:400;opacity:0.7;}
.agreed-squads-section{background:${SC.white};border:1px solid ${SC.silver};border-radius:12px;padding:20px 24px;display:flex;flex-direction:column;gap:14px;box-shadow:0 2px 8px rgba(0,48,135,0.04);}
.agreed-squad-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;background:${SC.offWhite};border-radius:8px;}
.agreed-squad-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:4px 10px;border-radius:6px;min-width:52px;text-align:center;}
.agreed-squad-label.RTIM{background:rgba(0,132,127,0.1);color:${SC.teal};}
.agreed-squad-label.QA{background:rgba(21,101,192,0.1);color:${SC.blueLight};}
.agreed-squad-label.ACM{background:rgba(240,165,0,0.12);color:#c47f00;}
.agreed-confirmed{font-size:0.78rem;color:${SC.teal};font-weight:600;white-space:nowrap;}
.agreed-chip.readonly{cursor:default;opacity:0.5;}
.agreed-chip.readonly:hover{border-color:${SC.silver};color:${SC.ink};background:${SC.offWhite};transform:none;}
.btn-share{background:linear-gradient(135deg,${SC.blue},${SC.blueMid});color:white;font-size:0.75rem;padding:7px 14px;border-radius:6px;box-shadow:0 2px 8px rgba(0,48,135,0.2);}
.btn-share:hover{opacity:0.9;transform:translateY(-1px);}
.prefilled-banner{background:linear-gradient(135deg,rgba(0,48,135,0.06),rgba(0,48,135,0.02));border:1px solid rgba(0,48,135,0.2);border-radius:8px;padding:12px 16px;font-size:0.82rem;color:${SC.blue};line-height:1.5;}
.countdown-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;}
.countdown-bar-wrap{width:100%;max-width:300px;height:6px;background:${SC.silver};border-radius:3px;overflow:hidden;}
.countdown-bar{height:100%;border-radius:3px;transition:width 0.5s linear,background 0.3s;}
@media(max-width:600px){.main{padding:16px 12px 60px;}.role-grid{grid-template-columns:repeat(2,1fr);}.snap-av{font-size:2rem;}}
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

// ── SUPABASE HELPERS ─────────────────────────────────────────
async function fetchRoom(id) {
  const { data, error } = await supabase
    .from("rooms").select("data").eq("id", id).single();
  if (error) return null;
  return data?.data || null;
}

async function upsertRoom(id, roomData) {
  await supabase.from("rooms").upsert({
    id,
    data: roomData,
    updated_at: new Date().toISOString(),
  });
}

// ── SNAPSHOT MODAL ───────────────────────────────────────────
function SnapshotModal({ room, onClose }) {
  const snapRef = useRef(null);

  function printSnap() {
    const el = snapRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=700,height=900");
    w.document.write(`<html><head><title>Estimation Snapshot</title><style>body{margin:0;font-family:sans-serif;}</style></head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }

  const players = room.players || {};
  const story = room.story || "(No story title set)";
  const squadAgreedPoints = room.squadAgreedPoints || {};
  const date = new Date().toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" });
  const squadsWithVotes = SQUADS.filter(sq =>
    Object.values(players).some(p => p.squad === sq && p.vote !== null)
  );

  return (
    <div className="snap-overlay fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="snap-modal slide-up">
        <div className="snap-modal-hdr">
          <h2>📸 Estimation Snapshot</h2>
          <button className="btn btn-ghost" style={{ color: "rgba(255,255,255,0.7)" }} onClick={onClose}>✕ Close</button>
        </div>
        <div id="snap-card" ref={snapRef}>
          <div className="snap-hdr">
            <div className="snap-brand">
              <div className="snap-logo">P</div>
              <div className="snap-brand-name">Planit Poker</div>
            </div>
            <div className="snap-date">{date}</div>
          </div>
          <div className="snap-sl">Story / Feature</div>
          <div className="snap-story">{story}</div>
          <div className="snap-agreed-box">
            <div>
              <div className="snap-al">Agreed Story Points</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:8}}>
                {SQUADS.map(sq => squadAgreedPoints[sq] ? (
                  <div key={sq} style={{textAlign:"center"}}>
                    <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{sq}</div>
                    <div style={{fontFamily:"DM Serif Display,serif",fontSize:"2rem",color:"white",lineHeight:1}}>{squadAgreedPoints[sq]}</div>
                  </div>
                ) : null)}
                {!SQUADS.some(sq => squadAgreedPoints[sq]) && <div className="snap-av" style={{opacity:0.5,fontSize:"1.8rem"}}>Not set</div>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Squads estimated</div>
              <div style={{ display: "flex", gap: 6 }}>
                {squadsWithVotes.map(sq => (
                  <span key={sq} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "2px 8px", fontSize: "0.7rem", color: "white", fontWeight: 700 }}>{sq}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="snap-squads">
            {SQUADS.map(sq => {
              const stats = squadStats(players, sq, true);
              const sqPlayers = Object.entries(players)
                .filter(([, p]) => p.squad === sq)
                .sort((a, b) => a[1].name.localeCompare(b[1].name));
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
          <div className="snap-footer">
            <span>Generated by Planit Poker</span>
            <span>Story points are team estimates only</span>
          </div>
        </div>
        <div className="snap-actions">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={printSnap}>🖨 Print / Save as PDF</button>
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
  const [storyInput, setStoryInput] = useState("");
  const [editingStory, setEditingStory] = useState(false);
  const [activeSquad, setActiveSquad] = useState(null); // set on join
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [isNewCreator, setIsNewCreator] = useState(false);
  const [originalCreatorReclaimed, setOriginalCreatorReclaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── READ ROOM CODE FROM URL PARAM ───────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) setRoomInput(roomParam.toUpperCase());
  }, []);

  // ── REALTIME SUBSCRIPTION ────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    // Subscribe to changes on this room row
    const channel = supabase
      .channel(`room-${roomId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        if (payload.new?.data) setRoom(payload.new.data);
      })
      .subscribe(async (status) => {
        // Once subscribed, do an initial fetch so we always have latest state
        if (status === "SUBSCRIBED") {
          const latest = await fetchRoom(roomId);
          if (latest) setRoom(latest);
        }
      });

    // Poll every 3s as a fallback in case realtime misses an event
    const fallback = setInterval(async () => {
      const latest = await fetchRoom(roomId);
      if (latest) setRoom(latest);
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallback);
    };
  }, [roomId]);

  // ── MUTATE ROOM (read-modify-write to Supabase) ──────────
  const mutateRoom = useCallback(async (updater) => {
    const current = await fetchRoom(roomId);
    const next = updater(current || {});
    setRoom(next); // optimistic update
    await upsertRoom(roomId, next);
  }, [roomId]);

  // ── CREATE ROOM ──────────────────────────────────────────
  async function createRoom() {
    if (!myName.trim() || !myRole) return;
    setLoading(true); setError("");
    const id = genId();
    const effectiveSquad = myRole === "PO" ? null : myRole;
    const creatorKey = `${myName.trim().toLowerCase()}:${myRole}`;
    const initial = {
      id, story: "", revealed: false, votingStarted: false,
      agreedPoints: null, squadAgreedPoints: {},
      creatorId: myId,
      originalCreatorId: myId,
      originalCreatorKey: creatorKey,
      players: { [myId]: { name: myName.trim(), role: myRole, squad: effectiveSquad, vote: null, joinedAt: Date.now() } },
      history: [],
    };
    try {
      await upsertRoom(id, initial);
      setActiveSquad(effectiveSquad || "RTIM"); setRoomId(id); setRoom(initial); setScreen("game");
    } catch (e) {
      setError("Could not create room. Check your Supabase connection.");
    }
    setLoading(false);
  }

  // ── JOIN ROOM ────────────────────────────────────────────
  async function joinRoom() {
    if (!myName.trim() || !myRole || !roomInput.trim()) return;
    setLoading(true); setError("");
    const id = roomInput.trim().toUpperCase();
    const effectiveSquad = myRole === "PO" ? null : myRole;
    try {
      let r = await fetchRoom(id);
      if (!r) r = { id, story: "", revealed: false, votingStarted: false, agreedPoints: null, squadAgreedPoints: {}, creatorId: null, originalCreatorKey: null, players: {}, history: [] };
      r.players[myId] = { name: myName.trim(), role: myRole, squad: effectiveSquad, vote: null, joinedAt: Date.now() };
      // Reclaim creator if this user matches the original creator fingerprint
      const joiningKey = `${myName.trim().toLowerCase()}:${myRole}`;
      if (r.originalCreatorKey && joiningKey === r.originalCreatorKey && r.creatorId !== myId) {
        r.creatorId = myId;
      }
      await upsertRoom(id, r);
      setActiveSquad(effectiveSquad || "RTIM"); setRoomId(id); setRoom(r); setScreen("game");
    } catch (e) {
      setError("Could not join room. Check the room code and try again.");
    }
    setLoading(false);
  }

  async function castVote(val) {
    if (room?.revealed || myRole === "PO") return;
    await mutateRoom(r => ({
      ...r,
      players: { ...r.players, [myId]: { ...r.players[myId], vote: val } },
    }));
  }

  const [countdown, setCountdown] = useState(null);

  async function startVoting() {
    await mutateRoom(r => ({ ...r, votingStarted: true, votingStartedAt: Date.now() }));
  }

  // Sync countdown from room state so all users see the same timer
  useEffect(() => {
    if (!room?.votingStarted || !room?.votingStartedAt || room?.revealed) {
      setCountdown(null);
      return;
    }
    function tick() {
      const elapsed = Math.floor((Date.now() - room.votingStartedAt) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      setCountdown(remaining);
    }
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [room?.votingStarted, room?.votingStartedAt, room?.revealed]);

  async function revealVotes() {
    await mutateRoom(r => ({ ...r, revealed: true }));
  }

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

  async function setStory() {
    await mutateRoom(r => ({ ...r, story: storyInput.trim() }));
    setEditingStory(false);
  }

  const roomIdRef = useRef(roomId);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

  async function leaveRoom() {
    const rid = roomIdRef.current;
    if (!rid) { setRoomId(null); setRoom(null); setScreen("home"); return; }
    try {
      const current = await fetchRoom(rid);
      if (current) {
        const players = { ...current.players };
        delete players[myId];
        let newCreatorId = current.creatorId;
        if (current.creatorId === myId) {
          const remaining = Object.entries(players)
            .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0));
          newCreatorId = remaining.length > 0 ? remaining[0][0] : null;
        }
        await upsertRoom(rid, { ...current, players, creatorId: newCreatorId });
      }
    } catch(e) { console.error("leaveRoom error", e); }
    setRoomId(null); setRoom(null); setScreen("home");
  }

  // Detect if creatorId just changed to me (handed off)
  const prevCreatorIdRef = useRef(null);
  useEffect(() => {
    if (!room || !roomId) return;
    const prevId = prevCreatorIdRef.current;
    const currId = room.creatorId;
    // Handed off TO me
    if (currId === myId && prevId !== null && prevId !== myId) {
      setIsNewCreator(true);
    }
    // Taken AWAY from me (original creator reclaimed)
    if (prevId === myId && currId !== null && currId !== myId) {
      setOriginalCreatorReclaimed(true);
    }
    prevCreatorIdRef.current = currId;
  }, [room?.creatorId]);

  // Remove player if they close/refresh the tab
  useEffect(() => {
    if (!roomId) return;
    const handleUnload = async () => {
      const current = await fetchRoom(roomId);
      if (!current) return;
      const players = { ...current.players };
      delete players[myId];
      await upsertRoom(roomId, { ...current, players });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [roomId, myId]);

  const [copiedUrl, setCopiedUrl] = useState(false);

  function copyRoomId() {
    navigator.clipboard.writeText(roomId).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  function shareUrl() {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000);
  }

  // ── COMPUTED ─────────────────────────────────────────────
  const players = room?.players || {};
  const me = players[myId];
  const myVote = me?.vote ?? null;
  const revealed = room?.revealed || false;
  const effectiveSquad = myRole === "PO" ? null : myRole;
  const resolvedSquad = activeSquad || "RTIM";
  const squadPlayers = Object.entries(players).filter(([, p]) => p.squad === resolvedSquad);
  const anyVoted = Object.values(players).some(p => p.vote !== null);
  const activeStats = squadStats(players, resolvedSquad, revealed);
  const voteCounts = revealed
    ? Object.values(players).filter(p => p.squad === resolvedSquad)
        .reduce((acc, p) => { if (p.vote !== null) acc[p.vote] = (acc[p.vote] || 0) + 1; return acc; }, {})
    : {};
  const squadComplete = sq => revealed && Object.values(players).some(p => p.squad === sq && p.vote !== null);
  const isPO = myRole === "PO";
  const isMySquadTab = effectiveSquad === activeSquad;
  const isCreator = room?.creatorId === myId;
  const canControl = isCreator || isPO;
  const votingStarted = room?.votingStarted || false;
  const squadAgreedPoints = room?.squadAgreedPoints || {};
  // Non-PO, non-voting players who haven't voted yet
  const SQUAD_ORDER = { RTIM: 0, QA: 1, ACM: 2 };
  const pendingVoters = Object.values(players)
    .filter(p => p.role !== "PO" && p.vote === null)
    .sort((a, b) => {
      const sqA = SQUAD_ORDER[a.squad] ?? 99;
      const sqB = SQUAD_ORDER[b.squad] ?? 99;
      if (sqA !== sqB) return sqA - sqB;
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-logo">P</div>
            <div className="nav-title">Planit <span>Poker</span></div>
          </div>
          <div className="nav-right">
            {screen === "game" && me && (
              <>
                <span className="nav-badge">{me.name} · {me.role}</span>
                <button className="btn btn-danger" onClick={leaveRoom}>Leave</button>
              </>
            )}
          </div>
        </nav>

        <div className="main">

          {/* ── HOME ── */}
          {screen === "home" && (
            <div className="setup-container slide-up">
              <div className="setup-hero">
                <h1>Estimate with <em>confidence</em></h1>
                <p>Multi-squad story pointing for agile teams. RTIM, QA and ACM estimate together.</p>
              </div>
              <div className="setup-card">
                <div className="sc-header">
                  <h2>Join a Session</h2>
                  <p>Create a new room or join an existing one</p>
                </div>
                <div className="sc-body">
                  {error && <div className="error-box">{error}</div>}
                  {roomInput && (
                    <div className="prefilled-banner fade-in">
                      🎉 You've been invited to room <strong>{roomInput}</strong> — enter your name and role to jump in!
                    </div>
                  )}
                  <div className="field">
                    <div className="label">Your Name</div>
                    <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="e.g. Sarah Chen" autoFocus />
                  </div>
                  <div className="field">
                    <div className="label">Your Role</div>
                    <div className="role-grid">
                      {ROLES.map(r => (
                        <div key={r}
                          style={{"--role-color": ROLE_COLORS[r]?.bg, "--role-glow": ROLE_COLORS[r]?.bgGlow}}
                          className={`role-pill ${myRole === r ? "selected" : ""}`}
                          onClick={() => setMyRole(r)}>{r}</div>
                      ))}
                    </div>
                  </div>
                  {myRole && myRole !== "PO" && (
                    <div className="fade-in" style={{ fontSize: "0.78rem", color: SC.slate, background: SC.offWhite, padding: "10px 14px", borderRadius: 8, border: `1px solid ${SC.silver}` }}>
                      You will vote in the <strong style={{ color: SC.teal }}>{myRole}</strong> squad.
                    </div>
                  )}
                  {myRole === "PO" && (
                    <div className="fade-in" style={{ fontSize: "0.78rem", color: SC.slate, background: SC.offWhite, padding: "10px 14px", borderRadius: 8, border: `1px solid ${SC.silver}` }}>
                      As PO, you observe all squads and set the final agreed story points.
                    </div>
                  )}
                  {!roomInput ? (
                    <>
                      <button className="btn btn-primary" style={{ width: "100%" }} onClick={createRoom}
                        disabled={!myName.trim() || !myRole || loading}>
                        {loading ? "Creating…" : "Create New Room"}
                      </button>
                      <div className="divider">or join existing</div>
                      <div className="field">
                        <div className="label">Room Code</div>
                        <input value={roomInput} onChange={e => setRoomInput(e.target.value.toUpperCase())}
                          placeholder="e.g. A1B2C3" maxLength={12}
                          onKeyDown={e => e.key === "Enter" && joinRoom()} />
                      </div>
                      <button className="btn btn-outline" style={{ width: "100%" }} onClick={joinRoom}
                        disabled={!myName.trim() || !myRole || !roomInput.trim() || loading}>
                        {loading ? "Joining…" : "Join Room →"}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="field">
                        <div className="label">Room Code</div>
                        <input value={roomInput} onChange={e => setRoomInput(e.target.value.toUpperCase())}
                          placeholder="e.g. A1B2C3" maxLength={12}
                          onKeyDown={e => e.key === "Enter" && joinRoom()} />
                      </div>
                      <button className="btn btn-blue" style={{ width: "100%" }} onClick={joinRoom}
                        disabled={!myName.trim() || !myRole || !roomInput.trim() || loading}>
                        {loading ? "Joining…" : "→ Join Room"}
                      </button>
                      <div className="divider">or start fresh</div>
                      <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => { setRoomInput(""); createRoom(); }}
                        disabled={!myName.trim() || !myRole || loading}>
                        {loading ? "Creating…" : "Create New Room"}
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
                "--role-color": ROLE_COLORS[myRole]?.bg || "#00847F",
                "--role-gradient": ROLE_COLORS[myRole]?.gradient || "linear-gradient(135deg,#00847F,#005F5B)",
                "--role-glow": ROLE_COLORS[myRole]?.bgGlow || "rgba(0,132,127,0.15)",
                "--role-bg-light": ROLE_COLORS[myRole]?.bgLight || "rgba(0,132,127,0.08)",
                display:"contents"
              }}>
              <div className="room-bar slide-up">
                <div className="room-info">
                  <div className="room-code">
                    <div><div className="lbl">Room</div><div className="val">{roomId}</div></div>
                    <button className="copy-btn" onClick={copyRoomId}>{copied ? "✓" : "Code"}</button>
                  </div>
                  <button className="btn btn-share" onClick={shareUrl}>
                    {copiedUrl ? "✓ Link copied!" : "🔗 Share invite link"}
                  </button>
                  <div className="me-badge">
                    <span>{me?.name}</span>
                    <span className={`role-tag ${myRole}`}>{myRole}</span>
                    {isCreator && <span className="creator-tag">👑 Creator</span>}
                    <span style={{ color: SC.steel, fontSize: "0.75rem" }}>{Object.keys(players).length} in room</span>
                  </div>
                  {room?.creatorId && players[room.creatorId] && !isCreator && (
                    <div style={{ fontSize: "0.72rem", color: SC.slate }}>
                      👑 <strong style={{ color: SC.inkLight }}>{players[room.creatorId].name}</strong> is the creator
                    </div>
                  )}
                </div>
                {revealed && (
                  <button className="btn btn-snap" onClick={() => setShowSnapshot(true)}>📸 Snapshot</button>
                )}
              </div>

              {/* Original creator reclaimed modal */}
              {originalCreatorReclaimed && (
                <div className="creator-modal-overlay fade-in">
                  <div className="creator-modal slide-up">
                    <div className="creator-modal-icon">🫡</div>
                    <div className="creator-modal-title">The OG is back in town</div>
                    <div className="creator-modal-body">
                      The original session creator just rejoined and has reclaimed their throne. You've been a wonderful temp — but the crown goes back where it belongs. Carry on! 👑
                    </div>
                    <button className="btn btn-outline" style={{width:"100%"}} onClick={() => setOriginalCreatorReclaimed(false)}>
                      Fair enough, carry on! 😄
                    </button>
                  </div>
                </div>
              )}

              {/* New creator modal */}
              {isNewCreator && (
                <div className="creator-modal-overlay fade-in">
                  <div className="creator-modal slide-up">
                    <div className="creator-modal-icon">👑</div>
                    <div className="creator-modal-title">You're now the Session Creator</div>
                    <div className="creator-modal-body">
                      The previous creator has left the room. You now have full control — you can set the story, start voting, and reveal votes.
                    </div>
                    <button className="btn btn-primary" style={{width:"100%"}} onClick={() => setIsNewCreator(false)}>
                      Got it, let's go →
                    </button>
                  </div>
                </div>
              )}

              <div className="story-panel slide-up">
                <div className="story-hdr">
                  <div className="story-hdr-title">Current Story</div>
                  {room.story && !editingStory && canControl && (
                    <button className="btn btn-ghost" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem" }}
                      onClick={() => { setStoryInput(room.story); setEditingStory(true); }}>Edit</button>
                  )}
                </div>
                <div className="story-body">
                  {(editingStory || !room.story) && canControl ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      <input value={storyInput} onChange={e => setStoryInput(e.target.value)}
                        placeholder="Enter the story or feature title…" autoFocus
                        onKeyDown={e => { if (e.key === "Enter") setStory(); if (e.key === "Escape") setEditingStory(false); }} />
                      <button className="btn btn-primary" onClick={setStory} disabled={!storyInput.trim()}>Set</button>
                      {room.story && <button className="btn btn-outline" onClick={() => setEditingStory(false)}>✕</button>}
                    </div>
                  ) : room.story ? (
                    <div className="story-text">{room.story}</div>
                  ) : (
                    <div style={{color:"#C5CED8",fontStyle:"italic",fontSize:"0.9rem"}}>Waiting for creator to set the story…</div>
                  )}
                </div>
              </div>

              <div className="squad-tabs slide-up">
                {SQUADS.map(sq => (
                  <button key={sq} className={`squad-tab ${activeSquad === sq ? "active" : ""} ${squadComplete(sq) ? "complete" : ""}`}
                    onClick={() => setActiveSquad(sq)}>
                    {sq}{squadComplete(sq) && <span className="tab-check">✓</span>}
                    <span style={{ fontSize: "0.65rem", marginLeft: 4, opacity: 0.6 }}>
                      ({Object.values(players).filter(p => p.squad === sq).length})
                    </span>
                  </button>
                ))}
              </div>

              <div className="slide-up">
                <div className="section-label">{activeSquad} Participants</div>
                {squadPlayers.length === 0 ? (
                  <div style={{ color: SC.steel, fontSize: "0.82rem", padding: "12px 0" }}>No one from {activeSquad} has joined yet.</div>
                ) : (
                  <div className="players-grid">
                    {squadPlayers.map(([pid, p]) => (
                      <div key={pid}
                        style={{
                          "--squad-color": ROLE_COLORS[p.squad]?.bg || "#00847F",
                          "--squad-bg": ROLE_COLORS[p.squad]?.bgLight || "rgba(0,132,127,0.08)",
                          "--squad-gradient": ROLE_COLORS[p.squad]?.squadGradient || "linear-gradient(135deg,#00847F,#005F5B)",
                          "--squad-glow": ROLE_COLORS[p.squad]?.bgGlow || "rgba(0,132,127,0.15)",
                          "--squad-color-alpha": (ROLE_COLORS[p.squad]?.bg || "#00847F") + "40",
                        }}
                        className={`player-tile ${p.vote && !revealed ? "voted" : ""} ${p.vote && revealed ? "revealed-tile" : ""} ${pid === myId ? "me-tile" : ""}`}>
                        <div className="player-name">{p.name}{pid === myId ? " ★" : ""}</div>
                        <span className={`p-role-tag ${p.role}`}>{p.role}</span>
                        <div className={`card-slot ${p.vote === null ? "empty" : revealed ? "revealed-val" : "voted-hidden"}`}>
                          {revealed && p.vote !== null ? p.vote : ""}
                        </div>
                        {p.vote !== null && !revealed && <span className="status-badge badge-voted-s"><span className="badge-dot" />voted</span>}
                        {p.vote === null && <span className="status-badge badge-waiting pulse"><span className="badge-dot" />waiting</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

              {revealed && (
                <div className="agreed-squads-section slide-up">
                  <div className="section-label">Agreed Story Points by Squad</div>
                  {SQUADS.map(sq => {
                    const sqHasVotes = Object.values(players).some(p => p.squad === sq && p.vote !== null);
                    if (!sqHasVotes) return null;
                    return (
                      <div key={sq} className="agreed-squad-row">
                        <div className={`agreed-squad-label ${sq}`}>{sq}</div>
                        <div className="agreed-chips">
                          {FIBONACCI.filter(v => v !== "?").map(v => (
                            <div key={v}
                              className={`agreed-chip ${squadAgreedPoints[sq] === v ? "selected" : ""} ${!canControl ? "readonly" : ""}`}
                              onClick={() => canControl && setSquadAgreedPoints(sq, v)}>{v}</div>
                          ))}
                        </div>
                        {squadAgreedPoints[sq] && (
                          <span className="agreed-confirmed">✓ {squadAgreedPoints[sq]} pts</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {votingStarted && !revealed && countdown !== null && (
                <div className="countdown-wrap slide-up">
                  <div className={`countdown-badge ${countdown <= 5 ? "urgent" : ""}`}>⏱ {countdown}s</div>
                  <div className="countdown-bar-wrap">
                    <div className="countdown-bar" style={{width: `${(countdown/15)*100}%`, background: countdown <= 5 ? "#C0392B" : "var(--role-color,#003087)"}}/>
                  </div>
                </div>
              )}

              <div className="controls-row slide-up">
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {!votingStarted && canControl && (
                    <button className="btn btn-primary" onClick={startVoting} disabled={!room?.story}>
                      ▶ Start Voting
                    </button>
                  )}
                  {!votingStarted && !canControl && (
                    <div className="po-observer">⏳ Waiting for the session creator to start voting…</div>
                  )}
                  {votingStarted && !revealed && canControl && (
                    <button className="btn btn-blue" onClick={revealVotes} disabled={!anyVoted}>
                      {anyVoted ? "Reveal All Votes →" : "Waiting for votes…"}
                    </button>
                  )}
                  {votingStarted && !revealed && !canControl && (
                    <div className="po-observer">🗳️ Voting in progress — cast your vote below.</div>
                  )}
                  {revealed && canControl && (
                    <button className="btn btn-blue" onClick={newRound}>Start New Round →</button>
                  )}
                </div>
                {revealed && (
                  <button className="btn btn-snap" onClick={() => setShowSnapshot(true)}>📸 Take Snapshot</button>
                )}
              </div>

              {!revealed && !isPO && isMySquadTab && votingStarted && (
                <div className="voting-panel slide-up">
                  <div className="voting-hdr">
                    <div className="voting-title">Cast Your Vote — {activeSquad}</div>
                    {myVote && <div className="your-vote">Selected: {myVote}</div>}
                  </div>
                  <div className="cards-row">
                    {FIBONACCI.map(val => (
                      <div key={val} className={`vote-card ${myVote === val ? "selected" : ""}`} onClick={() => castVote(val)}>{val}</div>
                    ))}
                  </div>
                </div>
              )}

              {!revealed && votingStarted && pendingVoters.length > 0 && (
                <div className="pending-box slide-up">
                  <div className="pending-title">⏳ Still waiting on:</div>
                  <div className="pending-list">
                    {pendingVoters.map((p, i) => (
                      <span key={i} className={`pending-tag ${p.squad || "PO"}`}>{p.name} <span className="pending-role">· {p.role}</span></span>
                    ))}
                  </div>
                </div>
              )}

              {!revealed && isPO && votingStarted && (
                <div className="po-observer">👁 As PO, you're observing all squads. Votes are hidden until revealed.</div>
              )}

              {!revealed && !isPO && !isMySquadTab && votingStarted && (
                <div className="po-observer">Switch to the <strong>{effectiveSquad}</strong> tab to cast your vote.</div>
              )}

              {(room.history || []).length > 0 && (
                <div className="history-panel slide-up">
                  <div className="panel-header"><div className="panel-title">Round History</div></div>
                  {room.history.map((h, i) => (
                    <div key={i} className="history-row">
                      <div className="h-story">{h.story || "(untitled)"}</div>
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
              </div>{/* end role css vars wrapper */}
            </>
          )}
        </div>
      </div>

      {showSnapshot && room && <SnapshotModal room={room} onClose={() => setShowSnapshot(false)} />}
    </>
  );
}
