const sceneTableBody = document.querySelector('#sceneTable tbody');
const clipTableBody = document.querySelector('#clipTable tbody');
const projectForm = document.querySelector('#projectForm');
const message = document.querySelector('#message');
const projectsList = document.querySelector('#projectsList');
const projectsSummary = document.querySelector('#projectsSummary');
const globalDeviceBackgrounds = document.querySelector('#globalDeviceBackgrounds');
const globalStoryBackgrounds = document.querySelector('#globalStoryBackgrounds');
const globalDevices = document.querySelector('#globalDevices');
const globalAngle = document.querySelector('#globalAngle');
const globalMotion = document.querySelector('#globalMotion');
const globalMotionAmount = document.querySelector('#globalMotionAmount');
const globalMotionAmountValue = document.querySelector('#globalMotionAmountValue');
const globalTransition = document.querySelector('#globalTransition');
const globalScreenZoom = document.querySelector('#globalScreenZoom');
const globalScreenZoomValue = document.querySelector('#globalScreenZoomValue');
const globalCaptionStyles = document.querySelector('#globalCaptionStyles');
const globalCaptionPosition = document.querySelector('#globalCaptionPosition');
const globalCaptionSize = document.querySelector('#globalCaptionSize');
const globalCaptionAccent = document.querySelector('#globalCaptionAccent');
const minSceneSecondsInput = document.querySelector('#minSceneSeconds');
const targetSceneSecondsInput = document.querySelector('#targetSceneSeconds');
const maxSceneSecondsInput = document.querySelector('#maxSceneSeconds');
const singleSceneModeInput = document.querySelector('#singleSceneMode');
const themeToggleBtn = document.querySelector('#themeToggleBtn');
const thumbnailInput = document.querySelector('#thumbnailInput');
const thumbnailPreview = document.querySelector('#thumbnailPreview');
const thumbnailPasteZone = document.querySelector('#thumbnailPasteZone');
const thumbnailPasteHint = document.querySelector('#thumbnailPasteHint');
const customBackgroundInput = document.querySelector('#customBackgroundInput');
const customBackgroundUploadBox = document.querySelector('#customBackgroundUploadBox');
const customBackgroundHint = document.querySelector('#customBackgroundHint');
const thumbnailBumperPosition = document.querySelector('#thumbnailBumperPosition');
const layoutDeviceLiftInput = document.querySelector('[name="layoutDeviceLift"]');
const layoutCtaLiftInput = document.querySelector('[name="layoutCtaLift"]');
const saveBarTitle = document.querySelector('#saveBarTitle');
const saveBarHint = document.querySelector('#saveBarHint');
const saveProjectBtn = document.querySelector('#saveProjectBtn');
const newProjectBtn = document.querySelector('#newProjectBtn');
const projectTypeInputs = [...document.querySelectorAll('[name="projectType"]')];
const screenRecordingInput = projectForm?.elements.screenRecording;
const voiceoverInput = document.querySelector('#voiceoverInput');
const transcribeVoiceoverBtn = document.querySelector('#transcribeVoiceoverBtn');
const transcriptionLanguage = document.querySelector('#transcriptionLanguage');
const originalScriptInput = document.querySelector('#originalScriptInput');
const useWhisperxAlignmentInput = document.querySelector('#useWhisperxAlignment');
const reduceMusicForCaptionsInput = document.querySelector('#reduceMusicForCaptions');
const screenUploadBox = document.querySelector('#screenUploadBox');
const screenUploadLabel = document.querySelector('#screenUploadLabel');
const voiceoverUploadBox = document.querySelector('#voiceoverUploadBox');
const voiceoverUploadLabel = document.querySelector('#voiceoverUploadLabel');
const MAX_PROJECT_SECONDS = 600;

const BACKGROUND_PRESETS = [
  { id: 'reading-room', label: 'Reading room', thumb: '/preview-assets/assets/lifestyle-reading-room.png' },
  { id: 'office-desk', label: 'Office desk', thumb: '/preview-assets/assets/background-office-desk.png' },
  { id: 'cafe-table', label: 'Cafe table', thumb: '/preview-assets/assets/background-cafe-table.png' },
  { id: 'dark-studio', label: 'Dark studio', thumb: '/preview-assets/assets/background-dark-studio.png' },
  { id: 'home-office', label: 'Home office', thumb: '/preview-assets/assets/background-home-office.png' },
  { id: 'classroom', label: 'Classroom', thumb: '/preview-assets/assets/background-classroom.png' },
  { id: 'meeting-room', label: 'Meeting room', thumb: '/preview-assets/assets/background-meeting-room.png' },
  { id: 'evening-desk', label: 'Evening desk', thumb: '/preview-assets/assets/background-evening-desk.png' },
  { id: 'kitchen-counter', label: 'Kitchen counter', thumb: '/preview-assets/assets/background-kitchen-counter.png' },
  { id: 'creator-studio', label: 'Creator studio', thumb: '/preview-assets/assets/background-creator-studio.png' },
  { id: 'story-kids', label: 'Kids story', thumb: '/preview-assets/assets/background-story-kids.svg' },
  { id: 'story-inspirational', label: 'Inspirational', thumb: '/preview-assets/assets/background-story-inspirational.svg' },
  { id: 'story-hindu-devotional', label: 'Hindu devotional', thumb: '/preview-assets/assets/background-story-hindu-devotional.svg' },
  { id: 'story-diya-glow', label: 'Diya glow', thumb: '/preview-assets/assets/background-story-diya-glow.svg' },
  { id: 'story-temple-lamps', label: 'Temple lamps', thumb: '/preview-assets/assets/background-story-temple-lamps.svg' },
  { id: 'story-devotional-aura', label: 'Devotional aura', thumb: '/preview-assets/assets/background-story-devotional-aura.svg' },
  { id: 'story-starry-night', label: 'Twinkling stars', thumb: '/preview-assets/assets/background-story-starry-night.svg' },
  { id: 'story-moon-magic', label: 'Moon story', thumb: '/preview-assets/assets/background-story-moon-magic.svg' },
  { id: 'story-magic-forest', label: 'Magic forest', thumb: '/preview-assets/assets/background-story-magic-forest.svg' },
  { id: 'story-haunted-mist', label: 'Haunted mist', thumb: '/preview-assets/assets/background-story-haunted-mist.svg' },
  { id: 'story-podcast-waves', label: 'Podcast waves', thumb: '/preview-assets/assets/background-story-podcast-waves.svg' },
  { id: 'story-talk', label: 'Talk / podcast', thumb: '/preview-assets/assets/background-story-talk.svg' },
  { id: 'story-scary', label: 'Scary story', thumb: '/preview-assets/assets/background-story-scary.svg' },
  { id: 'custom-media', label: 'Uploaded media', thumb: '/preview-assets/assets/background-custom-media.svg' },
];
const DEVICE_BACKGROUND_PRESETS = BACKGROUND_PRESETS.filter((preset) => !preset.id.startsWith('story-') && preset.id !== 'custom-media');
const STORY_BACKGROUND_PRESETS = BACKGROUND_PRESETS.filter((preset) => preset.id.startsWith('story-') || preset.id === 'custom-media');
const ANIMATED_BACKGROUND_IDS = new Set([
  'story-diya-glow',
  'story-temple-lamps',
  'story-devotional-aura',
  'story-starry-night',
  'story-moon-magic',
  'story-magic-forest',
  'story-haunted-mist',
  'story-podcast-waves',
]);

const DEVICE_PRESETS = [
  { id: 'tablet-pro', label: 'Tablet Pro' },
  { id: 'phone-modern', label: 'Phone' },
  { id: 'laptop-silver', label: 'Laptop' },
  { id: 'browser-window', label: 'Browser' },
  { id: 'full-screen', label: 'Full screen' },
];

const ANGLE_PRESETS = [
  { id: 'low-desk-left', label: 'Low desk left' },
  { id: 'low-desk-right', label: 'Low desk right' },
  { id: 'front-center', label: 'Front center' },
  { id: 'floating-hero', label: 'Floating hero' },
];

const MOTION_PRESETS = [
  { id: 'slow-push-in', label: 'Slow push in' },
  { id: 'screen-focus', label: 'Screen focus' },
  { id: 'pan-left', label: 'Pan left' },
  { id: 'pan-right', label: 'Pan right' },
  { id: 'device-tilt', label: 'Handheld camera' },
  { id: 'cta-push', label: 'CTA push' },
];

const TRANSITION_PRESETS = [
  { id: 'soft-fade', label: 'Soft fade' },
  { id: 'clean-cut', label: 'Clean cut' },
  { id: 'slide-up', label: 'Slide up' },
];

const CAPTION_STYLE_PRESETS = [
  { id: 'white-chip', label: 'White chip', sample: 'Clean' },
  { id: 'glass-card', label: 'Glass card', sample: 'Glass' },
  { id: 'bold-bottom', label: 'Bold bottom', sample: 'Bold' },
  { id: 'editorial-card', label: 'Editorial card', sample: 'Editorial' },
  { id: 'neon-ribbon', label: 'Neon ribbon', sample: 'Accent' },
  { id: 'kinetic-stack', label: 'Kinetic stack', sample: 'Stack' },
  { id: 'minimal-subtitle', label: 'Minimal subtitle', sample: 'Subtitle' },
  { id: 'device-callout', label: 'Device callout', sample: 'Callout' },
];

const CAPTION_POSITION_PRESETS = [
  { id: 'auto', label: 'Auto' },
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'device', label: 'Near device' },
];

const CAPTION_ANIMATION_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'rise', label: 'Fade rise' },
  { id: 'pop', label: 'Pop' },
  { id: 'slide-mask', label: 'Slide mask' },
  { id: 'type-on', label: 'Type on' },
];

const CAPTION_SIZE_PRESETS = [
  { id: 'compact', label: 'Compact' },
  { id: 'standard', label: 'Standard' },
  { id: 'large', label: 'Large' },
  { id: 'hero', label: 'Hero' },
];

const CAPTION_ACCENT_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'first-word', label: 'First word' },
  { id: 'last-word', label: 'Last word' },
];

const CLIP_MODE_PRESETS = [
  { id: 'device-screen', label: 'Device screen' },
  { id: 'full-screen', label: 'Full screen' },
  { id: 'background', label: 'Background' },
  { id: 'overlay', label: 'Overlay' },
];

