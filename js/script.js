/* Shared UI behaviour. Every feature is guarded so this file works on every page. */
const header = document.querySelector("header");
const navLinks = document.querySelector(".nav-links");
const hamburger = document.querySelector(".hamburger");
const contactForm = document.getElementById("contact-form");

window.addEventListener("scroll", () => header?.classList.toggle("header-scroll", window.scrollY > 50));

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active");
    hamburger.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  });
  navLinks.querySelectorAll("li").forEach((item) => item.addEventListener("click", () => {
    navLinks.classList.remove("nav-active");
    hamburger.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }));
}

const themeToggle = document.querySelector(".theme-toggle");
const moonIcon = document.querySelector(".fa-moon");
const sunIcon = document.querySelector(".fa-sun");
function applyTheme(theme) {
  const light = theme === "light";
  document.body.classList.toggle("light-theme", light);
  if (moonIcon) moonIcon.style.display = light ? "none" : "block";
  if (sunIcon) sunIcon.style.display = light ? "block" : "none";
}
if (themeToggle) {
  applyTheme(localStorage.getItem("theme") || "dark");
  themeToggle.addEventListener("click", () => {
    const theme = document.body.classList.contains("light-theme") ? "dark" : "light";
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("section-animate");
  }), { threshold: 0.15 });
  document.querySelectorAll("section").forEach((section) => observer.observe(section));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.addEventListener("click", function (event) {
  const target = document.querySelector(this.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
}));

const binaryElement = document.querySelector(".binary");
if (binaryElement) {
  const binary = binaryElement.textContent;
  binaryElement.textContent = "";
  let index = 0;
  const typeBinary = () => {
    if (index < binary.length) {
      binaryElement.textContent += binary[index++];
      window.setTimeout(typeBinary, 40);
    }
  };
  window.setTimeout(typeBinary, 800);
}

if (contactForm) contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = document.getElementById("name")?.value.trim() || "there";
  contactForm.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i><p>Thank you <strong></strong>, your message has been received.</p></div>`;
  contactForm.querySelector("strong").textContent = name;
});

const popup = document.getElementById("certificatePopup");
const popupImage = document.getElementById("popupImage");
if (popup && popupImage) {
  document.querySelectorAll(".certification-card").forEach((card) => card.addEventListener("click", () => {
    const image = card.querySelector(".certificate-preview img");
    if (!image) return;
    popupImage.src = image.src;
    popupImage.alt = image.alt;
    popup.hidden = false;
  }));
  popup.addEventListener("click", () => { popup.hidden = true; });
}

const loginModal = document.getElementById("loginModal");
function openLogin() { if (loginModal) loginModal.style.display = "flex"; }
function closeLogin() { if (loginModal) loginModal.style.display = "none"; }
function sendOTP() { alert("OTP login is not enabled. Please use the Login page."); }
function verifyOTP() { alert("OTP login is not enabled. Please use the Login page."); }
Object.assign(window, { openLogin, closeLogin, sendOTP, verifyOTP });
