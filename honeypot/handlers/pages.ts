function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CSS = `
:root{
  --bg:#f7f8fa;--surface:#ffffff;--text:#111827;--muted:#6b7280;--line:#e5e7eb;
  --brand:#111827;--brand-2:#2563eb;--accent:#0d9488;--accent-2:#0f766e;
  --amber:#d97706;--rose:#e11d48;--radius:14px;--shadow:0 1px 2px rgba(16,24,40,.05),0 8px 24px -12px rgba(16,24,40,.15);
  --shadow-lg:0 12px 40px -16px rgba(16,24,40,.28);
  --font:"Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
button,input,textarea,select{font:inherit}
.container{max-width:1180px;margin:0 auto;padding:0 20px}
.muted{color:var(--muted)}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}

/* ── Top announcement ── */
.announce{background:#0b1220;color:#cbd5e1;font-size:13px;text-align:center;padding:9px 16px;letter-spacing:.2px}
.announce strong{color:#fff;font-weight:600}
.announce a{color:#93c5fd;text-decoration:underline;text-underline-offset:2px}

/* ── Header ── */
.header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.header-inner{display:flex;align-items:center;gap:22px;height:68px}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:19px;letter-spacing:-.4px;flex-shrink:0}
.logo-mark{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);display:grid;place-items:center;color:#fff;font-size:15px;font-weight:800;box-shadow:0 4px 12px rgba(37,99,235,.35)}
.logo span{color:var(--brand-2)}
.nav{display:flex;align-items:center;gap:4px;flex:1}
.nav a{padding:8px 13px;border-radius:8px;font-size:14.5px;font-weight:500;color:#374151;transition:.15s}
.nav a:hover{background:#f3f4f6;color:#111827}
.nav a.active{background:#eff6ff;color:#1d4ed8;font-weight:600}
.header-actions{display:flex;align-items:center;gap:8px}
.icon-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border:1px solid var(--line);background:#fff;border-radius:10px;font-size:13.5px;font-weight:500;color:#374151;cursor:pointer;transition:.15s}
.icon-btn:hover{border-color:#d1d5db;background:#f9fafb}
.icon-btn.primary{background:#111827;color:#fff;border-color:#111827}
.icon-btn.primary:hover{background:#1f2937}
.cart-count{background:var(--brand-2);color:#fff;font-size:11px;font-weight:700;border-radius:99px;padding:1px 7px;margin-left:2px}
.search-pill{display:flex;align-items:center;gap:8px;flex:1;max-width:420px;background:#f3f4f6;border:1px solid transparent;border-radius:12px;padding:9px 14px;transition:.15s}
.search-pill:focus-within{background:#fff;border-color:#93c5fd;box-shadow:0 0 0 3px rgba(37,99,235,.15)}
.search-pill input{border:0;background:transparent;outline:0;width:100%;font-size:14px;color:#111827}
.search-pill input::placeholder{color:#9ca3af}
.search-pill kbd{font-size:11px;color:#9ca3af;background:#fff;border:1px solid var(--line);border-radius:5px;padding:1px 6px}

/* ── Hero ── */
.hero{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(125deg,#0f172a 0%,#1e3a8a 45%,#0f766e 100%);color:#fff;margin-top:26px;box-shadow:var(--shadow-lg)}
.hero::before{content:"";position:absolute;inset:0;background:
  radial-gradient(ellipse 600px 300px at 85% 20%,rgba(56,189,248,.25),transparent),
  radial-gradient(ellipse 400px 260px at 10% 90%,rgba(168,85,247,.2),transparent);pointer-events:none}
.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:32px;padding:52px 48px;position:relative;z-index:1;align-items:center}
.eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);padding:6px 14px;border-radius:99px;font-size:12.5px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;color:#e0f2fe;margin-bottom:18px}
.dot{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,.3)}
.hero h1{margin:0 0 14px;font-size:clamp(30px,4.2vw,46px);line-height:1.1;letter-spacing:-1.2px;font-weight:800}
.hero p{margin:0 0 28px;font-size:16.5px;line-height:1.65;color:#dbeafe;max-width:520px}
.cta-row{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 24px;border-radius:12px;font-size:14.5px;font-weight:600;cursor:pointer;border:0;transition:.18s;text-align:center}
.btn-light{background:#fff;color:#111827;box-shadow:0 4px 14px rgba(0,0,0,.18)}
.btn-light:hover{background:#f3f4f6;transform:translateY(-1px)}
.btn-ghost{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.3)}
.btn-ghost:hover{background:rgba(255,255,255,.18)}
.btn-brand{background:#111827;color:#fff}
.btn-brand:hover{background:#1f2937;transform:translateY(-1px);box-shadow:var(--shadow)}
.btn-blue{background:var(--brand-2);color:#fff}
.btn-blue:hover{background:#1d4ed8;transform:translateY(-1px)}
.btn-block{width:100%}
.btn-lg{padding:15px 28px;font-size:15px;border-radius:13px}
.hero-card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:18px;padding:26px;backdrop-filter:blur(8px)}
.hero-stat{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.12);font-size:14px}
.hero-stat:last-child{border:0;padding-bottom:0}
.hero-stat:first-child{padding-top:0}
.hero-stat b{font-size:22px;font-weight:800;letter-spacing:-.5px}
.hero-stat .sub{font-size:12px;color:#a5f3fc;display:block;font-weight:400}

/* ── Trust bar ── */
.trust{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:22px}
.trust-item{display:flex;gap:12px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;box-shadow:var(--shadow)}
.trust-ico{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;font-size:19px;flex-shrink:0;background:#eff6ff;color:#2563eb}
.trust-ico.green{background:#ecfdf5;color:#059669}
.trust-ico.amber{background:#fffbeb;color:#d97706}
.trust-ico.purple{background:#f5f3ff;color:#7c3aed}
.trust-item h4{margin:0;font-size:13.5px;font-weight:700}
.trust-item p{margin:2px 0 0;font-size:12.5px;color:var(--muted);line-height:1.4}

/* ── Sections ── */
.section{margin:56px 0 0}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap}
.section-head h2{margin:0;font-size:26px;letter-spacing:-.7px;font-weight:800}
.section-head p{margin:6px 0 0;color:var(--muted);font-size:14.5px}
.link-more{font-size:14px;font-weight:600;color:var(--brand-2);white-space:nowrap}
.link-more:hover{text-decoration:underline}

/* ── Category tiles ── */
.cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.cat-tile{position:relative;overflow:hidden;border-radius:16px;padding:24px 20px;min-height:140px;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;box-shadow:var(--shadow);transition:.2s;cursor:pointer}
.cat-tile:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg)}
.cat-tile h3{margin:0;font-size:17px;font-weight:700;position:relative;z-index:1}
.cat-tile span{font-size:13px;opacity:.85;position:relative;z-index:1}
.cat-tile .emoji{position:absolute;top:16px;right:18px;font-size:38px;opacity:.9}
.cat-1{background:linear-gradient(135deg,#1d4ed8,#3b82f6)}
.cat-2{background:linear-gradient(135deg,#0f766e,#14b8a6)}
.cat-3{background:linear-gradient(135deg,#b45309,#f59e0b)}
.cat-4{background:linear-gradient(135deg,#6d28d9,#a78bfa)}

/* ── Product grid ── */
.prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
.prod{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:.2s;display:flex;flex-direction:column;box-shadow:var(--shadow)}
.prod:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:#d1d5db}
.prod-img{position:relative;height:180px;display:grid;place-items:center;font-size:56px;background:linear-gradient(160deg,#f8fafc,#eef2ff)}
.badge{position:absolute;top:12px;left:12px;background:#111827;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px;letter-spacing:.3px}
.badge.sale{background:var(--rose)}
.badge.new{background:var(--brand-2)}
.badge.hot{background:var(--amber)}
.fav{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;background:#fff;border:1px solid var(--line);display:grid;place-items:center;font-size:15px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.06)}
.prod-body{padding:16px 16px 18px;display:flex;flex-direction:column;gap:8px;flex:1}
.prod-cat{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--brand-2)}
.prod-title{margin:0;font-size:15.5px;font-weight:700;letter-spacing:-.2px;line-height:1.35}
.prod-desc{margin:0;font-size:13px;color:var(--muted);line-height:1.5;flex:1}
.stars{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--amber);font-weight:600}
.stars .count{color:var(--muted);font-weight:400;font-size:12.5px}
.price-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}
.price{font-size:19px;font-weight:800;letter-spacing:-.4px}
.price small{font-size:13px;font-weight:500;color:var(--muted);text-decoration:line-through;margin-left:6px}
.add-btn{background:#111827;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s}
.add-btn:hover{background:#2563eb}
.stock{font-size:12px;font-weight:600;color:#059669}
.stock.low{color:var(--amber)}
.stock.out{color:var(--rose)}

/* ── Feature banner ── */
.banner{margin-top:56px;border-radius:20px;overflow:hidden;background:linear-gradient(120deg,#111827,#1e293b 55%,#0f766e);color:#fff;padding:44px 44px;display:grid;grid-template-columns:1.3fr .7fr;gap:28px;align-items:center;box-shadow:var(--shadow-lg);position:relative}
.banner::after{content:"";position:absolute;right:-40px;top:-40px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(45,212,191,.3),transparent 70%)}
.banner h2{margin:0 0 10px;font-size:28px;letter-spacing:-.7px;position:relative;z-index:1}
.banner p{margin:0 0 22px;color:#cbd5e1;font-size:15px;max-width:520px;position:relative;z-index:1}
.banner-side{position:relative;z-index:1;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:22px}
.banner-side h4{margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#99f6e4}
.perk{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.1)}
.perk:last-child{border:0}
.perk i{font-style:normal;color:#34d399;font-weight:700}

/* ── Reviews ── */
.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.rev{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px;box-shadow:var(--shadow)}
.rev .stars{margin-bottom:10px}
.rev p{margin:0 0 16px;font-size:14px;line-height:1.65;color:#374151}
.rev-who{display:flex;align-items:center;gap:11px}
.avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:14px;color:#fff}
.rev-who b{display:block;font-size:13.5px}
.rev-who span{font-size:12px;color:var(--muted)}

/* ── Newsletter ── */
.newsletter{margin-top:56px;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:40px;text-align:center;box-shadow:var(--shadow)}
.newsletter h2{margin:0 0 8px;font-size:24px;letter-spacing:-.5px}
.newsletter p{margin:0 auto 22px;color:var(--muted);max-width:520px;font-size:14.5px}
.nl-form{display:flex;gap:10px;max-width:480px;margin:0 auto}
.nl-form input{flex:1;border:1px solid var(--line);border-radius:12px;padding:13px 16px;font-size:14.5px;outline:0;background:#f9fafb}
.nl-form input:focus{border-color:#93c5fd;box-shadow:0 0 0 3px rgba(37,99,235,.14);background:#fff}
.nl-note{margin-top:12px;font-size:12.5px;color:var(--muted)}

/* ── Footer ── */
.footer{margin-top:64px;background:#0b1220;color:#94a3b8;padding:52px 0 0}
.foot-grid{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:32px;padding-bottom:40px;border-bottom:1px solid #1f2937}
.foot-brand .logo{color:#fff;margin-bottom:14px}
.foot-brand p{font-size:13.5px;line-height:1.65;margin:0 0 16px;max-width:300px}
.socials{display:flex;gap:8px}
.socials a{width:36px;height:36px;border-radius:9px;background:#111827;border:1px solid #1f2937;display:grid;place-items:center;font-size:14px;transition:.15s}
.socials a:hover{background:#1e293b;border-color:#334155;color:#fff}
.foot-col h5{margin:0 0 14px;color:#fff;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:700}
.foot-col a{display:block;font-size:13.5px;padding:5px 0;color:#94a3b8;transition:.12s}
.foot-col a:hover{color:#e2e8f0;transform:translateX(3px)}
.foot-bottom{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding:20px 0 28px;font-size:13px}
.pay-row{display:flex;gap:8px;flex-wrap:wrap}
.pay{background:#111827;border:1px solid #1f2937;border-radius:7px;padding:5px 11px;font-size:11.5px;font-weight:700;color:#cbd5e1;letter-spacing:.4px}

/* ── Forms / cards ── */
.form-wrap{max-width:480px;margin:48px auto}
.form-wrap.wide{max-width:640px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);overflow:hidden}
.card-pad{padding:34px 34px 36px}
.card h1{margin:0 0 6px;font-size:24px;letter-spacing:-.6px}
.card .sub{margin:0 0 24px;color:var(--muted);font-size:14.5px}
.field{margin-bottom:18px}
.field label{display:block;font-size:13px;font-weight:600;margin-bottom:7px;color:#374151}
.field input,.field textarea,.field select{width:100%;border:1px solid var(--line);border-radius:11px;padding:12px 14px;font-size:14.5px;background:#f9fafb;outline:0;transition:.15s;color:#111827}
.field input:focus,.field textarea:focus,.field select:focus{background:#fff;border-color:#93c5fd;box-shadow:0 0 0 3px rgba(37,99,235,.14)}
.field textarea{min-height:120px;resize:vertical}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.alert{display:flex;gap:10px;align-items:flex-start;background:#fffbeb;border:1px solid #fcd34d;color:#92400e;padding:13px 16px;border-radius:11px;font-size:13.5px;margin-bottom:20px;line-height:1.5}
.alert.err{background:#fef2f2;border-color:#fca5a5;color:#991b1b}
.alert.ok{background:#ecfdf5;border-color:#6ee7b7;color:#065f46}
.divider{display:flex;align-items:center;gap:14px;margin:22px 0;color:var(--muted);font-size:13px}
.divider::before,.divider::after{content:"";flex:1;height:1px;background:var(--line)}
.alt-line{text-align:center;font-size:14px;color:var(--muted);margin-top:20px}
.alt-line a{color:var(--brand-2);font-weight:600}
.alt-line a:hover{text-decoration:underline}
.secure-note{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:18px;font-size:12.5px;color:var(--muted)}

/* ── Breadcrumb / page hero ── */
.crumb{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--muted);margin:24px 0 8px;flex-wrap:wrap}
.crumb a:hover{color:var(--brand-2)}
.crumb .sep{opacity:.5}
.page-title{font-size:32px;font-weight:800;letter-spacing:-1px;margin:8px 0 6px}
.page-sub{color:var(--muted);font-size:15px;margin:0 0 8px}

/* ── Admin ── */
.admin-shell{min-height:100vh;display:grid;grid-template-columns:240px 1fr;background:#f3f4f6}
.admin-side{background:#0b1220;color:#94a3b8;padding:24px 16px;display:flex;flex-direction:column;gap:4px}
.admin-side .logo{color:#fff;margin:0 8px 24px;font-size:16px}
.admin-side a{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:9px;font-size:14px;transition:.12s}
.admin-side a:hover{background:#111827;color:#e2e8f0}
.admin-side a.on{background:#1d4ed8;color:#fff;font-weight:600}
.admin-main{padding:28px 32px;overflow:auto}
.admin-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:14px;flex-wrap:wrap}
.admin-top h1{margin:0;font-size:24px;letter-spacing:-.6px}
.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
.kpi-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;box-shadow:var(--shadow)}
.kpi-card .lbl{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted)}
.kpi-card .val{font-size:28px;font-weight:800;letter-spacing:-1px;margin-top:6px}
.kpi-card .delta{font-size:12.5px;margin-top:4px;color:#059669;font-weight:600}
.kpi-card .delta.down{color:#dc2626}
.panel{background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;margin-bottom:18px}
.panel-h{padding:16px 20px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.panel-h h3{margin:0;font-size:15.5px;font-weight:700}
.panel-b{padding:8px 0}
.row{display:grid;grid-template-columns:90px 1fr auto;gap:14px;align-items:center;padding:12px 20px;border-bottom:1px solid #f3f4f6;font-size:13.5px}
.row:last-child{border:0}
.row:hover{background:#f9fafb}
.tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:700;letter-spacing:.2px}
.tag.blue{background:#eff6ff;color:#1d4ed8}
.tag.green{background:#ecfdf5;color:#047857}
.tag.amber{background:#fffbeb;color:#b45309}
.tag.red{background:#fef2f2;color:#b91c1c}
.tag.gray{background:#f3f4f6;color:#4b5563}
.bar-chart{display:flex;align-items:flex-end;gap:8px;height:140px;padding:16px 20px 8px}
.bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}
.bar{width:100%;max-width:36px;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#3b82f6,#1d4ed8);min-height:4px;transition:.3s}
.bar.susp{background:linear-gradient(180deg,#f87171,#dc2626)}
.bar-lbl{font-size:10.5px;color:var(--muted);font-weight:600}

/* ── Dashboard account ── */
.dash-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.dash-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px;box-shadow:var(--shadow)}
.dash-card h3{margin:0 0 6px;font-size:16px}
.dash-card .big{font-size:30px;font-weight:800;letter-spacing:-1px}
.tbl{width:100%;border-collapse:collapse;font-size:13.5px}
.tbl th{text-align:left;padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid var(--line)}
.tbl td{padding:13px 16px;border-bottom:1px solid #f3f4f6}
.tbl tr:last-child td{border:0}
.tbl tr:hover td{background:#f9fafb}

/* ── 404 ── */
.err-wrap{min-height:50vh;display:grid;place-items:center;text-align:center;padding:60px 20px}
.err-code{font-size:96px;font-weight:900;letter-spacing:-6px;background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1}

/* ── Animations ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.fade{animation:fadeUp .45s ease both}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;animation:pulse 1.6s infinite;margin-right:6px}

/* ── Responsive ── */
@media (max-width:960px){
  .hero-grid{grid-template-columns:1fr;padding:36px 28px}
  .trust{grid-template-columns:1fr 1fr}
  .cat-grid{grid-template-columns:1fr 1fr}
  .banner{grid-template-columns:1fr;padding:32px 26px}
  .rev-grid{grid-template-columns:1fr}
  .foot-grid{grid-template-columns:1fr 1fr}
  .admin-shell{grid-template-columns:1fr}
  .admin-side{flex-direction:row;flex-wrap:wrap;gap:6px}
  .kpi{grid-template-columns:1fr 1fr}
  .dash-grid{grid-template-columns:1fr}
  .search-pill{display:none}
}
@media (max-width:640px){
  .header-inner{height:auto;padding:12px 0;flex-wrap:wrap;gap:10px}
  .nav{order:3;width:100%;overflow-x:auto;padding-bottom:4px}
  .trust{grid-template-columns:1fr}
  .cat-grid{grid-template-columns:1fr}
  .form-row{grid-template-columns:1fr}
  .nl-form{flex-direction:column}
  .foot-grid{grid-template-columns:1fr}
  .kpi{grid-template-columns:1fr}
  .page-title{font-size:26px}
}
@media print{.announce,.header,.footer,.no-print{display:none!important}}
`;

