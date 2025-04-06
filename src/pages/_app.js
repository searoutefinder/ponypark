import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; // Import styles
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const router = useRouter();

  NProgress.configure({ showSpinner: false });

  useEffect(() => {
    const handleTouchMove = (e) => {
      const isPinchZoom = e.touches.length > 1;
      const mapElement = document.getElementById('map');

      if (isPinchZoom && mapElement && !mapElement.contains(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
      setIsPageTransitioning(true);
    }
    const handleStop = () => {
      NProgress.done();
      setIsPageTransitioning(false);
    }

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  return <div className={`${isPageTransitioning ? 'fade-exit' : 'fade-enter'} transition-opacity duration-500`}>   
    <Component {...pageProps} />
  </div>
}

export default MyApp;
