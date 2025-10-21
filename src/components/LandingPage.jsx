import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  // 5 logos array
  const logos = [
    { id: 1, name: "CSE", image: "/logos/venum.jpeg" },
    { id: 2, name: "Logo 2", image: "/logos/everlast.jpeg" },
    { id: 4, name: "Logo 4", image: "/logos/twins.jpeg" },
    { id: 3, name: "Logo 3", image: "/logos/hayabusa.jpeg" },
    { id: 5, name: "Logo 5", image: "/logos/wesing.jpeg" },
    
  ];

  const totalDuration = 6000; // 10 seconds total
  const perLogoDuration = totalDuration / logos.length; // 2 second per logo

  const [progress, setProgress] = useState(0);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  useEffect(() => {
    // progress updater
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (totalDuration / 50));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);

    // logo change every 1 second
    const logoTimer = setInterval(() => {
      setCurrentLogoIndex((prev) => {
        if (prev === logos.length - 1) {
          clearInterval(logoTimer);
          clearInterval(progressTimer);
          navigate("/home");
          return prev;
        }
        return prev + 1;
      });
    }, perLogoDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(logoTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
      <div className="text-center w-full max-w-6xl">
        {/* Logo container */}
        <div className="relative w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] mb-8 mx-auto overflow-hidden">
          <img
            key={currentLogoIndex} // important to re-trigger animation
            src={logos[currentLogoIndex].image}
            alt={logos[currentLogoIndex].name}
            className="w-full h-full object-contain logo-spin-right logo-glow"
            style={{
              mixBlendMode: "screen",
              background: "transparent",
            }}
          />
        </div>

        {/* Circular Progress */}
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgb(55, 65, 81)"
                strokeWidth="8"
                fill="transparent"
                className="opacity-30"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="white"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-100 ease-linear drop-shadow-lg"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <div className="text-gray-300 text-sm font-medium">Loading...</div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
