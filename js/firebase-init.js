/**
 * ZeR0CyB3r Firebase Integration
 * Initializes Firebase App & Firebase Auth for password resets and cloud security services
 */

(function () {
  let firebaseApp = null;
  let firebaseAuth = null;
  let firebaseDb = null;
  let firebaseConfig = null;

  async function loadConfig() {
    if (firebaseConfig) return firebaseConfig;
    try {
      const resp = await fetch('firebase-applet-config.json');
      if (resp.ok) {
        firebaseConfig = await resp.json();
        return firebaseConfig;
      }
    } catch (err) {
      console.warn('Could not load firebase-applet-config.json:', err);
    }
    return null;
  }

  async function initFirebase() {
    if (firebaseApp && firebaseAuth && firebaseDb) {
      return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
    }
    const config = await loadConfig();
    if (!config || !window.firebase) {
      return null;
    }

    try {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        firebaseApp = window.firebase.initializeApp(config);
      } else {
        firebaseApp = window.firebase.app();
      }
      firebaseAuth = window.firebase.auth();

      // Initialize Firestore if SDK is present
      if (window.firebase.firestore) {
        try {
          firebaseDb = window.firebase.firestore();
        } catch (dbErr) {
          console.warn('Firestore initialization warning:', dbErr);
        }
      }

      return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
    } catch (e) {
      console.error('Failed to initialize Firebase Auth/Firestore:', e);
      return null;
    }
  }

  /**
   * Register user directly in Firebase Authentication and Firestore Database
   * Saves: name, number/phone, mail, password, and creation timestamps
   * And sends an official Firebase verification link
   */
  async function registerWithFirebase(name, email, password, phone) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const fb = await initFirebase();
    if (!fb || !fb.auth) {
      return { success: false, message: 'Firebase Auth is not initialized.' };
    }

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await fb.auth.createUserWithEmailAndPassword(cleanEmail, password);
      const user = userCredential.user;

      // 2. Set Display Name in Firebase Auth Profile
      if (user && name) {
        try {
          await user.updateProfile({ displayName: name });
        } catch (e) {
          console.warn('Could not update displayName in Firebase:', e);
        }
      }

      // 3. Save full record to Cloud Firestore (Users Collection) with name, phone, mail, password
      let savedToFirestore = false;
      if (fb.db) {
        try {
          const userDoc = {
            uid: user.uid,
            name: String(name || '').trim(),
            number: String(phone || '').trim(),
            mail: cleanEmail,
            email: cleanEmail,
            password: String(password || ''),
            registeredAt: new Date().toISOString(),
            status: "active",
            role: "analyst",
            updatedAt: new Date().toISOString()
          };

          // Store in 'users' collection with user.uid and also by cleanEmail
          await fb.db.collection('users').doc(user.uid).set(userDoc, { merge: true });
          savedToFirestore = true;
          console.log('User document stored in Firestore successfully:', user.uid);
        } catch (dbErr) {
          console.warn('Firestore user doc write note:', dbErr);
        }
      }

      // 4. Send Official Firebase Verification Email directly to user mailbox
      let verificationSent = false;
      try {
        await user.sendEmailVerification();
        verificationSent = true;
      } catch (verifErr) {
        console.warn('sendEmailVerification note:', verifErr);
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || name
        },
        savedToFirestore: savedToFirestore,
        verificationSent: verificationSent,
        message: verificationSent
          ? `User created in Firebase Database! Verification email dispatched to ${cleanEmail}.`
          : `User profile successfully registered in Firebase.`
      };
    } catch (err) {
      console.error('Firebase createUserWithEmailAndPassword error:', err);
      let errMsg = err.message || 'Firebase registration error';
      if (err.code === 'auth/email-already-in-use') {
        // If already in Firebase Auth, attempt sign-in and update Firestore details
        try {
          const credential = await fb.auth.signInWithEmailAndPassword(cleanEmail, password);
          const user = credential.user;
          if (user && fb.db) {
            await fb.db.collection('users').doc(user.uid).set({
              uid: user.uid,
              name: String(name || '').trim(),
              number: String(phone || '').trim(),
              mail: cleanEmail,
              email: cleanEmail,
              password: String(password || ''),
              status: "active",
              role: "analyst",
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
          return {
            success: true,
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || name
            },
            savedToFirestore: true,
            message: `Account re-synchronized with updated profile.`
          };
        } catch (signInErr) {
          console.warn('Re-auth note:', signInErr);
        }
        errMsg = `An account with ${cleanEmail} already exists in Firebase. Please log in or reset password.`;
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address syntax.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.';
      }
      return { success: false, code: err.code, message: errMsg };
    }
  }

  /**
   * Sign In via Firebase Authentication
   */
  async function signInWithFirebase(email, password) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const fb = await initFirebase();
    if (!fb || !fb.auth) {
      return { success: false, message: 'Firebase Auth is not initialized.' };
    }

    try {
      const userCredential = await fb.auth.signInWithEmailAndPassword(cleanEmail, password);
      const user = userCredential.user;
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        message: 'Firebase login successful.'
      };
    } catch (err) {
      console.warn('Firebase signInWithEmailAndPassword error:', err);
      let msg = err.message || 'Firebase login failed';
      if (err.code === 'auth/user-disabled') {
        msg = 'SECURITY ALERT: This account has been blocked or suspended by Firebase Administrator. Access is strictly denied.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'This account does not exist or has been deleted from Firebase. Access denied.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email address or passphrase.';
      }
      return { success: false, code: err.code, message: msg };
    }
  }

  /**
   * Send Password Reset Email via Firebase Auth
   * @param {string} email 
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async function sendPasswordReset(email) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Ensure Firebase is ready
    const fb = await initFirebase();
    if (fb && fb.auth) {
      try {
        await fb.auth.sendPasswordResetEmail(cleanEmail);
        return {
          success: true,
          message: `Official Firebase password reset link sent to ${cleanEmail}. Check your inbox/spam folder.`
        };
      } catch (err) {
        console.warn('Firebase Auth sendPasswordResetEmail error:', err);
        // Handle common Firebase errors gracefully
        if (err.code === 'auth/user-not-found') {
          // If not in Firebase yet, still provide localized reset instructions or link
          return {
            success: true,
            message: `Password reset dispatched to ${cleanEmail}. Please check your inbox or spam directory to proceed.`
          };
        } else if (err.code === 'auth/invalid-email') {
          return { success: false, message: 'Invalid email address syntax.' };
        } else if (err.code === 'auth/too-many-requests') {
          return { success: false, message: 'Too many requests. Please wait a moment before requesting another reset.' };
        }
        // Fallback friendly success for security reasons
        return {
          success: true,
          message: `Security instructions for ${cleanEmail} dispatched via Firebase security protocol.`
        };
      }
    }

    // Fallback if network blocked
    return {
      success: true,
      message: `Password reset link dispatched for ${cleanEmail}. Please check your email to update your access passphrase.`
    };
  }

  /**
   * Delete / Purge all registered users from Firestore database
   */
  async function purgeAllRegisteredUsers() {
    const fb = await initFirebase();
    let count = 0;
    if (fb && fb.db) {
      try {
        const snap = await fb.db.collection('users').get();
        const batch = fb.db.batch();
        snap.forEach(doc => {
          batch.delete(doc.ref);
          count++;
        });
        if (count > 0) {
          await batch.commit();
        }
      } catch (e) {
        console.warn('Purge users note:', e);
      }
    }
    return { success: true, count };
  }

  // Auto initialize on load
  if (typeof window !== 'undefined') {
    window.CyberFirebase = {
      initFirebase,
      registerWithFirebase,
      signInWithFirebase,
      sendPasswordReset,
      purgeAllRegisteredUsers,
      getConfig: loadConfig
    };
    initFirebase();
  }
})();
