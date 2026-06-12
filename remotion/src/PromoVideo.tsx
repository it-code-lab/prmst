import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Loop,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Scene = {
  start: number;
  end: number;
  caption: string;
  narration?: string;
  words?: CaptionWord[];
  wordTimingSource?: 'voiceover' | 'estimated';
  background?:
    | 'reading-room'
    | 'office-desk'
    | 'cafe-table'
    | 'dark-studio'
    | 'home-office'
    | 'classroom'
    | 'meeting-room'
    | 'evening-desk'
    | 'kitchen-counter'
    | 'creator-studio'
    | 'story-kids'
    | 'story-inspirational'
    | 'story-hindu-devotional'
    | 'story-talk'
    | 'story-scary';
  device?: 'tablet-pro' | 'phone-modern' | 'laptop-silver' | 'browser-window' | 'full-screen';
  angle?: 'low-desk-left' | 'low-desk-right' | 'front-center' | 'floating-hero';
  motion?: 'slow-push-in' | 'screen-focus' | 'pan-left' | 'pan-right' | 'device-tilt' | 'cta-push';
  motionAmount?: number;
  screenZoom?: number;
  transition?: 'soft-fade' | 'clean-cut' | 'slide-up';
  captionStyle?: 'white-chip' | 'glass-card' | 'bold-bottom' | 'editorial-card' | 'neon-ribbon' | 'kinetic-stack' | 'minimal-subtitle' | 'device-callout' | 'creator-pop' | 'karaoke-card';
  captionPosition?: 'auto' | 'top' | 'center' | 'bottom' | 'device';
  captionAnimation?: 'rise' | 'pop' | 'slide-mask' | 'type-on' | 'none';
  captionSize?: 'compact' | 'standard' | 'large' | 'hero';
  captionAccent?: 'none' | 'first-word' | 'last-word';
  captionAnimationAmount?: number;
};

type CaptionWord = {
  text: string;
  start: number;
  end: number;
  source?: 'voiceover' | 'estimated';
};

type TimelineClip = {
  start: number;
  end: number;
  mode: 'device-screen' | 'full-screen' | 'background' | 'overlay';
  label?: string;
  asset: string;
  durationSeconds?: number | null;
};

type ThumbnailBumper = {
  position?: 'none' | 'start' | 'end';
  durationSeconds?: number;
  fit?: 'cover' | 'contain';
};

type LayoutSettings = {
  deviceLift?: number;
  ctaLift?: number;
};

export type PromoProps = {
  title: string;
  productName: string;
  targetUrl?: string;
  cta: string;
  format: 'vertical' | 'landscape' | 'square';
  template: 'lifestyle' | 'tablet' | 'laptop' | 'phone';
  durationSeconds: number;
  fps: number;
  screenAsset?: string | null;
  screenDurationSeconds?: number | null;
  voiceoverAsset?: string | null;
  backgroundMusicAsset?: string | null;
  logoAsset?: string | null;
  thumbnailAsset?: string | null;
  thumbnailBumper?: ThumbnailBumper;
  layout?: LayoutSettings;
  scenes: Scene[];
  clips?: TimelineClip[];
  previewSettings?: PreviewSettings;
};

type PreviewSettings = {
  captions?: {
    style?: Scene['captionStyle'] | '';
    position?: Scene['captionPosition'] | '';
    groupMode?: 'words' | 'sentences';
    wordsPerGroup?: number;
    sentencesPerGroup?: number;
    highlightMode?: 'word' | 'trail' | 'pulse' | 'none';
    size?: Scene['captionSize'] | '';
    boxMode?: 'single' | 'lines';
    paragraphAlign?: 'left' | 'center' | 'right' | 'justify';
    fontFamily?: '' | 'Inter' | 'Arial' | 'Georgia' | 'Merriweather' | 'Verdana' | 'Trebuchet MS' | 'Tahoma' | 'Comic Sans MS';
    fontColor?: string;
    fontSizePercent?: number;
    fontWeight?: '' | '500' | '650' | '800' | '950';
    activeStyle?: 'color' | 'pill' | 'underline' | 'glow' | 'none';
    activeColor?: string;
  };
  audio?: {
    voiceoverEnabled?: boolean;
    voiceoverVolume?: number;
    musicEnabled?: boolean;
    musicVolume?: number;
  };
  playbackRate?: number;
};

type CaptionHighlightMode = NonNullable<NonNullable<PreviewSettings['captions']>['highlightMode']>;

export const defaultPromoProps: PromoProps = {
  title: 'Premium Promo Video Studio',
  productName: 'Your Product',
  targetUrl: 'https://example.com',
  cta: 'Try it free today',
  format: 'vertical',
  template: 'lifestyle',
  durationSeconds: 30,
  fps: 30,
  screenAsset: 'sample-screen.mp4',
  screenDurationSeconds: null,
  voiceoverAsset: null,
  backgroundMusicAsset: null,
  logoAsset: null,
  thumbnailAsset: null,
  thumbnailBumper: {position: 'none', durationSeconds: 0.5, fit: 'cover'},
  layout: {deviceLift: 0, ctaLift: 0},
  previewSettings: {
    captions: {style: '', position: '', groupMode: 'words', wordsPerGroup: 3, sentencesPerGroup: 1, highlightMode: 'word', size: '', boxMode: 'single', paragraphAlign: 'center', fontFamily: '', fontColor: '', fontSizePercent: 100, fontWeight: '', activeStyle: 'color', activeColor: '#facc15'},
    audio: {voiceoverEnabled: true, voiceoverVolume: 1.0, musicEnabled: true, musicVolume: 0.18},
    playbackRate: 1,
  },
  clips: [],
  scenes: [
    {start: 0, end: 5, caption: 'Promote your product faster'},
    {start: 5, end: 12, caption: 'Use your real screen recording'},
    {start: 12, end: 22, caption: 'Add captions, motion, and CTA'},
    {start: 22, end: 30, caption: 'Try it free today'},
  ],
};

function activeScene(scenes: Scene[], seconds: number): Scene | undefined {
  const current = scenes.find((scene) => seconds >= Number(scene.start || 0) && seconds < Number(scene.end || 0));
  if (current) return current;

  const previous = scenes.reduce<Scene | undefined>((best, scene) => {
    const end = Number(scene.end || scene.start || 0);
    const bestEnd = best ? Number(best.end || best.start || 0) : -Infinity;
    return seconds >= end && end >= bestEnd ? scene : best;
  }, undefined);
  if (previous) return previous;

  return scenes.reduce<Scene | undefined>((best, scene) => {
    const start = Number(scene.start || 0);
    const bestStart = best ? Number(best.start || 0) : Infinity;
    return start < bestStart ? scene : best;
  }, undefined);
}

const sceneDefaults: Required<Omit<Scene, 'caption' | 'narration' | 'words' | 'wordTimingSource'>> = {
  start: 0,
  end: 30,
  background: 'reading-room',
  device: 'tablet-pro',
  angle: 'low-desk-left',
  motion: 'slow-push-in',
  motionAmount: 2.2,
  screenZoom: 1,
  transition: 'soft-fade',
  captionStyle: 'white-chip',
  captionPosition: 'auto',
  captionAnimation: 'none',
  captionSize: 'standard',
  captionAccent: 'none',
  captionAnimationAmount: 1.4,
};

function designedScene(scenes: Scene[], seconds: number): Scene & typeof sceneDefaults {
  return {...sceneDefaults, ...(activeScene(scenes, seconds) || {caption: ''})};
}

function safeStatic(asset?: string | null): string | null {
  return asset ? staticFile(asset) : null;
}

