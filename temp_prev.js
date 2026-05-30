const project = JSON.parse(document.querySelector('#projectData').textContent);
const stage = document.querySelector('#previewStage');
const screenVideo = document.querySelector('#screenVideo');
const backgroundImage = document.querySelector('#backgroundImage');
const logoImage = document.querySelector('#logoImage');
const captionChip = document.querySelector('#captionChip');
const ctaPill = document.querySelector('#ctaPill');
const replayBtn = document.querySelector('#replayBtn');
const cleanBtn = document.querySelector('#cleanBtn');
const sceneCamera = document.querySelector('.scene-camera');
const tabletStage = document.querySelector('.tablet-stage');

const assetUrl = (path) => path ? `/preview-assets/${path}` : '';
const BACKGROUNDS = {
  'reading-room': 'assets/lifestyle-reading-room.png',
  'office-desk': 'assets/background-office-desk.png',
  'cafe-table': 'assets/background-cafe-table.png',
  'dark-studio': 'assets/background-dark-studio.png',
};
const DEFAULT_SCENE = {
  background: 'reading-room',
  device: 'tablet-pro',
  angle: 'low-desk-left',
  motion: 'slow-push-in',
  screenZoom: 1.06,
  transition: 'soft-fade',
  captionStyle: 'white-chip',
};
const scenes = Array.isArray(project.scenes) ? project.scenes : [];
const duration = Math.max(5, Number(project.durationSeconds || 30));
const ctaStart = Math.max(0, duration - 5.6);
let activeSceneKey = '';
let animationFrame = null;

stage.classList.remove('vertical', 'landscape', 'square');
stage.classList.add(project.format || 'vertical');
backgroundImage.src = assetUrl(BACKGROUNDS[DEFAULT_SCENE.background]);

if (project.assets?.screen) {
  screenVideo.src = assetUrl(project.assets.screen);
}

if (project.assets?.logo) {
  logoImage.src = assetUrl(project.assets.logo);
  logoImage.classList.remove('hidden');
}

ctaPill.textContent = project.cta || 'Try it free today';

function activeScene(seconds) {
  const scene = scenes.find((item) => seconds >= Number(item.start || 0) && seconds < Number(item.end || 0)) || scenes[scenes.length - 1] || {};
  return { ...DEFAULT_SCENE, ...scene };
}

function setCaption(caption) {
  captionChip.innerHTML = '';
  String(caption || project.title || '').split(/\n+/).filter(Boolean).forEach((line) => {
    const span = document.createElement('span');
    span.textContent = line;
    captionChip.appendChild(span);
  });
}

function updatePreview() {
  const seconds = screenVideo.currentTime || 0;
  const scene = activeScene(seconds);
  applySceneDesign(scene);
  setCaption(scene?.caption || project.title);
  ctaPill.classList.toggle('hidden', seconds < ctaStart);

  if (seconds >= duration) {
    screenVideo.pause();
  } else {
    animationFrame = requestAnimationFrame(updatePreview);
  }
}

function applySceneDesign(scene) {
  const sceneKey = [
    scene.start,
    scene.background,
    scene.device,
    scene.angle,
    scene.motion,
    scene.transition,
    scene.captionStyle,
  ].join('|');

  if (activeSceneKey !== sceneKey) {
    activeSceneKey = sceneKey;
    backgroundImage.src = assetUrl(BACKGROUNDS[scene.background] || BACKGROUNDS[DEFAULT_SCENE.background]);
    stage.dataset.transition = scene.transition || DEFAULT_SCENE.transition;
    stage.dataset.captionStyle = scene.captionStyle || DEFAULT_SCENE.captionStyle;
    sceneCamera.dataset.motion = scene.motion || DEFAULT_SCENE.motion;
    tabletStage.dataset.device = scene.device || DEFAULT_SCENE.device;
    tabletStage.dataset.angle = scene.angle || DEFAULT_SCENE.angle;
    sceneCamera.style.animation = 'none';
    void sceneCamera.offsetWidth;
    sceneCamera.style.animation = '';
  }

  const localDuration = Math.max(0.5, Number(scene.end || duration) - Number(scene.start || 0));
  const localProgress = Math.min(1, Math.max(0, (screenVideo.currentTime - Number(scene.start || 0)) / localDuration));
  const zoomBase = Number(scene.screenZoom || DEFAULT_SCENE.screenZoom);
  screenVideo.style.transform = `translate3d(0, 0, 0) scale(${zoomBase})`;
}

function playFromStart() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  screenVideo.currentTime = 0;
  screenVideo.play();
  animationFrame = requestAnimationFrame(updatePreview);
}

screenVideo.addEventListener('loadedmetadata', () => {
  if (duration > screenVideo.duration && Number.isFinite(screenVideo.duration)) {
    screenVideo.loop = true;
  }
  playFromStart();
});

screenVideo.addEventListener('play', () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(updatePreview);
});
screenVideo.addEventListener('pause', updatePreview);
screenVideo.addEventListener('seeked', updatePreview);
replayBtn.addEventListener('click', playFromStart);

cleanBtn.addEventListener('click', () => {
  document.body.classList.toggle('clean');
  cleanBtn.textContent = document.body.classList.contains('clean') ? 'Show controls' : 'Clean view';
});

if (!project.assets?.screen) {
  setCaption(project.title);
}
