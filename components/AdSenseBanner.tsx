
import React, { useEffect } from 'react';

interface AdSenseBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  dataAdSlot,
  dataAdFormat = "auto",
  dataFullWidthResponsive = true,
  className = ""
}) => {
  useEffect(() => {
    try {
      // Bu, Google AdSense skriptini işə salır
      const pushAd = () => {
        try {
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
        } catch (e) {
          console.error("AdSense error:", e);
        }
      };
      
      // Bir az gecikmə ilə yükləyirik ki, səhifə tam hazır olsun
      const timer = setTimeout(pushAd, 1000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error("AdSense loading error:", e);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center items-center my-4 overflow-hidden min-h-[100px] bg-slate-900/30 border border-slate-700/30 rounded-lg ${className}`}>
      {/* 
         DİQQƏT: AdSense hesabınız təsdiqləndikdən sonra:
         1. data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" hissəsini öz ID-nizlə əvəz edin.
         2. data-ad-slot hissəsini AdSense panelindən aldığınız slot ID ilə əvəz edin.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // BURANI DƏYİŞİN
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
      />
      {/* Test zamanı görünməsi üçün müvəqqəti yazı (Production-da silinəcək) */}
      <div className="absolute text-slate-500 text-xs font-mono pointer-events-none">
        Google Ad Space
      </div>
    </div>
  );
};

export default AdSenseBanner;
