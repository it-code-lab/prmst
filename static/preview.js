const project = JSON.parse(document.querySelector('#projectData').textContent);
const stage = document.querySelector('#previewStage');
const screenCanvas = document.querySelector('#screenCanvas');
const screenVideo = document.querySelector('#screenVideo');
const deviceClipVideo = document.querySelector('#deviceClipVideo');
const fullClipVideo = document.querySelector('#fullClipVideo');
const backgroundClipVideo = document.querySelector('#backgroundClipVideo');
const overlayClipVideo = document.querySelector('#overlayClipVideo');
const backgroundImage = document.querySelector('#backgroundImage');
const customBackgroundVideo = document.querySelector('#customBackgroundVideo');
const animatedBackgroundLayer = document.querySelector('#animatedBackgroundLayer');
const logoImage = document.querySelector('#logoImage');
const captionChip = document.querySelector('#captionChip');
const ctaPill = document.querySelector('#ctaPill');
const thumbnailBumperImage = document.querySelector('#thumbnailBumperImage');
const playBtn = document.querySelector('#playBtn');
const pauseBtn = document.querySelector('#pauseBtn');
const resumeBtn = document.querySelector('#resumeBtn');
const stopBtn = document.querySelector('#stopBtn');
const replayBtn = document.querySelector('#replayBtn');
const cleanBtn = document.querySelector('#cleanBtn');
const renderBtn = document.querySelector('#renderBtn');
const mp4Link = document.querySelector('#mp4Link');
const renderStatus = document.querySelector('#renderStatus');
const sceneCamera = document.querySelector('.scene-camera');
const tabletStage = document.querySelector('.tablet-stage');
const captionStyleTray = document.querySelector('#captionStyleTray');
const captionPositionSelect = document.querySelector('#previewCaptionPosition');
const captionGroupModeSelect = document.querySelector('#previewCaptionGroupMode');
const captionWordsInput = document.querySelector('#previewWordsPerGroup');
const captionWordsValue = document.querySelector('#previewWordsValue');
const captionCountLabel = document.querySelector('#previewCaptionCountLabel');
const captionHighlightSelect = document.querySelector('#previewHighlightMode');
const captionSizeSelect = document.querySelector('#previewCaptionSize');
const captionFontSelect = document.querySelector('#previewCaptionFont');
const captionFontColorInput = document.querySelector('#previewCaptionFontColor');
const captionFontSizeInput = document.querySelector('#previewCaptionFontSize');
const captionFontSizeValue = document.querySelector('#previewCaptionFontSizeValue');
const captionWeightSelect = document.querySelector('#previewCaptionWeight');
const captionBoxModeSelect = document.querySelector('#previewCaptionBoxMode');
const captionParagraphAlignSelect = document.querySelector('#previewCaptionParagraphAlign');
const captionActiveStyleSelect = document.querySelector('#previewCaptionActiveStyle');
const captionActiveColorInput = document.querySelector('#previewCaptionActiveColor');
const resetCaptionPreviewBtn = document.querySelector('#resetCaptionPreviewBtn');
const captionTimingBadge = document.querySelector('#captionTimingBadge');
const voiceoverAudio = document.querySelector('#voiceoverAudio');
const musicAudio = document.querySelector('#musicAudio');
const voiceoverEnabled = document.querySelector('#voiceoverEnabled');
const voiceoverVolume = document.querySelector('#voiceoverVolume');
const voiceoverVolumeValue = document.querySelector('#voiceoverVolumeValue');
const musicEnabled = document.querySelector('#musicEnabled');
const musicVolume = document.querySelector('#musicVolume');
const musicVolumeValue = document.querySelector('#musicVolumeValue');
const musicDucking = document.querySelector('#musicDucking');
const audioStatus = document.querySelector('#audioStatus');
const musicCategorySelect = document.querySelector('#musicCategorySelect');
const musicTrackSelect = document.querySelector('#musicTrackSelect');
const applyMusicBtn = document.querySelector('#applyMusicBtn');
const musicLibraryStatus = document.querySelector('#musicLibraryStatus');
const previewScrubber = document.querySelector('#previewScrubber');
const currentTimeLabel = document.querySelector('#currentTimeLabel');
const durationTimeLabel = document.querySelector('#durationTimeLabel');
const previewSpeed = document.querySelector('#previewSpeed');
const recordReadyBtn = document.querySelector('#recordReadyBtn');
const recordCountdown = document.querySelector('#recordCountdown');
const screenCtx = screenCanvas?.getContext('2d', { alpha: false });

