(function(root) {
  'use strict';

  var ICONS = {
    House: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
    GraduationCap: '<path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
    BookOpen: '<path d="M2 4h7a4 4 0 0 1 4 4v13a4 4 0 0 0-4-4H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v13a4 4 0 0 1 4-4h7z"/>',
    BriefcaseBusiness: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
    Wrench: '<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3z"/><path d="m14 10 3-3"/>',
    UserRound: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    Settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a2 2 0 0 0-1.4-3.4h-.3a2 2 0 1 1 0-4h.2a2 2 0 0 0 1.4-3.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a2 2 0 0 0 3.4-1.4v-.3a2 2 0 1 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 1.4 3.4h.3a2 2 0 1 1 0 4h-.2a2 2 0 0 0-1.4 3.4Z" transform="translate(2 2) scale(.83)"/>',
    ShieldCheck: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    Compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.8 6.4-5.6 2.8 2.8-5.6z"/>',
    CalendarClock: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18"/><circle cx="15" cy="15" r="3"/><path d="M15 13v2l1 1"/>',
    Folders: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2z"/><path d="M3 10h18"/>',
    ClipboardCheck: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4.5h6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1Z"/><path d="m8 14 2 2 5-5"/>',
    Star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    Flame: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-3-2-5-3 3-5 6-5 9a7 7 0 0 0 7 7Z"/><path d="M12 22a3 3 0 0 0 3-3c0-2-2-3-3-5-1 2-3 3-3 5a3 3 0 0 0 3 3Z"/>',
    Heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
    Coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.5a6 6 0 0 1-8.6 7.7"/><path d="M8 5v6m-2-3h4m8 4v6m-2-3h4"/>',
    Trophy: '<path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4"/>',
    ChartNoAxesCombined: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/><path d="M14 9h5v5"/>',
    TrendingUp: '<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
    ListTodo: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h.01M11 9h6M7 14l1.5 1.5L11 13m2 1h4"/>',
    Gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H7.5a2.5 2.5 0 1 1 2.4-3.2C10.5 6.4 12 8 12 8Zm0 0h4.5a2.5 2.5 0 1 0-2.4-3.2C13.5 6.4 12 8 12 8Z"/>',
    Lightbulb: '<path d="M9 18h6m-5 4h4"/><path d="M8 14a7 7 0 1 1 8 0c-1 .8-1 2-1 2h-6s0-1.2-1-2Z"/>',
    CircleCheck: '<circle cx="12" cy="12" r="10"/><path d="m8 12 2.5 2.5L16 9"/>',
    CircleX: '<circle cx="12" cy="12" r="10"/><path d="m9 9 6 6m0-6-6 6"/>',
    LockKeyhole: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
    Camera: '<path d="M14 5h-4L8 8H4a2 2 0 0 0-2 2v9h20v-9a2 2 0 0 0-2-2h-4z"/><circle cx="12" cy="13" r="3"/>',
    ImagePlus: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21m13-8v6m-3-3h6"/>',
    LogOut: '<path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
    Wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8h18m-5 6h5"/><circle cx="16" cy="14" r=".6"/>',
    CalendarDays: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/>',
    PanelsTopLeft: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M9 9h12"/>',
    ShoppingCart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h2l2.5 12h12l3-9H5"/>',
    Zap: '<path d="m13 2-3 8h7l-6 12 2-9H6z"/>',
    Shirt: '<path d="m16 4 5 3-2 5-3-1v10H8V11l-3 1-2-5 5-3c1 2 2.5 3 4 3s3-1 4-3Z"/>',
    Glasses: '<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M10 15h4m-12-2 1-5h14l1 5"/>',
    CupSoda: '<path d="M5 3h14l-1 18H6L5 3Z"/><path d="M5 7h14m-9-4 2 4m2-4 2 4"/>',
    Cat: '<path d="M5 10 4 3l5 3a9 9 0 0 1 6 0l5-3-1 7a8 8 0 1 1-14 0Z"/><path d="M9 13h.01M15 13h.01m-5 4a3 3 0 0 0 6 0"/>',
    Bot: '<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4m-4 5h.01M16 12h.01M9 16h6"/><circle cx="12" cy="3" r="1"/>',
    Leaf: '<path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z"/><path d="M4 21c2-5 6-8 12-11"/>',
    ChevronRight: '<path d="m9 18 6-6-6-6"/>',
    ArrowLeft: '<path d="m12 19-7-7 7-7m-7 7h14"/>',
    Check: '<path d="m5 12 4 4L19 6"/>',
    Mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    Clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    Eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    Palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-2a2 2 0 0 0-2 2 5 5 0 0 1-3 5Z"/>',
    Lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    BadgeCheck: '<path d="M12 3 15 5l4-.2.8 3.8L22 12l-2.2 3.4-.8 3.8-4-.2-3 2-3-2-4 .2-.8-3.8L2 12l2.2-3.4L5 4.8l4 .2z"/><path d="m8 12 2.5 2.5L16 9"/>',
    Store: '<path d="M3 10V5l1-2h16l1 2v5M5 10v11h14V10"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 21v-6h6v6"/>',
    Calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    Timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6m-3 0v3m6.5 1.5L20 5"/>',
    CircleHelp: '<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.7 1.3-1.7 2.7m0 3h.01"/>',
    CircleUserRound: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="3"/><path d="M6.5 19a6 6 0 0 1 11 0"/>',
    Sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
    CircleAlert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v5m0 3h.01"/>',
    Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    Moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    RefreshCw: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.4-3"/>',
    CirclePlus: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/>',
    Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5m-5 5V3"/>',
    Upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5m5-5v12"/>',
    Trash2: '<path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6"/>'
  };

  function escapeAttribute(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function svg(name, size, label, className) {
    var paths = ICONS[name];
    if (!paths) throw new Error('Unknown LifeSkill icon: ' + name);
    var dimension = Number.isFinite(size) ? Math.max(12, Math.min(48, size)) : 20;
    var accessible = label ? ' role="img" aria-label="' + escapeAttribute(label) + '"' : ' aria-hidden="true"';
    var classAttr = className ? ' class="' + escapeAttribute(className) + '"' : '';
    return '<svg' + classAttr + ' width="' + dimension + '" height="' + dimension + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"' + accessible + '>' + paths + '</svg>';
  }

  root.LifeSkillIcons = { svg: svg, names: Object.keys(ICONS) };
})(typeof globalThis !== 'undefined' ? globalThis : this);

