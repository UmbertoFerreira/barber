export function LogoEmblem({ size = 120, className = "", ...props }) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      className={className}
      data-testid="logo-emblem"
      {...props}
    >
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3C649" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8C7323" />
        </linearGradient>
        <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0392B" />
          <stop offset="100%" stopColor="#6E1D1E" />
        </linearGradient>
      </defs>

      {/* shield */}
      <path
        d="M100 8 L176 34 L176 110 C176 158 144 190 100 212 C56 190 24 158 24 110 L24 34 Z"
        fill="#0F2327"
        stroke="url(#goldGrad)"
        strokeWidth="5"
      />
      <path
        d="M100 18 L166 41 L166 108 C166 150 138 179 100 199 C62 179 34 150 34 108 L34 41 Z"
        fill="none"
        stroke="rgba(212,175,55,0.35)"
        strokeWidth="1.5"
      />

      {/* scissors (left) */}
      <g transform="translate(38,62) rotate(-18)" stroke="url(#goldGrad)" strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M14 6 L46 44" />
        <path d="M46 6 L14 44" />
        <circle cx="10" cy="50" r="7" />
        <circle cx="50" cy="50" r="7" />
      </g>

      {/* razor (right) */}
      <g transform="translate(120,60) rotate(20)">
        <rect x="0" y="0" width="14" height="34" rx="4" fill="#C8CDD2" stroke="url(#goldGrad)" strokeWidth="2" />
        <rect x="2" y="32" width="10" height="26" rx="4" fill="#7A4A21" stroke="url(#goldGrad)" strokeWidth="2" />
      </g>

      {/* barber pole */}
      <g>
        <rect x="86" y="30" width="28" height="58" rx="9" fill="#F4F1EA" stroke="url(#goldGrad)" strokeWidth="3" />
        <clipPath id="poleClip">
          <rect x="89" y="33" width="22" height="52" rx="7" />
        </clipPath>
        <g clipPath="url(#poleClip)">
          <path d="M84 40 L116 52 M84 52 L116 64 M84 64 L116 76 M84 76 L116 88 M84 28 L116 40" stroke="#9E2A2B" strokeWidth="7" />
          <path d="M84 46 L116 58 M84 70 L116 82 M84 34 L116 46" stroke="#0F2327" strokeWidth="3.5" />
        </g>
        <circle cx="100" cy="24" r="7" fill="url(#goldGrad)" />
        <rect x="88" y="88" width="24" height="7" rx="3" fill="url(#goldGrad)" />
      </g>

      {/* ANTONIO */}
      <text
        x="100"
        y="136"
        textAnchor="middle"
        fontFamily="'Cinzel Decorative', serif"
        fontWeight="900"
        fontSize="21"
        fill="url(#goldGrad)"
        letterSpacing="1"
      >
        ANTONIO
      </text>

      {/* ribbon */}
      <path d="M30 152 L170 152 L162 168 L170 184 L30 184 L38 168 Z" fill="url(#ribbonGrad)" stroke="url(#goldGrad)" strokeWidth="2.5" />
      <path d="M30 152 L12 146 L20 168 L12 190 L30 184 Z" fill="#6E1D1E" stroke="url(#goldGrad)" strokeWidth="2" />
      <path d="M170 152 L188 146 L180 168 L188 190 L170 184 Z" fill="#6E1D1E" stroke="url(#goldGrad)" strokeWidth="2" />
      <text
        x="100"
        y="175"
        textAnchor="middle"
        fontFamily="'Cinzel Decorative', serif"
        fontWeight="700"
        fontSize="17"
        fill="#F3C649"
        letterSpacing="6"
      >
        BARBER
      </text>
    </svg>
  );
}

export function LogoIcon({ size = 40, className = "", ...props }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      data-testid="logo-icon"
      {...props}
    >
      <rect width="64" height="64" rx="14" fill="#0F2327" stroke="#D4AF37" strokeWidth="2" />
      <rect x="24" y="12" width="16" height="36" rx="6" fill="#F4F1EA" stroke="#D4AF37" strokeWidth="2.5" />
      <path d="M25 18 L39 26 M25 26 L39 34 M25 34 L39 42" stroke="#9E2A2B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="9" r="4" fill="#D4AF37" />
      <rect x="22" y="48" width="20" height="5" rx="2.5" fill="#D4AF37" />
    </svg>
  );
}