const assetUrl = (path) => path ? `/preview-assets/${path}` : '';
const BACKGROUNDS = {
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
  'story-diya-glow': 'assets/background-story-diya-glow.svg',
  'story-temple-lamps': 'assets/background-story-temple-lamps.svg',
  'story-devotional-aura': 'assets/background-story-devotional-aura.svg',
  'story-starry-night': 'assets/background-story-starry-night.svg',
  'story-moon-magic': 'assets/background-story-moon-magic.svg',
  'story-magic-forest': 'assets/background-story-magic-forest.svg',
  'story-haunted-mist': 'assets/background-story-haunted-mist.svg',
  'story-podcast-waves': 'assets/background-story-podcast-waves.svg',
  'story-talk': 'assets/background-story-talk.svg',
  'story-scary': 'assets/background-story-scary.svg',
  'custom-media': 'assets/background-custom-media.svg',
};
const ANIMATED_BACKGROUNDS = new Set([
  'story-diya-glow',
  'story-temple-lamps',
  'story-devotional-aura',
  'story-starry-night',
  'story-moon-magic',
  'story-magic-forest',
  'story-haunted-mist',
  'story-podcast-waves',
]);
const DEFAULT_SCENE = {
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
const CAPTION_STYLE_PRESETS = [
  { id: 'white-chip', label: 'White chip', sample: 'Clean' },
  { id: 'glass-card', label: 'Glass card', sample: 'Glass' },
  { id: 'bold-bottom', label: 'Bold bottom', sample: 'Bold' },
  { id: 'editorial-card', label: 'Editorial card', sample: 'Editorial' },
  { id: 'neon-ribbon', label: 'Neon ribbon', sample: 'Accent' },
  { id: 'kinetic-stack', label: 'Kinetic stack', sample: 'Stack' },
  { id: 'minimal-subtitle', label: 'Minimal subtitle', sample: 'Subtitle' },
  { id: 'device-callout', label: 'Device callout', sample: 'Callout' },
  { id: 'creator-pop', label: 'Creator pop', sample: 'Viral' },
  { id: 'karaoke-card', label: 'Karaoke card', sample: 'Karaoke' },
];
const CAPTION_FONT_STACKS = {
  Inter: 'Inter, Arial, sans-serif',
  Arial: 'Arial, Helvetica, sans-serif',
  Georgia: 'Georgia, "Times New Roman", serif',
  Merriweather: 'Merriweather, Georgia, serif',
  Verdana: 'Verdana, Geneva, sans-serif',
  'Trebuchet MS': '"Trebuchet MS", Arial, sans-serif',
  Tahoma: 'Tahoma, Geneva, sans-serif',
  'Comic Sans MS': '"Comic Sans MS", "Comic Sans", cursive',
  'Hindi Kids': '"Baloo 2", "Noto Sans Devanagari", "Nirmala UI", Mangal, sans-serif',
  'Hindi Story': '"Noto Serif Devanagari", Kokila, Mangal, "Nirmala UI", serif',
  'Hindi Devotional': '"Tiro Devanagari Hindi", "Noto Serif Devanagari", Kokila, Mangal, serif',
  'Hindi Scary': 'Kalam, "Noto Sans Devanagari", "Nirmala UI", Mangal, cursive',
};
const CAPTION_WORD_MAX = 8;
const CAPTION_SENTENCE_MAX = 12;
const scenes = Array.isArray(project.scenes) ? project.scenes : [];
const clips = Array.isArray(project.clips) ? project.clips : [];
const duration = Math.max(5, Number(project.durationSeconds || 30));
const thumbnailBumper = normalizeThumbnailBumper(project.thumbnailBumper, project.assets?.thumbnail);
const totalDuration = duration + (thumbnailBumper ? thumbnailBumper.durationSeconds : 0);
const layout = normalizeLayoutSettings(project.layout);
const ctaStart = Math.max(0, duration - 5.6);
const captionTimeline = scenes.map((scene) => {
  const words = sceneWords(scene);
  return { scene, words, timingSource: words.some((word) => word.source === 'voiceover') ? 'voiceover' : 'estimated' };
});
const captionTimelineWords = captionTimeline.flatMap((entry) => (
  entry.words.map((word, index) => ({
    ...word,
    sentenceBreak: index === entry.words.length - 1,
  }))
));
const previewSettingsKey = `promo-preview-captions:${project.id || 'default'}`;
const audioSettingsKey = `promo-preview-audio:${project.id || 'default'}`;
let activeSceneKey = '';
let animationFrame = null;
let activeCaptionGroupKey = '';
let lastCaptionRenderKey = '';
let previewCaptionSettings = loadPreviewCaptionSettings();
let previewAudioSettings = loadPreviewAudioSettings();
let musicLibraryCategories = [];
let playbackState = 'stopped';
let previewStartedAt = 0;
let pausedProjectTime = 0;
let playbackRate = Number(project.previewSettings?.playbackRate || 1);
let isScrubbing = false;
let countdownTimer = null;
let previewSettingsSaveTimer = null;

stage.classList.remove('vertical', 'landscape', 'square');
stage.classList.add(project.format || 'vertical');
stage.style.setProperty('--device-lift', `${layout.deviceLift}%`);
stage.style.setProperty('--cta-lift', `${layout.ctaLift}%`);
backgroundImage.src = assetUrl(BACKGROUNDS[DEFAULT_SCENE.background]);

if (project.assets?.screen) {
  screenVideo.src = assetUrl(project.assets.screen);
}

if (project.assets?.voiceover && voiceoverAudio) {
  voiceoverAudio.src = assetUrl(project.assets.voiceover);
}

if (musicAudio) {
  const initialMusicAsset = previewAudioSettings.musicAsset || project.assets?.backgroundMusic || '';
  setMusicSource(initialMusicAsset);
}

if (project.assets?.logo) {
  logoImage.src = assetUrl(project.assets.logo);
  logoImage.classList.remove('hidden');
}

if (thumbnailBumper && thumbnailBumperImage) {
  thumbnailBumperImage.src = assetUrl(project.assets.thumbnail);
  thumbnailBumperImage.style.objectFit = thumbnailBumper.fit;
}

ctaPill.textContent = project.cta || 'Try it free today';

function normalizeThumbnailBumper(settings, asset) {
  if (!asset) return null;
  const position = settings?.position;
  if (position !== 'start' && position !== 'end') return null;
  const durationSeconds = Math.min(2, Math.max(0.1, Number(settings?.durationSeconds || 0.5)));
  return {
    position,
    durationSeconds,
    fit: settings?.fit === 'contain' ? 'contain' : 'cover',
  };
}

function normalizeLayoutSettings(settings) {
  const number = (value, max) => Math.min(max, Math.max(0, Number(value || 0)));
  return {
    deviceLift: number(settings?.deviceLift, 16),
    ctaLift: number(settings?.ctaLift, 12),
  };
}

function contentTimeFromPreviewTime(seconds) {
  if (!thumbnailBumper) return Math.min(duration, Math.max(0, seconds));
  if (thumbnailBumper.position === 'start') {
    return Math.min(duration, Math.max(0, seconds - thumbnailBumper.durationSeconds));
  }
  return Math.min(duration, Math.max(0, seconds));
}

function isThumbnailBumperTime(seconds) {
  if (!thumbnailBumper) return false;
  return thumbnailBumper.position === 'start'
    ? seconds < thumbnailBumper.durationSeconds
    : seconds >= duration && seconds < totalDuration;
}

function activeSceneEntry(seconds) {
  const entry = captionTimeline.find((item) => seconds >= Number(item.scene.start || 0) && seconds < Number(item.scene.end || 0))
    || nearestPreviousSceneEntry(seconds)
    || nearestFirstSceneEntry()
    || { scene: {}, words: [], timingSource: 'estimated' };
  return { scene: { ...DEFAULT_SCENE, ...entry.scene }, words: entry.words, timingSource: entry.timingSource };
}

function activeScene(seconds) {
  return activeSceneEntry(seconds).scene;
}

function nearestPreviousSceneEntry(seconds) {
  return captionTimeline.reduce((best, item) => {
    const end = Number(item.scene.end || item.scene.start || 0);
    const bestEnd = best ? Number(best.scene.end || best.scene.start || 0) : -Infinity;
    return seconds >= end && end >= bestEnd ? item : best;
  }, null);
}

function nearestFirstSceneEntry() {
  return captionTimeline.reduce((best, item) => {
    const start = Number(item.scene.start || 0);
    const bestStart = best ? Number(best.scene.start || 0) : Infinity;
    return start < bestStart ? item : best;
  }, null);
}

function sceneWords(scene) {
  const start = Number(scene.start || 0);
  const end = Math.max(start + 0.4, Number(scene.end || start + 3));
  const storedWords = Array.isArray(scene.words) ? scene.words : [];
  if (storedWords.length) {
    return storedWords
      .map((word) => ({
        text: cleanWord(word.text || word.word || ''),
        start: Number(word.start ?? start),
        end: Number(word.end ?? word.start ?? end),
        source: word.source || 'voiceover',
      }))
      .filter((word) => word.text)
      .map((word, index, words) => ({
        ...word,
        start: Number.isFinite(word.start) ? word.start : start,
        end: Number.isFinite(word.end) && word.end > word.start ? word.end : (words[index + 1]?.start || end),
      }));
  }

  const source = String(scene.narration || scene.caption || project.title || '').replace(/\n+/g, ' ');
  const words = source.match(/[^\s]+/g) || [];
  const span = (end - start) / Math.max(1, words.length);
  return words.map((word, index) => ({
    text: cleanWord(word),
    start: start + index * span,
    end: start + (index + 1) * span,
    source: 'estimated',
  })).filter((word) => word.text);
}

function cleanWord(word) {
  return String(word || '').replace(/\s+/g, ' ').trim();
}

function setCaption(caption, scene, seconds, words = []) {
  const sourceWords = previewCaptionSettings.groupMode === 'sentences' && captionTimelineWords.length
    ? captionTimelineWords
    : words;
  const group = captionGroup(sourceWords, scene, seconds);
  const boxMode = previewCaptionSettings.boxMode === 'lines' ? 'lines' : 'single';
  const fallbackLines = String(caption || project.title || '').split(/\n+/).filter(Boolean).map((line) => line.split(/\s+/).filter(Boolean));
  const lines = group.words.length
    ? (boxMode === 'lines' ? splitCaptionWords(group.words) : [group.words])
    : (boxMode === 'lines' ? fallbackLines : [fallbackLines.flat()]);
  const groupKey = `${scene?.start || 0}|${group.words.map((word) => word.text).join(' ')}`;
  const renderKey = `${groupKey}|${group.activeIndex}|${previewCaptionSettings.groupMode}|${previewCaptionSettings.wordsPerGroup}|${previewCaptionSettings.sentencesPerGroup}|${previewCaptionSettings.highlightMode}|${previewCaptionSettings.boxMode}|${previewCaptionSettings.paragraphAlign}|${previewCaptionSettings.fontFamily}|${previewCaptionSettings.fontColor}|${previewCaptionSettings.fontSizePercent}|${previewCaptionSettings.fontWeight}|${previewCaptionSettings.activeStyle}|${previewCaptionSettings.activeColor}|${stage.dataset.captionStyle}|${stage.dataset.captionPosition}|${stage.dataset.captionSize}`;

  if (lastCaptionRenderKey === renderKey) return;
  lastCaptionRenderKey = renderKey;

  if (activeCaptionGroupKey !== groupKey) {
    activeCaptionGroupKey = groupKey;
    captionChip.style.animation = 'none';
    void captionChip.offsetWidth;
    captionChip.style.animation = '';
  }

  captionChip.innerHTML = '';
  lines.forEach((lineWords) => {
    const line = document.createElement('span');
    line.className = 'caption-line';
    lineWords.forEach((word, index) => {
      const wordEl = document.createElement('i');
      const wordText = typeof word === 'string' ? word : word.text;
      wordEl.textContent = wordText;
      if (typeof word !== 'string') {
        wordEl.classList.toggle('is-active', word.index === group.activeIndex);
        wordEl.classList.toggle('is-past', word.index < group.activeIndex);
        wordEl.style.setProperty('--word-progress', String(wordProgress(word, seconds)));
      }
      line.appendChild(wordEl);
      if (index < lineWords.length - 1) {
        line.appendChild(document.createTextNode(' '));
      }
    });
    captionChip.appendChild(line);
  });
}

function captionGroup(words, scene, seconds) {
  const timedWords = words.length ? words : sceneWords(scene || {});
  return previewCaptionSettings.groupMode === 'sentences'
    ? captionSentenceGroup(timedWords, scene, seconds)
    : captionWordGroup(timedWords, scene, seconds);
}

function captionWordGroup(words, scene, seconds) {
  if (!words.length) return { words: [], activeIndex: -1 };
  const activeIndex = activeCaptionWordIndex(words, seconds);
  const wordsPerGroup = clampCaptionCount(previewCaptionSettings.wordsPerGroup, 1, CAPTION_WORD_MAX, 3);
  const groupStart = Math.floor(activeIndex / wordsPerGroup) * wordsPerGroup;
  return {
    words: words.slice(groupStart, groupStart + wordsPerGroup).map((word, offset) => captionToken(word, groupStart + offset, activeIndex, seconds)),
    activeIndex,
  };
}

function captionSentenceGroup(words, scene, seconds) {
  if (!words.length) return { words: [], activeIndex: -1 };
  const activeIndex = activeCaptionWordIndex(words, seconds);
  const groups = sentenceIndexGroups(words);
  const activeSentenceIndex = Math.max(0, groups.findIndex((indexes) => indexes.includes(activeIndex)));
  const sentencesPerGroup = clampCaptionCount(previewCaptionSettings.sentencesPerGroup, 1, CAPTION_SENTENCE_MAX, 1);
  const sentenceStart = Math.floor(activeSentenceIndex / sentencesPerGroup) * sentencesPerGroup;
  const visibleIndexes = groups.slice(sentenceStart, sentenceStart + sentencesPerGroup).flat();
  return {
    words: visibleIndexes.map((index) => captionToken(words[index], index, activeIndex, seconds)),
    activeIndex,
  };
}

function sentenceIndexGroups(words) {
  const groups = [];
  let current = [];
  words.forEach((word, index) => {
    current.push(index);
    if (/[.!?\u0964]$/.test(word.text) || word.sentenceBreak) {
      groups.push(current);
      current = [];
    }
  });
  if (current.length) groups.push(current);
  return groups;
}

function activeCaptionWordIndex(words, seconds) {
  const foundIndex = words.findIndex((word, index) => {
    const nextStart = words[index + 1]?.start ?? word.end;
    return seconds >= word.start && seconds < Math.max(word.end, nextStart);
  });
  return foundIndex === -1
    ? (seconds < words[0].start ? 0 : words.length - 1)
    : foundIndex;
}

function captionToken(word, index, activeIndex, seconds) {
  return {
    ...word,
    index,
    active: index === activeIndex,
    past: index < activeIndex,
    progress: wordProgress(word, seconds),
  };
}

function clampCaptionCount(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
}

function safeHexColor(value, fallback) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function previewCaptionFontSizePx(captionSize) {
  const base = {
    compact: 19,
    standard: 24,
    large: 31,
    hero: 42,
  }[captionSize || 'standard'] || 24;
  return Math.round(base * (clampCaptionCount(previewCaptionSettings.fontSizePercent, 70, 180, 100) / 100));
}

function splitCaptionWords(words) {
  if (words.length <= 4) return [words];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint), words.slice(midpoint)];
}

