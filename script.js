// ==============================
// CONFIGURATION À MODIFIER
// ==============================
const weddingDate = new Date('2027-03-27T20:00:00').getTime();

// ==============================
// COUNTDOWN
// ==============================
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ==============================
// INTRO OVERLAY
// ==============================
const introOverlay = document.getElementById('introOverlay');
const openInviteBtn = document.getElementById('openInviteBtn');

// ==============================
// MUSIQUE
// ==============================
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

let musicPlaying = false;

openInviteBtn.addEventListener('click', async () => {
  introOverlay.classList.add('hidden');
  document.body.classList.remove('locked');

  // tentative lecture musique si une source est ajoutée
  try {
    if (bgMusic.querySelector('source')) {
      await bgMusic.play();
      musicPlaying = true;
    }
  } catch (e) {
    // autoplay peut être bloqué selon navigateur
  }
});

musicToggle.addEventListener('click', async () => {
  if (!bgMusic.querySelector('source')) {
    alert("Ajoute d'abord un fichier MP3 dans la balise audio.");
    return;
  }

  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
  } else {
    try {
      await bgMusic.play();
      musicPlaying = true;
    } catch (e) {
      console.log('Lecture bloquée par le navigateur.');
    }
  }
});