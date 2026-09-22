/**
 * Sistema de control de audio y animación de flores y corazones (Optimizado)
 */

window.addEventListener("DOMContentLoaded", () => {
  initAudioSystem();
});

window.addEventListener("load", () => {
  // Remueve la clase container para iniciar las animaciones de las flores
  document.body.classList.remove("container");
});

function initAudioSystem() {
  document.body.classList.remove("container");

  const audio = document.getElementById("musica");
  const autoplayHint = document.getElementById("autoplay-hint");
  const hintText = autoplayHint ? autoplayHint.querySelector(".hint-text") : null;

  if (!audio) return;

  const interactionEvents = ["click", "touchstart", "pointerdown", "keydown"];
  let isUnlockListenerAttached = false;

  // Actualiza la visibilidad del aviso flotante
  const updateHintVisibility = (isPlaying) => {
    if (autoplayHint) {
      if (isPlaying) {
        autoplayHint.classList.add("fade-out");
        autoplayHint.classList.remove("visible");
        setTimeout(() => {
          if (!audio.paused) {
            autoplayHint.style.display = "none";
          }
        }, 450);
      }
    }
  };

  // Muestra el mensaje flotante con texto dinámico
  const showHint = (message) => {
    if (autoplayHint) {
      if (hintText && message) {
        hintText.textContent = message;
      }
      autoplayHint.style.display = "flex";
      autoplayHint.classList.remove("fade-out");
      void autoplayHint.offsetWidth; // Reflow para reiniciar la animación suave
      autoplayHint.classList.add("visible");
    }
  };

  // Reproduce o reinicia la pista
  const playTrack = (fromBeginning = false) => {
    if (fromBeginning) {
      audio.currentTime = 0;
    }
    return audio.play();
  };

  // Manejador del toque o clic en cualquier parte de la pantalla
  const handleScreenInteraction = () => {
    detachScreenListeners();
    // Si la canción terminó o estaba en 0, arranca desde el principio
    const restart = audio.ended || audio.currentTime === 0;
    playTrack(restart)
      .then(() => {
        updateHintVisibility(true);
      })
      .catch((err) => {
        console.warn("No se pudo iniciar el audio tras la interacción:", err);
        attachScreenListeners();
      });
  };

  const attachScreenListeners = () => {
    if (isUnlockListenerAttached) return;
    isUnlockListenerAttached = true;
    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, handleScreenInteraction, { once: true });
    });
  };

  const detachScreenListeners = () => {
    if (!isUnlockListenerAttached) return;
    isUnlockListenerAttached = false;
    interactionEvents.forEach((evt) => {
      window.removeEventListener(evt, handleScreenInteraction);
    });
  };

  // Intento de reproducción automática al cargar o refrescar
  const attemptAutoplay = () => {
    const playPromise = playTrack(false);

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updateHintVisibility(true);
          detachScreenListeners();
        })
        .catch(() => {
          // Autoplay bloqueado: mostrar aviso hasta el primer clic
          showHint("Toca en cualquier lugar para escuchar la música");
          attachScreenListeners();
        });
    }
  };

  // Eventos nativos del elemento de audio
  audio.addEventListener("play", () => {
    updateHintVisibility(true);
    detachScreenListeners();
  });

  // Cada vez que termina la canción:
  // 1. Muestra el aviso invitando a volver a escuchar.
  // 2. Con un solo clic o toque en cualquier parte vuelve a reproducirse desde el inicio.
  audio.addEventListener("ended", () => {
    showHint("Toca en cualquier lugar para volver a escuchar la música");
    attachScreenListeners();
  });

  // Iniciar ciclo de reproducción
  attemptAutoplay();
}