function wordProgress(word, seconds) {
  const length = Math.max(0.08, Number(word.end || 0) - Number(word.start || 0));
  return Math.min(1, Math.max(0, (seconds - Number(word.start || 0)) / length));
}

function updatePreview() {
  const seconds = currentProjectTime();
  const contentSeconds = contentTimeFromPreviewTime(seconds);
  const bumperActive = isThumbnailBumperTime(seconds);
  const entry = activeSceneEntry(contentSeconds);
  const scene = entry.scene;
  applySceneDesign(scene);
  const activeDeviceClip = activeClip('device-screen', contentSeconds);
  updateDeviceStageVisibility(scene, activeDeviceClip);
  updateDeviceClipSource(activeDeviceClip, contentSeconds);
  updateTimelineClips(contentSeconds);
  drawDeviceScreen(activeDeviceClip);
  setCaption(scene?.caption || project.title, scene, contentSeconds, entry.words);
  setTraySelected(effectiveCaptionStyle(scene));
  setTimingBadge(entry.timingSource);
  updateTransport(seconds);
  ctaPill.classList.toggle('hidden', bumperActive || contentSeconds < ctaStart);
  thumbnailBumperImage?.classList.toggle('hidden', !bumperActive);

  if (seconds >= totalDuration) {
    stopPreview({ reset: false, render: false });
  } else if (playbackState === 'playing') {
    animationFrame = requestAnimationFrame(updatePreview);
  }
}

function applySceneDesign(scene) {
  const captionStyle = effectiveCaptionStyle(scene);
  const captionPosition = previewCaptionSettings.position || scene.captionPosition || DEFAULT_SCENE.captionPosition;
  const captionSize = previewCaptionSettings.size || scene.captionSize || DEFAULT_SCENE.captionSize;
  const sceneKey = [
    scene.start,
    scene.background,
    scene.device,
    scene.angle,
    scene.motion,
    scene.motionAmount,
    scene.transition,
    captionStyle,
    captionPosition,
    'none',
    captionSize,
    scene.captionAccent,
    previewCaptionSettings.groupMode,
    previewCaptionSettings.wordsPerGroup,
    previewCaptionSettings.sentencesPerGroup,
    previewCaptionSettings.highlightMode,
    previewCaptionSettings.boxMode,
    previewCaptionSettings.paragraphAlign,
    previewCaptionSettings.fontFamily,
    previewCaptionSettings.fontColor,
    previewCaptionSettings.fontSizePercent,
    previewCaptionSettings.fontWeight,
    previewCaptionSettings.activeStyle,
    previewCaptionSettings.activeColor,
  ].join('|');

  if (activeSceneKey !== sceneKey) {
    activeSceneKey = sceneKey;
    applyBackgroundMedia(scene.background);
    if (ANIMATED_BACKGROUNDS.has(scene.background)) {
      stage.dataset.animatedBackground = scene.background;
      animatedBackgroundLayer?.classList.remove('hidden');
    } else {
      delete stage.dataset.animatedBackground;
      animatedBackgroundLayer?.classList.add('hidden');
    }
    stage.dataset.transition = scene.transition || DEFAULT_SCENE.transition;
    stage.dataset.captionStyle = captionStyle;
    stage.dataset.captionPosition = captionPosition;
    stage.dataset.captionAnimation = 'none';
    stage.dataset.captionSize = captionSize;
    stage.dataset.captionAccent = scene.captionAccent || DEFAULT_SCENE.captionAccent;
    stage.dataset.highlightMode = previewCaptionSettings.highlightMode || 'word';
    stage.dataset.captionBoxMode = previewCaptionSettings.boxMode === 'lines' ? 'lines' : 'single';
    stage.dataset.paragraphAlign = ['left', 'center', 'right', 'justify'].includes(previewCaptionSettings.paragraphAlign) ? previewCaptionSettings.paragraphAlign : 'center';
    stage.dataset.activeWordStyle = previewCaptionSettings.activeStyle || 'color';
    stage.dataset.captionColor = previewCaptionSettings.fontColor ? 'custom' : 'scene';
    captionChip.style.setProperty('--caption-user-font', CAPTION_FONT_STACKS[previewCaptionSettings.fontFamily] || 'inherit');
    captionChip.style.setProperty('--caption-user-color', safeHexColor(previewCaptionSettings.fontColor, '#ffffff'));
    captionChip.style.setProperty('--caption-active-color', safeHexColor(previewCaptionSettings.activeColor, '#facc15'));
    captionChip.style.setProperty('--caption-font', `${previewCaptionFontSizePx(captionSize)}px`);
    captionChip.style.setProperty('--caption-user-weight', previewCaptionSettings.fontWeight || '850');
    sceneCamera.dataset.motion = scene.motion || DEFAULT_SCENE.motion;
    tabletStage.dataset.device = scene.device || DEFAULT_SCENE.device;
    tabletStage.dataset.angle = scene.angle || DEFAULT_SCENE.angle;
    setCameraMotionVars(scene);
    sceneCamera.style.animation = 'none';
    void sceneCamera.offsetWidth;
    sceneCamera.style.animation = '';
  }

  const localDuration = Math.max(0.5, Number(scene.end || duration) - Number(scene.start || 0));
  const localProgress = Math.min(1, Math.max(0, (contentTimeFromPreviewTime(currentProjectTime()) - Number(scene.start || 0)) / localDuration));
  const zoomBase = Number(scene.screenZoom || DEFAULT_SCENE.screenZoom);
  if (screenCanvas) screenCanvas.style.transform = `translate3d(0, 0, 0) scale(${zoomBase})`;
}

