// Injected by each client page - sets active nav item
function renderSidebar(activePage) {
  const user = Auth.requireAuth('client');
  if (!user) return;

  const pages = [
    { id:'dashboard', label:'Dashboard', href:'dashboard.html', icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { id:'cases',     label:'My Cases',  href:'cases.html',     icon:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>' },
    { id:'hearings',  label:'Hearings',  href:'hearings.html',  icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { id:'documents', label:'Documents', href:'documents.html', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
    { id:'fees',      label:'Fee Status',href:'fee-status.html',icon:'<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8m4 2v2m0-14v2"/>' },
    { id:'profile',   label:'Profile',   href:'profile.html',   icon:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>' },
  ];

  const navHTML = pages.map(p => `
    <a href="${p.href}" class="nav-item${activePage===p.id?' active':''}">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${p.icon}</svg>
      ${p.label}
    </a>`).join('');

  const initials = user.full_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  document.getElementById('sidebar').innerHTML = `
    <a href="dashboard.html" class="sidebar-brand">
      <div class="brand-icon"><svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div><div class="brand-name">LawMate</div></div>
    </a>
    <nav class="sidebar-nav">${navHTML}</nav>
    <div class="sidebar-footer">
      <div class="s-avatar"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
      <div><div class="footer-name">${user.full_name}</div><div class="footer-role">Client</div></div>
    </div>`;


    const sidebarBrand = document.querySelector('.sidebar-brand');
    if (sidebarBrand && !document.querySelector('.mobile-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'mobile-close-btn';
      closeBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      closeBtn.onclick = (e) => {
        e.preventDefault();
        document.getElementById('sidebar').classList.remove('open');
      };
      sidebarBrand.style.position = 'relative';
      sidebarBrand.appendChild(closeBtn);
    }

  loadNotifCount();
}




  // Add mobile menu toggle
  document.addEventListener('DOMContentLoaded', () => {
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.querySelector('.mobile-menu-btn')) {
      const btn = document.createElement('button');
      btn.className = 'mobile-menu-btn';
      btn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      btn.onclick = () => {
        document.getElementById('sidebar').classList.toggle('open');
      };
      topbar.insertBefore(btn, topbar.firstChild);
    }
  });
