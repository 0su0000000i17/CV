import { AdaptationArt, LetterArt } from './home-feature-art-target-shapes';
import { AnalysisArt, ImprovementArt } from './home-feature-art-resume-shapes';
import type { HomeFeatureArtKind } from './home-feature-art-types';

const SHAPES: Record<HomeFeatureArtKind, () => React.JSX.Element> = {
  analysis: AnalysisArt,
  improvement: ImprovementArt,
  adaptation: AdaptationArt,
  letter: LetterArt,
};

export function FeatureArtShape({ kind }: { kind: HomeFeatureArtKind }) {
  const Shape = SHAPES[kind];
  return <Shape />;
}
