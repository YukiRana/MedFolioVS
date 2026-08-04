// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyA93mpbnaQ0_HEqSNL-wGSfhlysISjFL-w",
    authDomain: "medfolio-42196.firebaseapp.com",
    projectId: "medfolio-42196",
    storageBucket: "medfolio-42196.firebasestorage.app",
    messagingSenderId: "487846908340",
    appId: "1:487846908340:web:f5772615889ad79ecca2e1",
    measurementId: "G-0JZTRL9B4B"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);