'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Gürültü efekti için JavaScript kodu
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const height = canvas.height = 256;
    const width = canvas.width = height;

    function noise() {
      requestAnimationFrame(noise);
      if (!context) return;
      const idata = context.getImageData(0, 0, width, height);
      for (let i = 0; i < idata.data.length; i += 4) {
        idata.data[i] = idata.data[i + 1] = idata.data[i + 2] = Math.floor(Math.random() * 255);
        idata.data[i + 3] = 255;
      }
      context.putImageData(idata, 0, 0);
    }

    noise();
  }, []);

  useEffect(() => {
    // Geri sayım ve otomatik yönlendirme
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.back();
    }
  }, [countdown, router]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');

        .font-oswald {
          font-family: 'Oswald', sans-serif;
        }

        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        @keyframes scanline {
          0% { top: -5px; }
          100% { top: 100%; }
        }

        @keyframes funnytext {
          0% {
            color: rgba(0, 0, 0, 0.3);
            filter: blur(3px);
          }
          30% {
            color: rgba(0, 0, 0, 0.5);
            filter: blur(1px);
          }
          65% {
            color: rgba(0, 0, 0, 0.2);
            filter: blur(5px);
          }
          100% {
            color: rgba(0, 0, 0, 0.3);
            filter: blur(3px);
          }
        }

        .animate-scanline {
          animation: scanline 8s linear infinite;
        }

        .animate-funnytext {
          animation: funnytext 4s ease-in-out infinite;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Gürültü efekti için canvas */}
      <canvas id="canvas" className="hidden" />

      {/* Arka plan gürültü efekti */}
      <div className="fixed inset-0 bg-noise opacity-30" />

      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-radial-to-b from-transparent to-black" />

      {/* Tarama çizgileri */}
      <div className="fixed inset-0 animate-scanline bg-linear-to-b from-transparent via-black/50 to-transparent h-1 opacity-30" />
      <div className="fixed inset-0 animate-scanline bg-linear-to-b from-transparent via-black/50 to-transparent h-1 opacity-30 animation-delay-4000" />

      {/* Ana içerik */}
      <div className="flex flex-col items-center justify-center h-screen relative z-10">
        <h1 className="text-[16rem] text-white font-oswald drop-shadow-2xl brightness-125">404</h1>
        <p className="text-6xl text-white font-oswald font-bold drop-shadow-lg brightness-125">Sayfa Bulunamadı!!</p>
        <p className="text-2xl text-white/80 font-oswald mt-8 drop-shadow-md">
          {countdown} saniye sonra önceki sayfaya yönlendirileceksiniz...
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-oswald border border-white/30 rounded-lg transition-all duration-300 drop-shadow-lg"
        >
          Hemen Geri Dön
        </button>
      </div>
    </>
  );
}