const NAV = (active = "") => `
<div class="announce">Free shipping on orders over <strong>$50</strong> · Members earn <strong>2× points</strong> this week · <a href="/products">Shop deals</a></div>
<header class="header">
  <div class="container header-inner">
    <a href="/" class="logo" aria-label="BrightCart home">
      <span class="logo-mark">BC</span>
      Bright<span>Cart</span>
    </a>
    <nav class="nav">
      <a href="/" class="${active === "home" ? "active" : ""}">Home</a>
      <a href="/products" class="${active === "products" ? "active" : ""}">Products</a>
      <a href="/search" class="${active === "search" ? "active" : ""}">Search</a>
      <a href="/dashboard" class="${active === "dashboard" ? "active" : ""}">My account</a>
      <a href="/contact" class="${active === "contact" ? "active" : ""}">Contact</a>
      <a href="/admin" class="${active === "admin" ? "active" : ""}">Partner</a>
    </nav>
    <form class="search-pill" action="/search" method="GET" role="search">
      <span aria-hidden="true">🔎</span>
      <input type="search" name="q" placeholder="Search products, SKUs, categories…" autocomplete="off">
      <kbd>Enter</kbd>
    </form>
    <div class="header-actions">
      <a href="/login" class="icon-btn ${active === "login" ? "primary" : ""}">👤 Sign in</a>
      <a href="/dashboard" class="icon-btn">🛒 Cart <span class="cart-count">2</span></a>
    </div>
  </div>
</header>`;

