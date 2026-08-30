'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const rawMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
const metrikaId = /^\d{1,12}$/u.test(rawMetrikaId ?? '') ? rawMetrikaId : null;
const publicAnalyticsPaths = new Set([
  '/',
  '/about',
  '/how-it-works',
  '/offer',
  '/privacy',
  '/terms',
]);

export function SiteAnalytics() {
  const pathname = usePathname();
  if (!metrikaId || !publicAnalyticsPaths.has(pathname)) return null;

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
        ym(${JSON.stringify(metrikaId)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});
      `}
    </Script>
  );
}
