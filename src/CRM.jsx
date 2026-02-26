import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

// Make supabase available globally for components
if (typeof window !== 'undefined') {
  window.supabase = supabase;
}

// ── Palette & Fonts ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:       #0d1117;
    --ink-soft:  #3a3f4a;
    --ink-muted: #7a8295;
    --surface:   #f5f4f0;
    --card:      #ffffff;
    --border:    #e4e2db;
    --gold:      #7F4DDA;
    --gold-light:#ede0fa;
    --gold-dark: #5a2fa8;
    --green:     #1a7a4a;
    --green-bg:  #e8f5ee;
    --red:       #c0392b;
    --red-bg:    #fdf0ee;
    --blue:      #1a4a7a;
    --blue-bg:   #e8f0f8;
    --shadow-sm: 0 1px 3px rgba(13,17,23,0.06);
    --shadow-md: 0 4px 16px rgba(13,17,23,0.08);
    --shadow-lg: 0 12px 40px rgba(13,17,23,0.12);
    --r:         10px;
    --serif:     'DM Serif Display', Georgia, serif;
    --sans:      'DM Sans', system-ui, sans-serif;
  }

  body { font-family: var(--sans); background: var(--surface); color: var(--ink); }

  /* ── Layout ── */
  .app { display: flex; min-height: 100vh; }
  .sidebar {
    width: 230px; min-width: 230px; background: var(--ink);
    display: flex; flex-direction: column;
    padding: 0 0 24px 0; position: fixed; top: 0; left: 0;
    height: 100vh; z-index: 100; overflow-y: auto;
  }
  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 12px;
  }
  .sidebar-logo h1 {
    font-family: var(--serif); font-size: 20px;
    color: var(--gold); letter-spacing: 0.01em; font-weight: 400;
  }
  .sidebar-logo p { color: rgba(255,255,255,0.35); font-size: 11px; margin-top: 3px; letter-spacing: 0.08em; text-transform: uppercase; }
  .sidebar-section-label {
    padding: 10px 24px 6px;
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.25); font-weight: 500;
  }
  .sidebar-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 24px; cursor: pointer;
    color: rgba(255,255,255,0.55); font-size: 13.5px; font-weight: 400;
    transition: all 0.15s; border-left: 2px solid transparent;
  }
  .sidebar-link:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); }
  .sidebar-link.active { color: var(--gold); border-left-color: var(--gold); background: rgba(127,77,218,0.12); }
  .sidebar-link svg { opacity: 0.7; }
  .sidebar-link.active svg { opacity: 1; }
  .sidebar-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 10px 24px; }

  .main { margin-left: 230px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

  .topbar {
    background: var(--card); border-bottom: 1px solid var(--border);
    padding: 0 32px; height: 58px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .topbar-title { font-family: var(--serif); font-size: 22px; font-weight: 400; color: var(--ink); }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .content { padding: 28px 32px; flex: 1; }

  /* ── Cards & Stat tiles ── */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--r); padding: 20px 22px;
    box-shadow: var(--shadow-sm);
  }
  .stat-label { font-size: 11px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; margin-bottom: 8px; }
  .stat-value { font-family: var(--serif); font-size: 28px; font-weight: 400; color: var(--ink); }
  .stat-value.gold { color: var(--gold-dark); }
  .stat-sub { font-size: 12px; color: var(--ink-muted); margin-top: 5px; }
  .stat-badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
  .badge-green { background: var(--green-bg); color: var(--green); }
  .badge-gold { background: var(--gold-light); color: var(--gold-dark); }
  .badge-blue { background: var(--blue-bg); color: var(--blue); }
  .badge-red { background: var(--red-bg); color: var(--red); }
  .badge-gray { background: #f0eeea; color: var(--ink-muted); }

  /* ── Tables ── */
  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--r); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .card-header {
    padding: 16px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title { font-family: var(--serif); font-size: 17px; font-weight: 400; }
  .card-body { padding: 0; }

  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th {
    text-align: left; padding: 11px 18px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--ink-muted); background: #faf9f6;
    border-bottom: 1px solid var(--border);
  }
  td { padding: 13px 18px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf9f6; cursor: pointer; }
  .td-name { font-weight: 500; color: var(--ink); }
  .td-sub { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; font-family: var(--sans); transition: all 0.15s;
  }
  .btn-primary { background: var(--ink); color: #fff; }
  .btn-primary:hover { background: #1e2530; }
  .btn-gold { background: var(--gold); color: #fff; }
  .btn-gold:hover { background: var(--gold-dark); }
  .btn-outline { background: transparent; color: var(--ink); border: 1px solid var(--border); }
  .btn-outline:hover { background: var(--surface); }
  .btn-ghost { background: transparent; color: var(--ink-muted); border: none; padding: 6px 10px; }
  .btn-ghost:hover { color: var(--ink); background: var(--surface); }
  .btn-sm { padding: 5px 11px; font-size: 12px; }
  .btn-danger { background: var(--red); color: #fff; }

  /* ── Search & Filter bar ── */
  .toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
  .search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 320px; }
  .search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--ink-muted); }
  .search-input {
    width: 100%; padding: 8px 12px 8px 34px;
    border: 1px solid var(--border); border-radius: 7px;
    font-size: 13.5px; font-family: var(--sans); background: var(--card);
    color: var(--ink); outline: none; transition: border 0.15s;
  }
  .search-input:focus { border-color: var(--gold); }
  .filter-select {
    padding: 8px 12px; border: 1px solid var(--border); border-radius: 7px;
    font-size: 13px; font-family: var(--sans); background: var(--card);
    color: var(--ink); cursor: pointer; outline: none;
  }
  .filter-select:focus { border-color: var(--gold); }

  /* ── Modal / Drawer ── */
  .overlay {
    position: fixed; inset: 0; background: rgba(13,17,23,0.45);
    z-index: 200; display: flex; align-items: flex-start; justify-content: flex-end;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.18s ease;
  }
  .drawer {
    width: 520px; max-width: 100vw; height: 100vh;
    background: var(--card); box-shadow: var(--shadow-lg);
    display: flex; flex-direction: column;
    animation: slideIn 0.2s ease;
    overflow-y: auto;
  }
  .drawer-header {
    padding: 22px 26px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between;
    position: sticky; top: 0; background: var(--card); z-index: 10;
  }
  .drawer-title { font-family: var(--serif); font-size: 22px; font-weight: 400; }
  .drawer-body { padding: 24px 26px; flex: 1; }
  .drawer-footer {
    padding: 16px 26px; border-top: 1px solid var(--border);
    display: flex; gap: 10px; justify-content: flex-end;
    position: sticky; bottom: 0; background: var(--card);
  }

  /* ── Form ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid.full { grid-template-columns: 1fr; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.span2 { grid-column: span 2; }
  .field label { font-size: 12px; font-weight: 600; color: var(--ink-soft); letter-spacing: 0.04em; text-transform: uppercase; }
  .field input, .field select, .field textarea {
    padding: 9px 12px; border: 1px solid var(--border); border-radius: 7px;
    font-size: 13.5px; font-family: var(--sans); background: var(--surface);
    color: var(--ink); outline: none; transition: border 0.15s;
  }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--gold); background: #fff; }
  .field textarea { resize: vertical; min-height: 80px; }
  .section-divider { margin: 22px 0 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
  .section-divider h3 { font-family: var(--serif); font-size: 15px; font-weight: 400; color: var(--ink-soft); }

  /* ── LP Detail sections ── */
  .detail-meta { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
  .meta-item { background: var(--surface); border-radius: 8px; padding: 14px 16px; }
  .meta-item .label { font-size: 11px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 5px; font-weight: 500; }
  .meta-item .value { font-size: 16px; font-weight: 600; color: var(--ink); }
  .meta-item .value.gold { color: var(--gold-dark); font-family: var(--serif); font-size: 18px; }

  .notes-list { display: flex; flex-direction: column; gap: 10px; }
  .note-item { background: var(--surface); border-radius: 8px; padding: 12px 14px; border-left: 3px solid var(--gold); }
  .note-meta { font-size: 11px; color: var(--ink-muted); margin-bottom: 5px; }
  .note-text { font-size: 13.5px; color: var(--ink-soft); line-height: 1.5; }

  .pipeline-bar { display: flex; gap: 4px; margin-bottom: 22px; }
  .pipeline-stage {
    flex: 1; text-align: center; padding: 8px 4px;
    border-radius: 6px; font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent;
  }
  .pipeline-stage:hover { transform: translateY(-1px); }

  /* ── Investor Portal ── */
  .portal-header {
    background: var(--ink); color: #fff;
    padding: 0 40px; height: 60px; display: flex; align-items: center; justify-content: space-between;
  }
  .portal-logo { font-family: var(--serif); font-size: 20px; color: var(--gold); }
  .portal-content { padding: 32px 40px; max-width: 960px; margin: 0 auto; }
  .portal-welcome { margin-bottom: 28px; }
  .portal-welcome h2 { font-family: var(--serif); font-size: 30px; font-weight: 400; margin-bottom: 6px; }
  .portal-welcome p { color: var(--ink-muted); font-size: 14px; }
  .portal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .portal-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 22px; box-shadow: var(--shadow-sm); }
  .portal-card h3 { font-family: var(--serif); font-size: 17px; margin-bottom: 14px; font-weight: 400; color: var(--ink-soft); }
  .portal-big-num { font-family: var(--serif); font-size: 38px; color: var(--gold-dark); margin-bottom: 4px; }
  .portal-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 13.5px; }
  .portal-row:last-child { border-bottom: none; }
  .portal-row .lbl { color: var(--ink-muted); }
  .portal-row .val { font-weight: 500; }

  /* ── Distribution history ── */
  .dist-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .dist-row:last-child { border-bottom: none; }

  /* ── Progress bar ── */
  .progress-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 8px; }
  .progress-fill { height: 100%; background: var(--gold); border-radius: 3px; transition: width 0.4s ease; }

  /* ── Animations ── */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: rise 0.25s ease both; }

  /* ── Kanban board ── */
  .kanban { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 12px; }
  .kanban-col { min-width: 200px; max-width: 220px; flex-shrink: 0; }
  .kanban-col-header { padding: 10px 12px; border-radius: 8px 8px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
  .kanban-cards { background: #f7f6f2; border-radius: 0 0 8px 8px; padding: 10px 8px; min-height: 120px; display: flex; flex-direction: column; gap: 8px; }
  .kanban-card { background: var(--card); border: 1px solid var(--border); border-radius: 7px; padding: 11px 12px; cursor: pointer; transition: box-shadow 0.15s; }
  .kanban-card:hover { box-shadow: var(--shadow-md); }
  .kanban-card .name { font-weight: 500; font-size: 13px; }
  .kanban-card .firm { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }
  .kanban-card .amount { font-size: 12px; color: var(--gold-dark); font-weight: 600; margin-top: 5px; }
  .kanban-count { display: inline-block; background: rgba(255,255,255,0.3); border-radius: 10px; padding: 1px 7px; font-size: 11px; font-weight: 600; margin-left: 5px; }

  /* ── Empty state ── */
  .empty { text-align: center; padding: 60px 20px; color: var(--ink-muted); }
  .empty svg { margin: 0 auto 14px; display: block; opacity: 0.3; }
  .empty h3 { font-family: var(--serif); font-size: 20px; font-weight: 400; margin-bottom: 8px; color: var(--ink-soft); }
  .empty p { font-size: 13.5px; }

  /* ── Misc ── */
  .tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 20px; background: var(--gold-light); color: var(--gold-dark); font-weight: 500; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--gold-light); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: var(--gold-dark); flex-shrink: 0; }
  .flex-row { display: flex; align-items: center; gap: 10px; }
  .gap-sm { gap: 6px; }
  .mt-4 { margin-top: 16px; }
  .mt-2 { margin-top: 8px; }
  .text-muted { color: var(--ink-muted); font-size: 13px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .full-col { grid-column: span 2; }
  @media (max-width: 900px) {
    .stats-row { grid-template-columns: 1fr 1fr; }
    .two-col { grid-template-columns: 1fr; }
    .portal-grid { grid-template-columns: 1fr; }
    .detail-meta { grid-template-columns: 1fr 1fr; }
  }
`;

// ── Data Models ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: "outreach",   label: "Outreach",     color: "#7a8295", bg: "#f0eeea" },
  { id: "meeting",    label: "Meeting",       color: "#1a4a7a", bg: "#e8f0f8" },
  { id: "diligence",  label: "Diligence",     color: "#9b7b2a", bg: "#f0e4b8" },
  { id: "soft",       label: "Soft Commit",   color: "#6a3a9a", bg: "#f0e8f8" },
  { id: "signed",     label: "Docs Signed",   color: "#c9a84c", bg: "#faf5e4" },
  { id: "closed",     label: "Closed",        color: "#1a7a4a", bg: "#e8f5ee" },
];

const TIERS = ["Strategic", "Institutional", "Family Office", "HNW", "UHNW"];
const PARTNERS = ["Sarah Chen", "Marcus Webb", "Priya Nair", "James Liu"];
const FUNDS = []; // Cleared - load from database only
const FUND_DEFS = []; // Cleared - load from database only

const SEED_LPS = []; // Removed seed data - start fresh

const PORTFOLIO = []; // Removed seed data - will load from funds

function fmtMoney(n, short = false) {
  if (!n) return "$0";
  if (short) {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n}`;
  }
  return "$" + n.toLocaleString();
}

function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function stageInfo(id) { return STAGES.find(s => s.id === id) || STAGES[0]; }

// ── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    users: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    pipeline: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    chart: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    portfolio: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M2 9V7a2 2 0 0 1 2-2h4l2-2h4l2 2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3"/><path d="m9 14 2 2 4-4"/></svg>,
    portal: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    plus: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    close: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    search: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    note: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    dollar: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    dash: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    fund: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    download: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    settings: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>,
  };
  return icons[name] || null;
};

// ── Storage helpers ───────────────────────────────────────────────────────────
async function loadData(key, fallback) {
  try {
    // Try window.storage first (Claude artifacts environment)
    if (window.storage) {
      const r = await window.storage.get(key);
      console.log(`📂 Loading ${key} from window.storage:`, r ? 'Found data' : 'No data, using fallback');
      return r ? JSON.parse(r.value) : fallback;
    }
    
    // Fallback to localStorage (standard web environment)
    const data = localStorage.getItem(key);
    console.log(`📂 Loading ${key} from localStorage:`, data ? 'Found data' : 'No data, using fallback');
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error(`❌ Error loading ${key}:`, error);
    return fallback;
  }
}

