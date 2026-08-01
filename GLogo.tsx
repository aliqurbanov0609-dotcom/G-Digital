interface Props { size?: number }
export function GLogo({ size = 96 }: Props) {
  return (
    <div
      className="relative flex items-center justify-center rounded-[28%] neu-surface neon-blue"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62} fill="none">
        <defs>
          <linearGradient id="gd-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="55%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path
          d="M40 12 C24 12, 14 22, 14 34 C14 46, 24 54, 36 54 C46 54, 52 48, 52 40 L52 32 L34 32 L34 38 L44 38 C44 43, 40 46, 34 46 C26 46, 22 40, 22 33 C22 26, 27 20, 36 20 C41 20, 44 22, 47 25 L52 20 C48 15, 44 12, 40 12 Z"
          fill="url(#gd-g)"
          stroke="rgba(147,197,253,0.8)"
          strokeWidth="0.5"
          style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.8))" }}
        />
      </svg>
    </div>
  );
}