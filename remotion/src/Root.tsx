import { Composition, Still } from "remotion";
import { OG } from "./OG";
import { TEASER_FRAMES, Teaser } from "./Teaser";

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="OG" component={OG} width={1200} height={630} />
    <Composition id="Teaser" component={Teaser} durationInFrames={TEASER_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