const DEFAULT_DESIGN = {
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
const DEFAULT_CLIP_DURATION = 4;
const STUDIO_GLOBAL_SETTINGS_KEY = 'promo-studio-global-settings:v1';
const STUDIO_THEME_KEY = 'promo-studio-theme:v1';
const VISUAL_MIRROR_FIELDS = [
  { key: 'background', selector: '.scene-background', defaultValue: DEFAULT_DESIGN.background },
  { key: 'device', selector: '.scene-device', defaultValue: DEFAULT_DESIGN.device },
  { key: 'angle', selector: '.scene-angle', defaultValue: DEFAULT_DESIGN.angle },
  { key: 'motion', selector: '.scene-motion', defaultValue: DEFAULT_DESIGN.motion },
  { key: 'motionAmount', selector: '.scene-motion-amount', defaultValue: DEFAULT_DESIGN.motionAmount, alwaysGlobal: true },
  { key: 'transition', selector: '.scene-transition', defaultValue: DEFAULT_DESIGN.transition },
  { key: 'screenZoom', selector: '.scene-screen-zoom', defaultValue: DEFAULT_DESIGN.screenZoom, alwaysGlobal: true },
];
const CAPTION_MIRROR_FIELDS = [
  { key: 'captionStyle', selector: '.scene-caption-style', defaultValue: DEFAULT_DESIGN.captionStyle },
  { key: 'captionPosition', selector: '.scene-caption-position', defaultValue: DEFAULT_DESIGN.captionPosition },
  { key: 'captionAnimation', selector: '.scene-caption-animation', defaultValue: DEFAULT_DESIGN.captionAnimation },
  { key: 'captionSize', selector: '.scene-caption-size', defaultValue: DEFAULT_DESIGN.captionSize },
  { key: 'captionAccent', selector: '.scene-caption-accent', defaultValue: DEFAULT_DESIGN.captionAccent },
  { key: 'captionAnimationAmount', selector: '.scene-caption-animation-amount', defaultValue: DEFAULT_DESIGN.captionAnimationAmount },
];
let selectedSceneId = '';
let dragSceneId = '';
let dragClipId = '';
let thumbnailClipboardFile = null;
let thumbnailPreviewUrl = '';
let customBackgroundPreviewUrl = '';
let customBackgroundPreviewIsVideo = false;
let thumbnailPositionTouched = false;
let currentProjectType = 'screen-promo';
let editingProjectId = '';
let editingProjectAssets = {};

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`;
}

function hideMessage() {
  message.className = 'message hidden';
  message.textContent = '';
}

function initThumbnailBumperControls() {
  thumbnailBumperPosition?.addEventListener('change', () => {
    thumbnailPositionTouched = true;
  });
  thumbnailInput?.addEventListener('change', () => {
    const file = thumbnailInput.files?.[0] || null;
    thumbnailClipboardFile = null;
    updateThumbnailPreview(file, file ? 'Thumbnail image selected.' : 'Upload an image or focus here and paste with Ctrl+V.');
  });
  document.addEventListener('paste', handleThumbnailPaste);
}

function handleThumbnailPaste(event) {
  const active = document.activeElement;
  if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) && active !== thumbnailInput) return;
  const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith('image/'));
  if (!item) return;
  const file = item.getAsFile();
  if (!file) return;
  event.preventDefault();
  const ext = file.type.split('/')[1] || 'png';
  const pastedFile = new File([file], `thumbnail-paste.${ext}`, { type: file.type });
  setThumbnailFile(pastedFile, 'Pasted thumbnail image.');
}

function setThumbnailFile(file, statusText) {
  thumbnailClipboardFile = file;
  if (thumbnailInput) {
    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      thumbnailInput.files = transfer.files;
      thumbnailClipboardFile = null;
    } catch {
      // Older browsers may not allow assigning FileList; submit handling appends this file.
    }
  }
  updateThumbnailPreview(file, statusText);
}

function updateThumbnailPreview(file, statusText) {
  if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
  thumbnailPreviewUrl = '';
  if (file && thumbnailPreview) {
    thumbnailPreviewUrl = URL.createObjectURL(file);
    thumbnailPreview.src = thumbnailPreviewUrl;
    thumbnailPreview.classList.remove('hidden');
    thumbnailPasteZone?.classList.remove('muted');
    if (thumbnailBumperPosition && !thumbnailPositionTouched && thumbnailBumperPosition.value === 'none') {
      thumbnailBumperPosition.value = 'start';
    }
  } else {
    thumbnailPreview?.classList.add('hidden');
    thumbnailPasteZone?.classList.add('muted');
  }
  if (thumbnailPasteHint) thumbnailPasteHint.textContent = statusText;
}

function initStudioTheme() {
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem(STUDIO_THEME_KEY) || 'light';
  } catch {
    savedTheme = 'light';
  }
  applyStudioTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggleBtn?.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    applyStudioTheme(nextTheme);
  });
}

function applyStudioTheme(theme) {
  document.body.dataset.theme = theme;
  try {
    localStorage.setItem(STUDIO_THEME_KEY, theme);
  } catch {
    // Ignore storage failures; the toggle should still work for this session.
  }
  if (themeToggleBtn) {
    const isLight = theme === 'light';
    themeToggleBtn.textContent = isLight ? 'Dark mode' : 'Light mode';
    themeToggleBtn.setAttribute('aria-pressed', String(isLight));
  }
}

function selectedProjectType() {
  return projectTypeInputs.find((input) => input.checked)?.value === 'audio-video'
    ? 'audio-video'
    : 'screen-promo';
}

function setRadioValue(root, selector, value) {
  root.querySelectorAll(selector).forEach((control) => {
    control.checked = control.value === value;
  });
}

function applyProjectTypeMode(options = {}) {
  const previousType = currentProjectType;
  currentProjectType = selectedProjectType();
  const isAudioVideo = currentProjectType === 'audio-video';
  document.body.dataset.projectType = currentProjectType;

  if (screenRecordingInput) {
    screenRecordingInput.required = !isAudioVideo;
  }
  if (screenUploadLabel) {
    screenUploadLabel.textContent = isAudioVideo ? 'Optional screen or b-roll video' : 'Screen recording video';
  }
  if (voiceoverUploadLabel) {
    voiceoverUploadLabel.textContent = isAudioVideo ? 'Audio track' : 'Optional voiceover';
  }
  screenUploadBox?.classList.toggle('muted', isAudioVideo);
  voiceoverUploadBox?.classList.toggle('muted', !isAudioVideo);
  syncTranscribeButtonState();

  if (isAudioVideo && previousType !== 'audio-video' && !options.initial) {
    setRadioValue(document, '.global-device', 'full-screen');
    if (globalCaptionPosition) globalCaptionPosition.value = 'center';
    sceneDesignRows().forEach((row) => {
      const visualOverride = row.querySelector('.scene-visual-override');
      if (visualOverride) visualOverride.checked = false;
      updateSceneOverrideState(row);
    });
    syncSceneControlsWithGlobals();
    saveStudioGlobalSettings();
    showMessage('Audio-to-video mode is ready. Add audio, generate captions, then pick a background and caption style.', 'success');
  }
}

function syncTranscribeButtonState() {
  if (!transcribeVoiceoverBtn) return;
  transcribeVoiceoverBtn.disabled = !voiceoverInput?.files?.length;
}

function selectCustomBackgroundPreset() {
  setRadioValue(document, '.global-background', 'custom-media');
  syncSceneControlsWithGlobals();
  saveStudioGlobalSettings();
}

function initProjectTypeControls() {
  projectTypeInputs.forEach((input) => {
    input.addEventListener('change', () => applyProjectTypeMode());
  });
  applyProjectTypeMode({ initial: true });
}

function globalVisualDesign({ fallback = false } = {}) {
  const fallbackValue = (value, fallbackValue) => value || (fallback ? fallbackValue : '');
  return {
    background: fallbackValue(checkedValue(document, '.global-background', ''), DEFAULT_DESIGN.background),
    device: fallbackValue(checkedValue(document, '.global-device', ''), DEFAULT_DESIGN.device),
    angle: fallbackValue(globalAngle?.value || '', DEFAULT_DESIGN.angle),
    motion: fallbackValue(globalMotion?.value || '', DEFAULT_DESIGN.motion),
    motionAmount: Number(globalMotionAmount?.value || DEFAULT_DESIGN.motionAmount),
    screenZoom: Number(globalScreenZoom?.value || DEFAULT_DESIGN.screenZoom),
    transition: fallbackValue(globalTransition?.value || '', DEFAULT_DESIGN.transition),
  };
}

function globalCaptionDesign() {
  return {
    captionStyle: checkedValue(document, '.global-caption-style', DEFAULT_DESIGN.captionStyle),
    captionPosition: globalCaptionPosition?.value || DEFAULT_DESIGN.captionPosition,
    captionAnimation: 'none',
    captionSize: globalCaptionSize?.value || DEFAULT_DESIGN.captionSize,
    captionAccent: globalCaptionAccent?.value || DEFAULT_DESIGN.captionAccent,
    captionAnimationAmount: DEFAULT_DESIGN.captionAnimationAmount,
  };
}

function applyGlobalVisualDesign(design = {}) {
  setRadioValue(document, '.global-background', design.background || '');
  setRadioValue(document, '.global-device', design.device || '');
  if (globalAngle) globalAngle.value = design.angle || '';
  if (globalMotion) globalMotion.value = design.motion || '';
  if (globalTransition) globalTransition.value = design.transition || '';
  if (globalMotionAmount) globalMotionAmount.value = Number(design.motionAmount || DEFAULT_DESIGN.motionAmount);
  if (globalScreenZoom) globalScreenZoom.value = Number(design.screenZoom || DEFAULT_DESIGN.screenZoom);
  syncGlobalRangeLabels();
}

function applyGlobalCaptionDesign(design = {}) {
  setRadioValue(document, '.global-caption-style', design.captionStyle || DEFAULT_DESIGN.captionStyle);
  if (globalCaptionPosition) globalCaptionPosition.value = design.captionPosition || DEFAULT_DESIGN.captionPosition;
  if (globalCaptionSize) globalCaptionSize.value = design.captionSize || DEFAULT_DESIGN.captionSize;
  if (globalCaptionAccent) globalCaptionAccent.value = design.captionAccent || DEFAULT_DESIGN.captionAccent;
}

function globalSceneDesign() {
  return {
    ...globalVisualDesign({ fallback: true }),
    ...globalCaptionDesign(),
  };
}

function loadStudioGlobalSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem(STUDIO_GLOBAL_SETTINGS_KEY) || '{}');
    return settings && typeof settings === 'object' ? settings : {};
  } catch {
    return {};
  }
}

function saveStudioGlobalSettings() {
  const settings = {
    visual: globalVisualDesign(),
    caption: globalCaptionDesign(),
    pacing: scenePacingConfig({ writeBack: false }),
    layout: layoutLiftConfig({ writeBack: false }),
  };
  try {
    localStorage.setItem(STUDIO_GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Browser storage can be unavailable in hardened/private contexts.
  }
}

function handleGlobalVisualChange() {
  syncGlobalRangeLabels();
  syncSceneControlsWithGlobals();
  saveStudioGlobalSettings();
}

function handleGlobalCaptionChange() {
  syncSceneControlsWithGlobals();
  saveStudioGlobalSettings();
}

function initGlobalVisualControls() {
  const savedVisual = loadStudioGlobalSettings().visual || {};
  if (globalDeviceBackgrounds) {
    globalDeviceBackgrounds.innerHTML = renderThumbOptions(DEVICE_BACKGROUND_PRESETS, savedVisual.background || '', 'global-background', 'global-background', { perScene: true });
  }
  if (globalStoryBackgrounds) {
    globalStoryBackgrounds.innerHTML = renderThumbOptions(STORY_BACKGROUND_PRESETS, savedVisual.background || '', 'global-background', 'global-background');
  }
  if (globalDevices) {
    globalDevices.innerHTML = renderDeviceOptions(DEVICE_PRESETS, savedVisual.device || '', 'global-device', { perScene: true });
  }
  if (globalAngle) globalAngle.innerHTML = renderOptions(ANGLE_PRESETS, savedVisual.angle || '', { perScene: true });
  if (globalMotion) globalMotion.innerHTML = renderOptions(MOTION_PRESETS, savedVisual.motion || '', { perScene: true });
  if (globalTransition) globalTransition.innerHTML = renderOptions(TRANSITION_PRESETS, savedVisual.transition || '', { perScene: true });
  if (globalMotionAmount && savedVisual.motionAmount) globalMotionAmount.value = savedVisual.motionAmount;
  if (globalScreenZoom && savedVisual.screenZoom) globalScreenZoom.value = savedVisual.screenZoom;
  syncGlobalRangeLabels();
  globalMotionAmount?.addEventListener('input', handleGlobalVisualChange);
  globalScreenZoom?.addEventListener('input', handleGlobalVisualChange);
  [globalDeviceBackgrounds, globalStoryBackgrounds, globalDevices, globalAngle, globalMotion, globalTransition].forEach((control) => {
    control?.addEventListener('change', handleGlobalVisualChange);
  });
}

function syncGlobalRangeLabels() {
  if (globalMotionAmountValue) globalMotionAmountValue.textContent = `${Number(globalMotionAmount?.value || DEFAULT_DESIGN.motionAmount).toFixed(2)}×`;
  if (globalScreenZoomValue) globalScreenZoomValue.textContent = `${Number(globalScreenZoom?.value || DEFAULT_DESIGN.screenZoom).toFixed(2)}×`;
}

function initGlobalCaptionControls() {
  const savedCaption = loadStudioGlobalSettings().caption || {};
  if (globalCaptionStyles) {
    globalCaptionStyles.innerHTML = renderCaptionStyleOptions(CAPTION_STYLE_PRESETS, savedCaption.captionStyle || DEFAULT_DESIGN.captionStyle, 'global-caption-style', 'global-caption-style');
  }
  if (globalCaptionPosition) globalCaptionPosition.innerHTML = renderOptions(CAPTION_POSITION_PRESETS, savedCaption.captionPosition || DEFAULT_DESIGN.captionPosition);
  if (globalCaptionSize) globalCaptionSize.innerHTML = renderOptions(CAPTION_SIZE_PRESETS, savedCaption.captionSize || DEFAULT_DESIGN.captionSize);
  if (globalCaptionAccent) globalCaptionAccent.innerHTML = renderOptions(CAPTION_ACCENT_PRESETS, savedCaption.captionAccent || DEFAULT_DESIGN.captionAccent);
  [globalCaptionStyles, globalCaptionPosition, globalCaptionSize, globalCaptionAccent].forEach((control) => {
    control?.addEventListener('change', handleGlobalCaptionChange);
  });
}

function addScene(scene = {}, options = {}) {
  const rowId = `scene-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  const design = { ...DEFAULT_DESIGN, ...globalSceneDesign(), ...scene };
  const hasVisualOverride = Boolean(scene.visualOverride);
  const hasCaptionOverride = Boolean(scene.captionOverride);
  const tr = document.createElement('tr');
  tr.className = 'scene-main';
  tr.dataset.designRow = rowId;
  tr.dataset.sceneId = rowId;
  tr.dataset.words = JSON.stringify(Array.isArray(scene.words) ? scene.words : []);
  tr.draggable = true;
  tr.innerHTML = `
    <td class="drag-cell"><button type="button" class="drag-handle" title="Drag scene">☰</button></td>
    <td>
      <span class="scene-number">Scene</span>
      <input type="hidden" class="scene-start" value="${scene.start ?? ''}" />
      <input type="hidden" class="scene-end" value="${scene.end ?? ''}" />
    </td>
    <td><span class="scene-duration">Auto</span></td>
    <td><textarea rows="2" class="scene-caption">${escapeHtml(scene.caption ?? '')}</textarea></td>
    <td><textarea rows="2" class="scene-narration">${escapeHtml(scene.narration ?? '')}</textarea></td>
    <td class="row-actions">
      <button type="button" class="insert-after small-icon-btn" title="Insert scene after this">S+</button>
      <button type="button" class="insert-clip-after small-icon-btn" title="Insert clip after this scene">C+</button>
      <button type="button" class="delete">×</button>
    </td>
  `;
  const designRow = document.createElement('tr');
  designRow.className = 'scene-design-row';
  designRow.dataset.rowId = rowId;
  designRow.innerHTML = `
    <td colspan="6">
      <details class="scene-advanced">
        <summary>Scene visual overrides</summary>
        <label class="override-toggle">
          <input type="checkbox" class="scene-visual-override" ${hasVisualOverride ? 'checked' : ''} />
          Override global scene look for this scene
        </label>
        <label class="override-toggle">
          <input type="checkbox" class="scene-caption-override" ${hasCaptionOverride ? 'checked' : ''} />
          Override global caption style for this scene
        </label>
      <div class="scene-design-grid">
        <div class="design-field wide visual-override-field">
          <span>Background</span>
          <div class="thumb-options">${renderThumbOptions(BACKGROUND_PRESETS, design.background, `${rowId}-bg`, 'scene-background')}</div>
        </div>
        <div class="design-field wide visual-override-field">
          <span>Device</span>
          <div class="device-options">${renderDeviceOptions(DEVICE_PRESETS, design.device, `${rowId}-device`)}</div>
        </div>
        <label class="design-field visual-override-field">
          Angle
          <select class="scene-angle">${renderOptions(ANGLE_PRESETS, design.angle)}</select>
        </label>
        <label class="design-field visual-override-field">
          Animation
          <select class="scene-motion">${renderOptions(MOTION_PRESETS, design.motion)}</select>
        </label>
        <label class="design-field zoom-field visual-override-field">
          Animation amount <strong>${Number(design.motionAmount || DEFAULT_DESIGN.motionAmount).toFixed(2)}×</strong>
          <input type="range" min="0.5" max="2.2" step="0.05" class="scene-motion-amount" value="${Number(design.motionAmount || DEFAULT_DESIGN.motionAmount)}" />
        </label>
        <label class="design-field visual-override-field">
          Transition
          <select class="scene-transition">${renderOptions(TRANSITION_PRESETS, design.transition)}</select>
        </label>
        <label class="design-field zoom-field visual-override-field">
          Screen zoom <strong>${Number(design.screenZoom || DEFAULT_DESIGN.screenZoom).toFixed(2)}×</strong>
          <input type="range" min="1" max="1.6" step="0.01" class="scene-screen-zoom" value="${Number(design.screenZoom || DEFAULT_DESIGN.screenZoom)}" />
        </label>
        <div class="design-field caption-style-field wide caption-override-field">
          <span>Caption style</span>
          <div class="caption-style-options">${renderCaptionStyleOptions(CAPTION_STYLE_PRESETS, design.captionStyle, `${rowId}-caption`)}</div>
        </div>
        <label class="design-field caption-override-field">
          Caption position
          <select class="scene-caption-position">${renderOptions(CAPTION_POSITION_PRESETS, design.captionPosition)}</select>
        </label>
        <label class="design-field caption-override-field">
          Caption animation
          <select class="scene-caption-animation">${renderOptions(CAPTION_ANIMATION_PRESETS, design.captionAnimation)}</select>
        </label>
        <label class="design-field caption-override-field">
          Caption size
          <select class="scene-caption-size">${renderOptions(CAPTION_SIZE_PRESETS, design.captionSize)}</select>
        </label>
        <label class="design-field caption-override-field">
          Caption accent
          <select class="scene-caption-accent">${renderOptions(CAPTION_ACCENT_PRESETS, design.captionAccent)}</select>
        </label>
        <label class="design-field zoom-field caption-override-field">
          Caption motion <strong>${Number(design.captionAnimationAmount || DEFAULT_DESIGN.captionAnimationAmount).toFixed(2)}×</strong>
          <input type="range" min="0.5" max="2.2" step="0.05" class="scene-caption-animation-amount" value="${Number(design.captionAnimationAmount || DEFAULT_DESIGN.captionAnimationAmount)}" />
        </label>
      </div>
      </details>
    </td>
  `;
  tr.addEventListener('click', () => selectScene(rowId));
  tr.addEventListener('dragstart', (event) => {
    dragSceneId = rowId;
    tr.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
  });
  tr.addEventListener('dragend', () => {
    dragSceneId = '';
    tr.classList.remove('dragging');
    [...sceneTableBody.querySelectorAll('.drag-over')].forEach(row => row.classList.remove('drag-over'));
    normalizeSceneTimeline();
    updateSceneNumbers();
    refreshClipPlacementOptions();
  });
  tr.addEventListener('dragover', (event) => {
    if (!dragSceneId || dragSceneId === rowId) return;
    event.preventDefault();
    tr.classList.add('drag-over');
  });
  tr.addEventListener('dragleave', () => tr.classList.remove('drag-over'));
  tr.addEventListener('drop', (event) => {
    event.preventDefault();
    moveScenePair(dragSceneId, rowId);
  });
  tr.querySelector('.insert-after').addEventListener('click', (event) => {
    event.stopPropagation();
    addScene(afterSceneDefaults(rowId), { afterSceneId: rowId });
  });
  tr.querySelector('.insert-clip-after').addEventListener('click', (event) => {
    event.stopPropagation();
    addClip({ placement: rowId });
    showMessage('Clip row added below. Choose the clip video file, then save the project.', 'success');
  });
  tr.querySelector('.delete').addEventListener('click', (event) => {
    event.stopPropagation();
    designRow.remove();
    tr.remove();
    if (selectedSceneId === rowId) {
      selectedSceneId = sceneRows().at(-1)?.dataset.sceneId || '';
      if (selectedSceneId) selectScene(selectedSceneId);
    }
    normalizeSceneTimeline();
    updateSceneNumbers();
    refreshClipPlacementOptions();
  });
  designRow.querySelector('.scene-motion-amount').addEventListener('input', (event) => {
    event.target.closest('.zoom-field').querySelector('strong').textContent = `${Number(event.target.value).toFixed(2)}×`;
  });
  designRow.querySelector('.scene-screen-zoom').addEventListener('input', (event) => {
    event.target.closest('.zoom-field').querySelector('strong').textContent = `${Number(event.target.value).toFixed(2)}×`;
  });
  designRow.querySelector('.scene-caption-animation-amount').addEventListener('input', (event) => {
    event.target.closest('.zoom-field').querySelector('strong').textContent = `${Number(event.target.value).toFixed(2)}×`;
  });
  bindSceneLocalValueTracking(designRow);
  designRow.querySelector('.scene-visual-override').addEventListener('change', () => updateSceneOverrideState(designRow));
  designRow.querySelector('.scene-caption-override').addEventListener('change', () => updateSceneOverrideState(designRow));
  updateSceneOverrideState(designRow);
  insertScenePair(tr, designRow, options.afterSceneId);
  selectScene(rowId);
  normalizeSceneTimeline();
  updateSceneNumbers();
  refreshClipPlacementOptions();
}

