/**
 * ZeR0CyB3r Study Hub // Procedural Installation & Practical Guides Dataset
 * Comprehensive step-by-step documentation for virtualization, tooling, and operations.
 */

var CYBER_GUIDES = [
  {
    id: "guide-kali-linux",
    categoryBadgeClass: "badge-os",
    categoryText: "OPERATING SYSTEM DEPLOYMENT",
    icon: "fa-linux",
    title: "Kali Linux 2026: Virtualization & Installation Masterclass",
    shortDesc: "Comprehensive deployment instructions for VMware Workstation, Oracle VirtualBox, WSL2, and Bare Metal with default credentials, guest additions, and first-boot setup.",
    setupTime: "15–20 Mins",
    target: "Penetration Testing Laboratory",
    officialUrl: "https://www.kali.org/get-kali/",
    supportedPlatforms: [
      { name: "VMware Workstation", highlight: true },
      { name: "Oracle VirtualBox", highlight: true },
      { name: "Windows WSL2", highlight: false },
      { name: "Bare Metal USB", highlight: false }
    ],
    specs: {
      minRam: "2 GB RAM",
      recRam: "4–8 GB RAM",
      cpuCores: "2 Cores",
      recCpu: "4 Cores",
      diskSpace: "25 GB Free",
      recDisk: "50+ GB SSD"
    },
    overview: "Kali Linux is the gold-standard Debian-based penetration testing platform. This guide provides certified step-by-step procedures to install, configure display drivers, enable clipboard sharing, and set up your offensive cyber laboratory.",
    firstBoot: {
      credentials: { username: "kali", password: "kali" },
      postInstallSteps: [
        {
          step: 1,
          title: "Update APT Repositories & Packages",
          action: "Synchronize local package index and upgrade all pre-installed penetration testing utilities to the latest stable build.",
          command: "sudo apt update && sudo apt dist-upgrade -y"
        },
        {
          step: 2,
          title: "Install VMware / VirtualBox Display Integration",
          action: "Enables dynamic desktop auto-resizing, shared clipboard copy-paste, and bidirectional drag-and-drop file transfers.",
          command: "sudo apt install -y open-vm-tools-desktop && sudo reboot"
        },
        {
          step: 3,
          title: "Configure Custom Non-Root Password",
          action: "For security compliance, replace the default password with an encrypted strong passphrase.",
          command: "passwd kali"
        }
      ]
    },
    installProcesses: {
      vmware: {
        steps: [
          {
            step: 1,
            title: "Download Kali ISO or Pre-Built VM Image",
            action: "Visit official kali.org/get-kali and download either the Installer ISO (64-bit) or the pre-configured VMware archive (.7z)."
          },
          {
            step: 2,
            title: "Configure Virtual Machine Hardware",
            action: "In VMware, click 'Create a New Virtual Machine' > Select 'Custom'. Set Guest OS to 'Linux' and Version to 'Debian 12.x 64-bit'. Allocate 4GB RAM and 2–4 CPU cores."
          },
          {
            step: 3,
            title: "Configure Virtual Disk & Network",
            action: "Create a 40GB+ SCSI/NVMe virtual disk stored as a single file. Set Network Connection to 'NAT' for safe shared host browsing, or 'Bridged' for local subnet attacks."
          },
          {
            step: 4,
            title: "Execute Graphical Installation",
            action: "Power on the VM, choose 'Graphical Install', configure your language/locale, and partition the disk using 'Guided - use entire disk'."
          }
        ]
      },
      virtualbox: {
        steps: [
          {
            step: 1,
            title: "Install Oracle VirtualBox & Extension Pack",
            action: "Download VirtualBox 7.x and install the Oracle VM VirtualBox Extension Pack to support USB 3.0 controllers and host integrations."
          },
          {
            step: 2,
            title: "Create Virtual Machine Profile",
            action: "Click 'New' > Name: 'Kali-Linux-2026', Type: 'Linux', Subtype: 'Debian (64-bit)'. Enable EFI if required, set RAM slider to 4096MB and CPUs to 2."
          },
          {
            step: 3,
            title: "Enable Hardware Virtualization (VT-x / AMD-V)",
            action: "Go to Settings > System > Processor > Verify 'Enable PAE/NX' is checked. Under Acceleration, verify 'VT-x/AMD-V' is active."
          },
          {
            step: 4,
            title: "Attach ISO & Complete Guided Setup",
            action: "Go to Storage > Controller: IDE/SATA > Click Empty optical drive > Choose the Kali Installer ISO. Start VM and complete setup."
          }
        ]
      },
      wsl2: {
        steps: [
          {
            step: 1,
            title: "Enable WSL2 on Windows 10/11",
            action: "Launch PowerShell as Administrator and run the automated installation command for the Kali distribution.",
            command: "wsl --install -d kali-linux"
          },
          {
            step: 2,
            title: "Initialize Kali User Account",
            action: "Reboot Windows when prompted. Launch 'Kali Linux' from the Start Menu, enter your desired username and password."
          },
          {
            step: 3,
            title: "Install Win-KeX Graphical Desktop",
            action: "Install the seamless GUI subsystem to run full Kali desktop windows directly alongside Windows apps.",
            command: "sudo apt update && sudo apt install -y kali-win-kex && kex --esm --sound"
          }
        ]
      },
      baremetal: {
        steps: [
          {
            step: 1,
            title: "Create Bootable USB Media with Rufus / Etcher",
            action: "Insert a 16GB+ USB flash drive. In Rufus, select the Kali ISO and make sure to write in 'DD Image Mode' for optimal BIOS boot compatibility."
          },
          {
            step: 2,
            title: "Configure BIOS / UEFI Firmware Settings",
            action: "Restart machine and tap F2 / F10 / Del. In BIOS: Disable Secure Boot, enable UEFI boot mode, and prioritize USB Drive in Boot Order."
          },
          {
            step: 3,
            title: "Partition Drive & Encrypt Root Partition (LUKS)",
            action: "Select 'Guided - use entire disk and set up encrypted LVM'. This protects all engagement data if the physical laptop is lost."
          }
        ]
      }
    },
    howToUse: {
      coreWorkflows: [
        {
          name: "Subnet Host Discovery",
          purpose: "Reconnaissance",
          explanation: "Rapid ping sweep to detect all active IP addresses on the local network.",
          command: "sudo nmap -sn 192.168.1.0/24"
        },
        {
          name: "Full Port & Service Scan",
          purpose: "Vulnerability Scanning",
          explanation: "Exhaustive scan of all 65,535 TCP ports with default scripts and version detection.",
          command: "nmap -sC -sV -p- -T4 -oA kali_scan target_ip"
        },
        {
          name: "Web Application Interception",
          purpose: "Proxy Setup",
          explanation: "Start Burp Suite with pre-configured loopback interface for HTTP/S traffic interception.",
          command: "burpsuite &"
        }
      ]
    },
    troubleshooting: [
      {
        issue: "Virtual Machine screen is locked at 800x600 resolution and cannot be resized",
        cause: "VMware Tools / VirtualBox Guest Additions kernel modules are missing or need recompilation.",
        solution: "Install the open-vm-tools-desktop package and reboot the guest machine.",
        fixCommand: "sudo apt update && sudo apt install -y open-vm-tools-desktop && sudo reboot"
      },
      {
        issue: "Cannot connect to the internet from inside Kali VM",
        cause: "Host network adapter DNS routing conflict or VM network configured to Host-Only.",
        solution: "Change VM Network Adapter to 'NAT'. If problem persists, restart systemd-resolved and set Google DNS.",
        fixCommand: "echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf"
      },
      {
        issue: "APT update fails with 'repository is not signed' or GPG key errors",
        cause: "System clock desynchronization or expired Kali archive keyring.",
        solution: "Update the kali-archive-keyring package and resync clock via NTP.",
        fixCommand: "sudo apt install -y kali-archive-keyring && sudo apt update"
      }
    ]
  },
  {
    id: "guide-parrot-os",
    categoryBadgeClass: "badge-os",
    categoryText: "PRIVACY & SECURITY OS",
    icon: "fa-feather",
    title: "Parrot Security OS: Installation, Hardening & Anonsurf Setup",
    shortDesc: "Deploy Parrot Security Edition in VMware or VirtualBox. Configure full-system Tor anonymization via Anonsurf and set up development sandboxes.",
    setupTime: "15 Mins",
    target: "Stealth Testing & Digital Privacy",
    officialUrl: "https://parrotsec.org/download/",
    supportedPlatforms: [
      { name: "Oracle VirtualBox", highlight: true },
      { name: "VMware Workstation", highlight: true },
      { name: "Bare Metal Live", highlight: false }
    ],
    specs: {
      minRam: "2 GB RAM",
      recRam: "4 GB RAM",
      cpuCores: "2 Cores",
      recCpu: "4 Cores",
      diskSpace: "20 GB Free",
      recDisk: "40 GB SSD"
    },
    overview: "Parrot OS is a lightweight, Debian-based distribution optimized for cloud penetration testing, cryptography, and digital privacy with hardened kernel protections.",
    firstBoot: {
      credentials: { username: "parrot", password: "parrot" },
      postInstallSteps: [
        {
          step: 1,
          title: "Full System Repository Upgrade",
          action: "Use Parrot's specialized package manager command to pull all security updates.",
          command: "sudo parrot-upgrade"
        },
        {
          step: 2,
          title: "Start & Verify Anonsurf Tor Anonymizer",
          action: "Route all system DNS requests and TCP socket traffic through the distributed Tor network.",
          command: "sudo anonsurf start && sudo anonsurf status"
        }
      ]
    },
    installProcesses: {
      virtualbox: {
        steps: [
          {
            step: 1,
            title: "Download Parrot Security Edition ISO",
            action: "Obtain the official Parrot Security ISO from parrotsec.org."
          },
          {
            step: 2,
            title: "Create Virtual Machine Profile",
            action: "In VirtualBox, create a Linux VM with 4GB RAM, 2 CPUs, and 30GB VDI virtual hard disk."
          },
          {
            step: 3,
            title: "Launch Calamares Installer",
            action: "Boot the Live ISO, click 'Install Parrot', select language, keyboard, and let Calamares complete automated partitioning."
          }
        ]
      },
      vmware: {
        steps: [
          {
            step: 1,
            title: "Create New VM Profile in VMware",
            action: "Select Custom > Linux > Debian 12 64-bit > Allocate 4GB RAM, 2 CPU cores, and NAT network adapter."
          },
          {
            step: 2,
            title: "Boot Live Mode & Install",
            action: "Boot into Parrot Live desktop, launch the installer, and select 'Erase Disk' for automated LUKS encrypted setup."
          }
        ]
      }
    },
    howToUse: {
      coreWorkflows: [
        {
          name: "Activate System-Wide Tor Routing",
          purpose: "OPSEC / Anonymity",
          explanation: "Reroutes all outgoing packets through Tor and clears RAM caches upon shutdown.",
          command: "sudo anonsurf start"
        },
        {
          name: "Verify Tor Exit Node IP",
          purpose: "Verification",
          explanation: "Confirm that public traffic originates from an authenticated Tor relay node.",
          command: "anonsurf myip"
        }
      ]
    },
    troubleshooting: [
      {
        issue: "Anonsurf fails to start with iptables lock error",
        cause: "Existing firewall conflict or residual daemon process.",
        solution: "Stop anonsurf, flush iptables, and restart the daemon.",
        fixCommand: "sudo anonsurf stop && sudo anonsurf restart"
      }
    ]
  },
  {
    id: "guide-burp-suite",
    categoryBadgeClass: "badge-tools",
    categoryText: "WEB VAPT ARSENAL",
    icon: "fa-spider",
    title: "Burp Suite Community & Pro: Browser Proxy & CA Setup",
    shortDesc: "Complete walkthrough: configure browser proxy listening on 127.0.0.1:8080, export & trust PortSwigger CA Certificate, and intercept HTTPS traffic.",
    setupTime: "10 Mins",
    target: "Web Application Assessment",
    officialUrl: "https://portswigger.net/burp/communitydownload",
    supportedPlatforms: [
      { name: "Firefox / Chrome", highlight: true },
      { name: "Windows / Linux / macOS", highlight: true }
    ],
    specs: {
      minRam: "2 GB RAM",
      recRam: "4 GB RAM",
      cpuCores: "2 Cores",
      recCpu: "4 Cores",
      diskSpace: "1 GB Free",
      recDisk: "2 GB Free"
    },
    overview: "Burp Suite is the premiere intercepting proxy for assessing OWASP Top 10 vulnerabilities in web applications, REST APIs, and microservices.",
    firstBoot: {
      credentials: { username: "N/A", password: "N/A" },
      postInstallSteps: [
        {
          step: 1,
          title: "Verify Proxy Listener Status",
          action: "Ensure Proxy Listener is running on 127.0.0.1:8080 in Burp > Proxy > Proxy Settings."
        },
        {
          step: 2,
          title: "Install PortSwigger CA Certificate in Browser",
          action: "Navigate to http://burpsuite in browser > Click 'CA Certificate' > Import into Firefox/Chrome Certificates under 'Authorities'."
        }
      ]
    },
    installProcesses: {
      baremetal: {
        steps: [
          {
            step: 1,
            title: "Download Burp Suite Installer",
            action: "Download Burp Suite Community or Pro edition from portswigger.net."
          },
          {
            step: 2,
            title: "Configure Browser Proxy Extension (FoxyProxy)",
            action: "Install FoxyProxy extension in Firefox/Chrome. Add a new proxy with Host: 127.0.0.1, Port: 8080, Type: HTTP."
          },
          {
            step: 3,
            title: "Import PortSwigger Root Certificate",
            action: "With proxy active, open http://burpsuite in the browser. Download cacert.der, open browser settings > Certificates > Authorities > Import and check 'Trust this CA to identify websites'."
          }
        ]
      }
    },
    howToUse: {
      coreWorkflows: [
        {
          name: "HTTP Request Interception & Modification",
          purpose: "Traffic Tampering",
          explanation: "Inspect and modify request parameters, headers, cookies, and payloads before they reach the web server.",
          command: "Proxy > Intercept > Toggle 'Intercept is on'"
        },
        {
          name: "Repeater Parameter Fuzzing",
          purpose: "Vulnerability Verification",
          explanation: "Send requests to Repeater (Ctrl+R) to iterate SQL injection payloads and test response headers.",
          command: "Right-Click Request > Send to Repeater (Ctrl+R)"
        }
      ]
    },
    troubleshooting: [
      {
        issue: "Browser shows 'SEC_ERROR_UNKNOWN_ISSUER' or 'Your connection is not private'",
        cause: "PortSwigger CA certificate has not been imported into the browser's trusted certificate store.",
        solution: "Download cacert.der from http://burpsuite while proxy is running and import into browser certificate authorities.",
        fixCommand: "Browser > Settings > Privacy & Security > Certificates > View Certificates > Authorities > Import"
      }
    ]
  },
  {
    id: "guide-nmap-scanner",
    categoryBadgeClass: "badge-tools",
    categoryText: "NETWORK AUDIT",
    icon: "fa-radar",
    title: "Nmap Network Mapper & NSE Scripting Engine",
    shortDesc: "Master host discovery, SYN stealth scans, version fingerprinting, and automated vulnerability detection using the Nmap Scripting Engine.",
    setupTime: "5 Mins",
    target: "Network Security & Port Auditing",
    officialUrl: "https://nmap.org/",
    supportedPlatforms: [
      { name: "Linux (apt/dnf)", highlight: true },
      { name: "Windows (Zenmap)", highlight: true },
      { name: "macOS (brew)", highlight: false }
    ],
    specs: {
      minRam: "512 MB RAM",
      recRam: "2 GB RAM",
      cpuCores: "1 Core",
      recCpu: "2 Cores",
      diskSpace: "200 MB Free",
      recDisk: "500 MB Free"
    },
    overview: "Nmap is the world's most versatile network exploration and security auditing tool. Supports raw IP packet generation, OS detection, and Lua scripting.",
    firstBoot: {
      credentials: { username: "N/A", password: "N/A" },
      postInstallSteps: [
        {
          step: 1,
          title: "Update NSE Script Database",
          action: "Update the local Nmap Scripting Engine database to discover latest known CVEs.",
          command: "sudo nmap --script-updatedb"
        }
      ]
    },
    installProcesses: {
      baremetal: {
        steps: [
          {
            step: 1,
            title: "Installation via Package Manager",
            action: "On Debian/Kali: sudo apt install -y nmap. On Arch: sudo pacman -S nmap. On macOS: brew install nmap."
          },
          {
            step: 2,
            title: "Verify Installation and Version",
            action: "Run nmap --version to confirm binary paths and Npcap/libpcap driver integration."
          }
        ]
      }
    },
    howToUse: {
      coreWorkflows: [
        {
          name: "Standard Fast Reconnaissance",
          purpose: "Port Scanning",
          explanation: "Scans top 1000 ports with version detection and default safe NSE scripts.",
          command: "nmap -sC -sV target_ip"
        },
        {
          name: "Comprehensive Vulnerability Audit",
          purpose: "Vuln Scan",
          explanation: "Executes all NSE vulnerability detection scripts against open services.",
          command: "nmap --script vuln -p- target_ip"
        }
      ]
    },
    troubleshooting: [
      {
        issue: "Scans run extremely slowly or hang on firewalled ports",
        cause: "Target drops packets causing TCP timeouts on standard timing.",
        solution: "Add -Pn to skip host ping and use -T4 timing template with --min-rate.",
        fixCommand: "nmap -Pn -T4 --min-rate 1000 -p- target_ip"
      }
    ]
  },
  {
    id: "guide-metasploit-framework",
    categoryBadgeClass: "badge-tools",
    categoryText: "EXPLOITATION ENGINE",
    icon: "fa-crosshairs",
    title: "Metasploit Framework & PostgreSQL Database Setup",
    shortDesc: "Initialize PostgreSQL database caching, configure msfconsole workspaces, manage multi-handler listeners, and generate staged payloads.",
    setupTime: "10 Mins",
    target: "Exploitation & Post-Exploitation",
    officialUrl: "https://www.metasploit.com/",
    supportedPlatforms: [
      { name: "Kali / Debian", highlight: true },
      { name: "Arch Linux", highlight: false },
      { name: "Docker Container", highlight: false }
    ],
    specs: {
      minRam: "2 GB RAM",
      recRam: "4 GB RAM",
      cpuCores: "2 Cores",
      recCpu: "4 Cores",
      diskSpace: "2 GB Free",
      recDisk: "5 GB Free"
    },
    overview: "Metasploit Framework enables penetration testers to verify vulnerability exploitability, deploy Meterpreter payloads, and manage engagements via workspace databases.",
    firstBoot: {
      credentials: { username: "msf", password: "Auto Generated" },
      postInstallSteps: [
        {
          step: 1,
          title: "Initialize Metasploit Database",
          action: "Starts and configures the PostgreSQL backend database for fast module search and loot tracking.",
          command: "sudo msfdb init && msfconsole -q"
        },
        {
          step: 2,
          title: "Verify Database Connection Status",
          action: "Inside msfconsole, verify that the database status returns 'Connected to msf'.",
          command: "db_status"
        }
      ]
    },
    installProcesses: {
      baremetal: {
        steps: [
          {
            step: 1,
            title: "Install via Apt or Nightly Installer",
            action: "Pre-installed on Kali Linux. For Ubuntu/Debian: curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall && chmod 755 msfinstall && ./msfinstall"
          }
        ]
      }
    },
    howToUse: {
      coreWorkflows: [
        {
          name: "Reverse TCP Meterpreter Multi Handler",
          purpose: "Payload Staging",
          explanation: "Configure listener to receive inbound reverse shells from compromised targets.",
          command: "use exploit/multi/handler\nset payload windows/x64/meterpreter/reverse_tcp\nset LHOST eth0\nset LPORT 4444\nexploit -j"
        },
        {
          name: "Search Verified Exploit Modules",
          purpose: "Module Discovery",
          explanation: "Search exploit database for verified high-reliability CVE modules.",
          command: "search type:exploit cve:2024 ranking:excellent"
        }
      ]
    },
    troubleshooting: [
      {
        issue: "Database connection failed (db_status shows not connected)",
        cause: "PostgreSQL service is stopped or database cluster needs reinitialization.",
        solution: "Restart PostgreSQL service and reinitialize the Metasploit database.",
        fixCommand: "sudo systemctl restart postgresql && sudo msfdb reinit"
      }
    ]
  },
  {
    id: "guide-wireshark-pcap",
    categoryBadgeClass: "badge-tools",
    categoryText: "TRAFFIC FORENSICS",
    icon: "fa-network-wired",
    title: "Wireshark: Npcap Setup & TLS Decryption Secrets",
    shortDesc: "Capture promiscuous network packets, configure non-root packet capture permissions, and decrypt TLS encrypted HTTPS sessions using SSLKEYLOGFILE.",
    setupTime: "10 Mins",
    target: "Traffic Analysis & Forensics",
    officialUrl: "https://www.wireshark.org/",
    supportedPlatforms: [
      { name: "Windows (Npcap)", highlight: true },
      { name: "Linux (libpcap)", highlight: true },
      { name: "macOS", highlight: false }
    ],
    specs: {
      minRam: "2 GB RAM",
      recRam: "4 GB RAM",
      cpuCores: "2 Cores",
      recCpu: "4 Cores",
      diskSpace: "500 MB Free",
      recDisk: "2 GB Free"
    },
    overview: "Wireshark provides deep visibility into network communication protocols. Analyze malware C2 traffic, detect exfiltration, and troubleshoot connectivity.",
    firstBoot: {
      credentials: { username: "N/A", password: "N/A" },
      postInstallSteps: [
        {
          step: 1,
          title: "Configure Non-Root Capture Privileges",
          action: "Allows standard Linux users to capture packets without needing sudo.",
          command: "sudo dpkg-reconfigure wireshark-common && sudo usermod -aG wireshark $USER"
        }
      ]
    },
    installProcesses: {
      baremetal: {
        steps: [
          {
            step: 1,
            title: "Install Wireshark & Drivers",
            action: "On Linux: sudo apt install -y wireshark tshark. On Windows: run installer and check 'Install Npcap with WinPcap compatibility'."
          }
        ]
      }
    },
    howToUse: {
      coreWorkflows: [
        {
          name: "TLS Decryption via Key Log File",
          purpose: "HTTPS Decryption",
          explanation: "Point Wireshark to your browser's SSLKEYLOGFILE to decrypt live HTTPS streams.",
          command: "Edit > Preferences > Protocols > TLS > (Pre)-Master-Secret log filename"
        },
        {
          name: "Filter Sensitive HTTP Authentication Credentials",
          purpose: "Traffic Inspection",
          explanation: "Extract HTTP POST requests containing potential credential strings.",
          command: "http.request.method == \"POST\" && (http contains \"password\" || http contains \"login\")"
        }
      ]
    },
    troubleshooting: [
      {
        issue: "No network interfaces appear in the capture list",
        cause: "Current user lacks permission to access raw sockets or Npcap driver not started.",
        solution: "Add user to wireshark group on Linux, or restart Npcap service on Windows.",
        fixCommand: "sudo usermod -aG wireshark $USER && newgrp wireshark"
      }
    ]
  }
];

/**
 * Procedural Search Filter Utility
 */
function searchCyberGuides(query) {
  if (!query) return CYBER_GUIDES;
  const q = query.toLowerCase().trim();
  return CYBER_GUIDES.filter(guide => {
    const titleMatch = guide.title.toLowerCase().includes(q);
    const descMatch = guide.shortDesc.toLowerCase().includes(q);
    const targetMatch = guide.target.toLowerCase().includes(q);
    const platformMatch = guide.supportedPlatforms.some(p => p.name.toLowerCase().includes(q));
    const workflowMatch = guide.howToUse && guide.howToUse.coreWorkflows.some(w =>
      w.name.toLowerCase().includes(q) ||
      w.command.toLowerCase().includes(q) ||
      w.explanation.toLowerCase().includes(q)
    );
    const troubleMatch = guide.troubleshooting && guide.troubleshooting.some(t =>
      t.issue.toLowerCase().includes(q) ||
      t.solution.toLowerCase().includes(q)
    );
    return titleMatch || descMatch || targetMatch || platformMatch || workflowMatch || troubleMatch;
  });
}

if (typeof window !== 'undefined') {
  window.CYBER_GUIDES = CYBER_GUIDES;
  window.searchCyberGuides = searchCyberGuides;
}