type ResolvedThumbnailBumper = {
  position: 'start' | 'end';
  durationSeconds: number;
  fit: 'cover' | 'contain';
};

function resolveThumbnailBumper(settings: ThumbnailBumper | undefined, thumbnailSrc: string | null): ResolvedThumbnailBumper | null {
  if (!thumbnailSrc) return null;
  const position = settings?.position;
  if (position !== 'start' && position !== 'end') return null;
  return {
    position,
    durationSeconds: clampNumber(settings?.durationSeconds, 0.1, 2, 0.5),
    fit: settings?.fit === 'contain' ? 'contain' : 'cover',
  };
}

function contentSecondsFromProjectTime(projectSeconds: number, contentDurationSeconds: number, thumbnailBumper: ResolvedThumbnailBumper | null): number {
  if (!thumbnailBumper) return projectSeconds;
  if (thumbnailBumper.position === 'start') {
    return Math.max(0, projectSeconds - thumbnailBumper.durationSeconds);
  }
  return Math.min(contentDurationSeconds, projectSeconds);
}

function normalizeLayoutSettings(settings?: LayoutSettings): Required<LayoutSettings> {
  return {
    deviceLift: clampNumber(settings?.deviceLift, 0, 16, 0),
    ctaLift: clampNumber(settings?.ctaLift, 0, 12, 0),
  };
}

function liftBottom(bottom: React.CSSProperties['bottom'], liftPercent: number): React.CSSProperties['bottom'] {
  if (!liftPercent || bottom === undefined || bottom === 'auto') return bottom;
  if (typeof bottom === 'number') return `calc(${bottom}px + ${liftPercent}%)`;
  return `calc(${bottom} + ${liftPercent}%)`;
}

const commonTextShadow = '0 8px 30px rgba(0,0,0,0.35)';
const backgroundAssets = {
  'reading-room': 'assets/lifestyle-reading-room.png',
  'office-desk': 'assets/background-office-desk.png',
  'cafe-table': 'assets/background-cafe-table.png',
  'dark-studio': 'assets/background-dark-studio.png',
  'home-office': 'assets/background-home-office.png',
  'classroom': 'assets/background-classroom.png',
  'meeting-room': 'assets/background-meeting-room.png',
  'evening-desk': 'assets/background-evening-desk.png',
  'kitchen-counter': 'assets/background-kitchen-counter.png',
  'creator-studio': 'assets/background-creator-studio.png',
  'story-kids': 'assets/background-story-kids.svg',
  'story-inspirational': 'assets/background-story-inspirational.svg',
  'story-hindu-devotional': 'assets/background-story-hindu-devotional.svg',
  'story-talk': 'assets/background-story-talk.svg',
  'story-scary': 'assets/background-story-scary.svg',
};

const captionFontStacks: Record<string, string> = {
  Inter: 'Inter, Arial, sans-serif',
  Arial: 'Arial, Helvetica, sans-serif',
  Georgia: 'Georgia, Times New Roman, serif',
  Merriweather: 'Merriweather, Georgia, serif',
  Verdana: 'Verdana, Geneva, sans-serif',
  'Trebuchet MS': 'Trebuchet MS, Arial, sans-serif',
  Tahoma: 'Tahoma, Geneva, sans-serif',
  'Comic Sans MS': 'Comic Sans MS, Comic Sans, cursive',
};