function renderOptions(presets, selected, options = {}) {
  const perScene = options.perScene ? '<option value="">Per scene</option>' : '';
  return perScene + presets.map((preset) => `<option value="${preset.id}" ${preset.id === selected ? 'selected' : ''}>${preset.label}</option>`).join('');
}

function renderThumbOptions(presets, selected, name, className, options = {}) {
  const perScene = options.perScene ? `
    <label class="thumb-option per-scene-option">
      <input type="radio" class="${className}" name="${name}" value="" ${selected ? '' : 'checked'} />
      <span class="per-scene-icon">Scene</span>
      <span>Per scene</span>
    </label>
  ` : '';
  return perScene + presets.map((preset) => {
    const isAnimated = ANIMATED_BACKGROUND_IDS.has(preset.id);
    const mediaPreview = preset.id === 'custom-media'
      ? customBackgroundThumbMarkup()
      : `<img src="${preset.thumb}" alt="" />`;
    return `
    <label class="thumb-option${isAnimated ? ' animated-thumb-option' : ''}">
      <input type="radio" class="${className}" name="${name}" value="${preset.id}" ${preset.id === selected ? 'checked' : ''} />
      ${mediaPreview}
      ${isAnimated ? '<span class="animated-badge" title="Animated background">Animated</span>' : ''}
      <span>${preset.label}</span>
    </label>
  `;
  }).join('');
}