async function saveData(key, value) {
  try {
    // Try window.storage first (Claude artifacts environment)
    if (window.storage) {
      await window.storage.set(key, JSON.stringify(value));
      console.log(`💾 Saved ${key} to window.storage successfully`, value.length || Object.keys(value).length, 'items');
      return;
    }
    
    // Fallback to localStorage (standard web environment)
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`💾 Saved ${key} to localStorage successfully`, value.length || Object.keys(value).length, 'items');
  } catch (error) {
    console.error(`❌ Error saving ${key}:`, error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function CRM({ session, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [activeFund, setActiveFund] = useState(null);
  const [lps, setLPs] = useState(null);
  const [fundDefs, setFundDefs] = useState(null);
  const [portalLP, setPortalLP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddFund, setShowAddFund] = useState(false);
  
  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      // Load funds from Supabase
      const { data: funds, error: fundsError } = await supabase
        .from('funds')
        .select('*')
        .order('vintage', { ascending: false });

      if (fundsError) throw fundsError;

      console.log('🔍 Loaded funds from Supabase:', funds);
      console.log('🔍 Number of funds:', funds?.length);

      // Load LPs from Supabase
      const { data: lpsData, error: lpsError } = await supabase
        .from('lps')
        .select('*')
        .order('created_at', { ascending: false });

      if (lpsError) throw lpsError;

      // Transform funds to match expected format
      const transformedFunds = funds?.map(f => ({
        name: f.name,
        vintage: f.vintage,
        target: f.target_amount,
        status: f.status
      })) || [];

      console.log('🔍 Transformed funds:', transformedFunds);
      console.log('🔍 Fund names:', transformedFunds.map(f => f.name));

      setFundDefs(transformedFunds.length > 0 ? transformedFunds : FUND_DEFS);
      setLPs(lpsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to seed data if Supabase fails
      setFundDefs(FUND_DEFS);
      setLPs([]);
      setLoading(false);
    }
  };

  const saveLPs = async (updated) => {
    setLPs(updated);
    // Save to Supabase instead of browser storage
    // Note: This will be replaced with proper upsert logic per LP
  };
  
  const goFund = (fundName) => { setActiveFund(fundName); setPage("fund"); };
  const goPage = (p) => { setPage(p); setActiveFund(null); };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "var(--sans)", color: "var(--ink-muted)" }}>
      <style>{CSS}</style>
      Loading Decisive Point CRM…
    </div>
  );

  // ── INVESTOR PORTAL VIEW ─────────────────────────────────────────────────
  if (portalLP) return (
    <>
      <style>{CSS}</style>
      <InvestorPortal lp={portalLP} onExit={() => setPortalLP(null)} />
    </>
  );

  const navItems = [
    { id: "dashboard", icon: "dash",      label: "Dashboard" },
    { id: "lps",       icon: "users",     label: "LP Directory" },
    { id: "portfolio", icon: "portfolio", label: "Portfolio" },
    { id: "portal",    icon: "portal",    label: "Investor Portal" },
    { id: "settings",  icon: "settings",  label: "Settings" },
  ];

  const titleMap = {
    dashboard: "Dashboard",
    lps: "LP Directory",
    portfolio: "Portfolio Companies",
    portal: "Investor Portal Preview",
    settings: "Settings",
    fund: activeFund || "Fund",
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <img src="data:image/png;base64,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knqJ5AyONo7yTyChN0i+lpXXfynGtL5ZrfbzvHNeS0sqJx2HqR2xtP1R8/w4e8PB7IrVYtW6hWOS1XWlqr5TUb6S6U0J4jA1rg6LjI5B3nyeaeYG3cQotL9SPfJI6SRznvcSXOcdySe8r8oCmF7G7mHU3TJMDqJdm1EbbpRtJ+nbtHL8JBiPqYVD1b50fsuODayYzkb5eqpoK1sVW7fl5PJ8rlJ8dmuJ9YCC1xF/Huaxhe9wa1o3JJ2ACih0jOllQWPyjGtMJYLjcxuya8EB9PTns+VDsld9sfMH23cHZNc9a8O0mtfHeKjy28Ss4qS1U7x10vg53/ls3+mPp2DiNlXnrRq7mOq178tyKt6uiicTR22AltPTDxDfpnbdrzuT6BsBpd6ulxvV1qLrd66or6+peZJ6iokL5JHeJceZXjQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQF2LRvpEZ5ptY6ywU04utplppI6Wnqnnehlc0hskTuZADiCWHzTsduEklcdRB/XEucXOJJJ3JPev4iICIiAuhaK6wZjpTevK8frOuoJXA1dsqCXU9QPHb6V+3Y8c/Hcbg89RB78ju1XfshuN8r38dXcKqWqnd4vkcXO/lJXgW4O00zP9jWn1Fiss0+OTTSRGpi84xcB4S57Rzawu3Ad2btIO3LfT0BERAREQEREBERAREQF97dWVNvuFPX0croammlbNDI3tY9pBaR6iAvgtwodNMzq9OLhqEyzTR45QuY19XL5vWlzwzeNp5vAc4buHIeKDN63a15pqxXtN8qm0lqhdxU1rpSWwRns4nb83v+2d2bnbYHZc0REBERAREQdf1M6Qme5thVrw+Sq9rLVSUMVNWNpnnrLg9jA0vmf28J234BsOfPi2G3IERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBF78fs9zv95pbNZqOWtuFW/q4IIxu6R3gFv37AOsv73t5/iN/rQcyRbTnOnma4PFSy5bjldZ2VbnNp3VDQOsLduIDY924/GtWQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAR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YJKTBsXp7VxbgVtwk6+UDxbGAGtPrLx6FGHMMpyLL71JecmvFZda+TkZqiTiIH1LR2Nb9qAAPBEQYZERBs2leV/INqHZcu8g9sPaupE/k3XdV1uwI24+F23b27FSm93P/wDa7+f/AP8AHREHGek1rp+zT8j/AP8Apb2i9pvKf/5Dynruu6r/ANNnDt1Xp34u7bnxlEQS+wDpjW3GMEx/GpMDq6p9ptlNQumbcmtEhiiaziA6s7b8O+268OrPS4t2cacXzEosHqqF90pTA2odcGvEe5B34erG/Z4oiCJ6IiAiIglVoz0sbfp/plZcOmwmquEltifGahlwbGJOKRz9+EsO3zW3b3LKZ/0xrbk+CZBjUeB1dK+7WypoWzOuTXCMyxOZxEdWN9uLfbdEQRBREQfaiqqmirIayiqJqapgeJIZonlj43g7hzXDmCDzBCklp70yNQLDRw0WTWq35PFEA0TvcaapcB9U9oLTy7+DfvJKIg3+Ppx20saZNOatr9hxBt2aQD6D1Q3/ABL9e7jtX73Vb+dG/wB2iIIta3Z0NStT7vmotftWLj1P/hev67q+rhji+b4W778G/YNt9ue260tEQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf/Z" alt="Decisive Point" style={{ maxWidth: "100%", maxHeight: 48, objectFit: "contain" }} />
            <p style={{ marginTop: 10, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>CRM Platform</p>
          </div>
          <span className="sidebar-section-label">Navigation</span>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-link ${page === item.id && !activeFund ? "active" : ""}`}
              onClick={() => goPage(item.id)}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </div>
          ))}
          <div className="sidebar-divider" />
          
          {/* Funds Section */}
          {(() => {
            const funds = (fundDefs || []).filter(f => f?.name?.startsWith("Decisive Point Fund")).sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
            const spvs = (fundDefs || []).filter(f => f?.name?.startsWith("Decisive Point -")).sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
            
            return (
              <>
                {funds.length > 0 && (
                  <>
                    <span className="sidebar-section-label">Funds</span>
                    {funds.map(f => (
                      <div
                        key={f.name}
                        className={`sidebar-link ${page === "fund" && activeFund === f.name ? "active" : ""}`}
                        style={{ fontSize: 13 }}
                        onClick={() => goFund(f.name)}
                      >
                        <Icon name="fund" size={14} />
                        <span style={{ flex: 1 }}>{f.name.replace("Decisive Point Fund ", "Fund ")}</span>
                        {f.status === "raising" && (
                          <span style={{ fontSize: 10, background: "rgba(127,77,218,0.25)", color: "var(--gold)", borderRadius: 8, padding: "1px 6px", fontWeight: 600 }}>LIVE</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
                
                {spvs.length > 0 && (
                  <>
                    <div className="sidebar-divider" style={{ margin: "8px 0" }} />
                    <span className="sidebar-section-label">SPVs</span>
                    {spvs.map(f => (
                      <div
                        key={f.name}
                        className={`sidebar-link ${page === "fund" && activeFund === f.name ? "active" : ""}`}
                        style={{ fontSize: 13 }}
                        onClick={() => goFund(f.name)}
                      >
                        <Icon name="fund" size={14} />
                        <span style={{ flex: 1 }}>{f.name.replace("Decisive Point - ", "")}</span>
                        {f.status === "raising" && (
                          <span style={{ fontSize: 10, background: "rgba(127,77,218,0.25)", color: "var(--gold)", borderRadius: 8, padding: "1px 6px", fontWeight: 600 }}>LIVE</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </>
            );
          })()}
          
          <div
            className="sidebar-link"
            style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8, borderLeft: "none" }}
            onClick={() => setShowAddFund(true)}
          >
            <Icon name="plus" size={13} />
            Add Fund
          </div>
        </nav>

        {/* Main */}
        <main className="main">
          <header className="topbar">
            <span className="topbar-title">{titleMap[page]}</span>
            <div className="topbar-right">
              <div style={{ fontSize: 11, color: "var(--gold-dark)", background: "var(--gold-light)", padding: "2px 8px", borderRadius: 4, marginRight: 12, fontWeight: 600 }}>
                v2.23-COLUMN-FIX
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <button 
                onClick={onLogout}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Icon name="logout" size={14} />
                Sign Out
              </button>
            </div>
          </header>

          <div className="content fade-in" key={page + activeFund}>
            {page === "dashboard" && <DashboardPage lps={lps} fundDefs={fundDefs} onFund={goFund} />}
            {page === "lps" && <LPDirectory lps={lps} saveLPs={saveLPs} onPortal={setPortalLP} />}
            {page === "portfolio" && <PortfolioPage fundDefs={fundDefs} />}
            {page === "portal" && <PortalPickerPage lps={lps} onSelect={setPortalLP} />}
            {page === "settings" && <SettingsPage lps={lps} session={session} />}
            {page === "fund" && activeFund && <FundPage fundName={activeFund} fundDefs={fundDefs} lps={lps} saveLPs={saveLPs} onPortal={setPortalLP} />}
          </div>
        </main>

        {showAddFund && <AddFundModal onClose={() => setShowAddFund(false)} />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage({ lps, fundDefs, onFund }) {
  const safeLps = lps || [];
  const closed = safeLps.filter(l => l.stage === "closed");
  const totalCommit = safeLps.reduce((s, l) => s + (l.commitment || 0), 0);
  const totalFunded = safeLps.reduce((s, l) => s + (l.funded || 0), 0);
  const totalNAV = safeLps.reduce((s, l) => s + (l.nav || 0), 0);
  const pipelineCount = safeLps.filter(l => l.stage !== "closed").length;
  const funds = fundDefs || FUND_DEFS;

  return (
    <div>
      <div className="stats-row">
        <StatCard label="Total LP Commitments" value={fmtMoney(totalCommit, true)} sub={`${closed.length} closed LPs`} />
        <StatCard label="Capital Deployed" value={fmtMoney(totalFunded, true)} sub={`${Math.round((totalFunded / totalCommit) * 100) || 0}% of commitments`} gold />
        <StatCard label="Portfolio NAV" value={fmtMoney(totalNAV, true)} sub="Marked to current" />
        <StatCard label="Pipeline LPs" value={pipelineCount} sub="Active prospects" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
        </div>
        <div className="card-body">
          {safeLps.filter(l => l.notes?.length > 0).slice(0, 6).map(lp => {
            const last = lp.notes[lp.notes.length - 1];
            const s = stageInfo(lp.stage);
            return (
              <div key={lp.id} style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                <div className="avatar">{initials(lp.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{lp.name}</span>
                      <span style={{ fontSize: 12, color: "var(--ink-muted)", marginLeft: 8 }}>{lp.fund.replace("Decisive Point ", "")}</span>
                    </div>
                    <span className="stat-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 3 }}>{last.text.slice(0, 100)}{last.text.length > 100 ? "…" : ""}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>{last.date} · {last.author}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">All Funds — Fundraising Overview</span>
          <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>Click any fund to open its full dashboard</span>
        </div>
        <div className="card-body" style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
          {funds.map(fd => {
            const fundLPs = safeLps.filter(l => l.fund === fd.name);
            const committed = fundLPs.reduce((s, l) => s + (l.commitment || 0), 0);
            const funded = fundLPs.reduce((s, l) => s + (l.funded || 0), 0);
            const pct = fd.target > 0 ? (committed / fd.target) * 100 : 0;
            const oversubscribed = committed > fd.target;
            const shortName = fd.name.replace("Decisive Point ", "");
            return (
              <div
                key={fd.name}
                onClick={() => onFund(fd.name)}
                style={{
                  border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px",
                  cursor: "pointer", transition: "box-shadow 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 400 }}>{shortName}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>· Vintage {fd.vintage}</span>
                    {fd.status === "raising" && <span style={{ fontSize: 10, background: "var(--gold-light)", color: "var(--gold-dark)", borderRadius: 8, padding: "2px 8px", fontWeight: 600 }}>LIVE RAISE</span>}
                    {fd.status === "closed" && oversubscribed && <span className="badge-green stat-badge">Oversubscribed</span>}
                    {fd.status === "closed" && !oversubscribed && <span className="badge-gray stat-badge">Closed</span>}
                  </div>
                  <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                    <span style={{ color: "var(--ink-muted)" }}>Target <b style={{ color: "var(--ink)" }}>{fmtMoney(fd.target, true)}</b></span>
                    <span style={{ color: "var(--ink-muted)" }}>Raised <b style={{ color: oversubscribed ? "var(--green)" : "var(--gold-dark)" }}>{fmtMoney(committed, true)}</b></span>
                    <span style={{ color: "var(--ink-muted)" }}>LPs <b style={{ color: "var(--ink)" }}>{fundLPs.filter(l => l.stage === "closed").length}</b></span>
                  </div>
                </div>
                {/* Progress bar — can overflow for oversubscribed */}
                <div style={{ position: "relative", height: 8, background: "var(--border)", borderRadius: 4, overflow: "visible" }}>
                  <div style={{
                    height: 8, borderRadius: 4,
                    background: oversubscribed ? "var(--green)" : "var(--gold)",
                    width: `${Math.min(pct, 100)}%`,
                    transition: "width 0.5s ease",
                  }} />
                  {oversubscribed && (
                    <div style={{
                      position: "absolute", top: -2, left: "100%", transform: "translateX(-2px)",
                      height: 12, width: `${Math.min((pct - 100) * 0.5, 30)}%`,
                      background: "var(--green)", opacity: 0.4, borderRadius: "0 4px 4px 0",
                    }} />
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--ink-muted)" }}>
                  <span>
                    <b style={{ color: oversubscribed ? "var(--green)" : "var(--ink)" }}>{Math.round(pct)}%</b>
                    {oversubscribed ? " — oversubscribed by " + fmtMoney(committed - fd.target, true) : " of target"}
                  </span>
                  <span>Funded: {fmtMoney(funded, true)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, gold }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${gold ? "gold" : ""}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 8, padding: "11px 14px" }}>
      <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 16 }}>{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── LP DIRECTORY ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Simple LP Directory - just displays lps, no complex loading
function LPDirectory({ lps, saveLPs, onPortal }) {
  const [search, setSearch] = useState("");
  const [filterPartner, setFilterPartner] = useState("all");
  const [filterFund, setFilterFund] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedLP, setExpandedLP] = useState(null);

  // Get unique funds from lps
  const funds = [...new Set((lps || []).map(lp => lp.fund))].filter(Boolean);

  // Filter LPs
  const filteredLPs = (lps || []).filter(lp => {
    const q = search.toLowerCase();
    const matchQ = !q || lp.name?.toLowerCase().includes(q) || lp.firm?.toLowerCase().includes(q);
    const matchPartner = filterPartner === "all" || lp.partner === filterPartner;
    const matchFund = filterFund === "all" || lp.fund === filterFund;
    return matchQ && matchPartner && matchFund;
  });

  return (
    <div>
      <div className="toolbar">
        <div className="search-wrap">
          <Icon name="search" size={14} />
          <input className="search-input" placeholder="Search LP name or firm…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterFund} onChange={e => setFilterFund(e.target.value)}>
          <option value="all">All Funds</option>
          {funds.map(f => <option key={f} value={f}>{f.replace('Decisive Point ', '')}</option>)}
        </select>
        <select className="filter-select" value={filterPartner} onChange={e => setFilterPartner(e.target.value)}>
          <option value="all">All Partners</option>
          {PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={14} /> Add LP
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {filteredLPs.length === 0 ? (
            <div className="empty">
              <Icon name="users" size={40} />
              <h3>No LPs found</h3>
              <p>Add your first LP to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Fund</th>
                  <th>Stage</th>
                  <th>Partner</th>
                  <th>Commitment</th>
                  <th>Funded</th>
                  <th>NAV</th>
                </tr>
              </thead>
              <tbody>
                {filteredLPs.map(lp => {
                  const s = stageInfo(lp.stage);
                  return (
                    <tr key={lp.id} onClick={() => setSelected(lp)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="td-name">{lp.name}</div>
                        <div className="td-sub">{lp.firm}</div>
                      </td>
                      <td>
                        <span className="stat-badge badge-gold">
                          {lp.fund?.replace('Decisive Point ', '') || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="stat-badge" style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td><span className="stat-badge badge-blue">{lp.partner}</span></td>
                      <td style={{ fontWeight: 500 }}>{lp.commitment ? fmtMoney(lp.commitment) : "—"}</td>
                      <td style={{ color: 'var(--gold)' }}>{lp.funded ? fmtMoney(lp.funded) : "—"}</td>
                      <td style={{ color: 'var(--green)' }}>{lp.nav ? fmtMoney(lp.nav) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && <AddLPDrawer onClose={() => setShowAdd(false)} onSave={(newLP) => { saveLPs([...lps, newLP]); setShowAdd(false); }} />}
      {selected && (
        <LPDetailDrawer
          lp={selected}
          onClose={() => setSelected(null)}
          onSave={(updated) => { saveLPs(lps.map(l => l.id === updated.id ? updated : l)); setSelected(updated); }}
          onDelete={(id) => { saveLPs(lps.filter(l => l.id !== id)); setSelected(null); }}
          onPortal={() => { onPortal(selected); setSelected(null); }}
        />
      )}
    </div>
  );
}

function LPDetailDrawer({ lp, onClose, onSave, onDelete, onPortal }) {
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(lp);
  const [newNote, setNewNote] = useState("");
  const [additionalContacts, setAdditionalContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const s = stageInfo(lp.stage);

  useEffect(() => {
    if (tab === "contacts") {
      loadAdditionalContacts();
    }
  }, [tab, lp.id]);

  const loadAdditionalContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('lp_additional_contacts')
        .select('*')
        .eq('lp_id', lp.id)
        .order('created_at');

      if (error) throw error;
      setAdditionalContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const deleteAdditionalContact = async (contactId) => {
    if (!confirm('Remove this contact?')) return;
    
    try {
      const { error } = await supabase
        .from('lp_additional_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      loadAdditionalContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error: ' + error.message);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = { date: new Date().toISOString().split("T")[0], author: "You", text: newNote };
    const updated = { ...lp, notes: [...lp.notes, note] };
    onSave(updated);
    setNewNote("");
  };

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="flex-row gap-sm" style={{ marginBottom: 6 }}>
              <div className="avatar" style={{ width: 38, height: 38, fontSize: 15 }}>{initials(lp.name)}</div>
              <div>
                <div className="drawer-title">{lp.name}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{lp.firm}</div>
              </div>
            </div>
            <div className="flex-row gap-sm" style={{ marginTop: 8 }}>
              <span className="stat-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              <span className="tag">{lp.fund}</span>
              {lp.tier && <span className="badge-gray stat-badge">{lp.tier}</span>}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", padding: "0 26px" }}>
          {["overview", "contacts", "notes", "docs"].map(t => (
            <div
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500,
                borderBottom: tab === t ? "2px solid var(--gold)" : "2px solid transparent",
                color: tab === t ? "var(--ink)" : "var(--ink-muted)",
                textTransform: "capitalize",
              }}
            >{t === "contacts" ? `Contacts (${additionalContacts.length + 1})` : t}</div>
          ))}
        </div>

        <div className="drawer-body">
          {tab === "overview" && !editing && (
            <div>
              <div className="detail-meta">
                <div className="meta-item">
                  <div className="label">Commitment</div>
                  <div className="value gold">{lp.commitment ? fmtMoney(lp.commitment) : "TBD"}</div>
                </div>
                <div className="meta-item">
                  <div className="label">Funded</div>
                  <div className="value">{lp.funded ? fmtMoney(lp.funded) : "—"}</div>
                </div>
                <div className="meta-item">
                  <div className="label">NAV</div>
                  <div className="value" style={{ color: lp.nav > lp.funded ? "var(--green)" : undefined }}>{lp.nav ? fmtMoney(lp.nav) : "—"}</div>
                </div>
              </div>

              <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "var(--ink-soft)" }}>
                <div className="portal-row"><span className="lbl">Email</span><span className="val">{lp.email}</span></div>
                <div className="portal-row"><span className="lbl">Phone</span><span className="val">{lp.phone}</span></div>
                <div className="portal-row"><span className="lbl">Partner</span><span className="val">{lp.partner}</span></div>
                <div className="portal-row"><span className="lbl">Tier</span><span className="val">{lp.tier}</span></div>
                <div className="portal-row"><span className="lbl">Fund</span><span className="val">{lp.fund}</span></div>
              </div>

              {/* Stage changer */}
              <div className="section-divider"><h3>Move Stage</h3></div>
              <div className="pipeline-bar">
                {STAGES.map(st => (
                  <div
                    key={st.id}
                    className="pipeline-stage"
                    style={{
                      background: lp.stage === st.id ? st.bg : "#f7f6f2",
                      color: lp.stage === st.id ? st.color : "var(--ink-muted)",
                      border: lp.stage === st.id ? `1.5px solid ${st.color}` : "1.5px solid var(--border)",
                    }}
                    onClick={() => onSave({ ...lp, stage: st.id })}
                  >
                    {st.label}
                  </div>
                ))}
              </div>

              {lp.distributions && lp.distributions.length > 0 && (
                <>
                  <div className="section-divider"><h3>Distributions</h3></div>
                  {lp.distributions.map((d, i) => (
                    <div key={i} className="dist-row">
                      <span style={{ fontSize: 13 }}>{d.date}</span>
                      <span className="stat-badge badge-green">{d.type}</span>
                      <span style={{ fontWeight: 600, color: "var(--green)" }}>{fmtMoney(d.amount)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab === "overview" && editing && (
            <div className="form-grid">
              <div className="field"><label>First & Last Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Firm</label><input value={form.firm} onChange={e => setForm({ ...form, firm: e.target.value })} /></div>
              <div className="field"><label>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="field"><label>Partner</label>
                <select value={form.partner} onChange={e => setForm({ ...form, partner: e.target.value })}>
                  {PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field"><label>Tier</label>
                <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field"><label>Fund</label>
                <select value={form.fund} onChange={e => setForm({ ...form, fund: e.target.value })}>
                  {FUNDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="field"><label>Stage</label>
                <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="field"><label>Commitment ($)</label><input type="number" value={form.commitment} onChange={e => setForm({ ...form, commitment: +e.target.value })} /></div>
              <div className="field"><label>Funded ($)</label><input type="number" value={form.funded} onChange={e => setForm({ ...form, funded: +e.target.value })} /></div>
              <div className="field"><label>NAV / Current Mark ($)</label><input type="number" value={form.nav} onChange={e => setForm({ ...form, nav: +e.target.value })} /></div>
            </div>
          )}

          {tab === "contacts" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Primary Contact
                </div>
                <div style={{ background: 'var(--gold-light)', padding: '16px', borderRadius: 8, border: '1px solid var(--gold)' }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{lp.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 2 }}>{lp.email}</div>
                  {lp.phone && <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{lp.phone}</div>}
                  <div style={{ fontSize: 11, color: 'var(--gold-dark)', marginTop: 8 }}>Primary · {lp.firm}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Additional Contacts
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddContact(true)}>
                  <Icon name="plus" size={13} /> Add Contact
                </button>
              </div>

              {additionalContacts.length === 0 ? (
                <div className="empty" style={{ padding: '30px 20px' }}>
                  <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>No additional contacts</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {additionalContacts.map(contact => (
                    <div key={contact.id} style={{ background: 'var(--surface)', padding: '14px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{contact.name}</div>
                        {contact.email && <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{contact.email}</div>}
                        {contact.phone && <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{contact.phone}</div>}
                        {contact.role && <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>{contact.role}</div>}
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteAdditionalContact(contact.id)} title="Remove">
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "notes" && (
            <div>
              <div className="notes-list">
                {lp.notes.length === 0 && <div className="text-muted">No notes yet. Add one below.</div>}
                {lp.notes.map((n, i) => (
                  <div key={i} className="note-item">
                    <div className="note-meta">{n.date} · {n.author}</div>
                    <div className="note-text">{n.text}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <textarea
                  className="field"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--sans)", fontSize: 13.5, minHeight: 80, resize: "vertical", outline: "none" }}
                  placeholder="Add a note…"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                />
                <button className="btn btn-primary btn-sm mt-2" onClick={addNote}>Save Note</button>
              </div>
            </div>
          )}

          {tab === "docs" && (
            <div>
              {lp.docs.length === 0 && <div className="text-muted">No documents on file.</div>}
              {lp.docs.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                  <div className="flex-row">
                    <Icon name="note" size={15} />
                    <span style={{ fontSize: 13.5 }}>{d}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          {!editing && <button className="btn btn-outline btn-sm" onClick={onPortal}><Icon name="portal" size={13} /> View Portal</button>}
          {!editing && <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Icon name="edit" size={13} /> Edit</button>}
          {editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>}
          {editing && <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Changes</button>}
        </div>

        {showAddContact && (
          <AddContactModal 
            lpId={lp.id} 
            onClose={() => setShowAddContact(false)}
            onSave={() => { setShowAddContact(false); loadAdditionalContacts(); }}
          />
        )}
      </div>
    </div>
  );
}

// ── Add Contact Modal ──
function AddContactModal({ lpId, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' });

  const handleSave = async () => {
    if (!form.name) {
      alert('Please enter a name');
      return;
    }

    try {
      const { error } = await supabase
        .from('lp_additional_contacts')
        .insert([{
          lp_id: lpId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role
        }]);

      if (error) throw error;
      onSave();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">Add Contact</div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field span2">
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Laura Barnett" />
            </div>
            <div className="field span2">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="laura@example.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div className="field">
              <label>Role</label>
              <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Operations" />
            </div>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Add Contact</button>
        </div>
      </div>
    </div>
  );
}

// ── Add LP Drawer ─────────────────────────────────────────────────────────────
function AddLPDrawer({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", // Primary contact name
    firm: "",
    email: "",
    phone: "",
    additionalContacts: []
  });

  const [showAddContact, setShowAddContact] = useState(false);

  const addAdditionalContact = () => {
    if (form.additionalContacts.length >= 3) {
      alert('Maximum 3 additional contacts');
      return;
    }
    setShowAddContact(true);
  };

  const saveAdditionalContact = (contact) => {
    setForm({
      ...form,
      additionalContacts: [...form.additionalContacts, contact]
    });
    setShowAddContact(false);
  };

  const removeContact = (index) => {
    setForm({
      ...form,
      additionalContacts: form.additionalContacts.filter((_, i) => i !== index)
    });
  };

  const save = async () => {
    if (!form.name.trim() || !form.firm.trim()) {
      alert('Please enter LP/Firm name and Primary Contact');
      return;
    }

    try {
      // Create LP record in Supabase
      const { data: lp, error: lpError } = await supabase
        .from('lps')
        .insert([{
          name: form.name, // Primary contact name
          firm: form.firm,
          email: form.email,
          phone: form.phone,
          stage: 'outreach',
          partner: PARTNERS[0],
          commitment: 0,
          funded: 0,
          nav: 0,
          fund: null, // Will be assigned from fund pages
          notes: [],
          docs: [],
          distributions: []
        }])
        .select()
        .single();

      if (lpError) throw lpError;

      // Add additional contacts
      if (form.additionalContacts.length > 0) {
        const contactsToInsert = form.additionalContacts.map(c => ({
          lp_id: lp.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          role: c.role
        }));

        const { error: contactsError } = await supabase
          .from('lp_additional_contacts')
          .insert(contactsToInsert);

        if (contactsError) throw contactsError;
      }

      onSave(lp);
    } catch (error) {
      console.error('Error adding LP:', error);
      alert('Error adding LP: ' + error.message);
    }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">Add New LP</div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field span2"><label>LP / Firm Name *</label><input value={form.firm} onChange={f("firm")} placeholder="Trophy Point Partners" /></div>
            <div className="field span2"><label>Primary Contact Name *</label><input value={form.name} onChange={f("name")} placeholder="Thomas Hendrix" /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={f("email")} placeholder="thomas@trophypoint.com" /></div>
            <div className="field"><label>Phone</label><input value={form.phone} onChange={f("phone")} placeholder="(555) 123-4567" /></div>
          </div>

          {/* Additional Contacts */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Additional Contacts ({form.additionalContacts.length}/3)</h4>
              {form.additionalContacts.length < 3 && (
                <button className="btn btn-outline btn-sm" onClick={addAdditionalContact}>
                  <Icon name="plus" size={12} /> Add Contact
                </button>
              )}
            </div>

            {form.additionalContacts.map((contact, i) => (
              <div key={i} style={{ background: 'var(--surface)', padding: '12px', borderRadius: 6, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{contact.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{contact.email} · {contact.role}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeContact(i)}>
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Add LP</button>
        </div>

        {showAddContact && (
          <AddAdditionalContactModal
            onClose={() => setShowAddContact(false)}
            onSave={saveAdditionalContact}
          />
        )}
      </div>
    </div>
  );
}

// Mini modal for adding additional contact
function AddAdditionalContactModal({ onClose, onSave }) {
  const [contact, setContact] = useState({ name: '', email: '', phone: '', role: '' });

  const handleSave = () => {
    if (!contact.name) {
      alert('Please enter a name');
      return;
    }
    onSave(contact);
  };

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div className="drawer" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">Add Additional Contact</div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field span2">
              <label>Name *</label>
              <input value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder="Laura Barnett" />
            </div>
            <div className="field span2">
              <label>Email</label>
              <input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="laura@example.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div className="field">
              <label>Role</label>
              <input value={contact.role} onChange={e => setContact({ ...contact, role: e.target.value })} placeholder="Operations" />
            </div>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PIPELINE PAGE (Kanban) ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function PipelinePage({ lps, saveLPs }) {
  const [selected, setSelected] = useState(null);

  const byStage = STAGES.map(s => ({
    ...s,
    lps: lps.filter(l => l.stage === s.id),
  }));

  const moveStage = (lp, stage) => {
    saveLPs(lps.map(l => l.id === lp.id ? { ...l, stage } : l));
  };

  return (
    <div>
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="text-muted">Drag LPs through stages by clicking a card and changing its stage below.</p>
        <div style={{ fontFamily: "var(--serif)", color: "var(--gold-dark)", fontSize: 15 }}>
          {lps.filter(l => l.stage === "closed").length} closed · {fmtMoney(lps.filter(l => l.stage === "closed").reduce((s, l) => s + l.commitment, 0), true)} committed
        </div>
      </div>

      <div className="kanban">
        {byStage.map(col => (
          <div key={col.id} className="kanban-col">
            <div className="kanban-col-header" style={{ background: col.bg, color: col.color }}>
              {col.label}
              <span className="kanban-count" style={{ background: col.color + "30" }}>{col.lps.length}</span>
            </div>
            <div className="kanban-cards">
              {col.lps.length === 0 && <div style={{ fontSize: 12, color: "var(--ink-muted)", textAlign: "center", padding: "20px 0" }}>—</div>}
              {col.lps.map(lp => (
                <div key={lp.id} className="kanban-card" onClick={() => setSelected(lp)}>
                  <div className="name">{lp.name}</div>
                  <div className="firm">{lp.firm}</div>
                  {lp.commitment > 0 && <div className="amount">{fmtMoney(lp.commitment, true)}</div>}
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 5 }}>{lp.partner}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <LPDetailDrawer
          lp={selected}
          onClose={() => setSelected(null)}
          onSave={(updated) => {
            saveLPs(lps.map(l => l.id === updated.id ? updated : l));
            setSelected(updated);
          }}
          onDelete={(id) => { saveLPs(lps.filter(l => l.id !== id)); setSelected(null); }}
          onPortal={() => {}}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PORTFOLIO PAGE ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// Seed schedule of investments data — each company has multiple financing rounds
const SEED_SCHEDULE = []; // Removed seed data

function PortfolioPage({ fundDefs }) {
  const [schedule, setSchedule] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [addFinancingFor, setAddFinancingFor] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // {compIdx, finIdx, field}
  const [editCompanyIdx, setEditCompanyIdx] = useState(null); // index into schedule for editing company
  const [editFinancing, setEditFinancing] = useState(null); // {compIdx, finIdx} for editing financing

  // Get fund names from fundDefs, or fall back to FUNDS constant
  const fundNames = fundDefs?.map(f => f.name) || FUNDS;
  
  console.log('🎯 PortfolioPage - fundDefs:', fundDefs);
  console.log('🎯 PortfolioPage - fundNames:', fundNames);

  useEffect(() => {
    loadPortfolioFromSupabase();
  }, []);

  const loadPortfolioFromSupabase = async () => {
    try {
      // Load companies
      const { data: companies, error: compError } = await supabase
        .from('portfolio_companies')
        .select('*')
        .order('company_name');
      
      if (compError) throw compError;

      // Load all financings
      const { data: financings, error: finError } = await supabase
        .from('financings')
        .select('*')
        .order('date');
      
      if (finError) throw finError;

      // Combine into schedule format
      const schedule = (companies || []).map(comp => ({
        company: comp.company_name,
        companyId: comp.id, // Store the database ID
        sector: comp.sector,
        fund: comp.fund_name || '',
        manualFMV: comp.manual_fmv,
        financings: (financings || [])
          .filter(f => f.company_id === comp.id)
          .map(f => ({
            id: f.id,
            asset: f.asset,
            fund: f.fund || '',
            date: f.date,
            invested: parseFloat(f.invested) || 0,
            shares: parseInt(f.shares) || 0,
            costPerShare: parseFloat(f.cost_per_share) || 0,
            fmvPerShare: parseFloat(f.fmv_per_share) || 0,
            converted: f.converted !== undefined ? f.converted : true,
            value: 0 // Calculated on the fly
          }))
      }));

      console.log('📂 Loaded portfolio from Supabase:', schedule);
      setSchedule(schedule);
    } catch (error) {
      console.error('❌ Error loading portfolio:', error);
      setSchedule([]);
    }
  };

  const saveSchedule = async (updated) => {
    setSchedule(updated);
    // Portfolio is now saved through individual add/update/delete functions
    // This function kept for compatibility but doesn't save to Supabase
  };

  const toggleExpand = (company) => setExpanded(prev => ({ ...prev, [company]: !prev[company] }));

  if (!schedule) return <div style={{ padding: 40, color: "var(--ink-muted)" }}>Loading…</div>;

  // Totals across all - using auto-calculated values with manual overrides
  const totalInvested = schedule.reduce((total, comp) => {
    return total + comp.financings.reduce((s, f) => s + f.invested, 0);
  }, 0);
  
  const totalValue = schedule.reduce((total, comp) => {
    // FMV logic: manual override > most recent by date > last entered
    let syncedFMV = 0;
    if (comp.manualFMV !== undefined && comp.manualFMV !== null) {
      syncedFMV = comp.manualFMV;
    } else if (comp.financings.length > 0) {
      const sortedByDate = [...comp.financings].sort((a, b) => new Date(b.date) - new Date(a.date));
      syncedFMV = sortedByDate[0]?.costPerShare || 0;
    }

    return total + comp.financings.reduce((s, f) => {
      // Unconverted SAFEs/Notes: value = invested amount
      const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
      if (isUnconverted) return s + f.invested;
      // Auto-calculate shares if not provided: invested / cost_per_share
      const shares = f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0);
      const fmv = syncedFMV || f.fmvPerShare || f.costPerShare;
      return s + (shares * fmv);
    }, 0);
  }, 0);

  const totalShares = schedule.reduce((total, comp) => {
    return total + comp.financings.reduce((s, f) => {
      const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
      if (isUnconverted) return s;
      return s + (f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0));
    }, 0);
  }, 0);
  const totalGainLoss = totalValue - totalInvested;
  const blendedMOIC   = totalInvested > 0 ? (totalValue / totalInvested).toFixed(2) : "—";

  const updateFinancing = async (compIdx, finIdx, field, val) => {
    const comp = schedule[compIdx];
    const fin = comp.financings[finIdx];
    
    try {
      // Map field names to database columns
      const fieldMap = {
        date: 'date',
        invested: 'invested',
        costPerShare: 'cost_per_share',
        fmvPerShare: 'fmv_per_share',
        asset: 'asset',
        shares: 'shares',
        converted: 'converted'
      };
      
      const dbField = fieldMap[field] || field;
      const { error } = await supabase
        .from('financings')
        .update({ [dbField]: isNaN(+val) ? val : +val })
        .eq('id', fin.id);
      
      if (error) throw error;
      
      // Update local state
      const updated = schedule.map((c, ci) => ci !== compIdx ? c : {
        ...c,
        financings: c.financings.map((f, fi) => fi !== finIdx ? f : { ...f, [field]: isNaN(+val) ? val : +val })
      });
      setSchedule(updated);
    } catch (error) {
      console.error('❌ Error updating financing:', error);
      alert('Error updating financing');
    }
  };

  const deleteFinancing = async (compIdx, finIdx) => {
    if (!confirm('Delete this financing round?')) return;
    
    const comp = schedule[compIdx];
    const fin = comp.financings[finIdx];
    
    try {
      const { error } = await supabase
        .from('financings')
        .delete()
        .eq('id', fin.id);
      
      if (error) throw error;
      
      // Update local state
      const updated = schedule.map((c, ci) => ci !== compIdx ? c : {
        ...c,
        financings: c.financings.filter((f, fi) => fi !== finIdx)
      });
      setSchedule(updated);
    } catch (error) {
      console.error('❌ Error deleting financing:', error);
      alert('Error deleting financing');
    }
  };

  const deleteCompany = async (compIdx) => {
    const company = schedule[compIdx];
    if (!confirm(`Delete ${company.company} and all its financing rounds?`)) return;
    
    try {
      // Use the stored database ID
      if (company.companyId) {
        const { error } = await supabase
          .from('portfolio_companies')
          .delete()
          .eq('id', company.companyId);
        
        if (error) throw error;
      }
      
      // Update local state
      const updated = schedule.filter((c, ci) => ci !== compIdx);
      setSchedule(updated);
    } catch (error) {
      console.error('❌ Error deleting company:', error);
      alert('Error deleting company');
    }
  };

  const updateCompanyFMV = async (compIdx, fmv) => {
    const company = schedule[compIdx];
    
    try {
      // Use stored database ID
      if (company.companyId) {
        const { error } = await supabase
          .from('portfolio_companies')
          .update({ manual_fmv: fmv })
          .eq('id', company.companyId);
        
        if (error) throw error;
      }
      
      // Update local state
      const updated = schedule.map((c, ci) => ci !== compIdx ? c : { ...c, manualFMV: fmv });
      setSchedule(updated);
    } catch (error) {
      console.error('❌ Error updating FMV:', error);
      alert('Error updating FMV');
    }
  };

  const updateCompany = async (compIdx, updates) => {
      const company = schedule[compIdx];
      try {
        if (company.companyId) {
          const { error } = await supabase
            .from('portfolio_companies')
            .update({
              company_name: updates.company,
              sector: updates.sector
            })
            .eq('id', company.companyId);
          if (error) throw error;
        }
        const updated = schedule.map((c, ci) => ci !== compIdx ? c : {
          ...c,
          company: updates.company,
          sector: updates.sector
        });
        setSchedule(updated);
        setEditCompanyIdx(null);
      } catch (error) {
        console.error('❌ Error updating company:', error);
        alert('Error updating company');
      }
    };

  const updateFinancingFull = async (compIdx, finIdx, updates) => {
    const comp = schedule[compIdx];
    const fin = comp.financings[finIdx];
    try {
      const { error } = await supabase
        .from('financings')
        .update({
          asset: updates.asset,
          fund: updates.fund,
          date: updates.date,
          invested: updates.invested,
          shares: updates.shares || 0,
          cost_per_share: updates.costPerShare || 0,
          fmv_per_share: updates.fmvPerShare || 0,
          converted: updates.converted !== undefined ? updates.converted : true
        })
        .eq('id', fin.id);
      if (error) throw error;

      const updated = schedule.map((c, ci) => ci !== compIdx ? c : {
        ...c,
        financings: c.financings.map((f, fi) => fi !== finIdx ? f : {
          ...f,
          asset: updates.asset,
          fund: updates.fund,
          date: updates.date,
          invested: updates.invested,
          shares: updates.shares || 0,
          costPerShare: updates.costPerShare || 0,
          fmvPerShare: updates.fmvPerShare || 0,
          converted: updates.converted !== undefined ? updates.converted : true
        })
      });
      setSchedule(updated);
      setEditFinancing(null);
    } catch (error) {
      console.error('❌ Error updating financing:', error);
      alert('Error updating financing');
    }
  };

  
  const addFinancing = async (compIdx, fin) => {
    console.log('➕ Adding financing:', fin, 'to company index:', compIdx);
    const company = schedule[compIdx];
    
    try {
      if (!company.companyId) throw new Error('Company ID not found');
      
      // Insert financing
      const { data: newFin, error } = await supabase
        .from('financings')
        .insert({
          company_id: company.companyId,
          asset: fin.asset,
          fund: fin.fund || '',
          date: fin.date,
          invested: fin.invested,
          shares: fin.shares || 0,
          cost_per_share: fin.costPerShare || 0,
          fmv_per_share: fin.fmvPerShare || 0,
          converted: fin.converted !== undefined ? fin.converted : true
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update local state
      const updated = schedule.map((c, ci) => ci !== compIdx ? c : {
        ...c,
        financings: [...c.financings, {
          id: newFin.id,
          asset: newFin.asset,
          fund: newFin.fund || '',
          date: newFin.date,
          invested: parseFloat(newFin.invested) || 0,
          shares: parseInt(newFin.shares) || 0,
          costPerShare: parseFloat(newFin.cost_per_share) || 0,
          fmvPerShare: parseFloat(newFin.fmv_per_share) || 0,
          converted: newFin.converted !== undefined ? newFin.converted : true,
          value: 0
        }]
      });
      console.log('📊 Updated schedule:', updated);
      setSchedule(updated);
      setAddFinancingFor(null);
    } catch (error) {
      console.error('❌ Error adding financing:', error);
      alert('Error adding financing: ' + error.message);
    }
  };

  const addCompany = async (comp) => {
    console.log('➕ Adding company:', comp);
    
    try {
      // Insert company
      const { data: newComp, error } = await supabase
        .from('portfolio_companies')
        .insert({
          company_name: comp.company,
          sector: comp.sector
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updated = [...schedule, { 
        company: newComp.company_name,
        companyId: newComp.id,
        sector: newComp.sector,
        manualFMV: null,
        financings: [] 
      }];
      console.log('📊 Updated schedule:', updated);
      setSchedule(updated);
      setShowAddCompany(false);
    } catch (error) {
      console.error('❌ Error adding company:', error);
      alert('Error adding company: ' + error.message);
    }
  };

  return (
    <div>
      <div className="stats-row">
        <StatCard label="Total Invested" value={fmtMoney(totalInvested, true)} sub={`${schedule.length} companies`} />
        <StatCard label="Portfolio Value" value={fmtMoney(totalValue, true)} sub="Current marks" gold />
        <StatCard label="Blended MOIC" value={`${blendedMOIC}x`} sub="Multiple on invested capital" />
        <StatCard label="Unrealized Gain" value={fmtMoney(totalGainLoss, true)} sub={totalGainLoss >= 0 ? "Gain" : "Loss"} />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Schedule of Investments</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddCompany(true)}>
            <Icon name="plus" size={13} /> Add Company
          </button>
        </div>
        
        {/* Auto-calculation explanation */}
        <div style={{ background: 'var(--gold-light)', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--gold-dark)' }}>
          <strong>💡 Auto-calculations:</strong> Shares = Investment ÷ Cost/Share  •  Value = Shares × FMV/Share  •  FMV syncs from latest round's cost/share  •  Click any field to edit
        </div>

        {/* Header row */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ width: 220 }}>Company / Asset</th>
                <th>Sector</th>
                <th>Fund</th>
                <th>Inv. Date</th>
                <th style={{ textAlign: "right" }}>Shares</th>
                <th style={{ textAlign: "right" }}>Invested</th>
                <th style={{ textAlign: "right" }}>Value</th>
                <th style={{ textAlign: "right" }}>Gain / Loss</th>
                <th style={{ textAlign: "right" }}>Cost / Sh.</th>
                <th style={{ textAlign: "right" }}>FMV / Sh.</th>
                <th style={{ textAlign: "right" }}>MOIC</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((comp, compIdx) => {
                // FMV logic: manual override > most recent by date > last entered
                let syncedFMV = 0;
                if (comp.manualFMV !== undefined && comp.manualFMV !== null) {
                  syncedFMV = comp.manualFMV; // Manual override
                } else if (comp.financings.length > 0) {
                  // Find most recent round by date
                  const sortedByDate = [...comp.financings].sort((a, b) => new Date(b.date) - new Date(a.date));
                  syncedFMV = sortedByDate[0]?.costPerShare || 0;
                }
                
                const compInvested = comp.financings.reduce((s, f) => s + f.invested, 0);
                const compValue = comp.financings.reduce((s, f) => {
                  const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
                  if (isUnconverted) return s + f.invested;
                  const shares = f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0);
                  const fmv = syncedFMV || f.fmvPerShare || f.costPerShare;
                  return s + (shares * fmv);
                }, 0);
                const compShares   = comp.financings.reduce((s, f) => {
                  const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
                  if (isUnconverted) return s;
                  return s + (f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0));
                }, 0);
                const compGL       = compValue - compInvested;
                const compMOIC     = compInvested > 0 ? (compValue / compInvested).toFixed(2) : "—";
                const isOpen       = expanded[comp.company];

                // Get unique funds across all financings
                const fundsInvested = [...new Set(comp.financings.map(f => f.fund).filter(Boolean))];
                const fundDisplay = fundsInvested.length === 1 
                  ? fundsInvested[0].replace("Decisive Point ", "")
                  : fundsInvested.length > 1 
                    ? `${fundsInvested.length} funds`
                    : "—";

                return [
                  /* ── Company summary row (accordion header) ── */
                  <tr key={comp.company + "_header"}
                    onClick={() => toggleExpand(comp.company)}
                    style={{ background: "#faf9f6", cursor: "pointer", borderTop: "2px solid var(--border)" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          display: "inline-block", width: 16, height: 16, lineHeight: "16px",
                          textAlign: "center", fontSize: 10, color: "var(--gold-dark)",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)"
                        }}>▶</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{comp.company}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{comp.financings.length} financing{comp.financings.length !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge-blue stat-badge">{comp.sector}</span></td>
                    <td>
                      <span className="tag" style={{ fontSize: 11 }} title={fundsInvested.length > 1 ? fundsInvested.join(', ') : ''}>
                        {fundDisplay}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink-muted)", fontSize: 12 }}>—</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{compShares.toLocaleString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoney(compInvested)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: compValue >= compInvested ? "var(--green)" : "var(--red)" }}>{fmtMoney(compValue)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: compGL >= 0 ? "var(--green)" : "var(--red)" }}>{compGL >= 0 ? "+" : ""}{fmtMoney(compGL)}</td>
                    <td style={{ textAlign: "right", color: "var(--ink-muted)" }}>—</td>
                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <span style={{ color: comp.manualFMV !== undefined ? 'var(--gold-dark)' : 'var(--ink)', fontWeight: comp.manualFMV !== undefined ? 600 : 400 }}>
                          ${syncedFMV.toFixed(2)}
                        </span>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => {
                            const newFMV = prompt(`Set FMV per share for ${comp.company}:`, syncedFMV);
                            if (newFMV !== null) updateCompanyFMV(compIdx, newFMV === '' ? null : +newFMV);
                          }}
                          title="Override FMV per share"
                          style={{ padding: '2px 4px' }}
                        >
                          <Icon name="edit" size={10} />
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`stat-badge ${+compMOIC >= 2 ? "badge-green" : +compMOIC >= 1 ? "badge-gold" : "badge-red"}`}>{compMOIC}x</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditCompanyIdx(compIdx)} title="Edit company">
                          <Icon name="edit" size={12} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setAddFinancingFor(compIdx)} title="Add financing round">
                          <Icon name="plus" size={12} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteCompany(compIdx)} title="Delete company" style={{ color: 'var(--red)' }}>
                          <Icon name="close" size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>,

                  /* ── Financing rows (expanded) ── */
                  ...(isOpen ? comp.financings.map((fin, finIdx) => {
                    // Get latest round for tooltip reference
                    const latestRound = comp.financings[comp.financings.length -1];
                    // Use same FMV logic
                    const displayFMV = syncedFMV || fin.fmvPerShare || fin.costPerShare;

                    // Check if this is an unconverted SAFE/Note
                    const isUnconverted = (fin.asset === "SAFE" || fin.asset === "Convertible Note") && fin.converted === false;

                    // Auto-calculate shares if not provided
                    const calculatedShares = isUnconverted ? 0 : (fin.shares || (fin.costPerShare > 0 ? Math.round(fin.invested / fin.costPerShare) : 0));

                    // For unconverted SAFEs/Notes, value = invested; otherwise shares * FMV
                    const calculatedValue = isUnconverted ? fin.invested : (calculatedShares * displayFMV);

                    // Calculate gain/loss and MOIC from auto-calculated value
                    const gl = calculatedValue - fin.invested;
                    const moic = fin.invested > 0 ? (calculatedValue / fin.invested).toFixed(2) : "—";
                    
                    const cellKey = (field) => `${compIdx}-${finIdx}-${field}`;
                    const isEditing = (field) => editingCell === cellKey(field);
                    const editCell = (field, val, isNum = true) => {
                      updateFinancing(compIdx, finIdx, field, isNum ? +val : val);
                      setEditingCell(null);
                    };
                    const EditableCell = ({ field, isNum = true, align = "right" }) => (
                      isEditing(field)
                        ? <input
                            autoFocus
                            defaultValue={fin[field]}
                            onBlur={e => editCell(field, e.target.value, isNum)}
                            onKeyDown={e => { if (e.key === "Enter") editCell(field, e.target.value, isNum); if (e.key === "Escape") setEditingCell(null); }}
                            style={{ width: "100%", border: "1px solid var(--gold)", borderRadius: 4, padding: "2px 6px", fontSize: 12, textAlign: align, fontFamily: "var(--sans)", background: "#fff", outline: "none" }}
                          />
                        : <span
                            onClick={() => setEditingCell(cellKey(field))}
                            title="Click to edit"
                            style={{ cursor: "text", borderBottom: "1px dashed transparent", transition: "border 0.1s" }}
                            onMouseEnter={e => e.target.style.borderBottomColor = "var(--gold)"}
                            onMouseLeave={e => e.target.style.borderBottomColor = "transparent"}
                          >
                            {isNum && field !== "costPerShare" && field !== "fmvPerShare" && field !== "shares" 
                              ? fmtMoney(fin[field]) 
                              : field === "shares" 
                                ? (fin[field] || 0).toLocaleString() 
                                : fin[field]}
                          </span>
                    );
                    return (
                      <tr key={fin.id} style={{ background: "#fff" }}>
                        <td style={{ paddingLeft: 44 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, background: "var(--gold-light)", color: "var(--gold-dark)", borderRadius: 4, padding: "2px 7px", fontWeight: 500 }}>{fin.asset}</span>
                            {isUnconverted && (
                              <span style={{ fontSize: 9, background: "#fff3cd", color: "#856404", borderRadius: 4, padding: "1px 5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Unconverted</span>
                            )}
                          </div>
                        </td>
                        <td></td>
                        <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                          <span style={{ fontSize: 11 }} title="Fund is set at company level">
                            {fin.fund ? fin.fund.replace("Decisive Point ", "") : "—"}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {isEditing("date")
                            ? <input autoFocus defaultValue={fin.date} type="date" onBlur={e => editCell("date", e.target.value, false)} style={{ border: "1px solid var(--gold)", borderRadius: 4, padding: "2px 4px", fontSize: 12, fontFamily: "var(--sans)" }} />
                            : <span onClick={() => setEditingCell(cellKey("date"))} style={{ cursor: "text" }}>{fin.date}</span>
                          }
                        </td>
                        <td style={{ textAlign: "right", fontSize: 12 }}>
                          {isUnconverted
                            ? <span style={{ color: "var(--ink-muted)" }}>—</span>
                            : <span style={{ color: "var(--ink-muted)" }} title="Auto-calculated: Investment ÷ Cost/Share">
                                {calculatedShares.toLocaleString()}
                              </span>
                          }
                        </td>
                        <td style={{ textAlign: "right", fontSize: 12 }}><EditableCell field="invested" /></td>
                        <td style={{ textAlign: "right", fontSize: 12, color: calculatedValue >= fin.invested ? "var(--green)" : "var(--red)" }}>
                          <span title={isUnconverted ? "Unconverted - value equals investment amount" : "Auto-calculated: Shares × FMV/Share"}>{fmtMoney(calculatedValue)}</span>
                        </td>
                        <td style={{ textAlign: "right", fontSize: 12, color: gl >= 0 ? "var(--green)" : "var(--red)" }}>{gl >= 0 ? "+" : ""}{fmtMoney(gl)}</td>
                        <td style={{ textAlign: "right", fontSize: 12 }}>
                          {isUnconverted
                            ? <span style={{ color: "var(--ink-muted)" }}>—</span>
                            : fin.costPerShare > 0 ? <EditableCell field="costPerShare" /> : <span style={{ color: "var(--ink-muted)" }}>N/A</span>
                          }
                        </td>
                        <td style={{ textAlign: "right", fontSize: 12 }}>
                          {isUnconverted
                            ? <span style={{ color: "var(--ink-muted)" }}>—</span>
                            : displayFMV > 0 ? (
                              <span title={finIdx < comp.financings.length - 1 ? `Synced from latest round (${latestRound.asset})` : "Latest round - sets FMV for all rounds"} style={{ color: finIdx === comp.financings.length - 1 ? "var(--gold-dark)" : "var(--ink-muted)" }}>
                                ${displayFMV.toFixed(2)}
                              </span>
                            ) : <span style={{ color: "var(--ink-muted)" }}>N/A</span>
                          }
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`stat-badge ${+moic >= 2 ? "badge-green" : +moic >= 1 ? "badge-gold" : "badge-red"}`}>{moic}x</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditFinancing({ compIdx, finIdx })}
                              title="Edit this round"
                              style={{ padding: '2px 4px' }}
                            >
                              <Icon name="edit" size={10} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => deleteFinancing(compIdx, finIdx)}
                              title="Delete this round"
                              style={{ color: 'var(--red)', padding: '2px 4px' }}
                            >
                              <Icon name="close" size={10} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : [])
                ];
              })}

              {/* ── Grand totals row ── */}
              <tr style={{ background: "var(--ink)", color: "#fff", borderTop: "2px solid var(--border)" }}>
                <td colSpan={4} style={{ fontWeight: 600, fontSize: 13, color: "#fff", paddingLeft: 18 }}>Total Portfolio</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: "var(--gold-light)" }}>{totalShares.toLocaleString()}</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: "var(--gold-light)" }}>{fmtMoney(totalInvested)}</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: totalValue >= totalInvested ? "#a8f0c6" : "#f0a8a8" }}>{fmtMoney(totalValue)}</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: totalGainLoss >= 0 ? "#a8f0c6" : "#f0a8a8" }}>{totalGainLoss >= 0 ? "+" : ""}{fmtMoney(totalGainLoss)}</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-light)" }}>{blendedMOIC}x</span>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Financing Modal */}
      {addFinancingFor !== null && (
        <AddFinancingModal
          company={schedule[addFinancingFor]?.company}
          fundNames={fundNames}
          onClose={() => setAddFinancingFor(null)}
          onSave={(fin) => addFinancing(addFinancingFor, fin)}
        />
      )}

      {/* Add Company Modal */}
      {showAddCompany && (
        <AddCompanyModal
          onClose={() => setShowAddCompany(false)}
          onSave={addCompany}
        />
      )}
      
      {/* Edit Company Modal */}
      {editCompanyIdx !== null && (
        <EditCompanyModal
          company={schedule[editCompanyIdx]}
          onClose={() => setEditCompanyIdx(null)}
          onSave={(updates) => updateCompany(editCompanyIdx, updates)}
        />
      )}

      {/* Edit Financing Modal */}
      {editFinancing !== null && (
        <EditFinancingModal
          company={schedule[editFinancing.compIdx]?.company}
          financing={schedule[editFinancing.compIdx]?.financings[editFinancing.finIdx]}
          fundNames={fundNames}
          onClose={() => setEditFinancing(null)}
          onSave={(updates) => updateFinancingFull(editFinancing.compIdx, editFinancing.finIdx, updates)}
        />
      )}
    </div>
  );
}

function AddFinancingModal({ company, fundNames, onClose, onSave }) {
  const [form, setForm] = useState({
    asset: "SAFE",
    fund: "",
    date: "",
    invested: 0,
    costPerShare: 0,
    manualShares: 0
  });
  const [useManualShares, setUseManualShares] = useState(false);
  const [converted, setConverted] = useState(true);

  const isSafeOrNote = form.asset === "SAFE" || form.asset === "Convertible Note";
  const isUnconverted = isSafeOrNote && !converted;

  // Auto-calculate shares when invested or costPerShare changes
  const calculatedShares = form.costPerShare > 0 ? Math.round(form.invested / form.costPerShare) : 0;
  const finalShares = isUnconverted ? 0 : (useManualShares ? form.manualShares : calculatedShares);

  const handleSave = () => {
    if (!form.date || !form.invested) {
      alert('Please fill in Date and Investment Amount');
      return;
    }

    // For unconverted SAFEs/Notes, only investment amount is needed
    if (!isUnconverted) {
      if (!useManualShares && !form.costPerShare) {
        alert('Please enter Cost per Share or toggle to manual shares entry');
        return;
      }

      if (useManualShares && !form.manualShares) {
        alert('Please enter number of shares');
        return;
      }
    }

    // Save with calculated or manual shares
    onSave({
      ...form,
      shares: finalShares,
      converted: isSafeOrNote ? converted : true,
      value: form.invested, // Initial value equals investment
      costPerShare: isUnconverted ? 0 : form.costPerShare,
      fmvPerShare: isUnconverted ? 0 : (form.costPerShare || 0)
    });
  };

  const f = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">Add Financing Round</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>{company}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field"><label>Asset / Round</label>
              <select value={form.asset} onChange={f("asset")}>
                {["SAFE","Convertible Note","Seed","Series A","Series A-1","Series B","Series C","Series D","Bridge","Other"].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field"><label>Fund</label>
              <select value={form.fund} onChange={f("fund")}>
                <option value="">— No fund —</option>
                {fundNames.map(fn => <option key={fn} value={fn}>{fn}</option>)}
              </select>
            </div>

            {/* Converted toggle - only shown for SAFE / Convertible Note */}
            {isSafeOrNote && (
              <div className="field span2" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={converted}
                    onChange={e => setConverted(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>This {form.asset} has converted</span>
                </label>
              </div>
            )}

            <div className="field"><label>Investment Date *</label><input type="date" value={form.date} onChange={f("date")} /></div>
            <div className="field"><label>Investment Amount ($) *</label>
              <input
                type="number"
                value={form.invested}
                onChange={e => setForm({...form, invested: +e.target.value})}
                placeholder="1000000"
              />
            </div>

            {/* If unconverted SAFE/Note, show info message instead of share fields */}
            {isUnconverted ? (
              <div className="field span2" style={{ background: 'var(--gold-light)', padding: '10px 12px', borderRadius: 6, fontSize: 11, color: 'var(--gold-dark)' }}>
                <strong>Unconverted {form.asset}:</strong> The investment amount will be used as both the invested amount and the current value until this {form.asset} converts. No share or cost-per-share information is required.
              </div>
            ) : (
              <>
                {/* Toggle for manual shares entry */}
                <div className="field span2" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={useManualShares}
                      onChange={e => setUseManualShares(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Manual shares entry</span>
                  </label>
                </div>

                {!useManualShares ? (
                  <>
                    <div className="field"><label>Cost per Share ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.costPerShare}
                        onChange={e => setForm({...form, costPerShare: +e.target.value})}
                        placeholder="5.00"
                      />
                    </div>
                    <div className="field" style={{ background: 'var(--surface)', padding: '12px', borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <label style={{ color: 'var(--ink-muted)', marginBottom: 4, fontSize: 11 }}>Calculated Shares</label>
                      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--gold-dark)' }}>
                        {calculatedShares.toLocaleString()}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="field"><label>Number of Shares *</label>
                      <input
                        type="number"
                        value={form.manualShares}
                        onChange={e => setForm({...form, manualShares: +e.target.value})}
                        placeholder="200000"
                      />
                    </div>
                    <div className="field"><label>Cost per Share ($) <span style={{fontSize: 11, color: 'var(--ink-muted)'}}>(optional)</span></label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.costPerShare}
                        onChange={e => setForm({...form, costPerShare: +e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}

                <div className="field span2" style={{ background: 'var(--gold-light)', padding: '10px 12px', borderRadius: 6, fontSize: 11, color: 'var(--gold-dark)' }}>
                  <strong>Note:</strong> {useManualShares
                    ? "Manual shares mode - enter exact share count."
                    : "Auto-calculation mode - shares will be calculated from investment amount ÷ cost per share."
                  }
                </div>
              </>
            )}
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Add Round</button>
        </div>
      </div>
    </div>
  );
}

function AddCompanyModal({ onClose, onSave }) {
  const [form, setForm] = useState({ company: "", sector: "" });
  const f = k => e => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">Add Portfolio Company</div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field span2"><label>Company Name</label><input value={form.company} onChange={f("company")} placeholder="Acme Corp" /></div>
            <div className="field span2"><label>Sector</label><input value={form.sector} onChange={f("sector")} placeholder="AI/ML" /></div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 12, padding: '10px', background: 'var(--surface)', borderRadius: 6 }}>
            💡 After adding the company, add financing rounds to specify which fund(s) invested.
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.company) onSave(form); }}>Add Company</button>
        </div>
      </div>
    </div>
  );
}

function EditCompanyModal({ company, onClose, onSave }) {
  const [form, setForm] = useState({ company: company.company, sector: company.sector || "" });
  const f = k => e => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">Edit Company</div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field span2"><label>Company Name</label><input value={form.company} onChange={f("company")} placeholder="Acme Corp" /></div>
            <div className="field span2"><label>Sector</label><input value={form.sector} onChange={f("sector")} placeholder="AI/ML" /></div>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.company) onSave(form); }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function EditFinancingModal({ company, financing, fundNames, onClose, onSave }) {
  const [form, setForm] = useState({
    asset: financing.asset || "SAFE",
    fund: financing.fund || "",
    date: financing.date || "",
    invested: financing.invested || 0,
    costPerShare: financing.costPerShare || 0,
    manualShares: financing.shares || 0
  });
  const isSafeOrNote = form.asset === "SAFE" || form.asset === "Convertible Note";
  const [converted, setConverted] = useState(
    financing.converted !== undefined ? financing.converted : true
  );
  const isUnconverted = isSafeOrNote && !converted;
  const [useManualShares, setUseManualShares] = useState(
    financing.shares > 0 && financing.costPerShare > 0 && financing.shares !== Math.round(financing.invested / financing.costPerShare)
  );

  const calculatedShares = form.costPerShare > 0 ? Math.round(form.invested / form.costPerShare) : 0;
  const finalShares = isUnconverted ? 0 : (useManualShares ? form.manualShares : calculatedShares);

  const handleSave = () => {
    if (!form.date || !form.invested) {
      alert('Please fill in Date and Investment Amount');
      return;
    }
    if (!isUnconverted) {
      if (!useManualShares && !form.costPerShare) {
        alert('Please enter Cost per Share or toggle to manual shares entry');
        return;
      }
      if (useManualShares && !form.manualShares) {
        alert('Please enter number of shares');
        return;
      }
    }
    onSave({
      ...form,
      shares: finalShares,
      converted: isSafeOrNote ? converted : true,
      costPerShare: isUnconverted ? 0 : form.costPerShare,
      fmvPerShare: isUnconverted ? 0 : (form.costPerShare || 0)
    });
  };

  const f = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">Edit Financing Round</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>{company}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field"><label>Asset / Round</label>
              <select value={form.asset} onChange={f("asset")}>
                {["SAFE","Convertible Note","Seed","Series A","Series A-1","Series B","Series C","Series D","Bridge","Other"].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field"><label>Fund</label>
              <select value={form.fund} onChange={f("fund")}>
                <option value="">— No fund —</option>
                {fundNames.map(fn => <option key={fn} value={fn}>{fn}</option>)}
              </select>
            </div>

            {/* Converted toggle - only shown for SAFE / Convertible Note */}
            {isSafeOrNote && (
              <div className="field span2" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={converted}
                    onChange={e => setConverted(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>This {form.asset} has converted</span>
                </label>
              </div>
            )}

            <div className="field"><label>Investment Date *</label><input type="date" value={form.date} onChange={f("date")} /></div>
            <div className="field"><label>Investment Amount ($) *</label>
              <input
                type="number"
                value={form.invested}
                onChange={e => setForm({...form, invested: +e.target.value})}
                placeholder="1000000"
              />
            </div>

            {isUnconverted ? (
              <div className="field span2" style={{ background: 'var(--gold-light)', padding: '10px 12px', borderRadius: 6, fontSize: 11, color: 'var(--gold-dark)' }}>
                <strong>Unconverted {form.asset}:</strong> The investment amount will be used as both the invested amount and the current value until this {form.asset} converts. No share or cost-per-share information is required.
              </div>
            ) : (
              <>
                <div className="field span2" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={useManualShares}
                      onChange={e => setUseManualShares(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Manual shares entry</span>
                  </label>
                </div>

                {!useManualShares ? (
                  <>
                    <div className="field"><label>Cost per Share ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.costPerShare}
                        onChange={e => setForm({...form, costPerShare: +e.target.value})}
                        placeholder="5.00"
                      />
                    </div>
                    <div className="field" style={{ background: 'var(--surface)', padding: '12px', borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <label style={{ color: 'var(--ink-muted)', marginBottom: 4, fontSize: 11 }}>Calculated Shares</label>
                      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--gold-dark)' }}>
                        {calculatedShares.toLocaleString()}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="field"><label>Number of Shares *</label>
                      <input
                        type="number"
                        value={form.manualShares}
                        onChange={e => setForm({...form, manualShares: +e.target.value})}
                        placeholder="200000"
                      />
                    </div>
                    <div className="field"><label>Cost per Share ($) <span style={{fontSize: 11, color: 'var(--ink-muted)'}}>(optional)</span></label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.costPerShare}
                        onChange={e => setForm({...form, costPerShare: +e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// ── ADD FUND MODAL ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AddFundModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    vintage: new Date().getFullYear(),
    target: 0,
    status: "raising"
  });

  const handleSave = async () => {
    if (!form.name.trim() || form.target <= 0) {
      alert("Please enter a fund name and target amount");
      return;
    }

    const fullName = form.name.includes("Decisive Point") 
      ? form.name 
      : `Decisive Point ${form.name}`;

    const newFund = {
      name: fullName,
      vintage: form.vintage,
      target_amount: form.target,
      status: form.status
    };

    try {
      // Save to Supabase instead of browser storage
      const { data, error } = await window.supabase
        .from('funds')
        .insert([newFund])
        .select();
      
      if (error) throw error;
      
      // Show success and reload to update sidebar
      alert(`✓ Fund "${fullName}" created successfully!`);
      window.location.reload();
    } catch (err) {
      console.error("Error saving fund:", err);
      alert(`Error creating fund: ${err.message}`);
    }
  };

  const f = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">Add New Fund</div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field span2">
              <label>Fund Name</label>
              <input 
                value={form.name} 
                onChange={f("name")} 
                placeholder="Fund IV" 
              />
              <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>
                Will be prefixed with "Decisive Point" if not included
              </div>
            </div>
            <div className="field">
              <label>Vintage Year</label>
              <input 
                type="number" 
                value={form.vintage} 
                onChange={e => setForm({ ...form, vintage: parseInt(e.target.value) })} 
                placeholder="2024" 
              />
            </div>
            <div className="field">
              <label>Target Raise ($)</label>
              <input 
                type="number" 
                value={form.target} 
                onChange={e => setForm({ ...form, target: parseFloat(e.target.value) })} 
                placeholder="100000000" 
              />
            </div>
            <div className="field span2">
              <label>Status</label>
              <select value={form.status} onChange={f("status")}>
                <option value="raising">Raising</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Create Fund</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SETTINGS PAGE ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPage({ lps, session }) {
  const [employees, setEmployees] = useState([]);
  const [lpUsers, setLpUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteInstructions, setShowInviteInstructions] = useState(null); // 'employee' or 'lp'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      // Load all user profiles
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Separate employees and LPs
      const emps = profiles?.filter(p => p.role === 'employee' || p.role === 'admin') || [];
      const lpProfiles = profiles?.filter(p => p.role === 'lp') || [];

      setEmployees(emps);
      setLpUsers(lpProfiles);
    } catch (error) {
      console.error('Error loading team:', error);
      setEmployees([]);
      setLpUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, role) => {
    try {
      // Delete user profile
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setMessage({ type: 'success', text: `${role === 'employee' ? 'Employee' : 'LP'} removed successfully` });
      setDeleteConfirm(null);
      loadTeamData();
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const copyInstructions = (type) => {
    const instructions = type === 'employee' 
      ? `To invite an employee:
1. Go to supabase.com → your project → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter their email and temporary password
4. Click "Create user"
5. Go to Table Editor → user_profiles
6. Find their row (should be auto-created)
7. Make sure role = 'employee'
8. Send them their login credentials manually

Once they log in at your app URL, they'll have full CRM access.`
      : `To grant LP portal access:
1. Go to supabase.com → your project → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter their email (can be different from LP contact email)
4. Click "Create user"
5. Copy the user's ID
6. Go to Table Editor → lps
7. Find the LP record you want to link
8. Paste the user ID into the user_id field
9. Go to Table Editor → user_profiles
10. Find their row and set role = 'lp'

Send them the portal URL and their credentials. They'll only see their own investment data.`;

    navigator.clipboard.writeText(instructions);
    setMessage({ type: 'success', text: 'Instructions copied to clipboard!' });
  };

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Loading team data...</div>;
  }

  return (
    <div>
      {/* Team Members */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Team Members ({employees.length})</span>
          <button className="btn btn-primary btn-sm" onClick={() => copyInstructions('employee')}>
            <Icon name="plus" size={13} /> Copy Invite Instructions
          </button>
        </div>
        <div className="card-body">
          {employees.length === 0 ? (
            <div className="empty"><p>No employees yet. Click above to invite your first team member.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name / ID</th>
                  <th>Role</th>
                  <th>Details</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="td-name">{emp.full_name || 'No name set'}</div>
                      <div className="td-sub" style={{ fontFamily: 'monospace', fontSize: 11 }}>{emp.id}</div>
                    </td>
                    <td><span className="stat-badge badge-gold">{emp.role}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                      View in Supabase
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                      {new Date(emp.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteConfirm({ id: emp.id, name: emp.full_name || emp.id, role: 'employee' })}
                        title="Remove user"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* LP Portal Access */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">LP Portal Access ({lpUsers.length})</span>
          <button className="btn btn-primary btn-sm" onClick={() => copyInstructions('lp')}>
            <Icon name="plus" size={13} /> Copy LP Access Instructions
          </button>
        </div>
        <div className="card-body">
          {lpUsers.length === 0 ? (
            <div className="empty"><p>No LP portal access granted yet. Click above for instructions.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Linked LP</th>
                  <th>Details</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lpUsers.map(lp => {
                  const linkedLP = lps.find(l => l.user_id === lp.id);
                  return (
                    <tr key={lp.id}>
                      <td>
                        <div className="td-sub" style={{ fontFamily: 'monospace', fontSize: 11 }}>{lp.id}</div>
                      </td>
                      <td>
                        {linkedLP 
                          ? <div><div className="td-name">{linkedLP.name}</div><div className="td-sub">{linkedLP.firm}</div></div>
                          : <span style={{ color: 'var(--ink-muted)' }}>Not linked</span>}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                        View in Supabase
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                        {new Date(lp.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteConfirm({ id: lp.id, name: linkedLP?.name || lp.id, role: 'lp' })}
                          title="Revoke portal access"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="drawer" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">Confirm Deletion</div>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}><Icon name="close" /></button>
            </div>
            <div className="drawer-body">
              <p style={{ fontSize: 14, marginBottom: 16 }}>
                Are you sure you want to remove <strong>{deleteConfirm.name}</strong>?
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                {deleteConfirm.role === 'employee' 
                  ? 'They will lose access to the CRM immediately.'
                  : 'They will lose access to the investor portal immediately.'}
              </p>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button 
                className="btn" 
                style={{ background: 'var(--red)', color: '#fff' }}
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.role)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Toast */}
      {message && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: message.type === 'error' ? 'var(--red-bg)' : 'var(--green-bg)',
          border: `1px solid ${message.type === 'error' ? 'var(--red)' : 'var(--green)'}`,
          color: message.type === 'error' ? 'var(--red)' : 'var(--green)',
          padding: '16px 20px',
          borderRadius: 10,
          boxShadow: 'var(--shadow-lg)',
          maxWidth: 400,
          fontSize: 13,
          zIndex: 1000
        }}>
          {message.text}
          <button
            onClick={() => setMessage(null)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >×</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PORTAL PICKER (for internal preview) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function PortalPickerPage({ lps, onSelect }) {
  const eligible = lps.filter(l => l.stage === "closed" && l.commitment > 0);

  return (
    <div>
      <div style={{ background: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: 10, padding: "14px 18px", marginBottom: 22, fontSize: 13.5, color: "var(--gold-dark)" }}>
        <b>Preview Mode:</b> Select an LP below to see exactly what they would see on their investor portal. In production, each LP would receive a secure login link.
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Closed LPs — Portal Preview</span></div>
        <div className="card-body">
          <table>
            <thead>
              <tr><th>Investor</th><th>Fund</th><th>Commitment</th><th>NAV</th><th></th></tr>
            </thead>
            <tbody>
              {eligible.map(lp => (
                <tr key={lp.id} onClick={() => onSelect(lp)}>
                  <td>
                    <div className="flex-row">
                      <div className="avatar">{initials(lp.name)}</div>
                      <div><div className="td-name">{lp.name}</div><div className="td-sub">{lp.firm}</div></div>
                    </div>
                  </td>
                  <td><span className="tag">{lp.fund}</span></td>
                  <td>{fmtMoney(lp.commitment)}</td>
                  <td style={{ color: "var(--green)", fontWeight: 500 }}>{fmtMoney(lp.nav)}</td>
                  <td><button className="btn btn-outline btn-sm"><Icon name="portal" size={13} /> View Portal</button></td>
                </tr>
              ))}
              {eligible.length === 0 && <tr><td colSpan={5}><div className="empty">No closed LPs yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── INVESTOR PORTAL (LP-facing) ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function InvestorPortal({ lp, onExit }) {
  const totalReturn = lp.nav - lp.funded;
  const returnPct = lp.funded > 0 ? ((lp.nav / lp.funded - 1) * 100).toFixed(1) : 0;
  const totalDistributions = lp.distributions.reduce((s, d) => s + d.amount, 0);
  const fundPortfolio = PORTFOLIO.filter(p => p.fund === lp.fund);

  return (
    <>
      <header className="portal-header">
        <img src="data:image/png;base64,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knqJ5AyONo7yTyChN0i+lpXXfynGtL5ZrfbzvHNeS0sqJx2HqR2xtP1R8/w4e8PB7IrVYtW6hWOS1XWlqr5TUb6S6U0J4jA1rg6LjI5B3nyeaeYG3cQotL9SPfJI6SRznvcSXOcdySe8r8oCmF7G7mHU3TJMDqJdm1EbbpRtJ+nbtHL8JBiPqYVD1b50fsuODayYzkb5eqpoK1sVW7fl5PJ8rlJ8dmuJ9YCC1xF/Huaxhe9wa1o3JJ2ACih0jOllQWPyjGtMJYLjcxuya8EB9PTns+VDsld9sfMH23cHZNc9a8O0mtfHeKjy28Ss4qS1U7x10vg53/ls3+mPp2DiNlXnrRq7mOq178tyKt6uiicTR22AltPTDxDfpnbdrzuT6BsBpd6ulxvV1qLrd66or6+peZJ6iokL5JHeJceZXjQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQF2LRvpEZ5ptY6ywU04utplppI6Wnqnnehlc0hskTuZADiCWHzTsduEklcdRB/XEucXOJJJ3JPev4iICIiAuhaK6wZjpTevK8frOuoJXA1dsqCXU9QPHb6V+3Y8c/Hcbg89RB78ju1XfshuN8r38dXcKqWqnd4vkcXO/lJXgW4O00zP9jWn1Fiss0+OTTSRGpi84xcB4S57Rzawu3Ad2btIO3LfT0BERAREQEREBERAREQF97dWVNvuFPX0croammlbNDI3tY9pBaR6iAvgtwodNMzq9OLhqEyzTR45QuY19XL5vWlzwzeNp5vAc4buHIeKDN63a15pqxXtN8qm0lqhdxU1rpSWwRns4nb83v+2d2bnbYHZc0REBERAREQdf1M6Qme5thVrw+Sq9rLVSUMVNWNpnnrLg9jA0vmf28J234BsOfPi2G3IERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBF78fs9zv95pbNZqOWtuFW/q4IIxu6R3gFv37AOsv73t5/iN/rQcyRbTnOnma4PFSy5bjldZ2VbnNp3VDQOsLduIDY924/GtWQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAR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YJKTBsXp7VxbgVtwk6+UDxbGAGtPrLx6FGHMMpyLL71JecmvFZda+TkZqiTiIH1LR2Nb9qAAPBEQYZERBs2leV/INqHZcu8g9sPaupE/k3XdV1uwI24+F23b27FSm93P/wDa7+f/AP8AHREHGek1rp+zT8j/AP8Apb2i9pvKf/5Dynruu6r/ANNnDt1Xp34u7bnxlEQS+wDpjW3GMEx/GpMDq6p9ptlNQumbcmtEhiiaziA6s7b8O+268OrPS4t2cacXzEosHqqF90pTA2odcGvEe5B34erG/Z4oiCJ6IiAiIglVoz0sbfp/plZcOmwmquEltifGahlwbGJOKRz9+EsO3zW3b3LKZ/0xrbk+CZBjUeB1dK+7WypoWzOuTXCMyxOZxEdWN9uLfbdEQRBREQfaiqqmirIayiqJqapgeJIZonlj43g7hzXDmCDzBCklp70yNQLDRw0WTWq35PFEA0TvcaapcB9U9oLTy7+DfvJKIg3+Ppx20saZNOatr9hxBt2aQD6D1Q3/ABL9e7jtX73Vb+dG/wB2iIIta3Z0NStT7vmotftWLj1P/hev67q+rhji+b4W778G/YNt9ue260tEQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf/Z" alt="Decisive Point" style={{ maxHeight: 36, objectFit: "contain" }} />
        <div className="flex-row">
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{lp.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{lp.firm}</div>
          </div>
          <button className="btn btn-ghost" style={{ color: "rgba(255,255,255,0.5)" }} onClick={onExit}>
            <Icon name="logout" size={15} /> Exit Preview
          </button>
        </div>
      </header>

      <div className="portal-content fade-in">
        <div className="portal-welcome">
          <h2>Welcome back, {lp.name.split(" ")[0]}</h2>
          <p>Your investor summary as of {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {lp.fund}</p>
        </div>

        {/* Big summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 24 }}>
          <div className="portal-card" style={{ borderTop: "3px solid var(--gold)" }}>
            <h3>Committed Capital</h3>
            <div className="portal-big-num">{fmtMoney(lp.commitment)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Funded: {fmtMoney(lp.funded)}</div>
            <div className="progress-track mt-2">
              <div className="progress-fill" style={{ width: lp.commitment > 0 ? `${(lp.funded / lp.commitment) * 100}%` : "0%" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 5 }}>
              {lp.commitment > 0 ? Math.round((lp.funded / lp.commitment) * 100) : 0}% funded
            </div>
          </div>

          <div className="portal-card" style={{ borderTop: "3px solid var(--green)" }}>
            <h3>Current NAV</h3>
            <div className="portal-big-num" style={{ color: "var(--green)" }}>{fmtMoney(lp.nav)}</div>
            <div style={{ fontSize: 13, color: lp.nav >= lp.funded ? "var(--green)" : "var(--red)" }}>
              {lp.nav >= lp.funded ? "▲" : "▼"} {fmtMoney(Math.abs(totalReturn))} ({returnPct}%)
            </div>
          </div>

          <div className="portal-card" style={{ borderTop: "3px solid var(--blue)" }}>
            <h3>Total Distributions</h3>
            <div className="portal-big-num" style={{ color: "var(--blue)" }}>{fmtMoney(totalDistributions)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{lp.distributions.length} distribution{lp.distributions.length !== 1 ? "s" : ""} received</div>
          </div>
        </div>

        <div className="portal-grid">
          {/* Account Details */}
          <div className="portal-card">
            <h3>Account Details</h3>
            <div className="portal-row"><span className="lbl">Fund</span><span className="val">{lp.fund}</span></div>
            <div className="portal-row"><span className="lbl">Investor Type</span><span className="val">{lp.tier}</span></div>
            <div className="portal-row"><span className="lbl">Relationship Manager</span><span className="val">{lp.partner}</span></div>
            <div className="portal-row"><span className="lbl">Commitment</span><span className="val">{fmtMoney(lp.commitment)}</span></div>
            <div className="portal-row"><span className="lbl">Capital Called</span><span className="val">{fmtMoney(lp.funded)}</span></div>
            <div className="portal-row"><span className="lbl">Uncalled Capital</span><span className="val">{fmtMoney(lp.commitment - lp.funded)}</span></div>
          </div>

          {/* Distributions */}
          <div className="portal-card">
            <h3>Distribution History</h3>
            {lp.distributions.length === 0
              ? <div className="text-muted" style={{ padding: "20px 0" }}>No distributions have been made yet.</div>
              : lp.distributions.map((d, i) => (
                  <div key={i} className="dist-row">
                    <span style={{ fontSize: 13 }}>{d.date}</span>
                    <span className="stat-badge badge-green">{d.type}</span>
                    <span style={{ fontWeight: 600, color: "var(--green)" }}>{fmtMoney(d.amount)}</span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Portfolio Companies */}
        {fundPortfolio.length > 0 && (
          <div className="portal-card mt-4">
            <h3>Fund Portfolio — {lp.fund}</h3>
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Sector</th>
                  <th>Stage</th>
                  <th>MOIC</th>
                </tr>
              </thead>
              <tbody>
                {fundPortfolio.map((c, i) => (
                  <tr key={i}>
                    <td><div className="td-name">{c.company}</div></td>
                    <td><span className="badge-blue stat-badge">{c.sector}</span></td>
                    <td style={{ fontSize: 13 }}>{c.stage}</td>
                    <td>
                      <span className={`stat-badge ${c.moic >= 2 ? "badge-green" : c.moic >= 1 ? "badge-gold" : "badge-red"}`}>
                        {c.moic.toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Documents */}
        {lp.docs.length > 0 && (
          <div className="portal-card mt-4">
            <h3>Your Documents</h3>
            {lp.docs.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < lp.docs.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="flex-row">
                  <Icon name="note" size={15} />
                  <span style={{ fontSize: 13.5 }}>{d}</span>
                </div>
                <button className="btn btn-outline btn-sm"><Icon name="download" size={13} /> Download</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── FUND PAGE ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function FundPage({ fundName, fundDefs, lps, saveLPs, onPortal }) {
  const [activeTab, setActiveTab] = useState('lps'); // 'lps' or 'portfolio'
  const [selectedLP, setSelectedLP] = useState(null);
  const [showAddLP, setShowAddLP] = useState(false);
  const [investments, setInvestments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fd = (fundDefs || FUND_DEFS).find(f => f.name === fundName) || FUND_DEFS[0];

  useEffect(() => {
    loadFundData();
    loadPortfolio();
  }, [fundName]);

  const loadFundData = async () => {
    try {
      // Get fund ID
      const { data: fundData, error: fundError } = await supabase
        .from('funds')
        .select('id')
        .eq('name', fundName)
        .single();

      if (fundError) {
        console.error('Fund lookup error:', fundError);
        setInvestments([]);
        setContacts([]);
        setLoading(false);
        return;
      }

      if (!fundData) {
        console.warn('Fund not found:', fundName);
        setInvestments([]);
        setContacts([]);
        setLoading(false);
        return;
      }

      // Load investment records for this fund
      const { data: investmentData, error: invError } = await supabase
        .from('lps')
        .select('*')
        .eq('fund_id', fundData.id)
        .eq('is_contact_record', false);

      if (invError) {
        console.error('Investment load error:', invError);
        setInvestments([]);
      } else {
        // Manually load contact data for each investment
        const investmentsWithContacts = await Promise.all(
          (investmentData || []).map(async (inv) => {
            if (!inv.parent_lp_id) return { ...inv, contact: null };
            
            const { data: contactData } = await supabase
              .from('lps')
              .select('*')
              .eq('id', inv.parent_lp_id)
              .single();
            
            return { ...inv, contact: contactData };
          })
        );
        setInvestments(investmentsWithContacts);
      }

      // Load all contacts for dropdown
      const { data: contactData, error: contactError } = await supabase
        .from('lps')
        .select('*')
        .eq('is_contact_record', true)
        .order('name');

      if (contactError) {
        console.error('Contact load error:', contactError);
        setContacts([]);
      } else {
        setContacts(contactData || []);
      }
    } catch (error) {
      console.error('Error loading fund data:', error);
      setInvestments([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      // Load companies
      const { data: companies, error: compError } = await supabase
        .from('portfolio_companies')
        .select('*')
        .order('company_name');
      
      if (compError) throw compError;

      // Load all financings
      const { data: financings, error: finError } = await supabase
        .from('financings')
        .select('*')
        .order('date');
      
      if (finError) throw finError;

      // Combine into schedule format
      const allCompanies = (companies || []).map(comp => ({
        company: comp.company_name,
        companyId: comp.id,
        sector: comp.sector,
        manualFMV: comp.manual_fmv,
        financings: (financings || [])
          .filter(f => f.company_id === comp.id)
          .map(f => ({
            id: f.id,
            asset: f.asset,
            fund: f.fund,
            date: f.date,
            invested: parseFloat(f.invested),
            shares: parseInt(f.shares),
            costPerShare: parseFloat(f.cost_per_share) || 0,
            fmvPerShare: parseFloat(f.fmv_per_share) || 0,
            converted: f.converted !== undefined ? f.converted : true,
            value: 0
          }))
      }));
      
      setPortfolio(allCompanies);
    } catch (error) {
      console.error('Portfolio load error:', error);
      setPortfolio([]);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Loading fund data...</div>;
  }

  const closedInvestments = investments.filter(inv => inv.stage === "closed");
  const pipelineInvestments = investments.filter(inv => inv.stage !== "closed");
  const committed = investments.reduce((s, inv) => s + (inv.commitment || 0), 0);
  const funded = investments.reduce((s, inv) => s + (inv.funded || 0), 0);
  const nav = investments.reduce((s, inv) => s + (inv.nav || 0), 0);
  const pct = fd.target > 0 ? (committed / fd.target) * 100 : 0;
  const oversubscribed = committed > fd.target;
  const shortName = fundName.replace("Decisive Point ", "");

  // pipeline by stage
  const byStage = STAGES.map(s => ({
    ...s, lps: investments.filter(inv => inv.stage === s.id),
  }));

  return (
    <div>
      {/* ── Fund summary header — light card ── */}
      <div className="card" style={{ marginBottom: 22, padding: "22px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Decisive Point · Vintage {fd.vintage}
            </div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>{shortName}</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {fd.status === "raising" && <span style={{ fontSize: 11, background: "var(--gold-light)", color: "var(--gold-dark)", borderRadius: 8, padding: "3px 10px", fontWeight: 600 }}>LIVE RAISE</span>}
              {fd.status === "closed" && oversubscribed && <span className="badge-green stat-badge" style={{ fontSize: 11, padding: "3px 10px" }}>OVERSUBSCRIBED</span>}
              {fd.status === "closed" && !oversubscribed && <span className="badge-gray stat-badge" style={{ fontSize: 11, padding: "3px 10px" }}>CLOSED</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Target Raise</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--gold-dark)" }}>{fmtMoney(fd.target, true)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 24, color: oversubscribed ? "var(--green)" : "var(--gold-dark)" }}>
            {fmtMoney(committed, true)}
          </span>
          <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>
            {Math.round(pct)}% of target
            {oversubscribed && <span style={{ color: "var(--green)", marginLeft: 8, fontWeight: 600 }}>+{fmtMoney(committed - fd.target, true)} over</span>}
          </span>
        </div>
        <div className="progress-track" style={{ height: 10, marginBottom: 18 }}>
          <div style={{
            height: "100%", borderRadius: 5,
            background: oversubscribed
              ? "linear-gradient(90deg, var(--gold), var(--green))"
              : "linear-gradient(90deg, var(--gold), #a07de8)",
            width: `${Math.min(pct, 100)}%`,
            transition: "width 0.6s ease",
          }} />
        </div>

        {/* Key metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {[
            { label: "Committed",    val: fmtMoney(committed, true) },
            { label: "Funded",       val: fmtMoney(funded, true) },
            { label: "Closed LPs",   val: closedInvestments.length },
            { label: "In Pipeline",  val: pipelineInvestments.length },
            { label: nav > 0 ? "Portfolio NAV" : "Remaining", val: nav > 0 ? fmtMoney(nav, true) : fmtMoney(Math.max(fd.target - committed, 0), true) },
          ].map(item => (
            <div key={item.label} style={{ background: "var(--surface)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stage breakdown ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 22 }}>
        {byStage.map(s => (
          <div key={s.id} style={{ background: s.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${s.color}30` }}>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: s.color }}>{s.lps.length}</div>
            {s.lps.length > 0 && (
              <div style={{ fontSize: 11, color: s.color, opacity: 0.7, marginTop: 3 }}>
                {fmtMoney(s.lps.reduce((acc, l) => acc + (l.commitment || 0), 0), true)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, borderBottom: '2px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('lps')}
          style={{
            background: activeTab === 'lps' ? 'var(--gold-light)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'lps' ? '3px solid var(--gold-dark)' : '3px solid transparent',
            color: activeTab === 'lps' ? 'var(--gold-dark)' : 'var(--ink-muted)',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.2s'
          }}
        >
          LPs & Pipeline
        </button>
        <button 
          onClick={() => setActiveTab('portfolio')}
          style={{
            background: activeTab === 'portfolio' ? 'var(--gold-light)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'portfolio' ? '3px solid var(--gold-dark)' : '3px solid transparent',
            color: activeTab === 'portfolio' ? 'var(--gold-dark)' : 'var(--ink-muted)',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.2s'
          }}
        >
          Portfolio ({portfolio.filter(c => c.financings.some(f => f.fund === fundName)).length})
        </button>
      </div>

      {activeTab === 'lps' && (
      <>
      <div className="two-col">
        {/* ── Pipeline prospects ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pipeline Prospects</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{pipelineInvestments.length} active</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddLP(true)}>
                <Icon name="plus" size={13} /> Add LP
              </button>
            </div>
          </div>
          <div className="card-body">
            {pipelineInvestments.length === 0
              ? <div className="empty" style={{ padding: "30px" }}>
                  <p>No pipeline prospects for this fund.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddLP(true)}>
                    <Icon name="plus" size={13} /> Add First LP
                  </button>
                </div>
              : pipelineInvestments.map(inv => {
                const s = stageInfo(inv.stage);
                const contactName = inv.contact?.name || 'Unknown';
                const contactFirm = inv.contact?.firm || '';
                return (
                  <div key={inv.id} style={{ display: "flex", gap: 10, padding: "11px 18px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer" }}
                    onClick={() => setSelectedLP(inv)}>
                    <div className="avatar">{initials(contactName)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{contactName}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{contactFirm}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="stat-badge" style={{ background: s.bg, color: s.color, display: "block", marginBottom: 3 }}>{s.label}</span>
                      {inv.commitment > 0 && <span style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 600 }}>{fmtMoney(inv.commitment, true)}</span>}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* ── Committed LPs ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Committed LPs</span>
            <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{closedInvestments.length} LPs · {fmtMoney(committed, true)}</span>
          </div>
          <div className="card-body">
            {closedInvestments.length === 0
              ? <div className="empty" style={{ padding: "30px" }}><p>No closed LPs yet.</p></div>
              : closedInvestments.map(inv => {
                const contactName = inv.contact?.name || 'Unknown';
                const contactFirm = inv.contact?.firm || '';
                return (
                  <div key={inv.id}
                    style={{ display: "flex", gap: 10, padding: "11px 18px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer" }}
                    onClick={() => setSelectedLP(inv)}>
                    <div className="avatar">{initials(contactName)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{contactName}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{contactFirm}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, color: "var(--gold-dark)", fontSize: 14 }}>{fmtMoney(inv.commitment, true)}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                        {inv.funded > 0 ? `${Math.round((inv.funded/inv.commitment)*100)}% funded` : "Not yet called"}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      {/* ── Full LP table ── */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">All LPs — {shortName}</span>
        </div>
        <div className="card-body">
          {investments.length === 0
            ? <div className="empty"><p>No LPs assigned to this fund yet.</p></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>Investor</th>
                    <th>Stage</th>
                    <th>Partner</th>
                    <th>Commitment</th>
                    <th>Funded</th>
                    <th>NAV</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => {
                    const s = stageInfo(inv.stage);
                    const contactName = inv.contact?.name || inv.name || 'Unknown';
                    const contactFirm = inv.contact?.firm || inv.firm || '';
                    return (
                      <tr key={inv.id} onClick={() => setSelectedLP(inv)}>
                        <td>
                          <div className="flex-row">
                            <div className="avatar">{initials(contactName)}</div>
                            <div>
                              <div className="td-name">{contactName}</div>
                              <div className="td-sub">{contactFirm}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="stat-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span></td>
                        <td style={{ fontSize: 13 }}>{inv.partner || inv.contact?.partner || '—'}</td>
                        <td style={{ fontWeight: 500 }}>{inv.commitment ? fmtMoney(inv.commitment) : "—"}</td>
                        <td>{inv.funded ? fmtMoney(inv.funded) : "—"}</td>
                        <td style={{ color: inv.nav > inv.funded ? "var(--green)" : "var(--ink)" }}>
                          {inv.nav ? fmtMoney(inv.nav) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </div>
      </div>
      </>
      )}

      {activeTab === 'portfolio' && (
        <FundPortfolioTab portfolio={portfolio} fundName={fundName} />
      )}

      {selectedLP && (
        <LPDetailDrawer
          lp={selectedLP}
          onClose={() => setSelectedLP(null)}
          onSave={(updated) => {
            saveLPs(lps.map(l => l.id === updated.id ? updated : l));
            setSelectedLP(updated);
          }}
          onDelete={(id) => { saveLPs(lps.filter(l => l.id !== id)); setSelectedLP(null); }}
          onPortal={() => { onPortal(selectedLP); setSelectedLP(null); }}
        />
      )}

      {showAddLP && (
        <AddLPToFundModal
          fundName={fundName}
          contacts={contacts}
          onClose={() => setShowAddLP(false)}
          onSave={loadFundData}
        />
      )}
    </div>
  );
}

// ── Fund Portfolio Tab ──
function FundPortfolioTab({ portfolio, fundName }) {
  const [expanded, setExpanded] = useState({});
  
  const toggleExpand = (company) => setExpanded(prev => ({ ...prev, [company]: !prev[company] }));
  
  // Filter companies to only show those with at least one financing from this fund
  // And within each company, only show financings from this fund
  // Keep allFinancings so we can compute company-level FMV (same logic as Portfolio page)
  const fundPortfolio = portfolio
    .map(comp => ({
      ...comp,
      allFinancings: comp.financings, // All company financings for FMV calculation
      financings: comp.financings.filter(f => f.fund === fundName)
    }))
    .filter(comp => comp.financings.length > 0);

// Helper: compute company-level synced FMV using same logic as Portfolio page
  // Priority: manual override > most recent by date > last entered
  const getCompanySyncedFMV = (comp) => {
    if (comp.manualFMV !== undefined && comp.manualFMV !== null) {
      return comp.manualFMV;
    }
    if (comp.allFinancings.length > 0) {
      const sortedByDate = [...comp.allFinancings].sort((a, b) => new Date(b.date) - new Date(a.date));
      return sortedByDate[0]?.costPerShare || 0;
    }
    return 0;
  };
  
  // Calculate fund-level totals (only from this fund's financings)
  const totalInvested = fundPortfolio.reduce((total, comp) => {
    return total + comp.financings.reduce((s, f) => s + f.invested, 0);
  }, 0);
  
  const totalValue = fundPortfolio.reduce((total, comp) => {
     const syncedFMV = getCompanySyncedFMV(comp);
    
    return total + comp.financings.reduce((s, f) => {
      const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
      if (isUnconverted) return s + f.invested;
      const shares = f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0);
      const fmv = syncedFMV || f.fmvPerShare || f.costPerShare;
      return s + (shares * fmv);
    }, 0);
  }, 0);

  const totalShares = fundPortfolio.reduce((total, comp) => {
    return total + comp.financings.reduce((s, f) => {
      const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
      if (isUnconverted) return s;
      return s + (f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0));
    }, 0);
  }, 0);
  const totalGainLoss = totalValue - totalInvested;
  const blendedMOIC = totalInvested > 0 ? (totalValue / totalInvested).toFixed(2) : "—";

  if (fundPortfolio.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="empty" style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h3 style={{ marginBottom: 8 }}>No Portfolio Companies Yet</h3>
            <p style={{ color: 'var(--ink-muted)', marginBottom: 20 }}>
              Add portfolio companies on the main Portfolio page and assign financing rounds to {fundName}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Fund Portfolio Stats */}
      <div className="stats-row" style={{ marginBottom: 22 }}>
        <StatCard label="Total Invested" value={fmtMoney(totalInvested, true)} sub={`${fundPortfolio.length} companies`} />
        <StatCard label="Portfolio Value" value={fmtMoney(totalValue, true)} sub="Current marks" gold />
        <StatCard label="Blended MOIC" value={`${blendedMOIC}x`} sub="Multiple on invested capital" />
        <StatCard label="Unrealized Gain" value={fmtMoney(totalGainLoss, true)} sub={totalGainLoss >= 0 ? "Gain" : "Loss"} />
      </div>

      {/* Portfolio Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">{fundName} Portfolio</span>
        </div>
        
        <div style={{ background: 'var(--gold-light)', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--gold-dark)' }}>
          <strong>💡 Auto-calculations:</strong> Shares = Investment ÷ Cost/Share  •  Value = Shares × FMV/Share  •  FMV syncs from Portfolio page (manual override or latest round)
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ width: 220 }}>Company / Asset</th>
                <th>Sector</th>
                <th>Inv. Date</th>
                <th style={{ textAlign: "right" }}>Shares</th>
                <th style={{ textAlign: "right" }}>Invested</th>
                <th style={{ textAlign: "right" }}>Value</th>
                <th style={{ textAlign: "right" }}>Gain / Loss</th>
                <th style={{ textAlign: "right" }}>Cost / Sh.</th>
                <th style={{ textAlign: "right" }}>FMV / Sh.</th>
                <th style={{ textAlign: "right" }}>MOIC</th>
              </tr>
            </thead>
            <tbody>
              {fundPortfolio.map((comp, compIdx) => {
                const syncedFMV = getCompanySyncedFMV(comp);
                
                const compInvested = comp.financings.reduce((s, f) => s + f.invested, 0);
                const compValue = comp.financings.reduce((s, f) => {
                  const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
                  if (isUnconverted) return s + f.invested;
                  const shares = f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0);
                  const fmv = syncedFMV || f.fmvPerShare || f.costPerShare;
                  return s + (shares * fmv);
                }, 0);
                const compShares = comp.financings.reduce((s, f) => {
                  const isUnconverted = (f.asset === "SAFE" || f.asset === "Convertible Note") && f.converted === false;
                  if (isUnconverted) return s;
                  return s + (f.shares || (f.costPerShare > 0 ? Math.round(f.invested / f.costPerShare) : 0));
                }, 0);
                const compGL = compValue - compInvested;
                const compMOIC = compInvested > 0 ? (compValue / compInvested).toFixed(2) : "—";
                const isOpen = expanded[comp.company];

                return [
                  /* Company summary row */
                  <tr key={comp.company + "_header"}
                    onClick={() => toggleExpand(comp.company)}
                    style={{ background: "#faf9f6", cursor: "pointer", borderTop: "2px solid var(--border)" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          display: "inline-block", width: 16, height: 16, lineHeight: "16px",
                          textAlign: "center", fontSize: 10, color: "var(--gold-dark)",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)"
                        }}>▶</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{comp.company}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{comp.financings.length} financing{comp.financings.length !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge-blue stat-badge">{comp.sector}</span></td>
                    <td style={{ color: "var(--ink-muted)", fontSize: 12 }}>—</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{compShares.toLocaleString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoney(compInvested)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: compValue >= compInvested ? "var(--green)" : "var(--red)" }}>{fmtMoney(compValue)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: compGL >= 0 ? "var(--green)" : "var(--red)" }}>{compGL >= 0 ? "+" : ""}{fmtMoney(compGL)}</td>
                    <td style={{ textAlign: "right", color: "var(--ink-muted)" }}>—</td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ color: comp.manualFMV !== undefined ? 'var(--gold-dark)' : 'var(--ink)', fontWeight: comp.manualFMV !== undefined ? 600 : 400 }}>
                        ${syncedFMV.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`stat-badge ${+compMOIC >= 2 ? "badge-green" : +compMOIC >= 1 ? "badge-gold" : "badge-red"}`}>{compMOIC}x</span>
                    </td>
                  </tr>,

                  /* Financing rows (expanded) */
                  ...(isOpen ? comp.financings.map((fin, finIdx) => {
                    const displayFMV = syncedFMV || fin.fmvPerShare || fin.costPerShare;
                    const isUnconverted = (fin.asset === "SAFE" || fin.asset === "Convertible Note") && fin.converted === false;
                    const calculatedShares = isUnconverted ? 0 : (fin.shares || (fin.costPerShare > 0 ? Math.round(fin.invested / fin.costPerShare) : 0));
                    const calculatedValue = isUnconverted ? fin.invested : (calculatedShares * displayFMV);
                    const gl = calculatedValue - fin.invested;
                    const moic = fin.invested > 0 ? (calculatedValue / fin.invested).toFixed(2) : "—";
                    
                    return (
                      <tr key={fin.id} style={{ background: "#fff" }}>
                        <td style={{ paddingLeft: 44 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, background: "var(--gold-light)", color: "var(--gold-dark)", borderRadius: 4, padding: "2px 7px", fontWeight: 500 }}>{fin.asset}</span>
                            {isUnconverted && (
                              <span style={{ fontSize: 9, background: "#fff3cd", color: "#856404", borderRadius: 4, padding: "1px 5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Unconverted</span>
                            )}
                          </div>
                        </td>
                        <td></td>
                        <td style={{ fontSize: 12 }}>{fin.date}</td>
                        <td style={{ textAlign: "right", fontSize: 12, color: "var(--ink-muted)" }}>
                          {isUnconverted ? "—" : calculatedShares.toLocaleString()}
                        </td>
                        <td style={{ textAlign: "right", fontSize: 12 }}>{fmtMoney(fin.invested)}</td>
                        <td style={{ textAlign: "right", fontSize: 12, color: calculatedValue >= fin.invested ? "var(--green)" : "var(--red)" }}>
                          {fmtMoney(calculatedValue)}
                        </td>
                        <td style={{ textAlign: "right", fontSize: 12, color: gl >= 0 ? "var(--green)" : "var(--red)" }}>{gl >= 0 ? "+" : ""}{fmtMoney(gl)}</td>
                        <td style={{ textAlign: "right", fontSize: 12 }}>
                          {isUnconverted ? <span style={{ color: "var(--ink-muted)" }}>—</span> : fin.costPerShare > 0 ? `$${fin.costPerShare.toFixed(2)}` : <span style={{ color: "var(--ink-muted)" }}>N/A</span>}
                        </td>
                        <td style={{ textAlign: "right", fontSize: 12 }}>
                          {isUnconverted ? <span style={{ color: "var(--ink-muted)" }}>—</span> : displayFMV > 0 ? (
                            <span style={{ color: comp.manualFMV !== undefined && comp.manualFMV !== null ? "var(--gold-dark)" : finIdx === comp.financings.length - 1 ? "var(--gold-dark)" : "var(--ink-muted)" }}>
                              ${displayFMV.toFixed(2)}
                            </span>
                          ) : <span style={{ color: "var(--ink-muted)" }}>N/A</span>}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`stat-badge ${+moic >= 2 ? "badge-green" : +moic >= 1 ? "badge-gold" : "badge-red"}`}>{moic}x</span>
                        </td>
                      </tr>
                    );
                  }) : [])
                ];
              })}

              {/* Grand totals row */}
              <tr style={{ background: "var(--ink)", color: "#fff", borderTop: "2px solid var(--border)" }}>
                <td colSpan={3} style={{ fontWeight: 600, fontSize: 13, color: "#fff", paddingLeft: 18 }}>Fund Total</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: "var(--gold-light)" }}>{totalShares.toLocaleString()}</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: "var(--gold-light)" }}>{fmtMoney(totalInvested)}</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: totalValue >= totalInvested ? "#a8f0c6" : "#f0a8a8" }}>{fmtMoney(totalValue)}</td>
                <td style={{ textAlign: "right", fontWeight: 700, color: totalGainLoss >= 0 ? "#a8f0c6" : "#f0a8a8" }}>{totalGainLoss >= 0 ? "+" : ""}{fmtMoney(totalGainLoss)}</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-light)" }}>{blendedMOIC}x</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Add LP to Fund Modal ──
function AddLPToFundModal({ fundName, contacts, onClose, onSave }) {
  const [allLPs, setAllLPs] = useState([]);
  const [selectedLPId, setSelectedLPId] = useState('');
  const [form, setForm] = useState({
    stage: 'outreach',
    commitment: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllLPs();
  }, []);

  const loadAllLPs = async () => {
    try {
      const { data, error } = await supabase
        .from('lps')
        .select('*')
        .is('fund', null) // Only LPs not yet assigned to a fund
        .order('name');

      if (error) throw error;
      setAllLPs(data || []);
    } catch (error) {
      console.error('Error loading LPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedLPId) {
      alert('Please select an LP');
      return;
    }

    try {
      // Update the LP record with fund assignment
      const { error } = await supabase
        .from('lps')
        .update({
          fund: fundName,
          stage: form.stage,
          commitment: form.commitment
        })
        .eq('id', selectedLPId);

      if (error) throw error;

      onSave();
      onClose();
    } catch (error) {
      console.error('Error adding LP to fund:', error);
      alert('Error adding LP: ' + error.message);
    }
  };

  const selectedLP = allLPs.find(lp => lp.id === selectedLPId);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">Add LP to {fundName.replace('Decisive Point ', '')}</div>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-muted)' }}>
              Loading LPs...
            </div>
          ) : allLPs.length === 0 ? (
            <div className="empty" style={{ padding: '30px 20px' }}>
              <p>No LPs available to add</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8 }}>
                Add LPs to your directory first
              </p>
            </div>
          ) : (
            <div className="form-grid">
              <div className="field span2">
                <label>Select LP *</label>
                <select 
                  value={selectedLPId} 
                  onChange={e => setSelectedLPId(e.target.value)}
                  style={{ fontSize: 14 }}
                >
                  <option value="">Choose from LP Directory...</option>
                  {allLPs.map(lp => (
                    <option key={lp.id} value={lp.id}>
                      {lp.firm} - {lp.name}
                    </option>
                  ))}
                </select>
                {selectedLP && (
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 6 }}>
                    {selectedLP.email} {selectedLP.phone && `· ${selectedLP.phone}`}
                  </div>
                )}
              </div>

              <div className="field">
                <label>Stage</label>
                <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Commitment ($)</label>
                <input
                  type="number"
                  value={form.commitment}
                  onChange={e => setForm({ ...form, commitment: parseFloat(e.target.value) || 0 })}
                  placeholder="5000000"
                />
              </div>
            </div>
          )}
        </div>
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!selectedLPId}>
            Add to Fund
          </button>
        </div>
      </div>
    </div>
  );
}