export const PromoVideo: React.FC<PromoProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const renderPlaybackRate = clampNumber(props.previewSettings?.playbackRate, 0.75, 1.5, 1);
  const thumbnailSrc = safeStatic(props.thumbnailAsset);
  const thumbnailBumper = resolveThumbnailBumper(props.thumbnailBumper, thumbnailSrc);
  const projectSeconds = (frame / fps) * renderPlaybackRate;
  const seconds = contentSecondsFromProjectTime(projectSeconds, props.durationSeconds, thumbnailBumper);
  const layout = normalizeLayoutSettings(props.layout);
  const scene = applyPreviewCaptionSettings(designedScene(props.scenes, seconds), props.previewSettings);
  const clips = Array.isArray(props.clips) ? props.clips : [];
  const screenSrc = safeStatic(props.screenAsset);
  const voiceSrc = safeStatic(props.voiceoverAsset);
  const musicSrc = safeStatic(props.backgroundMusicAsset);
  const logoSrc = safeStatic(props.logoAsset);

  if (props.template === 'lifestyle') {
    return <LifestylePromo {...props} screenSrc={screenSrc} voiceSrc={voiceSrc} musicSrc={musicSrc} logoSrc={logoSrc} thumbnailSrc={thumbnailSrc} resolvedThumbnailBumper={thumbnailBumper} layoutSettings={layout} />;
  }

  const entrance = spring({frame, fps, config: {damping: 18, stiffness: 120}});
  const slowZoom = interpolate(frame, [0, fps * 30], [1.03, 1.12], {extrapolateRight: 'clamp'});
  const captionPop = spring({frame: frame % Math.max(1, fps * 4), fps, config: {damping: 16, stiffness: 160}});

  const isVertical = props.format === 'vertical';
  const isLandscape = props.format === 'landscape';
  const isSquare = props.format === 'square';

  const ctaVisible = seconds >= Math.max(0, props.durationSeconds - 6);

  return (
    <AbsoluteFill style={{backgroundColor: '#0f172a', overflow: 'hidden', fontFamily: 'Inter, Arial, sans-serif'}}>
      {screenSrc ? (
        <OffthreadVideo
          src={screenSrc}
          muted
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(34px) saturate(1.25)',
            opacity: 0.42,
            transform: `scale(${slowZoom})`,
          }}
        />
      ) : null}

      <AbsoluteFill style={{background: 'linear-gradient(155deg, rgba(15,23,42,.93), rgba(49,46,129,.62), rgba(8,47,73,.72))'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 10%, rgba(167,139,250,.45), transparent 28%), radial-gradient(circle at 86% 85%, rgba(34,211,238,.36), transparent 32%)'}} />

      <div style={{position: 'absolute', top: isLandscape ? 54 : isSquare ? 58 : 92, left: isLandscape ? 74 : 64, right: isLandscape ? 74 : 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          {logoSrc ? <Img src={logoSrc} style={{width: 62, height: 62, objectFit: 'contain', borderRadius: 16}} /> : <div style={{width: 54, height: 54, borderRadius: 18, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 18px 50px rgba(124,58,237,.35)'}} />}
          <div>
            <div style={{fontSize: isLandscape ? 26 : 28, color: 'rgba(255,255,255,.72)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase'}}>{props.productName}</div>
            {props.targetUrl ? <div style={{fontSize: isLandscape ? 18 : 20, color: 'rgba(226,232,240,.72)', marginTop: 4}}>{props.targetUrl.replace(/^https?:\/\//, '')}</div> : null}
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: isLandscape ? 146 : isSquare ? 142 : 216,
        left: isLandscape ? 90 : 68,
        right: isLandscape ? 980 : 68,
        transform: `translateY(${interpolate(entrance, [0, 1], [40, 0])}px)`,
        opacity: entrance,
      }}>
        <div style={{fontSize: isLandscape ? 70 : isSquare ? 60 : 78, lineHeight: 0.96, fontWeight: 950, letterSpacing: '-0.06em', textShadow: commonTextShadow}}>
          {props.title}
        </div>
      </div>

      <DeviceStage
        screenSrc={screenSrc}
        template={props.template}
        format={props.format}
        frame={frame}
        fps={fps}
        width={width}
        height={height}
      />

      <div style={{
        position: 'absolute',
        left: isLandscape ? 92 : 72,
        right: isLandscape ? 92 : 72,
        bottom: isLandscape ? 72 : isSquare ? 76 : 170,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          maxWidth: isLandscape ? 760 : 880,
          padding: isLandscape ? '24px 34px' : '28px 38px',
          borderRadius: 34,
          background: 'rgba(15,23,42,.72)',
          border: '1px solid rgba(255,255,255,.18)',
          backdropFilter: 'blur(22px)',
          boxShadow: '0 28px 80px rgba(0,0,0,.34)',
          transform: `scale(${interpolate(captionPop, [0, 1], [0.96, 1])})`,
          opacity: interpolate(captionPop, [0, 1], [0.3, 1]),
          textAlign: 'center',
        }}>
          <div style={{fontSize: isLandscape ? 42 : isSquare ? 42 : 54, lineHeight: 1.08, fontWeight: 950, letterSpacing: '-0.035em'}}>
            {scene?.caption || props.cta}
          </div>
        </div>
      </div>

      {ctaVisible ? <CtaEndCard cta={props.cta} isLandscape={isLandscape} /> : null}
      {voiceSrc ? <TimelineAudio src={voiceSrc} playbackRate={renderPlaybackRate} contentDurationSeconds={props.durationSeconds} alignWithContent={false} /> : null}
      {musicSrc ? <TimelineAudio src={musicSrc} volume={0.18} thumbnailBumper={thumbnailBumper} playbackRate={renderPlaybackRate} contentDurationSeconds={props.durationSeconds} /> : null}
      <ThumbnailBumperOverlay thumbnailSrc={thumbnailSrc} thumbnailBumper={thumbnailBumper} contentDurationSeconds={props.durationSeconds} playbackRate={renderPlaybackRate} />
    </AbsoluteFill>
  );
};

const LifestylePromo: React.FC<PromoProps & {screenSrc: string | null; voiceSrc: string | null; musicSrc: string | null; logoSrc: string | null; thumbnailSrc: string | null; resolvedThumbnailBumper: ResolvedThumbnailBumper | null; layoutSettings: Required<LayoutSettings>}> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const playbackRate = clampNumber(props.previewSettings?.playbackRate, 0.75, 1.5, 1);
  const projectSeconds = (frame / fps) * playbackRate;
  const seconds = contentSecondsFromProjectTime(projectSeconds, props.durationSeconds, props.resolvedThumbnailBumper);
  const timelineFrame = Math.round(seconds * fps);
  const scene = applyPreviewCaptionSettings(designedScene(props.scenes, seconds), props.previewSettings);
  const clips = Array.isArray(props.clips) ? props.clips : [];
  const isLandscape = props.format === 'landscape';
  const isSquare = props.format === 'square';
  const ctaStartSeconds = Math.max(0, props.durationSeconds - 5.6);
  const ctaVisible = seconds >= ctaStartSeconds;
  const progress = seconds / Math.max(1, props.durationSeconds);
  const bgScale = interpolate(progress, [0, 1], [1.02, 1.08], {extrapolateRight: 'clamp'});

  const captionFrame = Math.max(0, timelineFrame - Math.round((scene?.start || 0) * fps));
  const captionIn = spring({frame: captionFrame, fps, config: {damping: 18, stiffness: 170}});
  const sceneFrame = Math.max(0, timelineFrame - Math.round(scene.start * fps));
  const sceneFrames = Math.max(1, Math.round((scene.end - scene.start) * fps));
  const sceneProgress = Math.min(1, sceneFrame / sceneFrames);
  const camera = cameraTransform(scene.motion, sceneProgress, scene.motionAmount);
  return (
    <AbsoluteFill style={{backgroundColor: '#eee2cf', overflow: 'hidden', fontFamily: 'Inter, Arial, sans-serif'}}>
      <AbsoluteFill style={{transform: camera}}>
        <Img
          src={staticFile(backgroundAssets[scene.background] || backgroundAssets['reading-room'])}
          style={{
            position: 'absolute',
            inset: '-2%',
            width: '104%',
            height: '104%',
            objectFit: 'cover',
            transform: `scale(${bgScale}) translateY(${isLandscape ? '-5%' : '0%'})`,
            filter: 'saturate(1.02) contrast(1.02)',
          }}
        />
        <TimelineClips clips={clips} mode="background" fit="cover" />
        <AbsoluteFill
          style={{
            background: isLandscape
              ? 'linear-gradient(90deg, rgba(255,255,255,.3), rgba(255,255,255,0) 42%, rgba(57,39,24,.14))'
              : 'linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 34%, rgba(81,52,24,.18))',
          }}
        />
        <LifestyleDeviceStage
          screenSrc={props.screenSrc}
          format={props.format}
          scene={scene}
          transitionOpacity={1}
          screenLoopFrames={props.screenDurationSeconds ? Math.max(2, Math.round(props.screenDurationSeconds * fps)) : undefined}
          deviceClips={clips.filter((clip) => clip.mode === 'device-screen')}
          playbackRate={playbackRate}
          deviceLift={props.layoutSettings.deviceLift}
        />
      </AbsoluteFill>

      <TimelineClips clips={clips} mode="full-screen" fit="cover" />
      <TimelineClips clips={clips} mode="overlay" fit="cover" overlay format={props.format} />

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
        }}
      />

      {props.logoSrc ? (
        <Img
          src={props.logoSrc}
          style={{
            position: 'absolute',
            top: isLandscape ? 42 : 78,
            left: isLandscape ? 52 : 48,
            width: isLandscape ? 64 : 74,
            height: isLandscape ? 64 : 74,
            objectFit: 'contain',
            borderRadius: 16,
            background: 'rgba(255,255,255,.78)',
            padding: 9,
            boxShadow: '0 12px 40px rgba(71,51,27,.18)',
          }}
        />
      ) : null}

      <div
        style={{
          position: 'absolute',
          ...captionPositionStyle(scene, isLandscape, isSquare),
          display: 'flex',
          justifyContent: captionJustify(scene, isLandscape),
          transform: captionTransform(scene, captionIn),
          opacity: interpolate(captionIn, [0, 1], [0, 1]),
        }}
      >
        <CaptionChip
          caption={scene?.caption || props.title}
          isLandscape={isLandscape}
          scene={scene}
          seconds={seconds}
          previewSettings={props.previewSettings}
        />
      </div>

      {ctaVisible ? <LifestyleCta cta={props.cta} isLandscape={isLandscape} isSquare={isSquare} startFrame={Math.round(ctaStartSeconds * fps)} ctaLift={props.layoutSettings.ctaLift} /> : null}
      {props.voiceSrc && props.previewSettings?.audio?.voiceoverEnabled !== false ? <TimelineAudio src={props.voiceSrc} volume={clampNumber(props.previewSettings?.audio?.voiceoverVolume, 0, 1, 1.0)} playbackRate={playbackRate} contentDurationSeconds={props.durationSeconds} alignWithContent={false} /> : null}
      {props.musicSrc && props.previewSettings?.audio?.musicEnabled !== false ? <TimelineAudio src={props.musicSrc} volume={clampNumber(props.previewSettings?.audio?.musicVolume, 0, 1, 0.18)} playbackRate={playbackRate} thumbnailBumper={props.resolvedThumbnailBumper} contentDurationSeconds={props.durationSeconds} /> : null}
      <ThumbnailBumperOverlay thumbnailSrc={props.thumbnailSrc} thumbnailBumper={props.resolvedThumbnailBumper} contentDurationSeconds={props.durationSeconds} playbackRate={playbackRate} />
    </AbsoluteFill>
  );
};

function captionPositionStyle(scene: Scene & typeof sceneDefaults, isLandscape: boolean, isSquare: boolean): React.CSSProperties {
  const style = scene.captionStyle;
  const position = style === 'bold-bottom' || style === 'minimal-subtitle' || style === 'creator-pop'
    ? 'bottom'
    : style === 'device-callout'
      ? 'device'
      : scene.captionPosition || 'auto';

  if (isLandscape) {
    if (position === 'device') return {top: '14%', left: '48%', right: '8%', bottom: 'auto'};
    if (position === 'center') return {top: '50%', left: '8%', right: '54%', bottom: 'auto'};
    if (position === 'bottom') return {top: 'auto', bottom: '10%', left: '8%', right: '54%'};
    return {top: '7%', left: '8%', right: '58%', bottom: 'auto'};
  }

  if (position === 'center') return {top: '42%', left: '7%', right: '7%', bottom: 'auto'};
  if (position === 'bottom') return {top: 'auto', bottom: '11%', left: '7%', right: '7%'};
  if (position === 'device') return {top: 'auto', bottom: '40%', left: '9%', right: '9%'};
  return {top: '4.6%', left: '7%', right: '7%', bottom: 'auto'};
}

function captionJustify(scene: Scene & typeof sceneDefaults, isLandscape: boolean): React.CSSProperties['justifyContent'] {
  if (scene.captionStyle === 'device-callout') return 'flex-start';
  return isLandscape ? 'flex-start' : 'center';
}

function captionTransform(scene: Scene & typeof sceneDefaults, captionIn: number): string {
  const amount = Math.min(2.2, Math.max(0.5, Number.isFinite(scene.captionAnimationAmount) ? scene.captionAnimationAmount : sceneDefaults.captionAnimationAmount));
  if (scene.captionAnimation === 'pop') {
    return `scale(${interpolate(captionIn, [0, 1], [Math.max(0.76, 1 - (0.12 * amount)), 1])})`;
  }
  if (scene.captionAnimation === 'slide-mask') {
    return `translateX(${interpolate(captionIn, [0, 1], [-18 * amount, 0])}px)`;
  }
  if (scene.captionAnimation === 'none') {
    return 'none';
  }
  return `translateY(${interpolate(captionIn, [0, 1], [16 * amount, 0])}px) scale(${interpolate(captionIn, [0, 1], [0.97, 1])})`;
}

function captionFontSize(scene: Scene & typeof sceneDefaults, isLandscape: boolean): number {
  const base = isLandscape ? 38 : 48;
  if (scene.captionSize === 'compact') return base * 0.78;
  if (scene.captionSize === 'large') return base * 1.18;
  if (scene.captionSize === 'hero') return base * 1.42;
  return base;
}

function applyPreviewCaptionSettings(scene: Scene & typeof sceneDefaults, settings?: PreviewSettings): Scene & typeof sceneDefaults {
  const captions = settings?.captions || {};
  return {
    ...scene,
    captionStyle: captions.style || scene.captionStyle,
    captionPosition: captions.position || scene.captionPosition,
    captionSize: captions.size || scene.captionSize,
    captionAnimation: 'none',
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.min(max, Math.max(min, numberValue)) : fallback;
}

const CaptionChip: React.FC<{caption: string; isLandscape: boolean; scene: Scene & typeof sceneDefaults; seconds?: number; previewSettings?: PreviewSettings}> = ({caption, isLandscape, scene, seconds = 0, previewSettings}) => {
  const captions = previewSettings?.captions || {};
  const groupMode = captions.groupMode === 'sentences' ? 'sentences' : 'words';
  const wordsPerGroup = clampNumber(captions.wordsPerGroup, 1, 8, 3);
  const sentencesPerGroup = clampNumber(captions.sentencesPerGroup, 1, 4, 1);
  const highlightMode = captions.highlightMode || 'word';
  const boxMode = captions.boxMode === 'lines' ? 'lines' : 'single';
  const paragraphAlign = normalizeParagraphAlign(captions.paragraphAlign);
  const fontFamily = captions.fontFamily && captionFontStacks[captions.fontFamily] ? captionFontStacks[captions.fontFamily] : undefined;
  const fontColor = safeCaptionHexColor(captions.fontColor, '');
  const fontWeight = captions.fontWeight || undefined;
  const activeStyle = captions.activeStyle || 'color';
  const activeColor = safeCaptionHexColor(captions.activeColor, '#facc15');
  const timedWords = sceneCaptionWords(scene, caption);
  const grouped = groupMode === 'sentences'
    ? captionSentenceGroup(timedWords, scene, seconds, sentencesPerGroup)
    : captionWordGroup(timedWords, scene, seconds, wordsPerGroup);
  const fallbackTokens = String(caption || '').split(/\n+/).filter(Boolean).map((line) => line.split(/\s+/).filter(Boolean).map((word, index) => ({text: word, index, active: false, past: false, progress: 0})));
  const lines = grouped.words.length
    ? (boxMode === 'lines' ? splitCaptionTokens(grouped.words) : [grouped.words])
    : (boxMode === 'lines' ? fallbackTokens : [fallbackTokens.flat()]);
  const style = scene.captionStyle || 'white-chip';
  const isGlass = style === 'glass-card';
  const isBottom = style === 'bold-bottom';
  const fontSize = captionFontSize(scene, isLandscape) * (clampNumber(captions.fontSizePercent, 70, 180, 100) / 100);
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: style === 'device-callout' ? 'flex-start' : 'center',
        gap: boxMode === 'single' ? 0 : (style === 'kinetic-stack' ? 10 : 5),
        maxWidth: isLandscape ? 560 : 900,
      }}
    >
      {(lines.length ? lines : [[{text: caption, index: 0, active: false, past: false, progress: 0}]]).map((line, index) => (
        <div
          key={`${line.map((token) => token.text).join(' ')}-${index}`}
          style={captionLineStyle(style, index, fontSize, isLandscape, {paragraphAlign, fontFamily, fontColor, fontWeight})}
        >
          {line.map((token) => (
            <span key={`${token.text}-${token.index}`} style={captionWordStyle(token, style, highlightMode, activeStyle, activeColor)}>
              {token.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

type CaptionToken = {
  text: string;
  index: number;
  active: boolean;
  past: boolean;
  progress: number;
};

function sceneCaptionWords(scene: Scene & typeof sceneDefaults, fallbackCaption: string): CaptionWord[] {
  const start = Number(scene.start || 0);
  const end = Math.max(start + 0.4, Number(scene.end || start + 3));
  const storedWords = Array.isArray(scene.words) ? scene.words : [];
  if (storedWords.length) {
    return storedWords
      .map((word) => ({
        text: cleanCaptionWord(word.text),
        start: Number.isFinite(Number(word.start)) ? Number(word.start) : start,
        end: Number.isFinite(Number(word.end)) ? Number(word.end) : end,
        source: word.source || 'voiceover',
      }))
      .filter((word) => word.text)
      .map((word, index, words) => ({
        ...word,
        end: word.end > word.start ? word.end : (words[index + 1]?.start || end),
      }));
  }

  const source = String(scene.narration || fallbackCaption || '').replace(/\n+/g, ' ');
  const words = source.match(/[^\s]+/g) || [];
  const span = (end - start) / Math.max(1, words.length);
  return words.map((word, index) => ({
    text: cleanCaptionWord(word),
    start: start + index * span,
    end: start + (index + 1) * span,
    source: 'estimated' as const,
  })).filter((word) => word.text);
}

function cleanCaptionWord(word: unknown): string {
  return String(word || '').replace(/\s+/g, ' ').trim();
}

function safeCaptionHexColor(value: unknown, fallback: string): string {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function normalizeParagraphAlign(value: unknown): 'left' | 'center' | 'right' | 'justify' {
  return value === 'left' || value === 'right' || value === 'justify' ? value : 'center';
}

function captionWordGroup(words: CaptionWord[], scene: Scene & typeof sceneDefaults, seconds: number, wordsPerGroup: number): {words: CaptionToken[]; activeIndex: number} {
  if (!words.length) return {words: [], activeIndex: -1};
  const activeIndex = activeCaptionWordIndex(words, seconds);
  const groupSize = Math.round(wordsPerGroup);
  const groupStart = Math.floor(activeIndex / groupSize) * groupSize;
  return {
    activeIndex,
    words: words.slice(groupStart, groupStart + groupSize).map((word, offset) => captionToken(word, groupStart + offset, activeIndex, seconds, scene)),
  };
}

function captionSentenceGroup(words: CaptionWord[], scene: Scene & typeof sceneDefaults, seconds: number, sentencesPerGroup: number): {words: CaptionToken[]; activeIndex: number} {
  if (!words.length) return {words: [], activeIndex: -1};
  const activeIndex = activeCaptionWordIndex(words, seconds);
  const groups = sentenceIndexGroups(words);
  const foundSentenceIndex = groups.findIndex((indexes) => indexes.includes(activeIndex));
  const activeSentenceIndex = foundSentenceIndex === -1 ? 0 : foundSentenceIndex;
  const groupSize = Math.round(sentencesPerGroup);
  const sentenceStart = Math.floor(activeSentenceIndex / groupSize) * groupSize;
  const visibleIndexes = groups.slice(sentenceStart, sentenceStart + groupSize).flat();
  return {
    activeIndex,
    words: visibleIndexes.map((index) => captionToken(words[index], index, activeIndex, seconds, scene)),
  };
}

function sentenceIndexGroups(words: CaptionWord[]): number[][] {
  const groups: number[][] = [];
  let current: number[] = [];
  words.forEach((word, index) => {
    current.push(index);
    if (/[.!?\u0964]$/.test(word.text) || current.length >= 18) {
      groups.push(current);
      current = [];
    }
  });
  if (current.length) groups.push(current);
  return groups;
}

function activeCaptionWordIndex(words: CaptionWord[], seconds: number): number {
  const foundIndex = words.findIndex((word, index) => {
    const nextStart = words[index + 1]?.start ?? word.end;
    return seconds >= word.start && seconds < Math.max(word.end, nextStart);
  });
  return foundIndex === -1
    ? (seconds < words[0].start ? 0 : words.length - 1)
    : foundIndex;
}

function captionToken(word: CaptionWord, index: number, activeIndex: number, seconds: number, scene: Scene & typeof sceneDefaults): CaptionToken {
  const length = Math.max(0.08, Number(word.end || 0) - Number(word.start || 0));
  return {
    text: word.text,
    index,
    active: index === activeIndex,
    past: index < activeIndex,
    progress: Math.min(1, Math.max(0, (seconds - Number(word.start || scene.start || 0)) / length)),
  };
}

function splitCaptionTokens(words: CaptionToken[]): CaptionToken[][] {
  if (words.length <= 4) return [words];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint), words.slice(midpoint)];
}

function captionWordStyle(token: CaptionToken, style: NonNullable<Scene['captionStyle']>, highlightMode: CaptionHighlightMode, activeStyle: NonNullable<NonNullable<PreviewSettings['captions']>['activeStyle']>, activeColor: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    borderRadius: '0.18em',
    fontStyle: 'normal',
    transformOrigin: 'center bottom',
    opacity: token.past ? 0.7 : 1,
    transform: token.active ? 'translateY(-0.025em) scale(1.055)' : 'none',
    color: 'inherit',
  };
  if (highlightMode === 'none') return {...base, opacity: 1, transform: 'none'};
  if (highlightMode === 'trail' && token.past) return {...base, opacity: 1, color: '#06b6d4'};
  if (activeStyle === 'none' && token.active) return {...base, opacity: 1, transform: 'none'};

  if (token.active) {
    return activeWordStyle(base, activeStyle, activeColor, style);
  }
  if (style === 'karaoke-card' && token.past) return {...base, color: '#fde68a', opacity: 1};
  return base;
}

function activeWordStyle(base: React.CSSProperties, activeStyle: NonNullable<NonNullable<PreviewSettings['captions']>['activeStyle']>, activeColor: string, style: NonNullable<Scene['captionStyle']>): React.CSSProperties {
  const transform = style === 'creator-pop' ? 'translateY(-0.03em) scale(1.12)' : base.transform;
  if (activeStyle === 'pill') return {...base, color: '#111827', background: activeColor, boxShadow: `0 0 0 .13em ${activeColor}, 0 12px 28px rgba(0,0,0,.22)`, transform};
  if (activeStyle === 'underline') return {...base, color: activeColor, textDecoration: 'underline', textDecorationColor: activeColor, textDecorationThickness: '0.14em', textUnderlineOffset: '0.13em', transform};
  if (activeStyle === 'glow') return {...base, color: activeColor, textShadow: `0 0 18px ${activeColor}, 0 0 34px rgba(255,255,255,.2)`, transform};
  return {...base, color: activeColor, transform};
}

type CaptionTypography = {
  paragraphAlign: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  fontColor?: string;
  fontWeight?: string;
};

function captionLineStyle(style: NonNullable<Scene['captionStyle']>, index: number, fontSize: number, isLandscape: boolean, typography: CaptionTypography): React.CSSProperties {
  const justifyContent = typography.paragraphAlign === 'left'
    ? 'flex-start'
    : typography.paragraphAlign === 'right'
      ? 'flex-end'
      : typography.paragraphAlign === 'justify'
        ? 'space-between'
        : 'center';
  const withTypography = (lineStyle: React.CSSProperties): React.CSSProperties => ({
    ...lineStyle,
    justifyContent,
    textAlign: typography.paragraphAlign,
    fontFamily: typography.fontFamily || lineStyle.fontFamily,
    color: typography.fontColor || lineStyle.color,
    fontWeight: typography.fontWeight || lineStyle.fontWeight,
  });
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'baseline',
    justifyContent,
    flexWrap: 'wrap',
    columnGap: '0.23em',
    rowGap: '0.08em',
    borderRadius: 10,
    padding: isLandscape ? '8px 18px 10px' : '10px 19px 12px',
    fontSize,
    lineHeight: 1.04,
    fontWeight: 850,
    letterSpacing: 0,
    textAlign: 'center',
    boxShadow: '0 12px 34px rgba(64,43,20,.16)',
    background: 'rgba(255,255,255,.94)',
    color: '#171717',
  };
  if (style === 'glass-card') {
    return withTypography({...base, background: 'rgba(15,23,42,.58)', color: 'white', boxShadow: '0 16px 44px rgba(0,0,0,.22)', backdropFilter: 'blur(14px)'});
  }
  if (style === 'bold-bottom') {
    return withTypography({...base, background: 'transparent', color: 'white', fontWeight: 950, boxShadow: 'none', textShadow: '0 8px 34px rgba(0,0,0,.52)'});
  }
  if (style === 'editorial-card') {
    return withTypography({...base, borderRadius: 8, background: 'rgba(255,250,240,.96)', fontFamily: 'Georgia, Times New Roman, serif', boxShadow: '0 18px 44px rgba(43,29,14,.18)'});
  }
  if (style === 'neon-ribbon') {
    return withTypography({...base, borderRadius: 999, background: 'linear-gradient(135deg, rgba(8,13,20,.88), rgba(4,47,46,.84))', color: '#ecfeff', border: '1px solid rgba(94,234,212,.36)', boxShadow: '0 18px 46px rgba(13,148,136,.24)', textTransform: 'uppercase'});
  }
  if (style === 'kinetic-stack') {
    return withTypography({...base, borderRadius: 8, background: index % 2 ? '#111827' : '#f8fafc', color: index % 2 ? '#f8fafc' : '#0f172a', transform: `rotate(${index % 2 ? 1.2 : -1.5}deg)`, boxShadow: '0 18px 42px rgba(0,0,0,.22)'});
  }
  if (style === 'minimal-subtitle') {
    return withTypography({...base, borderRadius: 0, background: 'rgba(0,0,0,.56)', color: 'white', boxShadow: 'none', fontWeight: 740, padding: isLandscape ? '7px 16px 9px' : '8px 18px 10px'});
  }
  if (style === 'device-callout') {
    return withTypography({...base, position: 'relative', borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,255,255,.97), rgba(219,234,254,.94))', color: '#0f172a', boxShadow: '0 16px 40px rgba(15,23,42,.22)'});
  }
  if (style === 'creator-pop') {
    return withTypography({...base, background: 'transparent', color: 'white', boxShadow: 'none', fontWeight: 950, textTransform: 'uppercase', textShadow: '0 2px 0 #111827, 2px 0 0 #111827, -2px 0 0 #111827, 0 -2px 0 #111827, 0 10px 30px rgba(0,0,0,.52)'});
  }
  if (style === 'karaoke-card') {
    return withTypography({...base, borderRadius: 12, background: 'linear-gradient(135deg, rgba(17,24,39,.82), rgba(49,46,129,.72))', color: 'rgba(255,255,255,.74)', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 18px 52px rgba(0,0,0,.32)'});
  }
  return withTypography(base);
}

const LifestyleDeviceStage: React.FC<{
  screenSrc: string | null;
  format: PromoProps['format'];
  scene: Scene & typeof sceneDefaults;
  transitionOpacity: number;
  screenLoopFrames?: number;
  deviceClips?: TimelineClip[];
  playbackRate?: number;
  deviceLift?: number;
}> = ({screenSrc, format, scene, transitionOpacity, screenLoopFrames, deviceClips = [], playbackRate = 1, deviceLift = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isLandscape = format === 'landscape';
  const isSquare = format === 'square';
  const intro = spring({frame: frame - 8, fps, config: {damping: 18, stiffness: 95}});
  const pushIn = interpolate(intro, [0, 1], [0.9, 1]);

  if (scene.device === 'full-screen') {
    if (!screenSrc && !deviceClips.length) {
      return null;
    }
    return (
      <AbsoluteFill style={{opacity: intro * transitionOpacity, background: '#020617'}}>
        <ScreenVideo
          screenSrc={screenSrc}
          radius={0}
          zoom={Number(scene.screenZoom || sceneDefaults.screenZoom)}
          loopFrames={screenLoopFrames}
          clips={deviceClips}
          playbackRate={playbackRate}
          fit="cover"
        />
      </AbsoluteFill>
    );
  }

  const stageStyle = deviceStageStyle(format, scene.device, scene.angle, deviceLift);

  return (
    <div
      style={{
        ...stageStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1400,
        transform: `scale(${pushIn})`,
        opacity: intro * transitionOpacity,
      }}
    >
      <div
        style={{
          ...deviceShellStyle(scene.device, isLandscape, isSquare),
          position: 'relative',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          boxShadow: '0 38px 82px rgba(50,31,14,.28), 0 72px 130px rgba(38,24,12,.26)',
          transform: angleTransform(scene.angle, scene.device, isLandscape, isSquare),
          transformStyle: 'preserve-3d',
          border: '2px solid rgba(255,255,255,.24)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: deviceInset(scene.device, isLandscape),
            borderRadius: deviceRadius(scene.device, isLandscape),
            overflow: 'hidden',
            background: '#f8fafc',
          }}
        >
          <ScreenVideo
            screenSrc={screenSrc}
            radius={deviceRadius(scene.device, isLandscape)}
            zoom={Number(scene.screenZoom || sceneDefaults.screenZoom)}
            loopFrames={screenLoopFrames}
            clips={deviceClips}
            playbackRate={playbackRate}
            fit={scene.device === 'browser-window' ? 'contain' : 'cover'}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: deviceGlassInset(scene.device, isLandscape),
            borderRadius: deviceRadius(scene.device, isLandscape) + 4,
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.18), inset 0 0 22px rgba(255,255,255,.16)',
            background: 'linear-gradient(110deg, rgba(255,255,255,.20), rgba(255,255,255,0) 34%, rgba(255,255,255,.10) 64%, rgba(255,255,255,0))',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

const LifestyleCta: React.FC<{cta: string; isLandscape: boolean; isSquare: boolean; startFrame: number; ctaLift?: number}> = ({cta, isLandscape, isSquare, startFrame, ctaLift = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - startFrame, fps, config: {damping: 15, stiffness: 140}});
  return (
    <div
      style={{
        position: 'absolute',
        left: isLandscape ? 160 : 0,
        right: isLandscape ? 'auto' : 0,
        bottom: liftBottom(isLandscape ? 72 : isSquare ? 54 : 74, ctaLift),
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: '#2f91ff',
          color: 'white',
          borderRadius: 999,
          padding: isLandscape ? '10px 25px 12px' : '13px 30px 15px',
          fontSize: isLandscape ? 34 : 39,
          lineHeight: 1,
          fontWeight: 760,
          letterSpacing: 0,
          boxShadow: '0 18px 42px rgba(35,112,214,.32)',
          transform: `translateY(${interpolate(pop, [0, 1], [24, 0])}px) scale(${interpolate(pop, [0, 1], [0.86, 1])})`,
          opacity: interpolate(pop, [0, 1], [0, 1]),
        }}
      >
        {cta}
      </div>
    </div>
  );
};

const DeviceStage: React.FC<{
  screenSrc: string | null;
  template: PromoProps['template'];
  format: PromoProps['format'];
  frame: number;
  fps: number;
  width: number;
  height: number;
}> = ({screenSrc, template, format, frame, fps}) => {
  const isLandscape = format === 'landscape';
  const isSquare = format === 'square';
  const deviceIn = spring({frame: frame - 10, fps, config: {damping: 18, stiffness: 95}});
  const floatY = Math.sin(frame / 38) * 8;
  const rotate = template === 'phone' ? -3 : template === 'laptop' ? 0 : -2;

  const stageStyle: React.CSSProperties = isLandscape
    ? {position: 'absolute', right: 78, top: 150, width: 940, height: 720}
    : isSquare
      ? {position: 'absolute', left: 90, right: 90, top: 260, height: 510}
      : {position: 'absolute', left: 72, right: 72, top: 560, height: 800};

  return (
    <div style={{...stageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${floatY}px) scale(${interpolate(deviceIn, [0, 1], [0.88, 1])}) rotate(${rotate}deg)`, opacity: deviceIn}}>
      {template === 'phone' ? <PhoneMock screenSrc={screenSrc} /> : template === 'laptop' ? <LaptopMock screenSrc={screenSrc} /> : <TabletMock screenSrc={screenSrc} />}
    </div>
  );
};

function deviceShellStyle(device: NonNullable<Scene['device']>, isLandscape: boolean, isSquare: boolean): React.CSSProperties {
  if (device === 'phone-modern') {
    return {
      width: '38%',
      aspectRatio: '9 / 19.2',
      padding: '2.8%',
      borderRadius: 34,
      background: 'linear-gradient(145deg, #202020, #050505 62%, #444)',
    };
  }
  if (device === 'laptop-silver') {
    return {
      width: '82%',
      aspectRatio: '16 / 10',
      padding: '1.7%',
      borderRadius: '18px 18px 8px 8px',
      background: 'linear-gradient(145deg, #263241, #06080c 58%, #3a4654)',
      boxShadow: '0 34px 70px rgba(0,0,0,.48), inset 0 0 0 3px rgba(255,255,255,.06)',
    };
  }
  if (device === 'browser-window') {
    return {
      width: '96%',
      aspectRatio: '16 / 10',
      padding: '2.7% 0.9% 0.9%',
      borderRadius: 10,
      background: 'linear-gradient(#111827 0 7%, #05070b 7%)',
      boxShadow: '0 24px 58px rgba(0,0,0,.38), inset 0 0 0 1px rgba(255,255,255,.12)',
    };
  }
  return {
    width: '86%',
    aspectRatio: '1.42 / 1',
    padding: '2.1%',
    borderRadius: 36,
    background: 'linear-gradient(145deg, #262626, #050505 58%, #333)',
  };
}

function deviceStageStyle(format: PromoProps['format'], device: NonNullable<Scene['device']>, angle: NonNullable<Scene['angle']>, deviceLift = 0): React.CSSProperties {
  const isLandscape = format === 'landscape';
  const isSquare = format === 'square';
  if (device === 'browser-window') {
    const style: React.CSSProperties = isLandscape
      ? {position: 'absolute', left: 'auto', right: '4%', bottom: '8%', width: '58%', height: '54%'}
      : isSquare
        ? {position: 'absolute', left: '4%', right: '4%', bottom: '11%', height: '48%'}
        : {position: 'absolute', left: '3%', right: '3%', bottom: '12%', height: '42%'};
    style.bottom = liftBottom(style.bottom, deviceLift);
    return style;
  }
  const style: React.CSSProperties = isLandscape
    ? {position: 'absolute', left: 'auto', right: '6%', bottom: '2%', width: '50%', height: '62%'}
    : isSquare
      ? {position: 'absolute', left: '-7%', right: '-7%', bottom: '7%', height: '58%'}
      : {position: 'absolute', left: '-7%', right: '-7%', bottom: '9.2%', height: '47%'};

  if (device === 'phone-modern') {
    style.bottom = '7%';
    style.height = '62%';
  }

  if (device === 'laptop-silver') {
    style.bottom = '10%';
    style.height = '42%';
  }

  if (angle === 'floating-hero') {
    style.bottom = '18%';
  }

  if (device !== 'full-screen') {
    style.bottom = liftBottom(style.bottom, deviceLift);
  }

  return style;
}

function angleTransform(angle: NonNullable<Scene['angle']>, device: NonNullable<Scene['device']>, isLandscape: boolean, isSquare: boolean): string {
  if (device === 'browser-window') return 'none';
  if (angle === 'front-center') return 'rotateX(24deg) rotateZ(0deg)';
  if (angle === 'floating-hero') return 'rotateX(8deg) rotateZ(-4deg)';
  if (angle === 'low-desk-right') return 'rotateX(54deg) rotateZ(7deg)';
  if (device === 'phone-modern') return 'rotateX(24deg) rotateZ(-6deg)';
  if (device === 'laptop-silver') return 'rotateX(42deg) rotateZ(-3deg)';
  return 'rotateX(54deg) rotateZ(-9deg)';
}

function cameraTransform(motion: NonNullable<Scene['motion']>, progress: number, motionAmount = sceneDefaults.motionAmount): string {
  const amount = Math.min(2.2, Math.max(0.5, Number.isFinite(motionAmount) ? motionAmount : sceneDefaults.motionAmount));
  const scale = (base: number) => 1 + base * amount;
  const pct = (base: number) => `${Number((base * amount).toFixed(3))}%`;
  if (motion === 'screen-focus') {
    return `scale(${interpolate(progress, [0, 1], [scale(0.02), scale(0.1)])}) translate3d(0%, ${pct(interpolate(progress, [0, 1], [0, -2]))}, 0)`;
  }
  if (motion === 'pan-left') {
    return `scale(${scale(0.06)}) translate3d(${pct(interpolate(progress, [0, 1], [2.2, -2.2]))}, ${pct(interpolate(progress, [0, 1], [0, -1]))}, 0)`;
  }
  if (motion === 'pan-right') {
    return `scale(${scale(0.06)}) translate3d(${pct(interpolate(progress, [0, 1], [-2.2, 2.2]))}, ${pct(interpolate(progress, [0, 1], [0, -1]))}, 0)`;
  }
  if (motion === 'device-tilt') {
    const cameraScale = interpolate(progress, [0, 0.35, 0.7, 1], [scale(0.055), scale(0.065), scale(0.06), scale(0.075)]);
    const x = interpolate(progress, [0, 0.35, 0.7, 1], [0, 0.7, -0.4, 0.2]);
    const y = interpolate(progress, [0, 0.35, 0.7, 1], [0, -0.7, -1.2, -1.6]);
    return `scale(${cameraScale}) translate3d(${pct(x)}, ${pct(y)}, 0)`;
  }
  if (motion === 'cta-push') {
    return `scale(${interpolate(progress, [0, 1], [scale(0.03), scale(0.12)])}) translate3d(0%, ${pct(interpolate(progress, [0, 1], [0, -2.6]))}, 0)`;
  }
  return `scale(${interpolate(progress, [0, 1], [scale(0.01), scale(0.06)])}) translate3d(0%, ${pct(interpolate(progress, [0, 1], [0, -1.2]))}, 0)`;
}

function deviceInset(device: NonNullable<Scene['device']>, isLandscape: boolean): number | string {
  if (device === 'phone-modern') return '2.8%';
  if (device === 'laptop-silver') return '1.7%';
  if (device === 'browser-window') return '2.7% 0.9% 0.9%';
  return '2.1%';
}

function deviceGlassInset(device: NonNullable<Scene['device']>, isLandscape: boolean): number | string {
  if (device === 'browser-window') return '2.5% 0.7% 0.7%';
  return '2%';
}

function deviceRadius(device: NonNullable<Scene['device']>, isLandscape: boolean): number {
  if (device === 'phone-modern') return 24;
  if (device === 'browser-window') return 8;
  return 26;
}

const TimelineAudio: React.FC<{
  src: string;
  volume?: number;
  playbackRate?: number;
  thumbnailBumper?: ResolvedThumbnailBumper | null;
  contentDurationSeconds: number;
  alignWithContent?: boolean;
}> = ({src, volume, playbackRate = 1, thumbnailBumper, contentDurationSeconds, alignWithContent = true}) => {
  const {fps} = useVideoConfig();
  const audio = <Audio src={src} volume={volume} playbackRate={playbackRate} />;
  if (!alignWithContent) return audio;
  const from = thumbnailBumper?.position === 'start'
    ? Math.max(1, Math.round((thumbnailBumper.durationSeconds / playbackRate) * fps))
    : 0;
  const durationInFrames = Math.max(1, Math.round((contentDurationSeconds / playbackRate) * fps));
  return <Sequence from={from} durationInFrames={durationInFrames}>{audio}</Sequence>;
};

const ThumbnailBumperOverlay: React.FC<{
  thumbnailSrc: string | null;
  thumbnailBumper: ResolvedThumbnailBumper | null;
  contentDurationSeconds: number;
  playbackRate: number;
}> = ({thumbnailSrc, thumbnailBumper, contentDurationSeconds, playbackRate}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!thumbnailSrc || !thumbnailBumper) return null;
  const projectSeconds = (frame / fps) * playbackRate;
  const isActive = thumbnailBumper.position === 'start'
    ? projectSeconds < thumbnailBumper.durationSeconds
    : projectSeconds >= contentDurationSeconds && projectSeconds < contentDurationSeconds + thumbnailBumper.durationSeconds;
  if (!isActive) return null;
  return (
    <AbsoluteFill style={{backgroundColor: '#020617', zIndex: 50}}>
      <Img
        src={thumbnailSrc}
        style={{
          width: '100%',
          height: '100%',
          objectFit: thumbnailBumper.fit,
        }}
      />
    </AbsoluteFill>
  );
};

const TimelineClips: React.FC<{
  clips: TimelineClip[];
  mode: TimelineClip['mode'];
  fit: React.CSSProperties['objectFit'];
  radius?: number;
  zoom?: number;
  overlay?: boolean;
  format?: PromoProps['format'];
}> = ({clips, mode, fit, radius = 0, zoom = 1, overlay = false, format = 'vertical'}) => {
  const {fps} = useVideoConfig();
  const overlayWidth = format === 'landscape' ? '28%' : format === 'square' ? '36%' : '42%';
  return (
    <>
      {clips.filter((clip) => clip.mode === mode && clip.asset).map((clip, index) => {
        const from = Math.max(0, Math.round(Number(clip.start || 0) * fps));
        const duration = Math.max(1, Math.round((Number(clip.end || 0) - Number(clip.start || 0)) * fps));
        const style: React.CSSProperties = overlay
          ? {
              position: 'absolute',
              right: format === 'landscape' ? '4%' : '5%',
              bottom: format === 'landscape' ? '6%' : '7%',
              width: overlayWidth,
              aspectRatio: '16 / 9',
              objectFit: fit,
              borderRadius: 14,
              zIndex: 7,
              boxShadow: '0 18px 58px rgba(0,0,0,.34)',
              border: '2px solid rgba(255,255,255,.72)',
            }
          : {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: fit,
              borderRadius: radius,
              transform: mode === 'device-screen' ? `translate3d(0, 0, 0) scale(${zoom})` : undefined,
              transformOrigin: 'center center',
            };
        return (
          <Sequence key={`${clip.asset}-${index}`} from={from} durationInFrames={duration}>
            <OffthreadVideo src={staticFile(clip.asset)} muted style={style} />
          </Sequence>
        );
      })}
    </>
  );
};

const ScreenVideo: React.FC<{screenSrc: string | null; radius: number; zoom?: number; loopFrames?: number; clips?: TimelineClip[]; playbackRate?: number; fit?: React.CSSProperties['objectFit']}> = ({screenSrc, radius, zoom = 1, loopFrames, clips = [], playbackRate = 1, fit = 'cover'}) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: fit,
    borderRadius: radius,
    transform: `translate3d(0, 0, 0) scale(${zoom})`,
    transformOrigin: 'center center',
    backfaceVisibility: 'hidden',
    willChange: 'transform',
  };

  if (!screenSrc) {
    return (
      <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderRadius: radius}}>
        <TimelineClips clips={clips} mode="device-screen" fit={fit} radius={radius} zoom={zoom} />
      </div>
    );
  }

  // OffthreadVideo extracts exact frames during render, which avoids decoder flicker on transformed device screens.
  const video = (
    <OffthreadVideo
      src={screenSrc}
      muted
      playbackRate={playbackRate}
      style={baseStyle}
    />
  );
  return (
    <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: radius, background: '#f8fafc'}}>
      {loopFrames && loopFrames > 1 ? <Loop durationInFrames={loopFrames}>{video}</Loop> : video}
      <TimelineClips clips={clips} mode="device-screen" fit={fit} radius={radius} zoom={zoom} />
    </div>
  );
};

const TabletMock: React.FC<{screenSrc: string | null}> = ({screenSrc}) => (
  <div style={{width: '92%', maxWidth: 900, aspectRatio: '1.35 / 1', padding: 24, borderRadius: 54, background: 'linear-gradient(145deg, #f8fafc, #cbd5e1)', boxShadow: '0 54px 120px rgba(0,0,0,.48)', border: '2px solid rgba(255,255,255,.6)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden', background: '#0f172a', boxShadow: 'inset 0 0 0 2px rgba(15,23,42,.22)'}}>
      <ScreenVideo screenSrc={screenSrc} radius={34} />
    </div>
  </div>
);

const LaptopMock: React.FC<{screenSrc: string | null}> = ({screenSrc}) => (
  <div style={{width: '96%', maxWidth: 980}}>
    <div style={{padding: 20, borderRadius: '34px 34px 18px 18px', background: 'linear-gradient(145deg, #e2e8f0, #94a3b8)', boxShadow: '0 54px 120px rgba(0,0,0,.5)'}}>
      <div style={{height: 34, display: 'flex', gap: 9, alignItems: 'center', paddingLeft: 12}}>
        <span style={{width: 13, height: 13, borderRadius: 99, background: '#ef4444'}} />
        <span style={{width: 13, height: 13, borderRadius: 99, background: '#f59e0b'}} />
        <span style={{width: 13, height: 13, borderRadius: 99, background: '#22c55e'}} />
      </div>
      <div style={{aspectRatio: '16 / 9', borderRadius: 18, overflow: 'hidden', background: '#020617'}}>
        <ScreenVideo screenSrc={screenSrc} radius={18} />
      </div>
    </div>
    <div style={{height: 34, width: '108%', marginLeft: '-4%', borderRadius: '0 0 48px 48px', background: 'linear-gradient(180deg,#cbd5e1,#64748b)', boxShadow: '0 35px 70px rgba(0,0,0,.36)'}} />
  </div>
);

const PhoneMock: React.FC<{screenSrc: string | null}> = ({screenSrc}) => (
  <div style={{height: '96%', aspectRatio: '9 / 18.5', padding: 18, borderRadius: 66, background: 'linear-gradient(145deg,#f8fafc,#64748b)', boxShadow: '0 54px 120px rgba(0,0,0,.5)'}}>
    <div style={{height: '100%', borderRadius: 46, overflow: 'hidden', background: '#020617', position: 'relative'}}>
      <div style={{position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)', width: 110, height: 24, borderRadius: 999, background: '#020617', zIndex: 5}} />
      <ScreenVideo screenSrc={screenSrc} radius={46} />
    </div>
  </div>
);

const CtaEndCard: React.FC<{cta: string; isLandscape: boolean}> = ({cta, isLandscape}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - fps * 24, fps, config: {damping: 14, stiffness: 120}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{
        padding: isLandscape ? '34px 58px' : '42px 58px',
        borderRadius: 999,
        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        color: 'white',
        fontSize: isLandscape ? 50 : 64,
        fontWeight: 950,
        letterSpacing: '-0.045em',
        boxShadow: '0 36px 110px rgba(6,182,212,.35)',
        transform: `scale(${interpolate(pop, [0, 1], [0.72, 1])})`,
        opacity: interpolate(pop, [0, 1], [0, 1]),
      }}>
        {cta}
      </div>
    </AbsoluteFill>
  );
};
