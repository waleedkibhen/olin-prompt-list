import React, { useEffect } from 'react';

export const AdsterraSocialBar: React.FC = () => {
  useEffect(() => {
    // Check if the script already exists to avoid duplicates during hot-reloads or re-renders
    if (document.querySelector('script[src*="profitableratecpmnetwork.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl30941412.profitableratecpmnetwork.com/2d/35/e0/2d35e05573e49e7643e5405557ae36fa.js';
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render any visible UI directly, the script injects the ad
};
