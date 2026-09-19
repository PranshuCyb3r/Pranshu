/* Authentication helpers shared by the login, registration and private pages. */
(function () {
  function setMessage(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? "#ff4d4d" : "#3cf5ff";
  }

  async function loginUser() {
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;
    const message = document.getElementById("loginMsg");
    if (!email || !password) {
      setMessage(message, "Please enter your email and password.", true);
      return;
    }
    setMessage(message, "Logging in…", false);
    const { error } = await window.supabase.auth.signInWithPassword({ email, password });
    if (error) return setMessage(message, error.message, true);
    window.location.assign("pre-page.html");
  }

  async function registerUser() {
    const name = document.getElementById("regName")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const password = document.getElementById("regPassword")?.value;
    const confirm = document.getElementById("regConfirm")?.value;
    const message = document.getElementById("msg");
    if (!name || !email || !password || !confirm) return setMessage(message, "All fields are required.", true);
    if (password.length < 6) return setMessage(message, "Password must be at least 6 characters.", true);
    if (password !== confirm) return setMessage(message, "Passwords do not match.", true);

    setMessage(message, "Creating account…", false);
    const { data, error } = await window.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "login.html")}`
      }
    });
    if (error) return setMessage(message, error.message, true);
    setMessage(message, data.session ? "Account created. Redirecting…" : "Verification email sent. Please check your inbox.", false);
    if (data.session) window.location.assign("pre-page.html");
  }

  async function protectPage() {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) window.location.replace("login.html");
  }

  async function logout() {
    await window.supabase.auth.signOut();
    window.location.assign("index.html");
  }

  window.loginUser = loginUser;
  window.registerUser = registerUser;
  window.protectPage = protectPage;
  window.logout = logout;
})();