const FOOTER = `
<footer class="footer">
  <div class="container">
    <div class="foot-grid">
      <div class="foot-brand">
        <div class="logo"><span class="logo-mark">BC</span> Bright<span>Cart</span></div>
        <p>Thousands of everyday products with same-day dispatch, easy returns, and member-only pricing. Serving customers since 2019.</p>
        <div class="socials">
          <a href="#" aria-label="Twitter">𝕏</a>
          <a href="#" aria-label="Instagram">📷</a>
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="YouTube">▶</a>
        </div>
      </div>
      <div class="foot-col">
        <h5>Shop</h5>
        <a href="/products">All products</a>
        <a href="/products">New arrivals</a>
        <a href="/products">Best sellers</a>
        <a href="/products">Deals & offers</a>
        <a href="/search">Gift cards</a>
      </div>
      <div class="foot-col">
        <h5>Help</h5>
        <a href="/contact">Contact support</a>
        <a href="/contact">Shipping info</a>
        <a href="/contact">Returns & refunds</a>
        <a href="/contact">Track an order</a>
        <a href="/contact">Size guides</a>
      </div>
      <div class="foot-col">
        <h5>Company</h5>
        <a href="/">About BrightCart</a>
        <a href="/contact">Careers</a>
        <a href="/contact">Press</a>
        <a href="/contact">Privacy policy</a>
        <a href="/contact">Terms of service</a>
      </div>
    </div>
    <div class="foot-bottom">
      <div>© 2026 BrightCart Commerce · Demo storefront · +1 (800) 555-0142 · support@brightcart.example</div>
      <div class="pay-row">
        <span class="pay">VISA</span><span class="pay">MC</span><span class="pay">AMEX</span>
        <span class="pay">PayPal</span><span class="pay">Apple Pay</span><span class="pay">G Pay</span>
      </div>
    </div>
  </div>
</footer>`;

