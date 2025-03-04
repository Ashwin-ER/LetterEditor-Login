import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9cq8Ggd276w519uaKwNNqIR9wHJw_wc8",
  authDomain: "login-52dad.firebaseapp.com",
  projectId: "login-52dad",
  storageBucket: "login-52dad.firebasestorage.app",
  messagingSenderId: "884583274312",
  appId: "1:884583274312:web:e9c9507f70c951f78a457d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "en";

const provider = new GoogleAuthProvider();

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", function () {
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log(user);
      
      // Create user object and store in localStorage
      const userData = {
        name: user.displayName || user.email.split('@')[0],
        email: user.email
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Show the editor section
      window.showEditor();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Login error:', errorMessage);
    });
});
