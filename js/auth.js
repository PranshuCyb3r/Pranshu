/**
 * ZeR0CyB3r Authentication & Session Security Manager
 * - Synchronizes registered users across sessions & storage
 * - Enforces 5-minute inactivity auto-logout security policy
 * - Handles resilient credential verification (case-insensitive emails, trimmed fields, normalized phone numbers)
 */

(function () {
  const SESSION_KEY = 'cyber_auth_session';
  const USERS_KEY = 'cyber_users';
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes inactivity timeout
  const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

  // Master initial seed accounts if DB is empty
  const DEFAULT_SEED_USERS = [
    {
      name: "Pranshu Verman",
      number: "+91 8103162875",
      mail: "pranshuverman12@gmail.com",
      password: "Cyber@2026",
      registeredAt: "2026-03-29 10:00:00"
    },
    {
      name: "ZeR0CyB3r Security Operator",
      number: "+91 8103162875",
      mail: "operator@zerocyber.com",
      password: "Cyber@2026",
      registeredAt: "2026-03-29 10:00:00"
    }
  ];

  // Helper to normalize strings for comparison
  function normalizeEmail(email) {
    if (!email) return '';
    return String(email).trim().toLowerCase();
  }

  function normalizePass(pass) {
    if (pass === null || pass === undefined) return '';
    return String(pass);
  }

  // Get users from localStorage safely
  function getRegisteredUsers() {
    let users = [];
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) {
        users = JSON.parse(raw);
      }
    } catch (e) {
      users = [];
    }

    if (!Array.isArray(users) || users.length === 0) {
      users = [...DEFAULT_SEED_USERS];
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } catch (e) {}
    } else {
      // Ensure seed users are always present in the database so admin logins never fail
      let updated = false;
      DEFAULT_SEED_USERS.forEach(seed => {
        const exists = users.some(u => normalizeEmail(u.mail) === normalizeEmail(seed.mail));
        if (!exists) {
          users.push(seed);
          updated = true;
        }
      });
      if (updated) {
        try {
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch (e) {}
      }
    }

    return users;
  }

  // Save registered user
  function saveRegisteredUser(userObj) {
    if (!userObj || !userObj.mail) return false;
    const users = getRegisteredUsers();
    const cleanEmail = normalizeEmail(userObj.mail);

    // Update if already exists or add new
    const idx = users.findIndex(u => normalizeEmail(u.mail) === cleanEmail);
    const cleanedUser = {
      name: String(userObj.name || '').trim(),
      number: String(userObj.number || '').trim(),
      mail: cleanEmail,
      password: normalizePass(userObj.password),
      registeredAt: userObj.registeredAt || new Date().toISOString()
    };

    if (idx >= 0) {
      users[idx] = cleanedUser;
    } else {
      users.push(cleanedUser);
    }

    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
      return false;
    }
  }

  // Get active session
  function getActiveSession() {
    let sessionStr = null;
    try {
      sessionStr = localStorage.getItem(SESSION_KEY);
    } catch (e) {
      sessionStr = null;
    }
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      if (!session || (!session.mail && !session.name)) {
        return null;
      }

      // Check Inactivity Expiration
      const now = Date.now();
      const lastActivity = session.lastActivity || session.loginTimestamp || now;
      if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
        // Session expired due to inactivity
        terminateSession('inactivity');
        return null;
      }

      return session;
    } catch (e) {
      return null;
    }
  }

  // Create new active session
  function createSession(user) {
    const now = Date.now();
    const sessionObj = {
      name: user.name || 'OPERATOR',
      mail: normalizeEmail(user.mail),
      number: user.number || '+91 8103162875',
      token: '#Z0C-' + Math.floor(10000 + Math.random() * 90000) + '-SEC',
      loginTime: new Date(now).toLocaleString(),
      loginTimestamp: now,
      lastActivity: now
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj));
    } catch (e) {}

    return sessionObj;
  }

  // Update session activity timestamp
  function touchActivity() {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session) {
          session.lastActivity = Date.now();
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
      }
    } catch (e) {}
  }

  // Terminate session with reason
  function terminateSession(reason) {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('cyber_session_user');
      sessionStorage.clear();
    } catch (e) {}

    if (reason === 'inactivity') {
      // Redirect to login with reason parameter
      const isAlreadyOnAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');
      if (!isAlreadyOnAuthPage) {
        window.location.href = 'login.html?reason=inactivity';
      }
    }
  }

  // Inactivity Watchdog
  function initInactivityWatchdog() {
    // Throttled activity event listener
    let throttleTimeout = null;
    const onUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          touchActivity();
          throttleTimeout = null;
        }, 3000);
      }
    };

    ACTIVITY_EVENTS.forEach(evt => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });

    // Check every 10 seconds if session has expired
    setInterval(() => {
      const session = getActiveSession();
      // If was previously on a protected page like hub.html and session is now null
      if (!session && window.location.pathname.includes('hub.html')) {
        window.location.replace('login.html?redirect=hub.html&reason=inactivity');
      }
    }, 10000);
  }

  // Initialize watchdog on load
  if (typeof window !== 'undefined') {
    initInactivityWatchdog();
  }

  // Export functions to global window object
  window.CyberAuth = {
    getRegisteredUsers,
    saveRegisteredUser,
    getActiveSession,
    createSession,
    touchActivity,
    terminateSession,
    normalizeEmail,
    normalizePass,
    INACTIVITY_TIMEOUT_MS
  };
})();
