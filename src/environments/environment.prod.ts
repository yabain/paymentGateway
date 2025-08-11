export const environment = {
  production: true,
  plateforme: 'web', // web if it is for web build and mobil if it is for iOs/Android build
  appVersion: '1.2.0', // Need specification version if it is for mobile build

  // Credentials for google agenda API
  CLIENT_ID: '663038665050-d2o8fimi64535rv31eqtovsbgn7ppej2.apps.googleusercontent.com',
  API_KEY: 'AIzaSyDK2TEGhQV8FJoZq5E520KOV94tzI1Jrg0',
  CLIENT_ID_MOBILE: '663038665050-adeqbfi3nesb3itj75ancckh6qj2j470.apps.googleusercontent.com',

  // url for backend
  backendUrl: 'https://digikuntz.com',  // For Production
  
  ENCRYPTION_KEY: '1KSLDKHFSHLKHLKQB8CIZY8Z9D70CC68Z612GHG923G2904240HKH42086763071535021', // Key for encrypt data

  introKey: 'intro-slides',
    
  // Variables to use to set datas in local storage
  user_key: 'dk_user_id',
  user_data: 'dk_user_data',
  countries_data: 'yabi_countries_data',
  cities_data: 'yabi_cities_data',
  categories_data: 'yabi_categories_data',
  memory_link: 'memory-link',
  
  // Keys for send mails via MailJs
  MailJS_publicKey: "HIRE5gd6zUa9hZqL9",
  MailJS_serviceId: "service_evssap9",
  MailJS_templateId: "template_kqm5g9p",

  // Url for download app
  downloadAppUrl: 'https://digikuntz.com/app',

};