function applyBackgroundMedia(background) {
  const customAsset = project.assets?.customBackground || '';
  if (background === 'custom-media' && customAsset) {
    const src = assetUrl(customAsset);
    if (isVideoAsset(customAsset)) {
      if (customBackgroundVideo && customBackgroundVideo.src !== location.origin + src && customBackgroundVideo.getAttribute('src') !== src) {
        customBackgroundVideo.src = src;
      }
      customBackgroundVideo?.classList.remove('hidden');
      backgroundImage?.classList.add('hidden');
      return;
    }
    if (backgroundImage) {
      backgroundImage.src = src;
      backgroundImage.classList.remove('hidden');
    }
    customBackgroundVideo?.classList.add('hidden');
    customBackgroundVideo?.pause();
    return;
  }

  if (backgroundImage) {
    backgroundImage.src = assetUrl(BACKGROUNDS[background] || BACKGROUNDS[DEFAULT_SCENE.background]);
    backgroundImage.classList.remove('hidden');
  }
  customBackgroundVideo?.classList.add('hidden');
  customBackgroundVideo?.pause();
}

function isVideoAsset(asset) {
  return /\.(mp4|mov|webm|mkv)$/i.test(String(asset || '').split('?')[0]);
}

function updateTimelineClips(seconds) {
  updateCustomBackgroundVideo(seconds);
  showTimelineClip(backgroundClipVideo, activeClip('background', seconds), seconds);
  showTimelineClip(fullClipVideo, activeClip('full-screen', seconds), seconds);
  showTimelineClip(overlayClipVideo, activeClip('overlay', seconds), seconds);
}

function updateCustomBackgroundVideo(seconds) {
  if (!customBackgroundVideo || customBackgroundVideo.classList.contains('hidden') || !customBackgroundVideo.src) return;
  try {
    customBackgroundVideo.currentTime = Number.isFinite(customBackgroundVideo.duration) && customBackgroundVideo.duration > 0
      ? seconds % customBackgroundVideo.duration
      : seconds;
  } catch {
    // Ignore media that is not seekable yet.
  }
  if (playbackState === 'playing') {
    customBackgroundVideo.play().catch(() => {});
  }
}

function updateDeviceStageVisibility(scene, activeDeviceClip) {
  const hideDevice = scene?.device === 'full-screen' && !project.assets?.screen && !activeDeviceClip;
  tabletStage?.classList.toggle('hidden', hideDevice);
}

function activeClip(mode, seconds) {
  return clips.find((clip) => clip.mode === mode && clip.asset && seconds >= Number(clip.start || 0) && seconds < Number(clip.end || 0));
}

function updateDeviceClipSource(clip, seconds) {
  if (!deviceClipVideo) return;
  if (!clip) {
    deviceClipVideo.pause();
    return;
  }
  syncClipVideo(deviceClipVideo, clip, seconds);
}

function showTimelineClip(video, clip, seconds, options = {}) {
  if (!video) return;
  if (!clip) {
    video.classList.add('hidden');
    video.pause();
    return;
  }

  syncClipVideo(video, clip, seconds);
  video.classList.remove('hidden');
  video.muted = true;
  video.style.objectFit = options.coverScreen ? 'cover' : 'cover';
  if (playbackState === 'playing') {
    video.play().catch(() => {});
  }
}

function syncClipVideo(video, clip, seconds) {
  const src = assetUrl(clip.asset);
  if (video.dataset.clipAsset !== clip.asset) {
    video.dataset.clipAsset = clip.asset;
    video.src = src;
    video.load();
  }

  const clipStart = Number(clip.start || 0);
  let targetTime = Math.max(0, seconds - clipStart);
  const mediaDuration = Number(video.duration || clip.durationSeconds || 0);
  if (mediaDuration > 0.2 && Number.isFinite(mediaDuration)) {
    targetTime %= mediaDuration;
  }

  try {
    if (Math.abs(Number(video.currentTime || 0) - targetTime) > 0.22 || video.paused) {
      video.currentTime = targetTime;
    }
  } catch {
    // Some browsers reject seeking until enough metadata has loaded.
  }

  video.muted = true;
  if (playbackState === 'playing') {
    video.play().catch(() => {});
  }
}

function drawDeviceScreen(activeDeviceClip) {
  if (!screenCanvas || !screenCtx) return;
  const source = activeDeviceClip && deviceClipVideo?.readyState >= 2 ? deviceClipVideo : screenVideo;

  const cssWidth = screenCanvas.clientWidth || 1;
  const cssHeight = screenCanvas.clientHeight || 1;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = Math.max(2, Math.round(cssWidth * dpr));
  const height = Math.max(2, Math.round(cssHeight * dpr));
  if (screenCanvas.width !== width || screenCanvas.height !== height) {
    screenCanvas.width = width;
    screenCanvas.height = height;
  }

  screenCtx.save();
  screenCtx.setTransform(1, 0, 0, 1, 0, 0);
  if (!source || source.readyState < 2 || !source.videoWidth || !source.videoHeight) {
    drawFallbackScreen(width, height);
    screenCtx.restore();
    return;
  }
  screenCtx.fillStyle = '#f8fafc';
  screenCtx.fillRect(0, 0, width, height);

  const containsScreen = tabletStage?.dataset.device === 'browser-window';
  const scale = containsScreen
    ? Math.min(width / source.videoWidth, height / source.videoHeight)
    : Math.max(width / source.videoWidth, height / source.videoHeight);
  const drawWidth = source.videoWidth * scale;
  const drawHeight = source.videoHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  screenCtx.drawImage(source, x, y, drawWidth, drawHeight);
  screenCtx.restore();
}

function drawFallbackScreen(width, height) {
  const gradient = screenCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1e293b');
  gradient.addColorStop(1, '#0f172a');
  screenCtx.fillStyle = gradient;
  screenCtx.fillRect(0, 0, width, height);
}

function setTimingBadge(source) {
  if (!captionTimingBadge) return;
  const isVoiceover = source === 'voiceover';
  captionTimingBadge.textContent = isVoiceover ? 'Timing: voiceover words' : 'Timing: estimated';
  captionTimingBadge.classList.toggle('is-voiceover', isVoiceover);
  stage.dataset.wordTimingSource = isVoiceover ? 'voiceover' : 'estimated';
}

function effectiveCaptionStyle(scene) {
  return previewCaptionSettings.style || scene.captionStyle || DEFAULT_SCENE.captionStyle;
}

function setCaptionMotionVars(scene) {
  const amount = clamp(Number(scene.captionAnimationAmount || DEFAULT_SCENE.captionAnimationAmount), 0.5, 2.2);
  captionChip.style.setProperty('--caption-rise-y', `${Math.round(16 * amount)}px`);
  captionChip.style.setProperty('--caption-pop-start', String(Math.max(0.76, 1 - (0.12 * amount))));
  captionChip.style.setProperty('--caption-slide-x', `${Math.round(-18 * amount)}px`);
  captionChip.style.setProperty('--caption-type-steps', '22');
}

function setCameraMotionVars(scene) {
  const amount = clamp(Number(scene.motionAmount || DEFAULT_SCENE.motionAmount), 0.5, 2.2);
  const motion = scene.motion || DEFAULT_SCENE.motion;
  const scale = (base) => Number((1 + base * amount).toFixed(4));
  const pct = (base) => `${Number((base * amount).toFixed(3))}%`;
  const vars = {
    '--camera-start-scale': 1,
    '--camera-end-scale': scale(0.06),
    '--camera-start-x': '0%',
    '--camera-end-x': '0%',
    '--camera-start-y': '0%',
    '--camera-mid-x': '0%',
    '--camera-mid-y': '0%',
    '--camera-late-x': '0%',
    '--camera-late-y': '0%',
    '--camera-end-y': pct(-1.2),
  };

  if (motion === 'screen-focus') {
    vars['--camera-start-scale'] = scale(0.02);
    vars['--camera-end-scale'] = scale(0.1);
    vars['--camera-end-y'] = pct(-2);
  } else if (motion === 'pan-left') {
    vars['--camera-start-scale'] = vars['--camera-end-scale'] = scale(0.06);
    vars['--camera-start-x'] = pct(2.2);
    vars['--camera-end-x'] = pct(-2.2);
    vars['--camera-end-y'] = pct(-1);
  } else if (motion === 'pan-right') {
    vars['--camera-start-scale'] = vars['--camera-end-scale'] = scale(0.06);
    vars['--camera-start-x'] = pct(-2.2);
    vars['--camera-end-x'] = pct(2.2);
    vars['--camera-end-y'] = pct(-1);
  } else if (motion === 'device-tilt') {
    vars['--camera-start-scale'] = scale(0.055);
    vars['--camera-mid-scale'] = scale(0.065);
    vars['--camera-late-scale'] = scale(0.06);
    vars['--camera-end-scale'] = scale(0.075);
    vars['--camera-mid-x'] = pct(0.7);
    vars['--camera-mid-y'] = pct(-0.7);
    vars['--camera-late-x'] = pct(-0.4);
    vars['--camera-late-y'] = pct(-1.2);
    vars['--camera-end-x'] = pct(0.2);
    vars['--camera-end-y'] = pct(-1.6);
  } else if (motion === 'cta-push') {
    vars['--camera-start-scale'] = scale(0.03);
    vars['--camera-end-scale'] = scale(0.12);
    vars['--camera-end-y'] = pct(-2.6);
  } else {
    vars['--camera-start-scale'] = scale(0.01);
  }

  Object.entries(vars).forEach(([name, value]) => {
    sceneCamera.style.setProperty(name, value);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : DEFAULT_SCENE.motionAmount));
}

