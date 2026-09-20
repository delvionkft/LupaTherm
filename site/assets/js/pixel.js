/* Meta Pixel — azonos eredetű külső fájl, hogy a szigorú CSP (nincs
   'unsafe-inline') mellett is fusson. A logika a hivatalos Meta Pixel
   kóddal azonos; azonnal, minden oldalbetöltéskor inicializál. */
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '962398476156311');
fbq('track', 'PageView');