function customBackgroundThumbMarkup() {
  const src = customBackgroundPreviewUrl || '/preview-assets/assets/background-custom-media.svg';
  const safeSrc = escapeHtml(src);
  if (customBackgroundPreviewIsVideo) {
    return `<div class="custom-media-preview has-media"><video src="${safeSrc}" muted playsinline loop></video><strong>Video</strong></div>`;
  }
  return `<div class="custom-media-preview${customBackgroundPreviewUrl ? ' has-media' : ''}"><img src="${safeSrc}" alt="" /><strong>${customBackgroundPreviewUrl ? 'Custom' : 'Upload'}</strong></div>`;
}

function renderDeviceOptions(presets, selected, name, options = {}) {
  const inputClass = name === 'global-device' ? 'global-device' : 'scene-device';
  const perScene = options.perScene ? `
    <label class="device-option per-scene-option">
      <input type="radio" class="${inputClass}" name="${name}" value="" ${selected ? '' : 'checked'} />
      <span class="device-icon per-scene-device-icon">Scene</span>
      <span>Per scene</span>
    </label>
  ` : '';
  return perScene + presets.map((preset) => `
    <label class="device-option ${preset.id}">
      <input type="radio" class="${inputClass}" name="${name}" value="${preset.id}" ${preset.id === selected ? 'checked' : ''} />
      <span class="device-icon"></span>
      <span>${preset.label}</span>
    </label>
  `).join('');
}

function sceneDesignRows() {
  return [...sceneTableBody.querySelectorAll('tr.scene-design-row')];
}

function fieldHost(designRow, selector) {
  const field = designRow.querySelector(selector);
  if (!field) return null;
  if (field.type === 'radio') {
    return field.closest('.thumb-options, .device-options, .caption-style-options');
  }
  return field;
}

function readSceneFieldValue(designRow, field) {
  const control = designRow.querySelector(field.selector);
  if (!control) return field.defaultValue;
  if (control.type === 'radio') return checkedValue(designRow, field.selector, field.defaultValue);
  return control.value || field.defaultValue;
}

function writeSceneFieldValue(designRow, field, value) {
  const controls = [...designRow.querySelectorAll(field.selector)];
  if (!controls.length) return;
  if (controls[0].type === 'radio') {
    const valueText = String(value ?? field.defaultValue);
    controls.forEach((control) => {
      control.checked = control.value === valueText;
    });
    if (!controls.some((control) => control.checked)) {
      const fallback = controls.find((control) => control.value === String(field.defaultValue));
      if (fallback) fallback.checked = true;
    }
    return;
  }
  controls[0].value = value ?? field.defaultValue;
  updateRangeLabel(controls[0]);
}

function updateRangeLabel(control) {
  if (!control || control.type !== 'range') return;
  const label = control.closest('.zoom-field')?.querySelector('strong');
  if (label) label.textContent = `${Number(control.value || 0).toFixed(2)}×`;
}

function rememberSceneLocalValue(designRow, field) {
  const host = fieldHost(designRow, field.selector);
  if (!host) return;
  host.dataset.localValue = readSceneFieldValue(designRow, field);
  host.dataset.userOverride = '1';
  delete host.dataset.globalMirror;
}

function bindSceneLocalValueTracking(designRow) {
  [...VISUAL_MIRROR_FIELDS, ...CAPTION_MIRROR_FIELDS].forEach((field) => {
    designRow.querySelectorAll(field.selector).forEach((control) => {
      control.addEventListener(control.type === 'range' ? 'input' : 'change', () => {
        if (!control.disabled) rememberSceneLocalValue(designRow, field);
      });
    });
  });
}

function mirrorFieldFromGlobal(designRow, field, globalValue, overrideActive) {
  const host = fieldHost(designRow, field.selector);
  if (!host || (overrideActive && host.dataset.userOverride === '1')) return;

  const hasGlobalValue = field.alwaysGlobal || (globalValue !== '' && globalValue !== null && globalValue !== undefined);
  if (hasGlobalValue) {
    if (host.dataset.globalMirror !== '1') {
      host.dataset.localValue = readSceneFieldValue(designRow, field);
    }
    writeSceneFieldValue(designRow, field, globalValue);
    host.dataset.globalMirror = '1';
    host.dataset.globalValue = String(globalValue ?? '');
    return;
  }

  if (host.dataset.globalMirror === '1') {
    writeSceneFieldValue(designRow, field, host.dataset.localValue || field.defaultValue);
    delete host.dataset.globalMirror;
    delete host.dataset.globalValue;
  }
}

function syncSceneControlsWithGlobals(targetDesignRow = null) {
  const visual = globalVisualDesign();
  const caption = globalCaptionDesign();
  const rows = targetDesignRow ? [targetDesignRow] : sceneDesignRows();

  rows.forEach((designRow) => {
    const visualOverride = designRow.querySelector('.scene-visual-override')?.checked;
    const captionOverride = designRow.querySelector('.scene-caption-override')?.checked;
    VISUAL_MIRROR_FIELDS.forEach((field) => mirrorFieldFromGlobal(designRow, field, visual[field.key], visualOverride));
    CAPTION_MIRROR_FIELDS.forEach((field) => mirrorFieldFromGlobal(designRow, field, caption[field.key], captionOverride));
  });
}

function updateSceneOverrideState(designRow) {
  const visualOverride = designRow.querySelector('.scene-visual-override')?.checked;
  const captionOverride = designRow.querySelector('.scene-caption-override')?.checked;
  designRow.querySelectorAll('.visual-override-field input, .visual-override-field select').forEach((field) => {
    field.disabled = !visualOverride;
  });
  designRow.querySelectorAll('.caption-override-field input, .caption-override-field select').forEach((field) => {
    field.disabled = !captionOverride;
  });
  designRow.classList.toggle('visual-inherits-global', !visualOverride);
  designRow.classList.toggle('caption-inherits-global', !captionOverride);
  syncSceneControlsWithGlobals(designRow);
}

function renderCaptionStyleOptions(presets, selected, name, className = 'scene-caption-style') {
  return presets.map((preset) => `
    <label class="caption-style-option ${preset.id}">
      <input type="radio" class="${className}" name="${name}" value="${preset.id}" ${preset.id === selected ? 'checked' : ''} />
      <span class="caption-style-preview"><b>${preset.sample}</b><em>Product</em></span>
      <span>${preset.label}</span>
    </label>
  `).join('');
}

function insertScenePair(tr, designRow, afterSceneId = '') {
  if (afterSceneId) {
    const anchor = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${afterSceneId}"]`);
    const anchorDesign = anchor?.nextElementSibling;
    if (anchorDesign) {
      anchorDesign.after(tr, designRow);
      return;
    }
  }
  sceneTableBody.appendChild(tr);
  sceneTableBody.appendChild(designRow);
}

function moveScenePair(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const source = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${sourceId}"]`);
  const target = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${targetId}"]`);
  if (!source || !target) return;
  const sourceDesign = source.nextElementSibling;
  const targetDesign = target.nextElementSibling;
  const beforeTarget = source.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING;
  if (beforeTarget) {
    targetDesign.after(source, sourceDesign);
  } else {
    target.before(source, sourceDesign);
  }
  selectScene(sourceId);
  normalizeSceneTimeline();
  updateSceneNumbers();
  refreshClipPlacementOptions();
}

function selectScene(rowId) {
  selectedSceneId = rowId;
  sceneTableBody.querySelectorAll('tr.scene-main').forEach(row => row.classList.toggle('selected-row', row.dataset.sceneId === rowId));
}

