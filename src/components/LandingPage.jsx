import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const logo = {
    id: 1,
    name: "CSE",
    image: "/logos/final.png"
  };

  const totalDuration = 5000; // 5 seconds in milliseconds
  const updateInterval = 50; // Update every 50ms for smooth progress

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (updateInterval / totalDuration) * 100;
        
        if (newProgress >= 100) {
          clearInterval(progressTimer);
          console.log("Redirecting to login...");
          navigate("/login");
          return 100;
        }
        
        return newProgress;
      });
    }, updateInterval);

    return () => {
      clearInterval(progressTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
      <div className="text-center w-full max-w-6xl">
        {/* Logo container - 50% of viewport */}
        <div className="relative w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] mb-8 mx-auto overflow-hidden">
          <img
            src={logo.image}
            alt={logo.name}
            className="w-full h-full object-contain logo-spin-right logo-glow"
            style={{
              mixBlendMode: 'screen',
              background: 'transparent'
            }}
          />
        </div>

        {/* Circular Progress bar */}
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            {/* Background circle */}
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
              {/* Progress circle */}
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
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          
          {/* Progress text */}
          <div className="text-gray-300 text-sm font-medium">
            Loading...
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;