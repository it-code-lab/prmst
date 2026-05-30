import React from 'react';
import {Composition} from 'remotion';
import {PromoProps, PromoVideo, defaultPromoProps} from './PromoVideo';

const fps = 30;
const defaultDurationInFrames = 30 * fps;
const maxDurationInFrames = 600 * fps;
const resolveDuration = (props: PromoProps) => {
  const seconds = Number(props.durationSeconds || 30);
  const bumper = props.thumbnailAsset && (props.thumbnailBumper?.position === 'start' || props.thumbnailBumper?.position === 'end')
    ? Math.min(2, Math.max(0.1, Number(props.thumbnailBumper?.durationSeconds || 0.5)))
    : 0;
  const playbackRate = Math.min(1.5, Math.max(0.75, Number(props.previewSettings?.playbackRate || 1)));
  return Math.max(5 * fps, Math.min(maxDurationInFrames, Math.round(((seconds + bumper) / playbackRate) * fps)));
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoVertical"
        component={PromoVideo}
        durationInFrames={defaultDurationInFrames}
        calculateMetadata={({props}) => ({durationInFrames: resolveDuration(props as PromoProps)})}
        fps={fps}
        width={1080}
        height={1920}
        defaultProps={{...defaultPromoProps, format: 'vertical'}}
      />
      <Composition
        id="PromoLandscape"
        component={PromoVideo}
        durationInFrames={defaultDurationInFrames}
        calculateMetadata={({props}) => ({durationInFrames: resolveDuration(props as PromoProps)})}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={{...defaultPromoProps, format: 'landscape'}}
      />
      <Composition
        id="PromoSquare"
        component={PromoVideo}
        durationInFrames={defaultDurationInFrames}
        calculateMetadata={({props}) => ({durationInFrames: resolveDuration(props as PromoProps)})}
        fps={fps}
        width={1080}
        height={1080}
        defaultProps={{...defaultPromoProps, format: 'square'}}
      />
    </>
  );
};