function sceneRows() {
  return [...sceneTableBody.querySelectorAll('tr.scene-main')];
}

function afterSceneDefaults(rowId) {
  const row = sceneTableBody.querySelector(`tr.scene-main[data-scene-id="${rowId}"]`);
  const end = Number(row?.querySelector('.scene-end')?.value || 0);
  const next = row?.nextElementSibling?.nextElementSibling;
  const nextStart = Number(next?.querySelector?.('.scene-start')?.value || end + 4);
  const duration = Math.max(1, Math.min(4, nextStart - end || 4));
  return { start: end, end: end + duration, caption: '', narration: '', ...globalSceneDesign() };
}

function updateSceneNumbers() {
  sceneRows().forEach((row, index) => {
    const start = Number(row.querySelector('.scene-start')?.value || 0);
    const end = Number(row.querySelector('.scene-end')?.value || start);
    const duration = Math.max(0, end - start);
    const number = row.querySelector('.scene-number');
    const length = row.querySelector('.scene-duration');
    if (number) number.textContent = `Scene ${index + 1}`;
    if (length) length.textContent = duration ? `${duration.toFixed(duration < 10 ? 2 : 1)}s` : 'Auto';
  });
}

function normalizeSceneTimeline() {
  const rows = sceneRows();
  if (!rows.length) return;
  if (rows.some((row) => hasVoiceoverWordTiming(parseWords(row.dataset.words)))) return;
  let cursor = 0;
  rows.forEach((row) => {
    const startInput = row.querySelector('.scene-start');
    const endInput = row.querySelector('.scene-end');
    const oldStart = Number(startInput.value || cursor);
    const oldEnd = Number(endInput.value || oldStart + 4);
    const duration = Math.max(0.5, oldEnd - oldStart || 4);
    startInput.value = Number(cursor.toFixed(2));
    endInput.value = Number((cursor + duration).toFixed(2));
    shiftStoredWords(row, cursor - oldStart);
    cursor += duration;
  });
}

function addClip(clip = {}) {
  const rowId = `clip_${Date.now()}_${Math.round(Math.random() * 100000)}`;
  const clipStart = Number(clip.start);
  const clipEnd = Number(clip.end);
  const timelineDuration = Number.isFinite(clipStart) && Number.isFinite(clipEnd) && clipEnd > clipStart
    ? Number((clipEnd - clipStart).toFixed(2))
    : (clip.durationSeconds || DEFAULT_CLIP_DURATION);
  const tr = document.createElement('tr');
  tr.className = 'clip-row';
  tr.dataset.clipId = rowId;
  tr.dataset.asset = clip.asset || '';
  tr.dataset.start = clip.start ?? '';
  tr.dataset.end = clip.end ?? '';
  tr.dataset.preferredPlacement = clip.placement || 'start';
  tr.draggable = true;
  const assetNote = clip.asset ? '<small class="asset-note">Saved clip kept unless replaced.</small>' : '';
  tr.innerHTML = `
    <td class="drag-cell"><button type="button" class="drag-handle" title="Drag clip">☰</button></td>
    <td>
      <span class="clip-placement-badge">Start</span>
      <select class="clip-placement"></select>
    </td>
    <td><input type="number" step="0.25" min="0.5" class="clip-duration" value="${timelineDuration}" /></td>
    <td><select class="clip-mode">${renderOptions(CLIP_MODE_PRESETS, clip.mode || 'device-screen')}</select></td>
    <td><input name="${rowId}" type="file" class="clip-file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska" />${assetNote}</td>
    <td><input class="clip-label" value="${escapeHtml(clip.label || '')}" placeholder="Optional" /></td>
    <td><button type="button" class="delete">×</button></td>
  `;
  tr.addEventListener('dragstart', (event) => {
    dragClipId = rowId;
    tr.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
  });
  tr.addEventListener('dragend', () => {
    dragClipId = '';
    tr.classList.remove('dragging');
    [...clipTableBody.querySelectorAll('.drag-over')].forEach(row => row.classList.remove('drag-over'));
  });
  tr.addEventListener('dragover', (event) => {
    if (!dragClipId || dragClipId === rowId) return;
    event.preventDefault();
    tr.classList.add('drag-over');
  });
  tr.addEventListener('dragleave', () => tr.classList.remove('drag-over'));
  tr.addEventListener('drop', (event) => {
    event.preventDefault();
    moveClipRow(dragClipId, rowId);
  });
  tr.querySelector('.delete').addEventListener('click', () => tr.remove());
  tr.querySelector('.clip-placement').addEventListener('change', () => {
    tr.dataset.preferredPlacement = tr.querySelector('.clip-placement').value;
    tr.dataset.start = '';
    tr.dataset.end = '';
    syncClipPlacementBadge(tr);
  });
  clipTableBody.appendChild(tr);
  refreshClipPlacementOptions();
  tr.querySelector('.clip-file')?.focus();
}

function moveClipRow(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const source = clipTableBody.querySelector(`tr.clip-row[data-clip-id="${sourceId}"]`);
  const target = clipTableBody.querySelector(`tr.clip-row[data-clip-id="${targetId}"]`);
  if (!source || !target) return;
  const beforeTarget = source.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING;
  if (beforeTarget) {
    target.after(source);
  } else {
    target.before(source);
  }
}

function refreshClipPlacementOptions() {
  const rows = sceneRows();
  const options = [
    { value: 'start', label: 'Start of video' },
    ...rows.map((row, index) => ({
      value: row.dataset.sceneId,
      label: `After scene ${index + 1}`,
    })),
  ];
  clipTableBody.querySelectorAll('.clip-placement').forEach((select) => {
    const row = select.closest('.clip-row');
    const previous = row?.dataset.preferredPlacement || select.value;
    select.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
    const fallback = options.some((option) => option.value === selectedSceneId) ? selectedSceneId : (options[options.length - 1]?.value || 'start');
    select.value = options.some((option) => option.value === previous) ? previous : fallback;
    if (row) {
      row.dataset.preferredPlacement = select.value;
      syncClipPlacementBadge(row);
    }
  });
}

function syncClipPlacementBadge(row) {
  const select = row.querySelector('.clip-placement');
  const badge = row.querySelector('.clip-placement-badge');
  if (!select || !badge) return;
  badge.textContent = select.options[select.selectedIndex]?.textContent || 'Start';
}

function loadSampleScenes() {
  sceneTableBody.innerHTML = '';
  selectedSceneId = '';
  [
    { start: 0, end: 4, caption: 'Story time,\njust got smarter', narration: 'Story time just got smarter.', background: 'reading-room', device: 'tablet-pro', angle: 'low-desk-left', motion: 'slow-push-in', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'editorial-card', captionPosition: 'top', captionAnimation: 'none', captionSize: 'large', captionAccent: 'last-word', captionAnimationAmount: 1.65 },
    { start: 4, end: 9, caption: 'the interactive story companion', narration: 'Meet the interactive story companion for young readers.', background: 'office-desk', device: 'laptop-silver', angle: 'front-center', motion: 'screen-focus', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'glass-card', captionPosition: 'top', captionAnimation: 'none', captionSize: 'standard', captionAccent: 'none', captionAnimationAmount: 1.4 },
    { start: 9, end: 15, caption: 'listen', narration: 'Listen to every line with clear narration.', background: 'cafe-table', device: 'phone-modern', angle: 'floating-hero', motion: 'device-tilt', motionAmount: 2.2, screenZoom: 1, transition: 'slide-up', captionStyle: 'neon-ribbon', captionPosition: 'top', captionAnimation: 'none', captionSize: 'compact', captionAccent: 'first-word', captionAnimationAmount: 1.7 },
    { start: 15, end: 22, caption: 'and tap any word to\nhear it out', narration: 'Tap any word to hear it out and build confidence.', background: 'home-office', device: 'tablet-pro', angle: 'low-desk-right', motion: 'pan-left', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'bold-bottom', captionPosition: 'bottom', captionAnimation: 'none', captionSize: 'hero', captionAccent: 'last-word', captionAnimationAmount: 1.55 },
    { start: 22, end: 26, caption: 'built from your real product', narration: 'Built from your real website or software recording.', background: 'meeting-room', device: 'browser-window', angle: 'front-center', motion: 'pan-right', motionAmount: 2.2, screenZoom: 1, transition: 'clean-cut', captionStyle: 'minimal-subtitle', captionPosition: 'bottom', captionAnimation: 'none', captionSize: 'standard', captionAccent: 'none', captionAnimationAmount: 1.2 },
    { start: 26, end: 30, caption: 'Try it free today', narration: 'Try it free today.', background: 'creator-studio', device: 'tablet-pro', angle: 'floating-hero', motion: 'cta-push', motionAmount: 2.2, screenZoom: 1, transition: 'soft-fade', captionStyle: 'device-callout', captionPosition: 'device', captionAnimation: 'none', captionSize: 'large', captionAccent: 'first-word', captionAnimationAmount: 1.8 },
  ].map((scene) => ({ ...scene, visualOverride: true, captionOverride: true })).forEach(addScene);
  normalizeSceneTimeline();
  updateSceneNumbers();
  refreshClipPlacementOptions();
}

function collectScenes() {
  normalizeSceneTimeline();
  updateSceneNumbers();
  if (singleSceneModeInput?.checked && sceneRows().length > 1) {
    mergeScenesForSingleMode({ silent: true });
  }
  return collectSceneRows();
}

