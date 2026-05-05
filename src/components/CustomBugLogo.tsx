import { useEffect, useRef } from 'react';

export function CustomBugLogo({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const legs = svg.querySelectorAll('.bug-leg');
    const antennae = svg.querySelectorAll('.bug-antenna');
    const bodyParts = svg.querySelectorAll('.bug-body-group');
    let animFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.06;

      // Animate legs (more dynamic movement)
      legs.forEach((leg, i) => {
        const el = leg as SVGGElement;
        const direction = i % 2 === 0 ? 1 : -1;
        const phase = Math.sin(time * 3 + i * 0.7);
        const swing = phase * 5 * direction;
        const lift = Math.abs(phase) * 2; // Add subtle lift effect
        el.style.transform = `rotate(${swing}deg) translateY(${-lift}px)`;
        el.style.transformOrigin = 'center';
      });

      // Animate antennae (waving motion)
      antennae.forEach((ant, i) => {
        const el = ant as SVGGElement;
        const direction = i % 2 === 0 ? 1 : -1;
        const wave = Math.sin(time * 4 + i * Math.PI) * 4 * direction;
        el.style.transform = `rotate(${wave}deg)`;
        el.style.transformOrigin = 'center bottom';
      });

      // Pulse animation for body parts
      bodyParts.forEach((part, i) => {
        const el = part as SVGGElement;
        const pulse = 1 + Math.sin(time * 2 + i * 0.5) * 0.03; // 3% size variation
        el.style.transform = `scale(${pulse})`;
        el.style.transformOrigin = 'center';
      });

      animFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Enhanced body gradient with depth */}
        <radialGradient id="bugBody" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="50%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </radialGradient>
        
        {/* Head gradient */}
        <radialGradient id="bugHead" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </radialGradient>
        
        {/* Intense eye gradient */}
        <radialGradient id="bugEye" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff3333" />
          <stop offset="50%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#880000" />
        </radialGradient>
        
        {/* Glow filter for the bug */}
        <filter id="bugGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#ff4444" floodOpacity="0.5" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Strong glow for eyes */}
        <filter id="eyeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feFlood floodColor="#ff0000" floodOpacity="0.8" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Ambient glow for entire bug */}
        <filter id="ambientGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feFlood floodColor="#666666" floodOpacity="0.3" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Group wrapper with ambient glow */}
      <g filter="url(#ambientGlow)">
        {/* Left Legs (3 legs with joints) */}
        <g className="bug-leg" style={{ transformOrigin: '32px 32px' }}>
          {/* Upper left leg */}
          <path d="M14 18 L8 10" stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="8" cy="10" r="1.5" fill="#888" />
          
          {/* Middle left leg */}
          <path d="M12 32 L3 32" stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="3" cy="32" r="1.5" fill="#888" />
          
          {/* Lower left leg */}
          <path d="M14 46 L8 54" stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="8" cy="54" r="1.5" fill="#888" />
        </g>
        
        {/* Right Legs (3 legs with joints) */}
        <g className="bug-leg" style={{ transformOrigin: '32px 32px' }}>
          {/* Upper right leg */}
          <path d="M50 18 L56 10" stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="56" cy="10" r="1.5" fill="#888" />
          
          {/* Middle right leg */}
          <path d="M52 32 L61 32" stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="61" cy="32" r="1.5" fill="#888" />
          
          {/* Lower right leg */}
          <path d="M50 46 L56 54" stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="56" cy="54" r="1.5" fill="#888" />
        </g>
        
        {/* Body with pulse animation */}
        <g className="bug-body-group">
          {/* Main body */}
          <ellipse cx="32" cy="34" rx="18" ry="16" fill="url(#bugBody)" />
          
          {/* Body segments/details */}
          <path d="M20 34 Q32 28 44 34" stroke="#4a4a4a" strokeWidth="1" fill="none" />
          <path d="M18 38 Q32 32 46 38" stroke="#4a4a4a" strokeWidth="1" fill="none" />
          <path d="M20 42 Q32 36 44 42" stroke="#4a4a4a" strokeWidth="1" fill="none" />
          
          {/* Body highlight */}
          <ellipse cx="28" cy="30" rx="6" ry="4" fill="rgba(255,255,255,0.1)" />
        </g>
        
        {/* Head with pulse animation */}
        <g className="bug-body-group">
          <ellipse cx="32" cy="16" rx="11" ry="9" fill="url(#bugHead)" />
          
          {/* Head highlight */}
          <ellipse cx="29" cy="13" rx="4" ry="3" fill="rgba(255,255,255,0.1)" />
        </g>
        
        {/* Eyes with glow */}
        <g filter="url(#eyeGlow)">
          {/* Left eye */}
          <circle cx="27" cy="14" r="4" fill="url(#bugEye)" />
          <circle cx="26" cy="13" r="1.5" fill="rgba(255,255,255,0.8)" />
          <circle cx="28" cy="15" r="0.8" fill="rgba(255,255,255,0.4)" />
          
          {/* Right eye */}
          <circle cx="37" cy="14" r="4" fill="url(#bugEye)" />
          <circle cx="36" cy="13" r="1.5" fill="rgba(255,255,255,0.8)" />
          <circle cx="38" cy="15" r="0.8" fill="rgba(255,255,255,0.4)" />
        </g>
        
        {/* Animated Antennae */}
        <g className="bug-antenna" style={{ transformOrigin: '27px 8px' }}>
          <path d="M27 8 L23 2" stroke="#777" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="23" cy="2" r="2.5" fill="#888" />
          <circle cx="22.5" cy="1.5" r="1" fill="rgba(255,255,255,0.2)" />
        </g>
        <g className="bug-antenna" style={{ transformOrigin: '37px 8px' }}>
          <path d="M37 8 L41 2" stroke="#777" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="41" cy="2" r="2.5" fill="#888" />
          <circle cx="40.5" cy="1.5" r="1" fill="rgba(255,255,255,0.2)" />
        </g>
        
        {/* Mouth */}
        <path d="M28 22 Q32 26 36 22" stroke="#444" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Mandibles */}
        <path d="M28 22 L26 24" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M36 22 L38 24" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
