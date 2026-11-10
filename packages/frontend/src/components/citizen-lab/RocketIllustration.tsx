import "src/components/citizen-lab/styles.css";

export function RocketIllustration() {
  return (
    <svg className="citizen-rocket" viewBox="0 0 360 260" aria-hidden="true">
      <path d="M70 208c47-23 74-44 108-89m-75 116c33-14 55-32 84-68" className="rocket-stroke-accent" fill="none" strokeWidth="2" strokeDasharray="6 9" />
      <g transform="rotate(35 230 104)" className="rocket-stroke-accent" fill="none" strokeWidth="4">
        <path d="M230 28c40 39 48 94 31 145l-31 34-31-34c-17-51-9-106 31-145Z" className="rocket-fill-dark" />
        <path d="M230 28c18 23 27 50 30 78h-60c3-28 12-55 30-78Z" className="rocket-fill-accent" stroke="none" />
        <circle cx="230" cy="130" r="19" className="rocket-fill-dark" />
        <circle cx="230" cy="130" r="8" className="rocket-fill-light" stroke="none" />
        <path d="m199 168-27 31 32-5m57-26 27 31-32-5" className="rocket-fill-dark" />
        <path d="m216 205-8 29 20-17 8 26 12-39" className="rocket-fill-yellow rocket-stroke-yellow" />
      </g>
      <path d="M318 54h20m-10-10v20M45 95h16m-8-8v16" className="rocket-stroke-lavender" strokeWidth="2" />
      <circle cx="99" cy="62" r="4" className="rocket-fill-pink" />
    </svg>
  );
}
