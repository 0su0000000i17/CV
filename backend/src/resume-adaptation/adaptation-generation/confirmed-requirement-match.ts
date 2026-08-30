function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-zа-яё0-9]+/giu)
    .filter((token) => token.length > 2);
}

/**
 * Shared token-overlap check: does `requirementLike` (a vacancy gap, a
 * notAdded entry, ...) refer to the same thing as one of the candidate's
 * positively confirmed requirements? Used everywhere a fit-check gap or
 * fabrication guard would otherwise treat a now-confirmed requirement as
 * still unconfirmed.
 */
export function isConfirmedRequirement(requirementLike: string, confirmedRequirements: string[]) {
  const tokens = tokenize(requirementLike);
  if (!tokens.length || !confirmedRequirements.length) return false;

  return confirmedRequirements.some((confirmed) => {
    const confirmedTokens = tokenize(confirmed);
    if (!confirmedTokens.length) return false;
    const matched = tokens.filter((token) => confirmedTokens.includes(token)).length;
    return matched / tokens.length >= 0.6;
  });
}