function collectSceneRows() {
  const globalVisual = globalVisualDesign();
  const globalCaption = globalCaptionDesign();
  const visualValue = (sceneValue, globalValue) => globalValue || sceneValue;
  return [...sceneTableBody.querySelectorAll('tr.scene-main')].map(row => {
    const designRow = row.nextElementSibling;
    const words = parseWords(row.dataset.words);
    const hasVisualOverride = designRow.querySelector('.scene-visual-override')?.checked;
    const hasCaptionOverride = designRow.querySelector('.scene-caption-override')?.checked;
    return {
      start: Number(row.querySelector('.scene-start').value || 0),
      end: Number(row.querySelector('.scene-end').value || 0),
      caption: row.querySelector('.scene-caption').value.trim(),
      narration: row.querySelector('.scene-narration').value.trim(),
      background: hasVisualOverride ? checkedValue(designRow, '.scene-background', DEFAULT_DESIGN.background) : visualValue(checkedValue(designRow, '.scene-background', DEFAULT_DESIGN.background), globalVisual.background),
      device: hasVisualOverride ? checkedValue(designRow, '.scene-device', DEFAULT_DESIGN.device) : visualValue(checkedValue(designRow, '.scene-device', DEFAULT_DESIGN.device), globalVisual.device),
      angle: hasVisualOverride ? designRow.querySelector('.scene-angle').value : visualValue(designRow.querySelector('.scene-angle').value, globalVisual.angle),
      motion: hasVisualOverride ? designRow.querySelector('.scene-motion').value : visualValue(designRow.querySelector('.scene-motion').value, globalVisual.motion),
      motionAmount: hasVisualOverride ? Number(designRow.querySelector('.scene-motion-amount').value || globalVisual.motionAmount) : globalVisual.motionAmount,
      screenZoom: hasVisualOverride ? Number(designRow.querySelector('.scene-screen-zoom').value || globalVisual.screenZoom) : globalVisual.screenZoom,
      transition: hasVisualOverride ? designRow.querySelector('.scene-transition').value : visualValue(designRow.querySelector('.scene-transition').value, globalVisual.transition),
      captionStyle: hasCaptionOverride ? checkedValue(designRow, '.scene-caption-style', globalCaption.captionStyle) : globalCaption.captionStyle,
      captionPosition: hasCaptionOverride ? designRow.querySelector('.scene-caption-position').value : globalCaption.captionPosition,
      captionAnimation: hasCaptionOverride ? designRow.querySelector('.scene-caption-animation').value : globalCaption.captionAnimation,
      captionSize: hasCaptionOverride ? designRow.querySelector('.scene-caption-size').value : globalCaption.captionSize,
      captionAccent: hasCaptionOverride ? designRow.querySelector('.scene-caption-accent').value : globalCaption.captionAccent,
      captionAnimationAmount: hasCaptionOverride ? Number(designRow.querySelector('.scene-caption-animation-amount').value || DEFAULT_DESIGN.captionAnimationAmount) : globalCaption.captionAnimationAmount,
      visualOverride: Boolean(hasVisualOverride),
      captionOverride: Boolean(hasCaptionOverride),
      words,
      wordTimingSource: hasVoiceoverWordTiming(words) ? 'voiceover' : 'estimated',
    };
  }).filter(s => s.end > s.start && (s.caption || s.narration));
}

function parseWords(value) {
  try {
    const words = JSON.parse(value || '[]');
    return Array.isArray(words) ? words : [];
  } catch {
    return [];
  }
}

function hasVoiceoverWordTiming(words) {
  return words.some((word) => word.source === 'voiceover' || (word.source !== 'estimated' && Number.isFinite(Number(word.start)) && Number.isFinite(Number(word.end))));
}

function collectClips() {
  normalizeSceneTimeline();
  updateSceneNumbers();
  const sceneTimings = sceneRows().map((row) => ({
    id: row.dataset.sceneId,
    start: Number(row.querySelector('.scene-start').value || 0),
    end: Number(row.querySelector('.scene-end').value || 0),
  }));
  const placementOffsets = new Map();
  return [...clipTableBody.querySelectorAll('tr.clip-row')].map(row => {
    const fileInput = row.querySelector('.clip-file');
    const placement = row.querySelector('.clip-placement').value;
    const existingAsset = row.dataset.asset || '';
    const hasReplacementFile = fileInput.files.length > 0;
    const storedStart = Number(row.dataset.start);
    const storedEnd = Number(row.dataset.end);
    const baseStart = placement === 'start'
      ? 0
      : (sceneTimings.find((scene) => scene.id === placement)?.end ?? lastSceneEnd());
    const duration = Number(row.querySelector('.clip-duration').value || DEFAULT_CLIP_DURATION);
    const safeDuration = Math.max(0.5, duration);
    const offset = placementOffsets.get(placement) || 0;
    const shouldUseStoredTiming = existingAsset && !hasReplacementFile && Number.isFinite(storedStart) && Number.isFinite(storedEnd) && storedEnd > storedStart;
    const start = shouldUseStoredTiming ? storedStart : baseStart + offset;
    const end = shouldUseStoredTiming ? storedStart + safeDuration : start + safeDuration;
    if (!shouldUseStoredTiming) placementOffsets.set(placement, offset + safeDuration);
    return {
      start,
      end,
      mode: row.querySelector('.clip-mode').value,
      label: row.querySelector('.clip-label').value.trim() || fileInput.files[0]?.name || 'Clip',
      fileField: fileInput.name,
      asset: existingAsset,
    };
  }).filter((clip, index) => {
    const row = clipTableBody.querySelectorAll('tr.clip-row')[index];
    return clip.end > clip.start && (row.querySelector('.clip-file').files.length > 0 || row.dataset.asset);
  });
}

function lastSceneEnd() {
  return Math.max(0, ...sceneRows().map(row => Number(row.querySelector('.scene-end').value || 0)));
}

function reflowSceneTimings() {
  let cursor = 0;
  sceneRows().forEach((row) => {
    const startInput = row.querySelector('.scene-start');
    const endInput = row.querySelector('.scene-end');
    const oldStart = Number(startInput.value || cursor);
    const oldEnd = Number(endInput.value || oldStart + 4);
    const duration = Math.max(0.5, oldEnd - oldStart);
    startInput.value = Number(cursor.toFixed(2));
    endInput.value = Number((cursor + duration).toFixed(2));
    shiftStoredWords(row, cursor - oldStart);
    cursor += duration;
  });
  updateSceneNumbers();
  refreshClipPlacementOptions();
}

function scenePacingConfig({ writeBack = true } = {}) {
  const singleScene = Boolean(singleSceneModeInput?.checked);
  const minSeconds = clampNumber(Number(minSceneSecondsInput?.value || 2.5), 1, 120);
  const targetSeconds = clampNumber(Number(targetSceneSecondsInput?.value || 4.5), minSeconds, MAX_PROJECT_SECONDS);
  const maxSeconds = clampNumber(Number(maxSceneSecondsInput?.value || 7), Math.max(targetSeconds, minSeconds + 0.25), MAX_PROJECT_SECONDS);
  if (writeBack) {
    if (minSceneSecondsInput) minSceneSecondsInput.value = minSeconds;
    if (targetSceneSecondsInput) targetSceneSecondsInput.value = targetSeconds;
    if (maxSceneSecondsInput) maxSceneSecondsInput.value = maxSeconds;
    syncSingleScenePacingState(singleScene);
  }
  return { minSeconds, targetSeconds, maxSeconds, singleScene };
}

function syncSingleScenePacingState(singleScene = Boolean(singleSceneModeInput?.checked)) {
  [minSceneSecondsInput, targetSceneSecondsInput, maxSceneSecondsInput].forEach((control) => {
    if (control) control.disabled = singleScene;
  });
}

function initScenePacingControls() {
  const savedPacing = loadStudioGlobalSettings().pacing || {};
  if (minSceneSecondsInput && savedPacing.minSeconds) minSceneSecondsInput.value = savedPacing.minSeconds;
  if (targetSceneSecondsInput && savedPacing.targetSeconds) targetSceneSecondsInput.value = savedPacing.targetSeconds;
  if (maxSceneSecondsInput && savedPacing.maxSeconds) maxSceneSecondsInput.value = savedPacing.maxSeconds;
  if (singleSceneModeInput) singleSceneModeInput.checked = Boolean(savedPacing.singleScene);
  scenePacingConfig();
  [minSceneSecondsInput, targetSceneSecondsInput, maxSceneSecondsInput, singleSceneModeInput].forEach((control) => {
    control?.addEventListener('change', (event) => {
      scenePacingConfig();
      saveStudioGlobalSettings();
      if (event.currentTarget === singleSceneModeInput && singleSceneModeInput.checked) {
        mergeScenesForSingleMode();
      }
    });
  });
}

function layoutLiftConfig({ writeBack = true } = {}) {
  const deviceLift = clampNumber(Number(layoutDeviceLiftInput?.value || 0), 0, 16);
  const ctaLift = clampNumber(Number(layoutCtaLiftInput?.value || 0), 0, 12);
  if (writeBack) {
    if (layoutDeviceLiftInput) layoutDeviceLiftInput.value = String(deviceLift);
    if (layoutCtaLiftInput) layoutCtaLiftInput.value = String(ctaLift);
  }
  return { deviceLift, ctaLift };
}

