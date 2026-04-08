function renderSidebar(activePage) {
  const user = Auth.requireAuth('lawyer');
  if (!user) return;
  const pages = [
    { id:'dashboard', label:'Dashboard',   href:'dashboard.html', icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { id:'clients',   label:'Clients',     href:'clients.html',   icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { id:'cases',     label:'Cases',       href:'cases.html',     icon:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>' },
    { id:'hearings',  label:'Hearings',    href:'hearings.html',  icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { id:'documents', label:'Documents',   href:'documents.html', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
    { id:'tasks',     label:'Tasks',       href:'tasks.html',     icon:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
    { id:'fees',      label:'Fee Records', href:'fee-records.html',icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { id:'profile',   label:'Profile',     href:'profile.html',   icon:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>' },
  ];
  const nav = pages.map(p=>`
    <a href="${p.href}" class="nav-item${activePage===p.id?' active':''}">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${p.icon}</svg>${p.label}
    </a>`).join('');
  document.getElementById('sidebar').innerHTML = `
    <a href="dashboard.html" class="sidebar-brand">
      <div class="brand-icon"><svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div><div class="brand-name">LawMate</div></div>
    </a>
    <nav class="sidebar-nav">${nav}</nav>
    <div class="sidebar-footer">
      <div class="avatar"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
      <div><div class="footer-name">${user.full_name}</div><div class="footer-role">Lawyer</div></div>
    </div>`;
  loadNotifCount();
}
