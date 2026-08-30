export function AdaptationArt() {
  return (
    <g>
      <circle cx="160" cy="105" r="67" fill="var(--feature-art-surface)" stroke="var(--feature-art-stroke)" strokeWidth="2" />
      <circle cx="160" cy="105" r="44" stroke="var(--feature-art-stroke-soft)" strokeWidth="2" />
      <circle cx="160" cy="105" r="21" fill="var(--feature-art-surface-raised)" stroke="var(--feature-art-line)" strokeWidth="2" />
      <circle cx="160" cy="105" r="6" fill="var(--feature-art-line-bright)" />
      <path d="M160 27V48M160 162V183M82 105H103M217 105H238" stroke="var(--feature-art-line)" strokeWidth="3" strokeLinecap="round" />
      <path d="M217 131L245 157L231 161L225 176L201 145Z" fill="var(--feature-art-line)" stroke="var(--feature-art-line-bright)" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
}

export function LetterArt() {
  return (
    <g>
      <rect x="82" y="52" width="156" height="112" rx="17" fill="var(--feature-art-surface)" stroke="var(--feature-art-stroke)" strokeWidth="2" />
      <path d="M83 68L160 122L237 68" stroke="var(--feature-art-line)" strokeWidth="3" />
      <path d="M83 151L137 106M237 151L183 106" stroke="var(--feature-art-stroke-soft)" strokeWidth="2" />
      <path d="M118 78H174" stroke="var(--feature-art-line)" strokeWidth="8" strokeLinecap="round" />
      <path d="M118 96H156" stroke="var(--feature-art-line-muted)" strokeWidth="7" strokeLinecap="round" />
      <path d="M237 42V56M230 49H244" stroke="var(--feature-art-line-bright)" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}
