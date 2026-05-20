import React from 'react';

export default function LoadingScreen({ fullScreen = true }) {
  const spokes = Array.from({ length: 12 });

  return (
    <div 
      className="flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300"
      style={{
        minHeight: fullScreen ? '100vh' : '50vh',
        width: '100%',
        fontFamily: "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <style>{`
        @keyframes ios-spinner-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>

      {/* Sky Blue iOS Activity Indicator Spinner */}
      <svg 
        viewBox="0 0 100 100" 
        style={{ 
          width: 46, 
          height: 46, 
          color: '#0ea5e9', // Sky Blue
          marginBottom: 16
        }}
      >
        {spokes.map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="18"
            x2="50"
            y2="32"
            stroke="currentColor"
            strokeWidth="7.5"
            strokeLinecap="round"
            transform={`rotate(${i * 30} 50 50)`}
            style={{
              animation: 'ios-spinner-fade 1.2s linear infinite',
              animationDelay: `${-1.2 + (i * 0.1)}s`
            }}
          />
        ))}
      </svg>

      {/* Clean Lowercase Muted Text Label */}
      <span 
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'hsl(var(--muted-foreground))',
          letterSpacing: '-0.01em',
          opacity: 0.8
        }}
      >
        loading...
      </span>
    </div>
  );
}