function initLayoutLiftControls() {
  const savedLayout = loadStudioGlobalSettings().layout || {};
  if (layoutDeviceLiftInput && savedLayout.deviceLift !== undefined) layoutDeviceLiftInput.value = String(savedLayout.deviceLift);
  if (layoutCtaLiftInput && savedLayout.ctaLift !== undefined) layoutCtaLiftInput.value = String(savedLayout.ctaLift);
  layoutLiftConfig();
  [layoutDeviceLiftInput, layoutCtaLiftInput].forEach((control) => {
    control?.addEventListener('change', () => {
      layoutLiftConfig();
      saveStudioGlobalSettings();
    });
  });
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function rebuildScenesByPacing(options = {}) {
  const silent = Boolean(options.silent);
  normalizeSceneTimeline();
  const scenes = collectSceneRows().sort((a, b) => a.start - b.start);
  if (!scenes.length) {
    if (!silent) showMessage('Add or generate scenes before rebuilding scene lengths.', 'error');
    return;
  }

  const { minSeconds, targetSeconds, maxSeconds, singleScene } = scenePacingConfig();
  if (singleScene) {
    mergeScenesForSingleMode({ silent });
    return;
  }
  const groups = [];
  let buffer = [];

  scenes.forEach((scene) => {
    if (buffer.length) {
      const currentStart = buffer[0].start;
      const projectedDuration = Math.max(0, scene.end - currentStart);
      const currentDuration = Math.max(0, buffer.at(-1).end - currentStart);
      if (currentDuration >= minSeconds && projectedDuration > maxSeconds) {
        groups.push(buffer);
        buffer = [];
      }
    }

    buffer.push(scene);
    const duration = Math.max(0, buffer.at(-1).end - buffer[0].start);
    const lastText = (scene.narration || scene.caption || '').trim();
    const endsSentence = /[.!?]$/.test(lastText);
    if (duration >= maxSeconds || (duration >= targetSeconds && endsSentence)) {
      groups.push(buffer);
      buffer = [];
    }
  });

  if (buffer.length) {
    const duration = Math.max(0, buffer.at(-1).end - buffer[0].start);
    if (groups.length && duration < minSeconds) {
      groups[groups.length - 1] = groups[groups.length - 1].concat(buffer);
    } else {
      groups.push(buffer);
    }
  }

  const rebuilt = groups.map((group) => mergeSceneGroup(group));
  sceneTableBody.innerHTML = '';
  selectedSceneId = '';
  rebuilt.forEach(addScene);
  normalizeSceneTimeline();
  updateSceneNumbers();
  refreshClipPlacementOptions();
  if (projectForm.elements.durationSeconds) {
    projectForm.elements.durationSeconds.value = Math.ceil(Math.max(Number(projectForm.elements.durationSeconds.value || 0), lastSceneEnd()));
  }
  if (!silent) showMessage(`Rebuilt ${scenes.length} scenes into ${rebuilt.length} paced scenes. Word timings were preserved.`, 'success');
}

function mergeScenesForSingleMode(options = {}) {
  const silent = Boolean(options.silent);
  normalizeSceneTimeline();
  const scenes = collectSceneRows().sort((a, b) => a.start - b.start);
  if (!scenes.length) {
    if (!silent) showMessage('Add or generate scenes before merging into one scene.', 'error');
    return false;
  }
  if (scenes.length === 1) {
    if (!silent) showMessage('This project already has one scene.', 'success');
    return true;
  }

  const rebuilt = [mergeSceneGroup(scenes)];
  sceneTableBody.innerHTML = '';
  selectedSceneId = '';
  rebuilt.forEach(addScene);
  normalizeSceneTimeline();
  updateSceneNumbers();
  refreshClipPlacementOptions();
  if (projectForm.elements.durationSeconds) {
    projectForm.elements.durationSeconds.value = Math.ceil(Math.max(Number(projectForm.elements.durationSeconds.value || 0), lastSceneEnd()));
  }
  if (!silent) showMessage(`Merged ${scenes.length} scenes into one story scene. Word timings were preserved.`, 'success');
  return true;
}

function mergeSceneGroup(group) {
  const first = group[0];
  const text = normalizeWhitespace(group.map((scene) => scene.narration || scene.caption || '').filter(Boolean).join(' '));
  const words = group.flatMap((scene) => Array.isArray(scene.words) ? scene.words : []).sort((a, b) => Number(a.start || 0) - Number(b.start || 0));
  return {
    ...first,
    start: Number(first.start.toFixed(2)),
    end: Number(group.at(-1).end.toFixed(2)),
    caption: captionFromText(text || normalizeWhitespace(group.map((scene) => scene.caption || '').join(' '))),
    narration: text,
    words,
    wordTimingSource: hasVoiceoverWordTiming(words) ? 'voiceover' : first.wordTimingSource || 'estimated',
  };
}

function captionFromText(text, maxChars = 42) {
  const words = normalizeWhitespace(text).split(' ').filter(Boolean);
  if (!words.length) return '';
  const lines = [];
  let current = [];
  words.forEach((word) => {
    const candidate = [...current, word].join(' ');
    if (current.length && candidate.length > maxChars) {
      lines.push(current.join(' '));
      current = [word];
    } else {
      current.push(word);
    }
  });
  if (current.length) lines.push(current.join(' '));
  return lines.slice(0, 2).join('\n');
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function shiftStoredWords(row, delta) {
  if (!delta) return;
  const words = parseWords(row.dataset.words);
  if (!words.length) return;
  row.dataset.words = JSON.stringify(words.map((word) => ({
    ...word,
    start: Number((Number(word.start || 0) + delta).toFixed(3)),
    end: Number((Number(word.end || 0) + delta).toFixed(3)),
  })));
}

async function generateScenesFromVoiceover(button) {
  const audio = voiceoverInput?.files?.[0];
  if (!audio) {
    showMessage('Choose an audio file first, then generate captions from it.', 'error');
    syncTranscribeButtonState();
    return;
  }

  button.disabled = true;
  button.textContent = 'Transcribing...';
  const hasOriginalScript = Boolean(normalizeWhitespace(originalScriptInput?.value || ''));
  showMessage(
    hasOriginalScript
      ? `${reduceMusicForCaptionsInput?.checked ? 'Preparing speech-focused audio, then a' : 'A'}ligning the original script for word-level caption timing.`
      : `${reduceMusicForCaptionsInput?.checked ? 'Preparing speech-focused audio, then t' : 'T'}ranscribing voiceover. The first run can take a while if the local model needs to load.`,
    '',
  );
  try {
    const formData = new FormData();
    formData.set('audio', audio);
    formData.set('durationSeconds', projectForm.elements.durationSeconds.value || '30');
    formData.set('transcriptionLanguage', transcriptionLanguage?.value || 'auto');
    formData.set('originalScript', originalScriptInput?.value || '');
    formData.set('useWhisperxAlignment', useWhisperxAlignmentInput?.checked ? '1' : '0');
    formData.set('reduceMusicForCaptions', reduceMusicForCaptionsInput?.checked ? '1' : '0');
    const pacing = scenePacingConfig();
    formData.set('minSceneSeconds', pacing.minSeconds);
    formData.set('targetSceneSeconds', pacing.targetSeconds);
    formData.set('maxSceneSeconds', pacing.maxSeconds);
    formData.set('singleSceneMode', pacing.singleScene ? '1' : '0');
    formData.set('productName', projectForm.elements.productName.value || '');
    formData.set('cta', projectForm.elements.cta.value || '');

    const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not transcribe voiceover');

    sceneTableBody.innerHTML = '';
    selectedSceneId = '';
    data.scenes.forEach(addScene);
    if (data.durationSeconds && projectForm.elements.durationSeconds) {
      projectForm.elements.durationSeconds.value = Math.ceil(Number(data.durationSeconds));
    }
    refreshClipPlacementOptions();
    const warning = data.warning ? `\n\n${data.warning}` : '';
    const sourceText = data.transcriptSource === 'script-whisperx'
      ? ' from the original script with WhisperX timing'
      : data.transcriptSource === 'script'
        ? ' from the original script'
        : ' from voiceover';
    const audioText = data.audioPreprocessed ? ' Music reduction was applied before caption generation.' : '';
    showMessage(`Generated ${data.scenes.length} caption scenes${sourceText}.${audioText}${warning}`, data.warning ? '' : 'success');
  } catch (err) {
    showMessage(String(err.message || err), 'error');
  } finally {
    button.textContent = 'Generate captions';
    syncTranscribeButtonState();
  }
}

function checkedValue(root, selector, fallback) {
  return root.querySelector(`${selector}:checked`)?.value || fallback;
}

function setFormValue(name, value) {
  const field = projectForm?.elements?.[name];
  if (field) field.value = value ?? '';
}

function setEditState(project = null) {
  const isEditing = Boolean(project?.id || editingProjectId);
  if (saveBarTitle) saveBarTitle.textContent = isEditing ? 'Editing project' : 'Ready for preview';
  if (saveBarHint) {
    saveBarHint.textContent = isEditing
      ? `Updating ${project?.title || editingProjectId}. Saved media stays in place unless replaced.`
      : 'Save the project to open the preview studio.';
  }
  if (saveProjectBtn) saveProjectBtn.textContent = isEditing ? 'Update Project' : 'Save Project';
  newProjectBtn?.classList.toggle('hidden', !isEditing);
}

function showExistingThumbnail(asset) {
  if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
  thumbnailPreviewUrl = '';
  if (asset && thumbnailPreview) {
    thumbnailPreview.src = `/preview-assets/${String(asset).replace(/\\/g, '/')}`;
    thumbnailPreview.classList.remove('hidden');
    thumbnailPasteZone?.classList.remove('muted');
    if (thumbnailPasteHint) thumbnailPasteHint.textContent = 'Saved thumbnail kept unless replaced.';
    return;
  }
  updateThumbnailPreview(null, 'Upload an image or focus here and paste with Ctrl+V.');
}

function showExistingCustomBackground(asset) {
  setCustomBackgroundPreview(asset ? `/preview-assets/${String(asset).replace(/\\/g, '/')}` : '', isVideoAsset(asset));
  if (customBackgroundHint) {
    customBackgroundHint.textContent = asset
      ? 'Saved media kept unless replaced'
      : 'Image or looping video';
  }
  customBackgroundUploadBox?.classList.toggle('muted', !asset);
  updateCustomBackgroundThumbPreviews();
}

function setCustomBackgroundPreview(src, isVideo) {
  if (customBackgroundPreviewUrl && customBackgroundPreviewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(customBackgroundPreviewUrl);
  }
  customBackgroundPreviewUrl = src || '';
  customBackgroundPreviewIsVideo = Boolean(isVideo);
}

function updateCustomBackgroundThumbPreviews() {
  document.querySelectorAll('.custom-media-preview').forEach((preview) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = customBackgroundThumbMarkup().trim();
    preview.replaceWith(wrapper.firstElementChild);
  });
  document.querySelectorAll('.custom-media-preview video').forEach((video) => {
    video.play?.().catch?.(() => {});
  });
}

function isVideoAsset(asset) {
  return /\.(mp4|mov|webm|mkv)$/i.test(String(asset || '').split('?')[0]);
}

function clearMediaInputs() {
  if (screenRecordingInput) screenRecordingInput.value = '';
  if (voiceoverInput) voiceoverInput.value = '';
  if (customBackgroundInput) customBackgroundInput.value = '';
  const backgroundMusicInput = projectForm?.elements?.backgroundMusic;
  if (backgroundMusicInput) backgroundMusicInput.value = '';
  const logoInput = projectForm?.elements?.logo;
  if (logoInput) logoInput.value = '';
  if (thumbnailInput) thumbnailInput.value = '';
  thumbnailClipboardFile = null;
  syncTranscribeButtonState();
}

function populateProjectForm(project) {
  editingProjectId = project.id || '';
  editingProjectAssets = project.assets && typeof project.assets === 'object' ? project.assets : {};
  setFormValue('title', project.title || '');
  setFormValue('productName', project.productName || '');
  setFormValue('targetUrl', project.targetUrl || '');
  setFormValue('cta', project.cta || '');
  setFormValue('format', project.format || 'vertical');
  setFormValue('template', project.template || 'lifestyle');
  setFormValue('durationSeconds', project.durationSeconds || 30);
  setFormValue('thumbnailBumperPosition', project.thumbnailBumper?.position || 'none');
  setFormValue('thumbnailBumperDuration', project.thumbnailBumper?.durationSeconds || 0.5);
  setFormValue('thumbnailBumperFit', project.thumbnailBumper?.fit || 'cover');
  setFormValue('layoutDeviceLift', project.layout?.deviceLift || 0);
  setFormValue('layoutCtaLift', project.layout?.ctaLift || 0);
  const type = project.projectType === 'audio-video' ? 'audio-video' : 'screen-promo';
  projectTypeInputs.forEach((input) => {
    input.checked = input.value === type;
  });
  clearMediaInputs();
  thumbnailPositionTouched = Boolean(project.thumbnailBumper?.position && project.thumbnailBumper.position !== 'none');
  showExistingThumbnail(editingProjectAssets.thumbnail);
  showExistingCustomBackground(editingProjectAssets.customBackground);

  const scenes = Array.isArray(project.scenes) ? project.scenes : [];
  const globalSource = scenes[0] || {};
  applyGlobalVisualDesign(globalSource);
  applyGlobalCaptionDesign(globalSource);
  sceneTableBody.innerHTML = '';
  selectedSceneId = '';
  scenes.forEach((scene) => addScene(scene));
  if (!scenes.length) loadSampleScenes();
  clipTableBody.innerHTML = '';
  (Array.isArray(project.clips) ? project.clips : []).forEach((clip) => addClip(clip));
  normalizeSceneTimeline();
  updateSceneNumbers();
  refreshClipPlacementOptions();
  applyProjectTypeMode({ initial: true });
  setEditState(project);
}

async function editProject(projectId, button) {
  if (!projectId) return;
  button.disabled = true;
  button.textContent = 'Loading...';
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load project');
    populateProjectForm(data.project);
    showMessage(`Loaded project for editing: ${data.project.title || projectId}`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showMessage(String(err.message || err), 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Edit';
  }
}

function startNewProject() {
  editingProjectId = '';
  editingProjectAssets = {};
  projectForm.reset();
  thumbnailClipboardFile = null;
  thumbnailPositionTouched = false;
  showExistingThumbnail('');
  showExistingCustomBackground('');
  clipTableBody.innerHTML = '';
  loadSampleScenes();
  applyProjectTypeMode({ initial: true });
  setEditState(null);
  hideMessage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadProjects() {
  projectsList.innerHTML = '<p>Loading projects...</p>';
  const res = await fetch('/api/projects');
  const data = await res.json();
  if (!data.projects?.length) {
    updateProjectsSummary([]);
    projectsList.innerHTML = '<p>No projects yet. Create your first promo video project.</p>';
    return;
  }
  updateProjectsSummary(data.projects);
  projectsList.innerHTML = '';
  data.projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    const renderProgress = Number(project.render?.progress || 0);
    const statusLabel = project.status === 'rendering' && renderProgress
      ? `rendering ${renderProgress}%`
      : (project.status || 'draft');
    const renderButtonLabel = project.status === 'rendering' && renderProgress
      ? `Rendering ${renderProgress}%`
      : 'Render MP4';
    const output = project.outputUrl
      ? `<a class="button-link secondary" href="${project.outputUrl}" target="_blank">Open MP4</a>`
      : '';
    const preview = project.id
      ? `<a class="button-link primary" href="/preview/${encodeURIComponent(project.id)}" target="_blank">Preview</a>`
      : '';
    const created = formatProjectDate(project.createdAt);
    card.innerHTML = `
      <div class="project-card-head">
        <div>
          <h3>${escapeHtml(project.title || project.id)}</h3>
          <p>${escapeHtml(project.productName || '')}</p>
        </div>
        <span class="badge">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="project-meta">
        <span class="badge muted-badge">${project.projectType === 'audio-video' ? 'Audio-to-video' : 'Screen promo'}</span>
        <span class="badge muted-badge">${escapeHtml(project.format || '')}</span>
        <span class="badge muted-badge">${escapeHtml(created)}</span>
      </div>
      <div class="card-actions">
        ${preview}
        <button class="secondary edit-project-btn" data-id="${project.id}">Edit</button>
        <button class="secondary render-btn" data-id="${project.id}">${escapeHtml(renderButtonLabel)}</button>
        <button class="danger-btn delete-project-btn" data-id="${project.id}">Delete</button>
        ${output}
      </div>
    `;
    projectsList.appendChild(card);
  });

  projectsList.querySelectorAll('.render-btn').forEach(btn => {
    btn.addEventListener('click', async () => renderProject(btn.dataset.id, btn));
  });
  projectsList.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.addEventListener('click', async () => editProject(btn.dataset.id, btn));
  });
  projectsList.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', async () => deleteProject(btn.dataset.id, btn));
  });
}