function mediaElements() {
  return [screenVideo, deviceClipVideo, backgroundClipVideo, fullClipVideo, overlayClipVideo, customBackgroundVideo, voiceoverAudio, musicAudio].filter(Boolean);
}

function currentProjectTime() {
  if (playbackState === 'playing') {
    return Math.min(totalDuration, Math.max(0, ((performance.now() - previewStartedAt) / 1000) * playbackRate));
  }
  return Math.min(totalDuration, Math.max(0, pausedProjectTime));
}

function audibleElements() {
  const items = [];
  if (voiceoverAudio?.src && previewAudioSettings.voiceoverEnabled) items.push(voiceoverAudio);
  if (musicAudio?.src && previewAudioSettings.musicEnabled) items.push(musicAudio);
  return items;
}

function syncAudioToVideo() {
  const seconds = currentProjectTime();
  const contentSeconds = contentTimeFromPreviewTime(seconds);
  audibleElements().forEach((media) => {
    try {
      media.currentTime = media === musicAudio && media.duration && Number.isFinite(media.duration)
        ? contentSeconds % media.duration
        : contentSeconds;
    } catch {
      // Some browsers disallow setting currentTime until metadata is ready.
    }
  });
}

function applyAudioSettings() {
  if (voiceoverAudio) {
    voiceoverAudio.volume = previewAudioSettings.voiceoverVolume;
    voiceoverAudio.muted = !previewAudioSettings.voiceoverEnabled || !voiceoverAudio.src;
  }
  if (musicAudio) {
    musicAudio.volume = effectiveMusicVolume();
    musicAudio.muted = !previewAudioSettings.musicEnabled || !musicAudio.src;
  }
  if (voiceoverEnabled) voiceoverEnabled.checked = previewAudioSettings.voiceoverEnabled;
  if (voiceoverVolume) voiceoverVolume.value = String(previewAudioSettings.voiceoverVolume);
  if (voiceoverVolumeValue) voiceoverVolumeValue.textContent = `${Math.round(previewAudioSettings.voiceoverVolume * 100)}%`;
  if (musicEnabled) musicEnabled.checked = previewAudioSettings.musicEnabled;
  if (musicVolume) musicVolume.value = String(previewAudioSettings.musicVolume);
  if (musicVolumeValue) {
    const ducked = previewAudioSettings.musicDucking && voiceoverAudio?.src && previewAudioSettings.voiceoverEnabled;
    musicVolumeValue.textContent = ducked
      ? `${Math.round(effectiveMusicVolume() * 100)}% ducked`
      : `${Math.round(previewAudioSettings.musicVolume * 100)}%`;
  }
  if (musicDucking) musicDucking.checked = previewAudioSettings.musicDucking !== false;
  updateAudioStatus();
}

function effectiveMusicVolume() {
  const base = Number(previewAudioSettings.musicVolume || 0);
  const shouldDuck = previewAudioSettings.musicDucking !== false && voiceoverAudio?.src && previewAudioSettings.voiceoverEnabled;
  return Math.min(1, Math.max(0, shouldDuck ? base * 0.35 : base));
}

function updateAudioStatus(message = '') {
  if (!audioStatus) return;
  const hasVoice = Boolean(voiceoverAudio?.src);
  const hasMusic = Boolean(musicAudio?.src);
  audioStatus.textContent = message || [
    hasVoice ? 'Voiceover' : '',
    hasMusic ? `Music${previewAudioSettings.musicDucking !== false && hasVoice ? ' ducked' : ''}` : '',
  ].filter(Boolean).join(' + ') || 'No preview audio';
  audioStatus.classList.toggle('has-audio', hasVoice || hasMusic);
}

function loadPreviewAudioSettings() {
  const defaults = {
    voiceoverEnabled: true,
    voiceoverVolume: 1.0,
    voiceoverDefaultVersion: 2,
    musicEnabled: true,
    musicVolume: 0.18,
    musicAsset: '',
    musicDucking: true,
  };
  const projectSettings = migratePreviewAudioDefaults(project.previewSettings?.audio || {});
  try {
    return { ...defaults, ...projectSettings, ...migratePreviewAudioDefaults(JSON.parse(localStorage.getItem(audioSettingsKey) || '{}')) };
  } catch {
    return { ...defaults, ...projectSettings };
  }
}

function migratePreviewAudioDefaults(settings) {
  const migrated = settings && typeof settings === 'object' ? { ...settings } : {};
  const isOldDefault = Number(migrated.voiceoverVolume) === 0.9 && Number(migrated.voiceoverDefaultVersion || 1) < 2;
  if (isOldDefault) migrated.voiceoverVolume = 1.0;
  if (migrated.voiceoverVolume === undefined) migrated.voiceoverVolume = 1.0;
  migrated.voiceoverDefaultVersion = 2;
  if (migrated.musicAsset === undefined) migrated.musicAsset = '';
  if (migrated.musicDucking === undefined) migrated.musicDucking = true;
  return migrated;
}

function savePreviewAudioSettings() {
  previewAudioSettings.voiceoverDefaultVersion = 2;
  localStorage.setItem(audioSettingsKey, JSON.stringify(previewAudioSettings));
  schedulePreviewSettingsSave();
}

