/**
 * ZeR0CyB3r - Live Threat Intelligence & CVE Radar
 * Interactive Threat Cards with Dynamic Mitigation Strategy Revealing
 */

(function () {
  'use strict';

  const THREAT_DATABASE = [
    {
      id: 'CVE-2024-3094',
      name: 'XZ Utils Liblzma Backdoor',
      category: 'supply-chain',
      categoryLabel: 'Supply Chain / SSH',
      cvss: 10.0,
      severity: 'critical',
      target: 'Linux Enterprise & OpenSSH Daemon',
      vector: 'Malicious upstream object injection in autotools tarball',
      description: 'Upstream supply chain compromise inserting an obfuscated backdoor into liblzma, enabling unauthorized authentication bypass and arbitrary code execution in OpenSSH.',
      mitigation: {
        patch: 'Immediately revert or upgrade xz to 5.4.6 or clean 5.6.2+. Rebuild affected container bases.',
        workaround: 'Verify sshd linking against liblzma and isolate exposed management access.',
        rule: 'ldd $(which sshd) | grep liblzma && xz --version',
        detection: 'Audit package managers: rpm -qa | grep xz || dpkg -l | grep xz-utils'
      },
      status: 'VERIFIED REMEDIATED'
    },
    {
      id: 'CVE-2024-6387',
      name: 'regreSSHion: OpenSSH Signal Handler RCE',
      category: 'zero-day',
      categoryLabel: 'Network RCE',
      cvss: 8.1,
      severity: 'high',
      target: 'glibc-based Linux Servers (sshd)',
      vector: 'Signal handler race condition (SIGALRM) in default sshd configuration',
      description: 'A regression of a 2006 race condition in OpenSSH server enables unauthenticated remote code execution as root on 32/64-bit glibc Linux systems.',
      mitigation: {
        patch: 'Upgrade OpenSSH to version 9.8p1 or vendor backported security release.',
        workaround: 'Set LoginGraceTime to 0 in sshd_config (prevents SIGALRM signal race condition).',
        rule: 'echo "LoginGraceTime 0" >> /etc/ssh/sshd_config && systemctl reload sshd',
        detection: 'Monitor auth.log for excessive preauth connection timeouts: "Timeout before authentication"'
      },
      status: 'HOTFIX DEPLOYED'
    },
    {
      id: 'CVE-2024-21626',
      name: 'runc Leaky File Descriptor Breakout',
      category: 'cloud',
      categoryLabel: 'Container Breakout',
      cvss: 8.6,
      severity: 'high',
      target: 'Docker, Containerd, Kubernetes Nodes',
      vector: 'Unclosed /sys/fs/cgroup internal file descriptor leak',
      description: 'Internal file descriptor leak in runc allows malicious containers to overwrite host binaries or traverse the host filesystem via /proc/self/fd/7.',
      mitigation: {
        patch: 'Update runc to >= 1.1.12 across all container runtimes and Kubernetes worker nodes.',
        workaround: 'Mount root filesystems as read-only and restrict process capabilities (drop CAP_SYS_ADMIN).',
        rule: 'docker run --read-only --cap-drop=ALL --security-opt=no-new-privileges',
        detection: 'Audit host kernel auditd for access to /sys/fs/cgroup from unprivileged namespace'
      },
      status: 'PATCH VERIFIED'
    },
    {
      id: 'CVE-2024-3400',
      name: 'PAN-OS GlobalProtect Command Injection',
      category: 'zero-day',
      categoryLabel: 'Perimeter Zero-Day',
      cvss: 10.0,
      severity: 'critical',
      target: 'Palo Alto Networks Edge Firewalls',
      vector: 'Arbitrary OS command injection in GlobalProtect Gateway feature',
      description: 'Unauthenticated remote attackers can execute arbitrary code with root privileges on the firewall operating system through crafted HTTP requests.',
      mitigation: {
        patch: 'Apply hotfixes: PAN-OS 10.2.9-h1, 11.0.4-h1, 11.1.2-h3, and corresponding maintenance releases.',
        workaround: 'Temporarily disable Device Telemetry until emergency hotfixes are installed.',
        rule: 'set deviceconfig setting telemetry enable no',
        detection: 'Review /var/log/pan/gpsvc.log for anomalous curl or shell pipe commands'
      },
      status: 'SIGNATURE ENFORCED'
    },
    {
      id: 'CVE-2023-44487',
      name: 'HTTP/2 Rapid Reset Protocol Flood',
      category: 'web',
      categoryLabel: 'Layer 7 Protocol Flaw',
      cvss: 7.5,
      severity: 'high',
      target: 'Nginx, Envoy, Cloud Edge CDNs & Reverse Proxies',
      vector: 'RST_STREAM abuse with parallel stream multiplexing',
      description: 'Exploits the HTTP/2 stream cancellation mechanism to send hundreds of thousands of requests per second, exhausting server CPU without reaching connection limits.',
      mitigation: {
        patch: 'Update web server packages (Nginx >= 1.25.3, Apache >= 2.4.58, HAProxy >= 2.8.4).',
        workaround: 'Limit max concurrent streams and enforce rate limiting per HTTP/2 connection.',
        rule: 'http2_max_concurrent_streams 100; limit_req zone=perip burst=40 nodelay;',
        detection: 'Track ratio of RST_STREAM frames relative to standard DATA frames in ingress logs'
      },
      status: 'WAF SHIELD ACTIVE'
    },
    {
      id: 'CVE-2024-20353',
      name: 'Cisco ASA & FTD WebVPN Denial & RCE',
      category: 'perimeter',
      categoryLabel: 'Enterprise Gateway',
      cvss: 8.6,
      severity: 'high',
      target: 'Cisco Adaptive Security Appliances & Firepower',
      vector: 'Memory corruption in WebVPN / AnyConnect SSL endpoint processing',
      description: 'A flaw in Cisco ASA SSL VPN allows an unauthenticated remote attacker to cause memory corruption, leading to denial of service reload or arbitrary code execution.',
      mitigation: {
        patch: 'Upgrade Cisco ASA and FTD software to the latest patched train (9.16.4.57+, 9.18.4.22+).',
        workaround: 'Enforce geo-blocking and restrict AnyConnect portal ingress to verified client IP ranges.',
        rule: 'access-list RESTRICT_VPN extended permit ip 198.51.100.0 255.255.255.0 any',
        detection: 'Monitor syslog for crash dumps with signature %ASA-1-106021 or unexpected core dumps'
      },
      status: 'AUDIT PASSED'
    }
  ];

  let activeCategory = 'all';
  let searchQuery = '';

  function renderThreatCards() {
    const gridEl = document.getElementById('threatIntelGrid');
    if (!gridEl) return;

    const filtered = THREAT_DATABASE.filter((threat) => {
      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'zero-day' && (threat.category === 'zero-day' || threat.cvss >= 9.0)) ||
        (activeCategory === 'cloud' && (threat.category === 'cloud' || threat.categoryLabel.includes('Container'))) ||
        (activeCategory === 'web' && (threat.category === 'web' || threat.categoryLabel.includes('Protocol'))) ||
        (activeCategory === 'supply-chain' && (threat.category === 'supply-chain' || threat.categoryLabel.includes('SSH')));

      const matchesSearch =
        searchQuery === '' ||
        threat.id.toLowerCase().includes(searchQuery) ||
        threat.name.toLowerCase().includes(searchQuery) ||
        threat.target.toLowerCase().includes(searchQuery) ||
        threat.description.toLowerCase().includes(searchQuery);

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(14, 17, 24, 0.5); border: 1px dashed var(--border-card); border-radius: 14px;">
          <i class="fa-solid fa-radar" style="font-size: 32px; color: #ff0038; margin-bottom: 12px; display: block;"></i>
          <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 6px;">
            NO THREAT SIGNATURES MATCHED
          </div>
          <p style="color: #a1a1aa; font-size: 12px; margin-bottom: 16px;">Try adjusting your search terms or selecting 'ALL INTEL'.</p>
          <button type="button" class="threat-filter-btn active" onclick="window.resetThreatFilter()">Reset Filter</button>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered
      .map((item) => {
        return `
        <article class="threat-card" data-cve="${item.id}" tabindex="0">
          <!-- Card Header -->
          <div class="threat-card-top">
            <span class="threat-cvss-badge ${item.severity}">
              <i class="fa-solid fa-radiation"></i> CVSS ${item.cvss.toFixed(1)} ${item.severity.toUpperCase()}
            </span>
            <span class="threat-category-tag">${item.categoryLabel}</span>
          </div>

          <!-- CVE ID & Name -->
          <div class="threat-cve-id">
            <i class="fa-solid fa-triangle-exclamation"></i> ${item.id}
          </div>
          <h3 class="threat-name">${item.name}</h3>

          <!-- Target Infrastructure -->
          <div class="threat-target">
            <i class="fa-solid fa-server"></i>
            <span>${item.target}</span>
          </div>

          <!-- Description -->
          <p class="threat-desc">${item.description}</p>

          <!-- Interactive Hover Mitigation Strategy Drawer -->
          <div class="threat-mitigation-drawer">
            <div class="mitigation-header">
              <span><i class="fa-solid fa-shield-halved"></i> MITIGATION BLUEPRINT</span>
              <span class="mitigation-badge">OFFENSIVE SEC VERIFIED</span>
            </div>

            <div class="mitigation-step">
              <i class="fa-solid fa-circle-check"></i>
              <span><strong>Remediation:</strong> ${item.mitigation.patch}</span>
            </div>

            <div class="mitigation-step">
              <i class="fa-solid fa-gears"></i>
              <span><strong>Defensive Control:</strong> ${item.mitigation.workaround}</span>
            </div>

            <div class="mitigation-code"># Enforcement command / rule:\n${item.mitigation.rule}</div>

            <div class="mitigation-step" style="margin-top: 8px;">
              <i class="fa-solid fa-magnifying-glass"></i>
              <span><strong>SOC IoC Detection:</strong> ${item.mitigation.detection}</span>
            </div>
          </div>

          <!-- Action Row -->
          <div class="threat-card-actions">
            <div class="threat-status-tag">
              <i class="fa-solid fa-circle-check"></i>
              <span>${item.status}</span>
            </div>

            <button type="button" class="threat-ask-ai-btn" onclick="window.askZeR0AiAboutThreat('${item.id}', '${item.name.replace(/'/g, "\\'")}')" title="Ask ZeR0 AI for in-depth remediation audit">
              <i class="fa-solid fa-microchip"></i>
              <span>Audit in ZeR0 AI</span>
            </button>
          </div>
        </article>
      `;
      })
      .join('');
  }

  // Global helper to trigger ZeR0 AI with pre-filled threat inquiry
  window.askZeR0AiAboutThreat = function (cveId, cveName) {
    if (window.openZeR0AiSentinel) {
      window.openZeR0AiSentinel();
    } else {
      const openBtn = document.getElementById('btnOpenGeminiSentinel');
      if (openBtn) openBtn.click();
    }

    setTimeout(() => {
      const inputEl = document.getElementById('geminiPromptInput');
      if (inputEl) {
        inputEl.value = `Provide a comprehensive technical VAPT audit and hardening checklist for ${cveId} (${cveName}). Include specific detection rules, defense-in-depth steps, and verification commands.`;
        inputEl.focus();
      }
    }, 250);
  };

  window.resetThreatFilter = function () {
    activeCategory = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('threatSearchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.threat-filter-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === 'all');
    });
    renderThreatCards();
  };

  function initThreatIntelUI() {
    renderThreatCards();

    // Category filter click handlers
    const filterButtons = document.querySelectorAll('.threat-filter-btn');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.filter || 'all';
        renderThreatCards();
      });
    });

    // Search input handler
    const searchInput = document.getElementById('threatSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderThreatCards();
      });
    }
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreatIntelUI);
  } else {
    initThreatIntelUI();
  }
})();
