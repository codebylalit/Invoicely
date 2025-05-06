// src/components/AdSenseAd.js
import { useEffect } from 'react';

const AdSenseAd = ({ adSlot }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('Adsense error', e);
        }
    }, []);

    return (
        <ins className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client="ca-pub-2484863449091466"
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
    );
};

export default AdSenseAd;
