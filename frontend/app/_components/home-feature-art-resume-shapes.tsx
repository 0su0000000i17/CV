export function AnalysisArt() {
  return (
    <g>
      <rect x="103" y="33" width="114" height="142" rx="18" fill="var(--feature-art-surface)" stroke="var(--feature-art-stroke)" strokeWidth="2" />
      <path d="M127 70H193" stroke="var(--feature-art-line)" strokeWidth="8" strokeLinecap="round" />
      <path d="M127 96H181" stroke="var(--feature-art-line-muted)" strokeWidth="7" strokeLinecap="round" />
      <path d="M127 118H169" stroke="var(--feature-art-line-muted)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="205" cy="150" r="25" fill="var(--feature-art-surface-raised)" stroke="var(--feature-art-line)" strokeWidth="2" />
      <path d="M193 150L202 159L218 140" stroke="var(--feature-art-line-bright)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function ImprovementArt() {
  return (
    <g>
      <rect x="91" y="55" width="103" height="121" rx="16" fill="var(--feature-art-surface)" stroke="var(--feature-art-stroke)" strokeWidth="2" transform="rotate(-6 91 55)" />
      <rect x="129" y="37" width="105" height="126" rx="16" fill="var(--feature-art-surface-raised)" stroke="var(--feature-art-stroke-soft)" strokeWidth="2" transform="rotate(5 129 37)" />
      <path d="M154 76L207 81" stroke="var(--feature-art-line)" strokeWidth="8" strokeLinecap="round" />
      <path d="M151 101L198 105" stroke="var(--feature-art-line)" strokeWidth="7" strokeLinecap="round" />
      <path d="M147 125L184 128" stroke="var(--feature-art-line-muted)" strokeWidth="7" strokeLinecap="round" />
      <path d="M92 128C112 108 128 104 148 112M137 100L149 112L135 121" stroke="var(--feature-art-line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
