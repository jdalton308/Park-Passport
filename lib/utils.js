export function formatAuthError(error) {
  const code = error?.code || "";

  const messages = {
    "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked": "Pop-up was blocked. Allow pop-ups for this site and try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email using a different sign-in method.",
    "auth/operation-not-allowed":
      "Google sign-in is not enabled. Enable it in the Firebase Console under Authentication.",
    "auth/unauthorized-domain":
      "This site is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };

  return messages[code] || error?.message || "Something went wrong. Please try again.";
}