export function page(title: string, body: string, active = "", headExtra = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="BrightCart Commerce — everyday products, fast shipping, member rewards.">
<title>${escapeHtml(title)}</title>
<style>${CSS}</style>
${headExtra}
</head>
<body>
${NAV(active)}
${body}
${FOOTER}
</body>
</html>`;
}

interface Product {
  name: string;
  emoji: string;
  cat: string;
  desc: string;
  price: string;
  was?: string;
  rating: string;
  reviews: number;
  badge?: { text: string; cls: string };
  stock: { text: string; cls: string };
}

const PRODUCTS: Product[] = [
  {
    name: "AeroWire Pro Headphones",
    emoji: "🎧",
    cat: "Audio",
    desc: "Wireless over-ear headphones with adaptive noise cancelling, 40h battery, and multipoint pairing.",
    price: "$129.00",
    was: "$159.00",
    rating: "4.8",
    reviews: 2143,
    badge: { text: "Best seller", cls: "hot" },
    stock: { text: "In stock", cls: "" },
  },
  {
    name: "Nimbus Smart Kettle 1.7L",
    emoji: "☕",
    cat: "Kitchen",
    desc: "Variable-temperature electric kettle with keep-warm mode, hold settings, and boil-dry protection.",
    price: "$64.50",
    rating: "4.6",
    reviews: 891,
    badge: { text: "New", cls: "new" },
    stock: { text: "In stock", cls: "" },
  },
  {
    name: "TrailLite Rechargeable Lantern",
    emoji: "🏮",
    cat: "Outdoor",
    desc: "400-lumen LED lantern with USB-C fast charge, IPX6 water resistance, and 60-hour runtime.",
    price: "$38.00",
    was: "$46.00",
    rating: "4.7",
    reviews: 1204,
    badge: { text: "−17%", cls: "sale" },
    stock: { text: "Low stock", cls: "low" },
  },
  {
    name: "Orbit Desk Mat XL",
    emoji: "🖱️",
    cat: "Workspace",
    desc: "Stitched-edge desk mat in charcoal grey. Optimized for optical and laser mice alike.",
    price: "$24.99",
    rating: "4.5",
    reviews: 654,
    stock: { text: "In stock", cls: "" },
  },
  {
    name: "Summit Insulated Bottle 750ml",
    emoji: "🥤",
    cat: "Outdoor",
    desc: "Double-wall stainless bottle keeps drinks cold 24h or hot 12h. Leak-proof sport cap.",
    price: "$22.00",
    rating: "4.9",
    reviews: 3102,
    badge: { text: "Top rated", cls: "hot" },
    stock: { text: "In stock", cls: "" },
  },
  {
    name: "Pulse Fitness Band 3",
    emoji: "⌚",
    cat: "Wearables",
    desc: "Heart-rate, SpO₂, and sleep tracking with a 10-day battery and 50m water resistance.",
    price: "$79.00",
    was: "$99.00",
    rating: "4.4",
    reviews: 1788,
    badge: { text: "−20%", cls: "sale" },
    stock: { text: "In stock", cls: "" },
  },
  {
    name: "LumenDesk LED Task Lamp",
    emoji: "💡",
    cat: "Workspace",
    desc: "Color-temperate desk lamp with memory presets, USB-C pass-through, and flicker-free LEDs.",
    price: "$49.00",
    rating: "4.6",
    reviews: 442,
    stock: { text: "Back in stock", cls: "" },
  },
  {
    name: "CrispCast Bluetooth Speaker",
    emoji: "🔊",
    cat: "Audio",
    desc: "Portable speaker with 360° sound, IPX7 waterproofing, and 24-hour playtime.",
    price: "$59.00",
    was: "$72.00",
    rating: "4.7",
    reviews: 967,
    badge: { text: "Deal", cls: "sale" },
    stock: { text: "Only 4 left", cls: "low" },
  },
];

function stars(rating: string, reviews: number): string {
  const full = Math.round(Number(rating));
  const glyphs = "★".repeat(full) + "☆".repeat(5 - full);
  return `<div class="stars">${glyphs} ${rating} <span class="count">(${reviews.toLocaleString("en-US")} reviews)</span></div>`;
}

function productCard(p: Product): string {
  return `
  <article class="prod fade">
    <div class="prod-img">
      ${p.badge ? `<span class="badge ${p.badge.cls}">${escapeHtml(p.badge.text)}</span>` : ""}
      <span class="fav" title="Save for later">♡</span>
      <span aria-hidden="true">${p.emoji}</span>
    </div>
    <div class="prod-body">
      <span class="prod-cat">${escapeHtml(p.cat)}</span>
      <h3 class="prod-title">${escapeHtml(p.name)}</h3>
      <p class="prod-desc">${escapeHtml(p.desc)}</p>
      ${stars(p.rating, p.reviews)}
      <div class="price-row">
        <span class="price">${escapeHtml(p.price)}${p.was ? `<small>${escapeHtml(p.was)}</small>` : ""}</span>
        <button type="button" class="add-btn" onclick="this.textContent='Added ✓';this.style.background='#059669'">Add</button>
      </div>
      <span class="stock ${p.stock.cls}">● ${escapeHtml(p.stock.text)}</span>
    </div>
  </article>`;
}

function productList(count = 8): string {
  return `<div class="prod-grid">${PRODUCTS.slice(0, count).map(productCard).join("")}</div>`;
}

/* ───────────────── Pages ───────────────── */

export function homePage(): string {
  return page(
    "BrightCart Commerce — Everyday products, delivered fast",
    `<main class="container" style="padding-bottom:20px">
      <section class="hero fade">
        <div class="hero-grid">
          <div>
            <div class="eyebrow"><span class="dot"></span> Spring event · ends Sunday</div>
            <h1>Everything you need,<br>delivered fast</h1>
            <p>Shop 12,000+ everyday essentials with same-day dispatch, free returns within 30 days, and member-only pricing that actually adds up.</p>
            <div class="cta-row">
              <a href="/products" class="btn btn-light btn-lg">Shop bestsellers →</a>
              <a href="/search" class="btn btn-ghost btn-lg">Search catalog</a>
            </div>
          </div>
          <aside class="hero-card" aria-label="Store highlights">
            <div class="hero-stat"><span>Orders shipped today<span class="sub">across 14 regions</span></span><b>4,281</b></div>
            <div class="hero-stat"><span>Average delivery<span class="sub">continental US</span></span><b>1.8d</b></div>
            <div class="hero-stat"><span>Customer satisfaction<span class="sub">last 90 days</span></span><b>97%</b></div>
            <div class="hero-stat"><span>Member cashback<span class="sub">on every order</span></span><b>2×</b></div>
          </aside>
        </div>
      </section>

      <section class="trust" aria-label="Why shop with us">
        <div class="trust-item"><div class="trust-ico">🚚</div><div><h4>Free shipping over $50</h4><p>Continental orders placed before 3pm local.</p></div></div>
        <div class="trust-item"><div class="trust-ico green">↩️</div><div><h4>30-day easy returns</h4><p>No restocking fees, prepaid labels included.</p></div></div>
        <div class="trust-item"><div class="trust-ico amber">🎁</div><div><h4>Member rewards</h4><p>Earn 2 points per dollar, redeem anytime.</p></div></div>
        <div class="trust-item"><div class="trust-ico purple">🛡️</div><div><h4>Price match</h4><p>Find it cheaper within 14 days — we match it.</p></div></div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><h2>Shop by category</h2><p>Curated picks refreshed every morning at 6am ET.</p></div>
          <a href="/products" class="link-more">View all →</a>
        </div>
        <div class="cat-grid">
          <a href="/products" class="cat-tile cat-1"><span class="emoji">🎧</span><h3>Audio & tech</h3><span>420+ products</span></a>
          <a href="/products" class="cat-tile cat-2"><span class="emoji">☕</span><h3>Home & kitchen</h3><span>680+ products</span></a>
          <a href="/products" class="cat-tile cat-3"><span class="emoji">🏕️</span><h3>Outdoor</h3><span>310+ products</span></a>
          <a href="/products" class="cat-tile cat-4"><span class="emoji">⌚</span><h3>Wearables</h3><span>150+ products</span></a>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><h2>Bestsellers this week</h2><p>What members are adding to cart right now.</p></div>
          <a href="/products" class="link-more">Shop all →</a>
        </div>
        ${productList(4)}
      </section>

      <section class="banner">
        <div>
          <h2>Join BrightCart+ — free for 30 days</h2>
          <p>Unlimited free shipping, early access to drops, doubled reward points, and dedicated chat support. Cancel anytime from your account page.</p>
          <div class="cta-row">
            <a href="/login" class="btn btn-light">Start free trial</a>
            <a href="/contact" class="btn btn-ghost">Compare plans</a>
          </div>
        </div>
        <div class="banner-side">
          <h4>Member perks</h4>
          <div class="perk"><i>✓</i> Free 2-day shipping on every order</div>
          <div class="perk"><i>✓</i> 2× points on all purchases</div>
          <div class="perk"><i>✓</i> Early access to seasonal sales</div>
          <div class="perk"><i>✓</i> Exclusive member-only bundles</div>
          <div class="perk"><i>✓</i> Priority customer support</div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><h2>Loved by 80,000+ shoppers</h2><p>Recent verified reviews from BrightCart members.</p></div>
        </div>
        <div class="rev-grid">
          <div class="rev">
            <div class="stars">★★★★★</div>
            <p>“Ordered headphones at 2pm and they arrived the next morning. Packaging was excellent and the noise cancelling is genuinely flagship-level.”</p>
            <div class="rev-who"><span class="avatar" style="background:#2563eb">SK</span><div><b>Sara K.</b><span>Verified buyer · Audio</span></div></div>
          </div>
          <div class="rev">
            <div class="stars">★★★★★</div>
            <p>“Returns are painless — printed the label from my account and refund hit in two days. This is how e-commerce should work.”</p>
            <div class="rev-who"><span class="avatar" style="background:#0d9488">MR</span><div><b>Marcus R.</b><span>Verified buyer · Home</span></div></div>
          </div>
          <div class="rev">
            <div class="stars">★★★★☆</div>
            <p>“Member pricing saved me about $40 last month. Support answered a shipping question in under five minutes on chat.”</p>
            <div class="rev-who"><span class="avatar" style="background:#7c3aed">AL</span><div><b>Aisha L.</b><span>Verified buyer · Wearables</span></div></div>
          </div>
        </div>
      </section>

      <section class="newsletter">
        <h2>Get $10 off your first order</h2>
        <p>Join the newsletter for early sale access, restock alerts, and a welcome discount. One email a week — no spam.</p>
        <form class="nl-form" action="/contact" method="GET">
          <input type="email" name="email" placeholder="you@example.com" required aria-label="Email address">
          <button type="submit" class="btn btn-blue">Subscribe</button>
        </form>
        <div class="nl-note">By subscribing you agree to our privacy policy. Unsubscribe anytime.</div>
      </section>
    </main>`,
    "home",
  );
}

export function productsPage(): string {
  return page(
    "Products — BrightCart Commerce",
    `<main class="container">
      <div class="crumb"><a href="/">Home</a><span class="sep">/</span><span>Products</span></div>
      <h1 class="page-title">Featured products</h1>
      <p class="page-sub">Catalog refreshed daily · SKU stock simulated for demonstration. Free returns on every order.</p>

      <section class="trust" style="margin:22px 0 28px">
        <div class="trust-item"><div class="trust-ico">🔍</div><div><h4>Quality checked</h4><p>Every SKU inspected before dispatch.</p></div></div>
        <div class="trust-item"><div class="trust-ico green">📦</div><div><h4>Same-day dispatch</h4><p>Order before 3pm local time.</p></div></div>
        <div class="trust-item"><div class="trust-ico amber">🏷️</div><div><h4>Member pricing</h4><p>Sign in for automatic discounts.</p></div></div>
        <div class="trust-item"><div class="trust-ico purple">💬</div><div><h4>Human support</h4><p>Chat with us 7 days a week.</p></div></div>
      </section>

      <section class="section" style="margin-top:8px">
        <div class="section-head">
          <div><h2>All products</h2><p>Showing ${PRODUCTS.length} of 12,482 items</p></div>
          <a href="/search" class="link-more">Filter & search →</a>
        </div>
        ${productList(8)}
      </section>

      <section class="section">
        <div class="section-head"><div><h2>New this week</h2><p>Fresh arrivals added every Monday.</p></div></div>
        ${productList(4)}
      </section>

      <section class="newsletter">
        <h2>Can't find what you need?</h2>
        <p>Our team can help source hard-to-find items and notify you when stock returns.</p>
        <div class="cta-row" style="justify-content:center">
          <a href="/contact" class="btn btn-blue">Contact support</a>
          <a href="/search" class="btn btn-brand">Search instead</a>
        </div>
      </section>
    </main>`,
    "products",
  );
}

export function searchPage(query: string, note?: string): string {
  const q = escapeHtml(query);
  const lower = query.toLowerCase();
  const hits = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.cat.toLowerCase().includes(lower) ||
      p.desc.toLowerCase().includes(lower),
  );
  const results = hits.length > 0 ? hits : PRODUCTS.slice(0, 4);

  return page(
    `Search: ${query} — BrightCart`,
    `<main class="container">
      <div class="crumb"><a href="/">Home</a><span class="sep">/</span><a href="/search">Search</a><span class="sep">/</span><span>${q}</span></div>
      <h1 class="page-title">Search results</h1>
      <p class="page-sub">Showing catalog matches for “${q}” · ${results.length} result${results.length === 1 ? "" : "s"}</p>

      ${note ? `<div class="alert" style="max-width:720px">ℹ️ ${escapeHtml(note)}</div>` : ""}

      <form class="search-pill" style="max-width:560px;margin:18px 0 28px;display:flex" action="/search" method="GET" role="search">
        <span aria-hidden="true">🔎</span>
        <input type="search" name="q" value="${q}" placeholder="Try another search…" autofocus>
        <button type="submit" class="btn btn-blue" style="padding:8px 16px;border-radius:9px">Search</button>
      </form>

      <section class="section" style="margin-top:0">
        <div class="section-head">
          <div><h2>Matching products</h2><p>Relevance ranked by name, category, and description.</p></div>
        </div>
        <div class="prod-grid">${results.map(productCard).join("")}</div>
      </section>

      <section class="trust" style="margin-top:40px">
        <div class="trust-item"><div class="trust-ico">Refine</div><div><h4>Use categories</h4><p>Try “audio”, “kitchen”, or “outdoor”.</p></div></div>
        <div class="trust-item"><div class="trust-ico green">SKU</div><div><h4>Search by SKU</h4><p>Paste a product code for exact matches.</p></div></div>
        <div class="trust-item"><div class="trust-ico amber">Filter</div><div><h4>Price filters</h4><p>Narrow results by budget range.</p></div></div>
        <div class="trust-item"><div class="trust-ico purple">Help</div><div><h4>Still stuck?</h4><p><a href="/contact" style="color:#7c3aed;font-weight:600">Ask support</a></p></div></div>
      </section>
    </main>`,
    "search",
  );
}

export function searchFormPage(): string {
  return page(
    "Search — BrightCart Commerce",
    `<main class="container">
      <div class="crumb"><a href="/">Home</a><span class="sep">/</span><span>Search</span></div>
      <div class="form-wrap wide" style="margin-top:36px">
        <div class="card card-pad fade">
          <h1>Search the catalog</h1>
          <p class="sub">Find products by name, category, SKU, or description across 12,000+ items.</p>
          <form method="GET" action="/search">
            <div class="field">
              <label for="q">Search query</label>
              <input id="q" name="q" type="search" placeholder="e.g. wireless headphones, SKU-4412, outdoor…" autocomplete="off" required>
            </div>
            <button type="submit" class="btn btn-blue btn-block btn-lg">Search catalog</button>
          </form>
          <div class="divider">Popular right now</div>
          <div class="cta-row" style="justify-content:center">
            <a href="/search?q=headphones" class="icon-btn">🎧 headphones</a>
            <a href="/search?q=kettle" class="icon-btn">☕ kettle</a>
            <a href="/search?q=bottle" class="icon-btn">🥤 bottle</a>
            <a href="/search?q=desk" class="icon-btn">🖱️ desk</a>
          </div>
          <p class="alt-line">Looking for your orders? <a href="/login">Sign in to your account</a></p>
        </div>
      </div>
    </main>`,
    "search",
  );
}

export function contactPage(): string {
  return page(
    "Contact support — BrightCart",
    `<main class="container">
      <div class="crumb"><a href="/">Home</a><span class="sep">/</span><span>Contact</span></div>
      <div class="form-wrap" style="margin-top:36px">
        <div class="card card-pad fade">
          <h1>Contact support</h1>
          <p class="sub">We typically respond within one business day. Average first reply this week: <strong>42 minutes</strong>.</p>
          <form method="POST" action="/contact">
            <div class="form-row">
              <div class="field">
                <label for="name">Full name</label>
                <input id="name" name="name" type="text" placeholder="Jane Doe" required>
              </div>
              <div class="field">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" placeholder="jane@example.com" required>
              </div>
            </div>
            <div class="field">
              <label for="topic">Topic</label>
              <select id="topic" name="topic">
                <option>Order status</option>
                <option>Returns & refunds</option>
                <option>Product question</option>
                <option>Account & membership</option>
                <option>Something else</option>
              </select>
            </div>
            <div class="field">
              <label for="order">Order number <span class="muted" style="font-weight:400">(optional)</span></label>
              <input id="order" name="order" type="text" placeholder="ORD-10482">
            </div>
            <div class="field">
              <label for="message">Message</label>
              <textarea id="message" name="message" placeholder="How can we help?" required></textarea>
            </div>
            <button type="submit" class="btn btn-blue btn-block btn-lg">Send message</button>
          </form>
          <div class="secure-note">🔒 Your details are only used to reply to this request.</div>
          <p class="alt-line">Prefer phone? Call <strong>+1 (800) 555-0142</strong> · Mon–Fri 8am–8pm ET</p>
        </div>
      </div>

      <section class="trust" style="margin-bottom:48px">
        <div class="trust-item"><div class="trust-ico">📦</div><div><h4>Track an order</h4><p>Have your ORD number ready.</p></div></div>
        <div class="trust-item"><div class="trust-ico green">↩️</div><div><h4>Start a return</h4><p>30 days from delivery date.</p></div></div>
        <div class="trust-item"><div class="trust-ico amber">💳</div><div><h4>Billing questions</h4><p>Charges appear as BRIGHTCART.</p></div></div>
        <div class="trust-item"><div class="trust-ico purple">🏢</div><div><h4>Business orders</h4><p>Bulk pricing on request.</p></div></div>
      </section>
    </main>`,
    "contact",
  );
}

export function contactThanksPage(): string {
  const ref = "BC-" + Math.floor(Math.random() * 900000 + 100000);
  return page(
    "Message sent — BrightCart",
    `<main class="container">
      <div class="form-wrap" style="margin-top:56px">
        <div class="card card-pad fade" style="text-align:center">
          <div style="font-size:56px;margin-bottom:8px">✅</div>
          <h1>Thanks — message received</h1>
          <p class="sub">A support specialist will follow up by email within one business day.</p>
          <div class="alert ok" style="text-align:left">Your reference number is <strong>${ref}</strong>. Keep it handy if you need to follow up.</div>
          <div class="cta-row" style="justify-content:center">
            <a href="/" class="btn btn-brand">Back to home</a>
            <a href="/contact" class="btn btn-blue">Send another message</a>
          </div>
        </div>
      </div>
    </main>`,
    "contact",
  );
}

export function loginPage(opts: { error?: string; admin?: boolean; success?: boolean } = {}): string {
  const action = opts.admin ? "/admin/login" : "/login";
  const title = opts.admin ? "Partner Console Sign In" : "Sign in to your account";
  const sub = opts.admin
    ? "Authorized BrightCart operations staff only. All sign-in attempts are logged and reviewed."
    : "Access your orders, wishlist, saved addresses, and member rewards.";

  return page(
    `${title} — BrightCart`,
    `<main class="container">
      <div class="form-wrap" style="margin-top:48px">
        <div class="card card-pad fade">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
            <span class="logo-mark" style="width:44px;height:44px;font-size:17px">${opts.admin ? "🔐" : "BC"}</span>
            <div>
              <h1 style="margin:0;font-size:22px">${title}</h1>
              <div class="muted" style="font-size:13.5px">${opts.admin ? "BrightCart Operations · Internal tools" : "Welcome back to BrightCart"}</div>
            </div>
          </div>
          <p class="sub" style="margin-top:0">${sub}</p>

          ${opts.error ? `<div class="alert err">⚠️ ${escapeHtml(opts.error)}</div>` : ""}
          ${opts.success ? `<div class="alert ok">✓ Signed in successfully. Redirecting…</div>` : ""}

          <form method="POST" action="${action}">
            <div class="field">
              <label for="username">Username or email</label>
              <input id="username" name="username" type="text" autocomplete="username" placeholder="${opts.admin ? "firstname.lastname" : "you@example.com"}" required autofocus>
            </div>
            <div class="field">
              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" required>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 18px;font-size:13.5px">
              <label style="display:flex;gap:8px;align-items:center;font-weight:400;color:#6b7280;cursor:pointer">
                <input type="checkbox" name="remember" style="width:auto"> Remember this device
              </label>
              <a href="/contact" style="color:#2563eb;font-weight:600">Forgot password?</a>
            </div>
            <button type="submit" class="btn btn-blue btn-block btn-lg">${opts.admin ? "Access console" : "Sign in"}</button>
          </form>

          <div class="secure-note">🔒 Encrypted connection · Session expires automatically</div>
          ${opts.admin ? "" : `<p class="alt-line">New to BrightCart? <a href="/products">Create an account</a> · <a href="/admin">Staff login</a></p>`}
        </div>
      </div>
    </main>`,
    opts.admin ? "admin" : "login",
  );
}

export function dashboardPage(): string {
  const orders = [
    ["ORD-10482", "Delivered", "Mar 12", "$84.20", "tag green"],
    ["ORD-10477", "Shipped", "Mar 10", "$129.00", "tag blue"],
    ["ORD-10455", "Processing", "Mar 8", "$38.50", "tag amber"],
    ["ORD-10401", "Delivered", "Feb 28", "$59.00", "tag green"],
    ["ORD-10388", "Refunded", "Feb 14", "$24.99", "tag gray"],
  ]
    .map(
      ([id, status, date, total, cls]) =>
        `<tr><td class="mono">${id}</td><td><span class="${cls}">${status}</span></td><td>${date}</td><td><strong>${total}</strong></td><td><a href="/contact" style="color:#2563eb;font-weight:600">Details</a></td></tr>`,
    )
    .join("");

  return page(
    "My account — BrightCart",
    `<main class="container">
      <div class="crumb"><a href="/">Home</a><span class="sep">/</span><span>My account</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:8px 0 24px">
        <div>
          <h1 class="page-title" style="margin:0">Your account</h1>
          <p class="page-sub">Signed in as <span class="tag blue">demo.member@brightcart.example</span> · Member since 2024</p>
        </div>
        <a href="/login" class="btn btn-brand">Sign out</a>
      </div>

      <div class="dash-grid" style="margin-bottom:22px">
        <div class="dash-card"><div class="muted" style="font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px">Store credit</div><div class="big">$15.00</div><div class="muted" style="font-size:13px">Expires Dec 2026</div></div>
        <div class="dash-card"><div class="muted" style="font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px">Reward points</div><div class="big">2,480</div><div class="muted" style="font-size:13px">≈ $24.80 to redeem</div></div>
        <div class="dash-card"><div class="muted" style="font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px">Saved items</div><div class="big">7</div><div class="muted" style="font-size:13px">2 back in stock</div></div>
      </div>

      <div class="panel">
        <div class="panel-h"><h3>Recent orders</h3><a href="/contact" class="link-more">Need help with an order?</a></div>
        <div style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>Order</th><th>Status</th><th>Date</th><th>Total</th><th></th></tr></thead>
            <tbody>${orders}</tbody>
          </table>
        </div>
      </div>

      <div class="dash-grid">
        <div class="dash-card">
          <h3>📦 Shipping addresses</h3>
          <p class="muted" style="font-size:13.5px;margin:6px 0 14px">2 saved addresses on file.</p>
          <a href="/contact" class="btn btn-brand" style="width:100%">Manage addresses</a>
        </div>
        <div class="dash-card">
          <h3>💳 Payment methods</h3>
          <p class="muted" style="font-size:13.5px;margin:6px 0 14px">Visa ···· 4242 · default</p>
          <a href="/contact" class="btn btn-brand" style="width:100%">Update payment</a>
        </div>
        <div class="dash-card">
          <h3>🔔 Notifications</h3>
          <p class="muted" style="font-size:13.5px;margin:6px 0 14px">Email alerts enabled for order updates.</p>
          <a href="/contact" class="btn btn-brand" style="width:100%">Edit preferences</a>
        </div>
      </div>

      <section class="section">
        <div class="section-head"><div><h2>Recommended for you</h2><p>Based on your recent orders and wishlist.</p></div></div>
        ${productList(4)}
      </section>
    </main>`,
    "dashboard",
  );
}

export function adminPage(): string {
  const users = [
    ["usr_8841", "j.alvarez", "Staff", "Support", "2 min ago", "tag blue"],
    ["usr_2210", "m.chen", "Manager", "Operations", "1 hr ago", "tag green"],
    ["usr_0091", "svc.reporting", "Service", "Automation", "Yesterday", "tag gray"],
    ["usr_4402", "p.okafor", "Staff", "Fulfillment", "3 days ago", "tag blue"],
    ["usr_1177", "l.novak", "Admin", "IT", "Today, 08:14", "tag red"],
  ]
    .map(
      ([id, user, role, dept, seen, cls]) =>
        `<div class="row"><span class="mono muted" style="font-size:12px">${id}</span><div><strong>${user}</strong><div class="muted" style="font-size:12px">${dept}</div></div><div style="display:flex;gap:10px;align-items:center"><span class="${cls}">${role}</span><span class="muted" style="font-size:12px">${seen}</span></div></div>`,
    )
    .join("");

  const activity = [
    ["09:41", "Deployed catalog-sync v2.4.1 to production", "tag green", "success"],
    ["09:12", "Rate-limit policy updated: 180 rpm → 220 rpm", "tag blue", "config"],
    ["08:47", "Warehouse scanner heartbeat restored (WH-East)", "tag amber", "warning"],
    ["08:03", "Nightly backup completed — 42 GB", "tag gray", "backup"],
    ["07:55", "New partner API key issued for acme-retail", "tag blue", "api"],
  ]
    .map(
      ([time, text, cls, kind]) =>
        `<div class="row"><span class="mono muted" style="font-size:12px">${time}</span><div>${text}</div><span class="${cls}">${kind}</span></div>`,
    )
    .join("");

  const hours = [42, 68, 55, 91, 77, 120, 98, 84, 110, 95, 72, 88];
  const bars = hours
    .map(
      (v, i) =>
        `<div class="bar-col"><div class="bar" style="height:${Math.round((v / 120) * 100)}%" title="${v} orders"></div><span class="bar-lbl">${String(6 + i).padStart(2, "0")}h</span></div>`,
    )
    .join("");

  return page(
    "Operations Console — BrightCart",
    `<div class="admin-shell">
      <aside class="admin-side">
        <div class="logo"><span class="logo-mark" style="width:32px;height:32px;font-size:13px">BC</span> Ops Console</div>
        <a href="/admin" class="on">📊 Overview</a>
        <a href="/admin/login">🔐 Sign in</a>
        <a href="/dashboard">👤 Customer view</a>
        <a href="/products">📦 Catalog</a>
        <a href="/contact">🎫 Support queue</a>
        <a href="/">← Exit to store</a>
      </aside>
      <div class="admin-main">
        <div class="admin-top">
          <div>
            <h1>Operations overview</h1>
            <div class="muted" style="font-size:13.5px"><span class="live-dot"></span>All systems operational · Region us-east-1 · Updated just now</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="icon-btn" type="button">⬇ Export</button>
            <button class="icon-btn primary" type="button">＋ New report</button>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi-card"><div class="lbl">Open incidents</div><div class="val">3</div><div class="delta down">▲ 1 vs yesterday</div></div>
          <div class="kpi-card"><div class="lbl">Deploys today</div><div class="val">12</div><div class="delta">All healthy</div></div>
          <div class="kpi-card"><div class="lbl">Queue depth</div><div class="val">241</div><div class="delta">▼ 18% vs avg</div></div>
          <div class="kpi-card"><div class="lbl">Error rate</div><div class="val">0.42%</div><div class="delta">Within SLO</div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px">
          <div class="panel">
            <div class="panel-h"><h3>Orders by hour</h3><span class="tag gray">Last 12 hours</span></div>
            <div class="bar-chart">${bars}</div>
          </div>
          <div class="panel">
            <div class="panel-h"><h3>Recent activity</h3><span class="tag blue">Live</span></div>
            <div class="panel-b">${activity}</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-h"><h3>Team & service accounts</h3><span class="tag gray">${users.split("class=").length} entries</span></div>
          <div class="panel-b">${users}</div>
        </div>

        <div class="panel">
          <div class="panel-h"><h3>Quick actions</h3></div>
          <div style="padding:18px 20px;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-blue" type="button">Run health check</button>
            <button class="btn btn-brand" type="button">Rotate API keys</button>
            <button class="btn btn-brand" type="button">Purge CDN cache</button>
            <button class="btn btn-brand" type="button">Schedule maintenance</button>
            <a href="/" class="btn btn-brand">View public store</a>
          </div>
        </div>
      </div>
    </div>`,
    "admin",
  );
}

export function apiPage(): string {
  const rows = [
    ["GET", "/v2/products", "List catalog items with cursor pagination"],
    ["GET", "/v2/products/{id}", "Retrieve a single product by SKU or id"],
    ["GET", "/v2/orders", "List orders visible to the token scope"],
    ["POST", "/v2/carts", "Create a new shopping cart"],
    ["POST", "/v2/carts/{id}/items", "Add an item to a cart"],
    ["GET", "/v2/customers/me", "Current customer profile and tier"],
    ["GET", "/v2/inventory/{sku}", "Stock level for a warehouse SKU"],
    ["POST", "/v2/webhooks", "Subscribe to order and inventory events"],
  ]
    .map(
      ([m, path, desc]) =>
        `<tr><td><span class="tag ${m === "GET" ? "green" : "blue"}">${m}</span></td><td class="mono" style="font-size:13px">${path}</td><td class="muted">${desc}</td></tr>`,
    )
    .join("");

  return page(
    "API — BrightCart Developer",
    `<main class="container">
      <div class="crumb"><a href="/">Home</a><span class="sep">/</span><span>API</span></div>
      <div class="hero" style="margin-top:20px">
        <div class="hero-grid" style="grid-template-columns:1fr;padding:40px 40px">
          <div>
            <div class="eyebrow"><span class="dot"></span> Developer platform · v2.4.1</div>
            <h1 style="font-size:34px">BrightCart REST API</h1>
            <p style="margin-bottom:18px">Build storefronts, bots, and integrations on top of the BrightCart catalog, cart, and order APIs. JSON in, JSON out — no SDK required.</p>
            <div class="cta-row">
              <a href="/contact" class="btn btn-light">Request API key</a>
              <a href="/docs" class="btn btn-ghost">Read the docs</a>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.3fr .7fr;gap:18px;margin-top:28px">
        <div class="panel">
          <div class="panel-h"><h3>Endpoints</h3><span class="tag gray">Base: https://api.brightcart.example/v2</span></div>
          <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>
        <div>
          <div class="panel">
            <div class="panel-h"><h3>Authentication</h3></div>
            <div style="padding:18px 20px">
              <p class="muted" style="font-size:13.5px;margin-top:0">Send a bearer token on every request:</p>
              <pre class="mono" style="background:#0b1220;color:#a5f3fc;padding:14px;border-radius:10px;font-size:12.5px;overflow:auto;margin:0">Authorization: Bearer &lt;token&gt;</pre>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h"><h3>Rate limits</h3></div>
            <div style="padding:18px 20px;font-size:13.5px" class="muted">
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6"><span>Free tier</span><strong>60 req/min</strong></div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6"><span>Partner</span><strong>600 req/min</strong></div>
              <div style="display:flex;justify-content:space-between;padding:6px 0"><span>Enterprise</span><strong>6,000 req/min</strong></div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h"><h3>Webhooks</h3></div>
            <div style="padding:18px 20px;font-size:13.5px" class="muted">
              <p style="margin-top:0">Events: <code>order.created</code>, <code>order.shipped</code>, <code>inventory.low</code>, <code>price.changed</code></p>
              <p style="margin-bottom:0">HMAC-SHA256 signatures on every delivery.</p>
            </div>
          </div>
        </div>
      </div>
    </main>`,
    "",
  );
}

export function notFoundPage(path: string): string {
  return page(
    "Page not found — BrightCart",
    `<main class="container">
      <div class="err-wrap">
        <div class="fade">
          <div class="err-code">404</div>
          <h1 style="margin:12px 0 8px;font-size:26px;letter-spacing:-.6px">We couldn't find that page</h1>
          <p class="muted" style="max-width:440px;margin:0 auto 26px;font-size:15px">
            The link may be broken or the product may have been removed. Try searching the catalog or head back home.
          </p>
          <div class="cta-row" style="justify-content:center">
            <a href="/" class="btn btn-blue btn-lg">Back to homepage</a>
            <a href="/search" class="btn btn-brand btn-lg">Search catalog</a>
          </div>
          <p class="muted mono" style="margin-top:28px;font-size:12.5px">Requested path: ${escapeHtml(path)}</p>
        </div>
      </div>
    </main>`,
    "",
  );
}
