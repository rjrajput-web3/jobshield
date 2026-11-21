export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="JobShield logo"
      className="shrink-0"
    >
      <path
        d="M32 3 9 11v17c0 15.2 9.7 26.9 23 33 13.3-6.1 23-17.8 23-33V11L32 3z"
        fill="#0b6355"
      />
      <path
        d="M32 7.5 13.5 14.2V28c0 12.7 7.9 22.7 18.5 28 10.6-5.3 18.5-15.3 18.5-28V14.2L32 7.5z"
        fill="#0d7a68"
      />
      <path
        d="m23.5 32.5 6 6L41 26.8"
        stroke="#fff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
