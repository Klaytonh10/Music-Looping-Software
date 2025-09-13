const start = document.querySelector(".start");
const clips = document.querySelector(".clips");
const playAll = document.querySelector("#playpause");

let metronome = {
  bpm: 0,
};

const bpmElement = document.querySelector(".bpm");

let soundInterval = (60 / metronome.bpm) * 1000;

playAll.checked = true;

start.addEventListener("click", ToggleMic);

let canRecord = false;
let isRecording = false;

let recorder = null;

let chunks = [];

function SetupAudio() {
  console.log("Setup");
  // check if media devices are available
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(SetupStream)
      .catch((err) => {
        console.error(err);
      });
  }
  metronome.bpm = 180;
  soundInterval = (60 / metronome.bpm) * 1000;
  bpmElement.value = metronome.bpm;
}

SetupAudio();

function SetupStream(stream) {
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };

  recorder.onstop = (e) => {
    const blob = new Blob(chunks, { type: "audio/webm; codecs=opus" });
    chunks = [];
    const audioUrl = URL.createObjectURL(blob);
    // create new element
    const article = document.createElement("article");
    article.classList.add("clip");

    const textInput = document.createElement("input");
    textInput.setAttribute("type", "text");

    const audio = document.createElement("audio");
    audio.classList.add("audio-clip");
    audio.controls = true;
    audio.src = audioUrl;

    const button = document.createElement("button");
    button.classList.add("audio-butt");
    button.textContent = "Delete";
    button.addEventListener("click", () => {
      article.remove();
      URL.revokeObjectURL(audioUrl); // cleanup memory
    });

    article.appendChild(textInput);
    article.appendChild(audio);
    article.appendChild(button);
    clips.appendChild(article);
  };

  canRecord = true;
}


let metIsPlaying = false;
const syncMetCheckbox = document.querySelector(".start-met-check");

function ToggleMic() {
  if (!canRecord) return;

  isRecording = !isRecording;

  if (isRecording) {
    recorder.start();
    console.log("Recording started...");
    start.style.animationName = "flash-color";
    start.style.animationDuration = "1.5s";
    start.style.animationIterationCount = "infinite";

    if (syncMetCheckbox.checked && !metIsPlaying) {
      toggleMetronome();
    }
  } else {
    recorder.stop();
    console.log("Recording stopped.");
    start.style.animationName = "";
    start.style.animationDuration = "";
    start.style.animationIterationCount = "";
    
    if (metIsPlaying) {
      toggleMetronome()
    }
  }
}

// loop through children elements and all should be played on button press

playAll.addEventListener("click", () => {
  const audios = clips.querySelectorAll("audio");

  if (!playAll.checked) {
    audios.forEach((audio) => {
      audio.currentTime = 0;
      audio.play();
    });
  } else if (playAll.checked) {
    audios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
});

//////////////

let isRed = false;
let metronomeInterval;

const bpmAdd = document.querySelector(".metro-add");
const bpmSubtract = document.querySelector(".metro-subtract");

bpmAdd.addEventListener("click", () => {
  if (metIsPlaying) return;

  metronome.bpm += 1;
  soundInterval = (60 / metronome.bpm) * 1000;
  bpmElement.value = metronome.bpm;
});

bpmSubtract.addEventListener("click", () => {
  if (metIsPlaying) return;

  metronome.bpm -= 1;
  soundInterval = (60 / metronome.bpm) * 1000;
  bpmElement.value = metronome.bpm;
});

// start/stop metronome
const startMetronomeButton = document.querySelector(".met-butt");

let met1 = new Audio("./media/met1.mp3");

startMetronomeButton.addEventListener("click", toggleMetronome);
function toggleMetronome() {
  metIsPlaying = !metIsPlaying;

  soundInterval = (60 / metronome.bpm) * 1000;

  if (metIsPlaying) {
    clearInterval(metronomeInterval);

    metronomeInterval = setInterval(changeMetColor, soundInterval / 2);
    console.log("metronome started", metIsPlaying);
  } else {
    clearInterval(metronomeInterval);
    startMetronomeButton.style.backgroundColor = "#f0f0f0";
    console.log("metronome ended", metIsPlaying);
  }
}

function changeMetColor() {
  isRed = !isRed;

  if (isRed) {
    startMetronomeButton.style.backgroundColor = "red";

    if (met1.duration > 0 && !met1.paused) {
      met1.currentTime = 0;
      met1.play();
    } else {
      met1.play();
    }
  } else {
    startMetronomeButton.style.backgroundColor = "#f0f0f0";
  }
}

// toggle bpm with buttons

const bpmSelect = document.querySelectorAll(".bpm-butt");
bpmSelect.forEach((button) => {
  button.addEventListener("click", function (e) {
    if (metIsPlaying) return;

    const clickedButton = e.target;

    metronome.bpm = parseInt(clickedButton.value);
    bpmElement.value = metronome.bpm;
    console.log("Button clicked: ", clickedButton.textContent);
  });
});
