App.accessRule("*");

App.info({
  name: 'LineApp',
  description: 'LineApp description',
  version: '1.0.0'
});

App.icons({
  'android_ldpi': 'public/mdpi_ic_launcher.png',
  'android_mdpi': 'public/mdpi_ic_launcher.png',
  'android_hdpi': 'public/hdpi_ic_launcher.png',
  'android_xhdpi': 'public/xhdpi_ic_launcher.png'
});

App.launchScreens({
  'android_ldpi_portrait': 'public/splash/splash1.png',
  'android_ldpi_landscape': 'public/splash/splash1land.png',
  'android_mdpi_portrait': 'public/splash/splash2.png',
  'android_mdpi_landscape': 'public/splash/splash2land.png',
  'android_hdpi_portrait': 'public/splash/splash3.png',
  'android_hdpi_landscape': 'public/splash/splash3land.png',
  'android_xhdpi_portrait': 'public/splash/splash4.png',
  'android_xhdpi_landscape': 'public/splash/splash4land.png'
});