async function loadMusicLibrary() {
  try {
    const response = await fetch('/api/music-library', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load music library.');
    musicLibraryCategories = Array.isArray(data.categories) ? data.categories : [];
    renderMusicLibraryControls();
  } catch (error) {
    if (musicCategorySelect) musicCategorySelect.innerHTML = '<option value="">Music unavailable</option>';
    if (musicTrackSelect) musicTrackSelect.innerHTML = '<option value="">No tracks</option>';
    if (musicLibraryStatus) musicLibraryStatus.textContent = String(error.message || error);
  }
}

function renderMusicLibraryControls() {
  if (!musicCategorySelect || !musicTrackSelect) return;
  const categoriesWithTracks = musicLibraryCategories.filter((category) => Array.isArray(category.tracks) && category.tracks.length);
  musicCategorySelect.innerHTML = [
    '<option value="">All categories</option>',
    ...musicLibraryCategories.map((category) => `<option value="${escapeAttribute(category.id)}">${escapeHtml(category.label || category.id)} (${category.tracks?.length || 0})</option>`),
  ].join('');

  const selectedAsset = previewAudioSettings.musicAsset || '';
  const selectedCategory = musicLibraryCategories.find((category) => category.tracks?.some((track) => track.asset === selectedAsset))?.id
    || categoriesWithTracks[0]?.id
    || '';
  musicCategorySelect.value = selectedCategory;
  renderMusicTrackOptions(selectedCategory, selectedAsset);
  updateMusicLibraryStatus();
}

function renderMusicTrackOptions(categoryId = musicCategorySelect?.value || '', selectedAsset = previewAudioSettings.musicAsset || '') {
  if (!musicTrackSelect) return;
  const tracks = musicLibraryCategories
    .filter((category) => !categoryId || category.id === categoryId)
    .flatMap((category) => (category.tracks || []).map((track) => ({ ...track, categoryLabel: category.label || category.id })));
  const uploadedOption = project.assets?.backgroundMusic
    ? `<option value="">Uploaded project music</option>`
    : '<option value="">No library music</option>';
  musicTrackSelect.innerHTML = uploadedOption + tracks.map((track) => (
    `<option value="${escapeAttribute(track.asset)}">${escapeHtml(track.title)} · ${escapeHtml(track.categoryLabel)}</option>`
  )).join('');
  musicTrackSelect.value = tracks.some((track) => track.asset === selectedAsset) ? selectedAsset : '';
}

function applySelectedMusicTrack({ play = true } = {}) {
  const asset = musicTrackSelect?.value || '';
  previewAudioSettings.musicAsset = asset;
  setMusicSource(asset || project.assets?.backgroundMusic || '');
  savePreviewAudioSettings();
  applyAudioSettings();
  updateMusicLibraryStatus();
  if (playbackState === 'playing') {
    syncAudioToVideo();
  } else if (play && musicAudio?.src) {
    try {
      musicAudio.currentTime = 0;
    } catch {
      // Ignore media that is not seekable yet.
    }
    updateAudioStatus('Previewing selected music');
  }
  if (play && previewAudioSettings.musicEnabled && musicAudio?.src) {
    musicAudio.play().catch(() => updateAudioStatus('Click Play to enable audio'));
  }
}

function setMusicSource(asset) {
  if (!musicAudio) return;
  if (!asset) {
    musicAudio.removeAttribute('src');
    musicAudio.load?.();
    return;
  }
  const src = assetUrl(asset);
  if (musicAudio.getAttribute('src') !== src) {
    musicAudio.src = src;
    musicAudio.load?.();
  }
}

function updateMusicLibraryStatus() {
  if (!musicLibraryStatus) return;
  const asset = previewAudioSettings.musicAsset || '';
  const selectedTrack = musicLibraryCategories.flatMap((category) => category.tracks || []).find((track) => track.asset === asset);
  const trackCount = musicLibraryCategories.reduce((count, category) => count + (category.tracks?.length || 0), 0);
  if (selectedTrack) {
    musicLibraryStatus.textContent = `Applied: ${selectedTrack.title}`;
  } else if (project.assets?.backgroundMusic) {
    musicLibraryStatus.textContent = 'Using uploaded project music';
  } else {
    musicLibraryStatus.textContent = trackCount ? 'Choose a track to apply to this video.' : 'Add audio files under remotion/public/music/category folders.';
  }
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}

function currentPreviewSettingsPayload() {
  return {
    captions: previewCaptionSettings,
    audio: previewAudioSettings,
    playbackRate,
  };
}

function schedulePreviewSettingsSave() {
  if (!project.id) return;
  clearTimeout(previewSettingsSaveTimer);
  previewSettingsSaveTimer = setTimeout(savePreviewSettingsToProject, 450);
}

async function savePreviewSettingsToProject() {
  if (!project.id) return;
  try {
    await fetch(`/api/projects/${encodeURIComponent(project.id)}/preview-settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previewSettings: currentPreviewSettingsPayload() }),
    });
  } catch {
    // Keep preview controls responsive even if project settings cannot be persisted.
  }
}

async function playSyncedMedia({ fromStart = false } = {}) {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (fromStart) {
    pausedProjectTime = 0;
  }
  previewStartedAt = performance.now() - (pausedProjectTime / playbackRate) * 1000;
  try {
    const contentSeconds = contentTimeFromPreviewTime(pausedProjectTime);
    if (Number.isFinite(screenVideo.duration) && screenVideo.duration > 0) {
      screenVideo.currentTime = contentSeconds % screenVideo.duration;
    } else {
      screenVideo.currentTime = contentSeconds;
    }
  } catch {
    // Ignore media that is not seekable yet.
  }
  playbackState = 'playing';
  applyPlaybackRate();
  syncAudioToVideo();
  updateTimelineClips(contentTimeFromPreviewTime(pausedProjectTime));
  applyAudioSettings();
  updatePlaybackButtons();
  const playPromises = [screenVideo, ...audibleElements()].map((media) => media.play().catch((error) => error));
  const results = await Promise.all(playPromises);
  const blocked = results.find((result) => result instanceof Error);
  if (blocked) {
    updateAudioStatus('Click Play to enable audio');
  }
  animationFrame = requestAnimationFrame(updatePreview);
}

function pausePreview() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  pausedProjectTime = currentProjectTime();
  playbackState = 'paused';
  mediaElements().forEach((media) => media.pause());
  updatePlaybackButtons();
  updatePreview();
}

function stopPreview({ reset = true, render = true } = {}) {
  cancelRecordCountdown();
  if (animationFrame) cancelAnimationFrame(animationFrame);
  pausedProjectTime = reset ? 0 : currentProjectTime();
  playbackState = 'stopped';
  mediaElements().forEach((media) => {
    media.pause();
    if (reset) {
      try {
        media.currentTime = 0;
      } catch {
        // Ignore media that is not seekable yet.
      }
    }
  });
  activeCaptionGroupKey = '';
  lastCaptionRenderKey = '';
  updatePlaybackButtons();
  updateTransport(pausedProjectTime);
  if (render) updatePreview();
}

function updatePlaybackButtons() {
  playBtn?.toggleAttribute('disabled', playbackState === 'playing');
  pauseBtn?.toggleAttribute('disabled', playbackState !== 'playing');
  resumeBtn?.toggleAttribute('disabled', playbackState !== 'paused');
  stopBtn?.toggleAttribute('disabled', playbackState === 'stopped');
}

function setRenderStatus(message = '', tone = '') {
  if (!renderStatus) return;
  renderStatus.textContent = message;
  renderStatus.dataset.tone = tone;
}

async function renderProjectFromPreview() {
  if (!project.id || !renderBtn) return;
  const previousText = renderBtn.textContent;
  renderBtn.disabled = true;
  renderBtn.textContent = 'Rendering...';
  setRenderStatus('Queued', 'working');
  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'preview',
        previewSettings: currentPreviewSettingsPayload(),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Render failed.');
    }
    const finalStatus = await pollRenderStatus(project.id);
    const outputUrl = finalStatus.outputUrl || data.outputUrl;
    if (outputUrl && mp4Link) {
      mp4Link.href = outputUrl;
      mp4Link.classList.remove('hidden');
    }
    setRenderStatus('MP4 ready', 'success');
  } catch (error) {
    setRenderStatus(error.message || 'Render failed', 'error');
  } finally {
    renderBtn.disabled = false;
    renderBtn.textContent = previousText;
  }
}

async function pollRenderStatus(projectId) {
  let readErrors = 0;
  let lastProgressLabel = '';
  while (true) {
    await wait(1800);
    let data;
    try {
      data = await readRenderStatus(projectId);
      readErrors = 0;
    } catch (error) {
      readErrors += 1;
      const outputReady = await checkOutputAvailable(projectId);
      if (outputReady) {
        return { status: 'rendered', outputUrl: outputReady, render: { progress: 100, phase: 'done' } };
      }
      const suffix = lastProgressLabel ? ` Last known: ${lastProgressLabel}.` : '';
      setRenderStatus(`Still checking render status...${suffix}`, 'working');
      if (readErrors >= 12) {
        throw new Error('Could not read render status. The render may still be running; refresh Preview or open the MP4 link after a minute.');
      }
      continue;
    }

    const render = data.render || {};
    const progress = Number(render.progress || 0);
    const phase = render.phase || data.status || 'rendering';
    lastProgressLabel = `${phase} ${progress ? `${progress}%` : ''}`.trim();
    setRenderStatus(lastProgressLabel, 'working');
    if (data.status === 'rendered') return data;
    if (data.status === 'failed') throw new Error(render.lastError || 'Render failed.');
  }
}

async function hydrateRenderStatus() {
  if (!project.id) return;
  try {
    const data = await readRenderStatus(project.id);
    const render = data.render || {};
    if (data.outputUrl && mp4Link) {
      mp4Link.href = data.outputUrl;
      mp4Link.classList.remove('hidden');
    }
    if (data.status === 'rendered') {
      setRenderStatus('MP4 ready', 'success');
      return;
    }
    if (data.status === 'failed') {
      setRenderStatus('Render failed', 'error');
      return;
    }
    if (data.status === 'rendering') {
      const progress = Number(render.progress || 0);
      const phase = render.phase || 'rendering';
      setRenderStatus(`${phase} ${progress ? `${progress}%` : ''}`.trim(), 'working');
    }
  } catch {
    const outputReady = await checkOutputAvailable(project.id);
    if (outputReady && mp4Link) {
      mp4Link.href = outputReady;
      mp4Link.classList.remove('hidden');
      setRenderStatus('MP4 ready', 'success');
    }
  }
}

async function readRenderStatus(projectId) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/render-status`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not read render status.');
  return data;
}

async function checkOutputAvailable(projectId) {
  const outputUrl = `/outputs/${encodeURIComponent(projectId)}.mp4`;
  try {
    const response = await fetch(outputUrl, { method: 'HEAD', cache: 'no-store' });
    return response.ok ? outputUrl : '';
  } catch {
    return '';
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seekPreview(seconds) {
  pausedProjectTime = Math.min(totalDuration, Math.max(0, Number(seconds) || 0));
  if (playbackState === 'playing') {
    previewStartedAt = performance.now() - (pausedProjectTime / playbackRate) * 1000;
  }
  try {
    const contentSeconds = contentTimeFromPreviewTime(pausedProjectTime);
    screenVideo.currentTime = Number.isFinite(screenVideo.duration) && screenVideo.duration > 0
      ? contentSeconds % screenVideo.duration
      : contentSeconds;
  } catch {
    // Ignore media that is not seekable yet.
  }
  syncAudioToVideo();
  updateTimelineClips(contentTimeFromPreviewTime(pausedProjectTime));
  activeCaptionGroupKey = '';
  lastCaptionRenderKey = '';
  updatePreview();
}

function applyPlaybackRate() {
  mediaElements().forEach((media) => {
    try {
      media.playbackRate = playbackRate;
    } catch {
      // Some media elements may reject rate changes before metadata.
    }
  });
}

function updateTransport(seconds = currentProjectTime()) {
  if (previewScrubber && !isScrubbing) previewScrubber.value = String(Math.min(totalDuration, Math.max(0, seconds)));
  if (currentTimeLabel) currentTimeLabel.textContent = formatTime(seconds);
  if (durationTimeLabel) durationTimeLabel.textContent = formatTime(totalDuration);
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(wholeSeconds).padStart(2, '0')}`;
}

function renderCaptionStyleTray() {
  if (!captionStyleTray) return;
  captionStyleTray.innerHTML = CAPTION_STYLE_PRESETS.map((preset) => `
    <button type="button" class="caption-style-pick ${preset.id}" data-style="${preset.id}">
      <span class="caption-style-preview"><b>${preset.sample}</b><em>Product</em></span>
      <span>${preset.label}</span>
    </button>
  `).join('');
  captionStyleTray.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const nextStyle = button.dataset.style || '';
      previewCaptionSettings.style = previewCaptionSettings.style === nextStyle ? '' : nextStyle;
      savePreviewCaptionSettings();
      activeSceneKey = '';
      updatePreview();
    });
  });
}

function setTraySelected(style) {
  if (!captionStyleTray) return;
  captionStyleTray.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('active', button.dataset.style === style);
    button.classList.toggle('override', Boolean(previewCaptionSettings.style) && button.dataset.style === style);
  });
}

function loadPreviewCaptionSettings() {
  const defaults = {
    style: '',
    position: '',
    groupMode: 'words',
    wordsPerGroup: 3,
    sentencesPerGroup: 1,
    highlightMode: 'word',
    size: '',
    boxMode: 'single',
    paragraphAlign: 'center',
    fontFamily: '',
    fontColor: '',
    fontSizePercent: 100,
    fontWeight: '',
    activeStyle: 'color',
    activeColor: '#facc15',
  };
  const projectSettings = project.previewSettings?.captions || {};
  try {
    return { ...defaults, ...projectSettings, ...JSON.parse(localStorage.getItem(previewSettingsKey) || '{}') };
  } catch {
    return { ...defaults, ...projectSettings };
  }
}

function savePreviewCaptionSettings() {
  localStorage.setItem(previewSettingsKey, JSON.stringify(previewCaptionSettings));
  schedulePreviewSettingsSave();
}

function syncCaptionControls() {
  if (captionPositionSelect) captionPositionSelect.value = previewCaptionSettings.position || '';
  const groupMode = previewCaptionSettings.groupMode === 'sentences' ? 'sentences' : 'words';
  const count = groupMode === 'sentences'
    ? clampCaptionCount(previewCaptionSettings.sentencesPerGroup, 1, CAPTION_SENTENCE_MAX, 1)
    : clampCaptionCount(previewCaptionSettings.wordsPerGroup, 1, CAPTION_WORD_MAX, 3);
  if (captionGroupModeSelect) captionGroupModeSelect.value = groupMode;
  if (captionCountLabel) captionCountLabel.textContent = groupMode === 'sentences' ? 'Sentences' : 'Words';
  if (captionWordsInput) {
    captionWordsInput.min = '1';
    captionWordsInput.max = groupMode === 'sentences' ? String(CAPTION_SENTENCE_MAX) : String(CAPTION_WORD_MAX);
    captionWordsInput.value = String(count);
  }
  if (captionWordsValue) captionWordsValue.textContent = String(count);
  if (captionHighlightSelect) captionHighlightSelect.value = previewCaptionSettings.highlightMode || 'word';
  if (captionSizeSelect) captionSizeSelect.value = previewCaptionSettings.size || '';
  if (captionFontSelect) captionFontSelect.value = previewCaptionSettings.fontFamily || '';
  if (captionFontColorInput) captionFontColorInput.value = safeHexColor(previewCaptionSettings.fontColor, '#ffffff');
  if (captionFontSizeInput) captionFontSizeInput.value = String(clampCaptionCount(previewCaptionSettings.fontSizePercent, 70, 180, 100));
  if (captionFontSizeValue) captionFontSizeValue.textContent = `${clampCaptionCount(previewCaptionSettings.fontSizePercent, 70, 180, 100)}%`;
  if (captionWeightSelect) captionWeightSelect.value = previewCaptionSettings.fontWeight || '';
  if (captionBoxModeSelect) captionBoxModeSelect.value = previewCaptionSettings.boxMode === 'lines' ? 'lines' : 'single';
  if (captionParagraphAlignSelect) captionParagraphAlignSelect.value = ['left', 'center', 'right', 'justify'].includes(previewCaptionSettings.paragraphAlign) ? previewCaptionSettings.paragraphAlign : 'center';
  if (captionActiveStyleSelect) captionActiveStyleSelect.value = previewCaptionSettings.activeStyle || 'color';
  if (captionActiveColorInput) captionActiveColorInput.value = safeHexColor(previewCaptionSettings.activeColor, '#facc15');
}

function wireCaptionControls() {
  syncCaptionControls();
  captionPositionSelect?.addEventListener('change', () => {
    previewCaptionSettings.position = captionPositionSelect.value;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionGroupModeSelect?.addEventListener('change', () => {
    previewCaptionSettings.groupMode = captionGroupModeSelect.value === 'sentences' ? 'sentences' : 'words';
    savePreviewCaptionSettings();
    syncCaptionControls();
    activeCaptionGroupKey = '';
    lastCaptionRenderKey = '';
    updatePreview();
  });
  captionWordsInput?.addEventListener('input', () => {
    if (previewCaptionSettings.groupMode === 'sentences') {
      previewCaptionSettings.sentencesPerGroup = clampCaptionCount(captionWordsInput.value, 1, CAPTION_SENTENCE_MAX, 1);
      if (captionWordsValue) captionWordsValue.textContent = String(previewCaptionSettings.sentencesPerGroup);
    } else {
      previewCaptionSettings.wordsPerGroup = clampCaptionCount(captionWordsInput.value, 1, CAPTION_WORD_MAX, 3);
      if (captionWordsValue) captionWordsValue.textContent = String(previewCaptionSettings.wordsPerGroup);
    }
    savePreviewCaptionSettings();
    activeCaptionGroupKey = '';
    lastCaptionRenderKey = '';
    updatePreview();
  });
  captionHighlightSelect?.addEventListener('change', () => {
    previewCaptionSettings.highlightMode = captionHighlightSelect.value || 'word';
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionSizeSelect?.addEventListener('change', () => {
    previewCaptionSettings.size = captionSizeSelect.value;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionFontSelect?.addEventListener('change', () => {
    previewCaptionSettings.fontFamily = captionFontSelect.value;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionFontColorInput?.addEventListener('input', () => {
    previewCaptionSettings.fontColor = safeHexColor(captionFontColorInput.value, '');
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionFontSizeInput?.addEventListener('input', () => {
    previewCaptionSettings.fontSizePercent = clampCaptionCount(captionFontSizeInput.value, 70, 180, 100);
    if (captionFontSizeValue) captionFontSizeValue.textContent = `${previewCaptionSettings.fontSizePercent}%`;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionWeightSelect?.addEventListener('change', () => {
    previewCaptionSettings.fontWeight = captionWeightSelect.value;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionBoxModeSelect?.addEventListener('change', () => {
    previewCaptionSettings.boxMode = captionBoxModeSelect.value === 'lines' ? 'lines' : 'single';
    savePreviewCaptionSettings();
    activeCaptionGroupKey = '';
    lastCaptionRenderKey = '';
    activeSceneKey = '';
    updatePreview();
  });
  captionParagraphAlignSelect?.addEventListener('change', () => {
    previewCaptionSettings.paragraphAlign = captionParagraphAlignSelect.value;
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionActiveStyleSelect?.addEventListener('change', () => {
    previewCaptionSettings.activeStyle = captionActiveStyleSelect.value || 'color';
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  captionActiveColorInput?.addEventListener('input', () => {
    previewCaptionSettings.activeColor = safeHexColor(captionActiveColorInput.value, '#facc15');
    savePreviewCaptionSettings();
    activeSceneKey = '';
    updatePreview();
  });
  resetCaptionPreviewBtn?.addEventListener('click', () => {
    previewCaptionSettings = {
      style: '',
      position: '',
      groupMode: 'words',
      wordsPerGroup: 3,
      sentencesPerGroup: 1,
      highlightMode: 'word',
      size: '',
      boxMode: 'single',
      paragraphAlign: 'center',
      fontFamily: '',
      fontColor: '',
      fontSizePercent: 100,
      fontWeight: '',
      activeStyle: 'color',
      activeColor: '#facc15',
    };
    savePreviewCaptionSettings();
    syncCaptionControls();
    activeSceneKey = '';
    activeCaptionGroupKey = '';
    lastCaptionRenderKey = '';
    updatePreview();
  });
}

function wireAudioControls() {
  applyAudioSettings();
  voiceoverEnabled?.addEventListener('change', () => {
    previewAudioSettings.voiceoverEnabled = voiceoverEnabled.checked;
    savePreviewAudioSettings();
    applyAudioSettings();
    if (playbackState === 'playing') {
      syncAudioToVideo();
      if (previewAudioSettings.voiceoverEnabled && voiceoverAudio?.src) voiceoverAudio.play().catch(() => updateAudioStatus('Click Play to enable audio'));
    }
  });
  voiceoverVolume?.addEventListener('input', () => {
    previewAudioSettings.voiceoverVolume = Number(voiceoverVolume.value || 0);
    savePreviewAudioSettings();
    applyAudioSettings();
  });
  musicEnabled?.addEventListener('change', () => {
    previewAudioSettings.musicEnabled = musicEnabled.checked;
    savePreviewAudioSettings();
    applyAudioSettings();
    if (playbackState === 'playing') {
      syncAudioToVideo();
      if (previewAudioSettings.musicEnabled && musicAudio?.src) musicAudio.play().catch(() => updateAudioStatus('Click Play to enable audio'));
    }
  });
  musicVolume?.addEventListener('input', () => {
    previewAudioSettings.musicVolume = Number(musicVolume.value || 0);
    savePreviewAudioSettings();
    applyAudioSettings();
  });
  musicDucking?.addEventListener('change', () => {
    previewAudioSettings.musicDucking = musicDucking.checked;
    savePreviewAudioSettings();
    applyAudioSettings();
  });
  musicCategorySelect?.addEventListener('change', () => {
    renderMusicTrackOptions(musicCategorySelect.value, previewAudioSettings.musicAsset || '');
    updateMusicLibraryStatus();
  });
  musicTrackSelect?.addEventListener('change', () => {
    applySelectedMusicTrack({ play: true });
  });
  applyMusicBtn?.addEventListener('click', () => {
    applySelectedMusicTrack({ play: true });
    updateAudioStatus('Music selection applied');
  });
}

function wireTransportControls() {
  if (previewScrubber) {
    previewScrubber.max = String(totalDuration);
    previewScrubber.addEventListener('input', () => {
      isScrubbing = true;
      const seconds = Number(previewScrubber.value || 0);
      updateTransport(seconds);
    });
    previewScrubber.addEventListener('change', () => {
      isScrubbing = false;
      seekPreview(Number(previewScrubber.value || 0));
    });
    previewScrubber.addEventListener('pointerup', () => {
      isScrubbing = false;
    });
  }
  if (previewSpeed) previewSpeed.value = String(playbackRate);
  previewSpeed?.addEventListener('change', () => {
    const current = currentProjectTime();
    playbackRate = Math.max(0.25, Number(previewSpeed.value || 1));
    pausedProjectTime = current;
    if (playbackState === 'playing') {
      previewStartedAt = performance.now() - (pausedProjectTime / playbackRate) * 1000;
    }
    applyPlaybackRate();
    schedulePreviewSettingsSave();
  });
  recordReadyBtn?.addEventListener('click', startRecordReady);
  updateTransport(0);
}

function startRecordReady() {
  cancelRecordCountdown();
  stopPreview();
  toggleCleanView(true);
  let count = 3;
  recordCountdown.textContent = String(count);
  recordCountdown.classList.remove('hidden');
  countdownTimer = setInterval(() => {
    count -= 1;
    if (count > 0) {
      recordCountdown.textContent = String(count);
      return;
    }
    clearInterval(countdownTimer);
    countdownTimer = null;
    recordCountdown.classList.add('hidden');
    playSyncedMedia({ fromStart: true });
  }, 1000);
}

function cancelRecordCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  recordCountdown?.classList.add('hidden');
}

function isEditableShortcutTarget(target) {
  if (!target) return false;
  const tagName = String(target.tagName || '').toLowerCase();
  return target.isContentEditable || ['input', 'select', 'textarea'].includes(tagName);
}

function toggleCleanView(force) {
  const shouldClean = typeof force === 'boolean' ? force : !document.body.classList.contains('clean');
  document.body.classList.toggle('clean', shouldClean);
  cleanBtn.textContent = shouldClean ? 'Show controls' : 'Clean view';
}

function wireKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isEditableShortcutTarget(event.target)) return;
    const key = event.key.toLowerCase();

    if (key === ' ' || key === 'k') {
      event.preventDefault();
      if (playbackState === 'playing') {
        pausePreview();
      } else {
        playSyncedMedia({ fromStart: playbackState === 'stopped' });
      }
    } else if (key === 'r' && event.shiftKey) {
      event.preventDefault();
      startRecordReady();
    } else if (key === 'c') {
      event.preventDefault();
      toggleCleanView();
    } else if (key === 'r') {
      event.preventDefault();
      playSyncedMedia({ fromStart: true });
    } else if (key === 's') {
      event.preventDefault();
      stopPreview();
    } else if (key === 'escape' && document.body.classList.contains('clean')) {
      event.preventDefault();
      cancelRecordCountdown();
      toggleCleanView(false);
    }
  });
}

screenVideo.addEventListener('loadedmetadata', () => {
  if (duration > screenVideo.duration && Number.isFinite(screenVideo.duration)) {
    screenVideo.loop = true;
  }
  stopPreview();
});

screenVideo.addEventListener('loadeddata', () => {
  drawDeviceScreen(activeClip('device-screen', contentTimeFromPreviewTime(currentProjectTime())));
});

screenVideo.addEventListener('play', () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  playbackState = 'playing';
  updatePlaybackButtons();
  animationFrame = requestAnimationFrame(updatePreview);
});
screenVideo.addEventListener('pause', () => {
  if (playbackState === 'playing') {
    pausePreview();
  } else if (playbackState !== 'stopped') {
    updatePreview();
  }
});
screenVideo.addEventListener('seeked', () => {
  syncAudioToVideo();
  updatePreview();
});
deviceClipVideo?.addEventListener('loadeddata', () => {
  drawDeviceScreen(activeClip('device-screen', contentTimeFromPreviewTime(currentProjectTime())));
});
playBtn?.addEventListener('click', () => playSyncedMedia({ fromStart: playbackState === 'stopped' }));
pauseBtn?.addEventListener('click', pausePreview);
resumeBtn?.addEventListener('click', () => playSyncedMedia());
stopBtn?.addEventListener('click', () => stopPreview());
replayBtn.addEventListener('click', () => playSyncedMedia({ fromStart: true }));
renderBtn?.addEventListener('click', renderProjectFromPreview);

cleanBtn.addEventListener('click', () => {
  toggleCleanView();
});

if (!project.assets?.screen) {
  setCaption(project.title, DEFAULT_SCENE, 0, []);
}

renderCaptionStyleTray();
wireCaptionControls();
wireAudioControls();
loadMusicLibrary();
wireTransportControls();
wireKeyboardShortcuts();
updatePlaybackButtons();
hydrateRenderStatus();
updatePreview();