function updateProjectsSummary(projects) {
  if (!projectsSummary) return;
  const total = projects.length;
  const drafts = projects.filter(project => (project.status || 'draft') === 'draft').length;
  const rendered = projects.filter(project => project.outputUrl || project.status === 'rendered').length;
  projectsSummary.innerHTML = `
    <div><strong>${total}</strong><span>Total</span></div>
    <div><strong>${drafts}</strong><span>Drafts</span></div>
    <div><strong>${rendered}</strong><span>Rendered</span></div>
  `;
}

function formatProjectDate(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function renderProject(projectId, button) {
  button.disabled = true;
  button.textContent = 'Queued...';
  showMessage('Render started in the background. You can keep working while progress updates here.', '');
  try {
    const res = await fetch(`/api/projects/${projectId}/render`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.details || data.error || 'Render failed');
    const finalStatus = await pollProjectRender(projectId, button);
    showMessage(`Rendered successfully: ${finalStatus.outputUrl}`, 'success');
    await loadProjects();
  } catch (err) {
    showMessage(String(err.message || err), 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Render MP4';
  }
}

async function pollProjectRender(projectId, button) {
  while (true) {
    await wait(1800);
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/render-status`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not read render status');
    const progress = Number(data.render?.progress || 0);
    const phase = data.render?.phase || data.status || 'rendering';
    button.textContent = progress ? `${progress}%` : 'Rendering...';
    showMessage(`Render ${phase}${progress ? ` · ${progress}%` : ''}`, '');
    if (data.status === 'rendered') return data;
    if (data.status === 'failed') throw new Error(data.render?.lastError || 'Render failed');
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deleteProject(projectId, button) {
  const ok = window.confirm('Delete this project, uploaded assets, and rendered MP4?');
  if (!ok) return;
  button.disabled = true;
  button.textContent = 'Deleting...';
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not delete project');
    showMessage(`Deleted project: ${projectId}`, 'success');
    await loadProjects();
  } catch (err) {
    showMessage(String(err.message || err), 'error');
    button.disabled = false;
    button.textContent = 'Delete';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage();
  const scenes = collectScenes();
  if (!scenes.length) {
    showMessage('Please add at least one scene with valid start/end times.', 'error');
    return;
  }
  const projectType = selectedProjectType();
  const voiceoverFile = voiceoverInput?.files?.[0];
  const screenFile = screenRecordingInput?.files?.[0];
  if (projectType === 'audio-video' && !voiceoverFile && !editingProjectAssets.voiceover) {
    showMessage('Choose an audio track before saving an audio-to-video project.', 'error');
    return;
  }
  if (projectType === 'screen-promo' && !screenFile && !editingProjectAssets.screen) {
    showMessage('Choose a screen recording video before saving a screen promo project.', 'error');
    return;
  }
  const customBackgroundFile = customBackgroundInput?.files?.[0];
  const hasCustomBackground = Boolean(customBackgroundFile || editingProjectAssets.customBackground);
  const usesCustomBackground = scenes.some((scene) => scene.background === 'custom-media');
  if (usesCustomBackground && !hasCustomBackground) {
    showMessage('Upload a custom background media file before using the Uploaded media background.', 'error');
    return;
  }
  const clips = collectClips();
  const formData = new FormData(projectForm);
  if (thumbnailClipboardFile) {
    formData.set('thumbnailImage', thumbnailClipboardFile, thumbnailClipboardFile.name || 'thumbnail-paste.png');
  }
  formData.set('scenes', JSON.stringify(scenes));
  formData.set('clips', JSON.stringify(clips));
  const submitBtn = projectForm.querySelector('button[type="submit"]');
  const isEditing = Boolean(editingProjectId);
  submitBtn.disabled = true;
  submitBtn.textContent = isEditing ? 'Updating...' : 'Saving...';
  try {
    const res = await fetch(isEditing ? `/api/projects/${encodeURIComponent(editingProjectId)}` : '/api/projects', {
      method: isEditing ? 'PATCH' : 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save project');
    editingProjectId = data.project.id;
    editingProjectAssets = data.project.assets && typeof data.project.assets === 'object' ? data.project.assets : {};
    populateProjectForm(data.project);
    showMessage(`${isEditing ? 'Project updated' : 'Project saved'}: ${data.project.id}\nNext: open Preview or click Render MP4 in the Projects panel.`, 'success');
    await loadProjects();
  } catch (err) {
    showMessage(String(err.message || err), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingProjectId ? 'Update Project' : 'Save Project';
  }
});

document.querySelector('#addSceneBtn').addEventListener('click', () => addScene({ start: lastSceneEnd(), end: lastSceneEnd() + 4, ...globalSceneDesign() }));
document.querySelector('#addSceneAfterBtn').addEventListener('click', () => {
  const afterId = selectedSceneId || sceneRows().at(-1)?.dataset.sceneId || '';
  addScene(afterId ? afterSceneDefaults(afterId) : { start: lastSceneEnd(), end: lastSceneEnd() + 4, ...globalSceneDesign() }, { afterSceneId: afterId });
});
document.querySelector('#addClipBtn').addEventListener('click', () => addClip());
document.querySelector('#loadSampleBtn').addEventListener('click', loadSampleScenes);
document.querySelector('#reflowScenesBtn')?.addEventListener('click', reflowSceneTimings);
document.querySelector('#paceScenesBtn')?.addEventListener('click', rebuildScenesByPacing);
transcribeVoiceoverBtn?.addEventListener('click', event => generateScenesFromVoiceover(event.target));
voiceoverInput?.addEventListener('change', syncTranscribeButtonState);
customBackgroundInput?.addEventListener('change', () => {
  if (!customBackgroundInput.files?.length) {
    showExistingCustomBackground(editingProjectAssets.customBackground);
    return;
  }
  const file = customBackgroundInput.files[0];
  setCustomBackgroundPreview(URL.createObjectURL(file), file.type.startsWith('video/') || isVideoAsset(file.name));
  customBackgroundUploadBox?.classList.remove('muted');
  if (customBackgroundHint) customBackgroundHint.textContent = 'Ready to use';
  updateCustomBackgroundThumbPreviews();
  selectCustomBackgroundPreset();
});
document.querySelector('#refreshProjectsBtn').addEventListener('click', loadProjects);
newProjectBtn?.addEventListener('click', startNewProject);

initStudioTheme();
initThumbnailBumperControls();
initGlobalVisualControls();
initGlobalCaptionControls();
initProjectTypeControls();
initScenePacingControls();
initLayoutLiftControls();
loadSampleScenes();
loadProjects();
