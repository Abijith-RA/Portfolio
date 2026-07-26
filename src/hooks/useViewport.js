import { useState, useEffect } from 'react';

/**
 * Custom hook to dynamically monitor window viewport dimensions
 * and detect device category without manual page breakpoint tweaking.
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isLaptop: false,
    isDesktop: false,
    deviceType: 'Desktop'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isLaptop = width >= 1024 && width < 1440;
      const isDesktop = width >= 1440;

      let deviceType = 'Desktop';
      if (isMobile) deviceType = 'Mobile';
      else if (isTablet) deviceType = 'Tablet';
      else if (isLaptop) deviceType = 'Laptop';

      setViewport({
        width,
        height,
        isMobile,
        isTablet,
        isLaptop,
        isDesktop,
        deviceType
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
