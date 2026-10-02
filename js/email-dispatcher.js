/**
 * ZeR0CyB3r Multi-Provider Real Mail Dispatcher
 * Integrates EmailJS to send actual 6-digit OTP codes directly to user's real email inbox
 */

(function () {
  const EMAILJS_CONFIG_KEY = 'cyber_emailjs_config';

  // Live production credentials provided by user
  const DEFAULT_CONFIG = {
    serviceId: 'service_prdo4ab',
    templateId: 'template_d8rr5kl',
    publicKey: 'GgypAMFsvZCFYmRv1',
    enabled: true
  };

  function getDispatcherConfig() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(EMAILJS_CONFIG_KEY));
    } catch (e) {}

    if (saved && saved.publicKey) {
      return saved;
    }
    return DEFAULT_CONFIG;
  }

  function setDispatcherConfig(cfg) {
    try {
      localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {}
  }

  /**
   * Dispatch Real OTP via EmailJS SDK directly to the user's Gmail/Mailbox
   */
  async function sendOtpEmail(toEmail, toName, otpCode) {
    const config = getDispatcherConfig();
    const cleanMail = String(toEmail || '').trim().toLowerCase();
    const cleanName = String(toName || 'User').trim();

    console.log(`[CyberMail Dispatcher] Sending real OTP email to: ${cleanMail}`);

    if (window.emailjs && config && config.publicKey) {
      try {
        window.emailjs.init(config.publicKey);

        // Standard EmailJS template parameter aliases for One-Time Password template
        const templateParams = {
          to_email: cleanMail,
          to_name: cleanName,
          email: cleanMail,
          user_email: cleanMail,
          otp_code: otpCode,
          passcode: otpCode,
          otp: otpCode,
          code: otpCode,
          app_name: 'ZeR0CyB3r Security',
          company_name: 'ZeR0CyB3r Security',
          timestamp: new Date().toLocaleString()
        };

        const response = await window.emailjs.send(config.serviceId, config.templateId, templateParams);
        console.log('[CyberMail Dispatcher] Real OTP Email Dispatched Successfully!', response.status, response.text);
        return {
          success: true,
          provider: 'EmailJS',
          status: response.status,
          message: `Official OTP has been dispatched to ${cleanMail} inbox.`
        };
      } catch (err) {
        console.error('[CyberMail Dispatcher] EmailJS Delivery Error:', err);
        return {
          success: false,
          error: err,
          message: err && err.text ? err.text : 'Failed to send OTP via EmailJS'
        };
      }
    }

    return {
      success: false,
      message: 'EmailJS SDK not ready'
    };
  }

  window.CyberEmailDispatcher = {
    sendOtpEmail,
    getDispatcherConfig,
    setDispatcherConfig
  };
})();
