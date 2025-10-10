export const environment = {
  production: false,
  plateforme: 'mobile', // web if it is for web build and mobile if it is for iOs/Android build
  appVersion: '1.2.0', // Need specification version if it is for build

  // Credentials for google agenda API for Web
  CLIENT_ID: '663038665050-d2o8fimi64535rv31eqtovsbgn7ppej2.apps.googleusercontent.com',
  API_KEY: 'AIzaSyDK2TEGhQV8FJoZq5E520KOV94tzI1Jrg0',
  // Credentials for google agenda API for Mobile
  CLIENT_ID_MOBILE: '663038665050-adeqbfi3nesb3itj75ancckh6qj2j470.apps.googleusercontent.com',

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: 'AIzaSyDK2TEGhQV8FJoZq5E520KOV94tzI1Jrg0',

  backendUrl: 'https://app.digikuntz.com',  // For Production
  // backendUrl: 'http://54.36.120.149:3002', // For dev
  // backendUrl: 'http://localhost:3002', // For dev
  
  frontUrl: 'https://payments.digikuntz.com',
  // frontUrl: 'https://localhost:4200',

  ENCRYPTION_KEY: '1KSLDKHFSHLKHLKQB8CIZY8Z9D70CC68Z612GHG923G2904240HKH42086763071535021', // Key for encrypt data
  
  introKey: 'intro-slides',

  // Variables to use to set datas in local storage
  user_key: 'dk_user_id',
  user_data: 'dk_user_data',
  countries_data: 'dk_countries_data',
  cities_data: 'dk_cities_data',
  categories_data: 'dk_categories_data',
  memory_link: 'memory-link',

  // Url for download application
  downloadAppUrl: 'https://digikuntz.com/app',

  // Keys for send mails via MailJs
  MailJS_publicKey: "HIRE5gd6zUa9hZqL9",
  MailJS_serviceId: "service_evssap9",
  MailJS_templateId: "template_kqm5g9p",
  
  
  firebase: {
        apiKey: "AIzaSyDMPae-T-eoij5VGhrXfK40KsCF2IWcdfE",
        authDomain: "paymentgateway-a84a1.firebaseapp.com",
        projectId: "paymentgateway-a84a1",
        storageBucket: "paymentgateway-a84a1.firebasestorage.app",
        messagingSenderId: "1064984663961",
        appId: "1:1064984663961:web:44ed1eb8eb59de4da56508",
        measurementId: "G-JLMGDDSEJK"

    },

    apiUrl: 'https://ynkap-api.payments.digikuntz.com',
};