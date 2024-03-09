const fftSize = 32768
function getLocalStream() {
    navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
        window.localStream = stream; // A
        window.localAudio.srcObject = stream; // B
        //window.localAudio.autoplay = true; // C
        window.audioCtx = new AudioContext();
        window.analyser = window.audioCtx.createAnalyser();
        source = window.audioCtx.createMediaStreamSource(window.localAudio.srcObject)
        source.connect(window.analyser)
        window.analyser.fftSize = fftSize;
        window.analyser.minDecibels = -110;
        window.analyser.maxDecibels = 0;
        window.analyser.smoothingTimeConstant = 0.85;
        //window.analyser.connect(window.audioCtx.destination)
        drawBars();
        //callback(stream);

    })
    .catch((err) => {
    console.error(`you got an error: ${err}`);
    });
}
//const audioCtx = new AudioContext();
//const analyser = audioCtx.createAnalyser();
getLocalStream()
const canvas = document.querySelector(".visualizer");
const speedview = document.querySelector(".calculatedSpeed");
const canvasCtx = canvas.getContext("2d");

function callback(stream) {
    ctx = new AudioContext();
    mic = ctx.createMediaStreamSource(stream)
    spe = ctx.createAnalyser();
    spe.fftSize = 256;
    bufferLength = spe.frequencyBinCount;
    window.bufferLength = bufferLength;
    dataArray = new Uint8Array(bufferLength);
    spe.getByteTimeDomainData(dataArray);
    mic.connect(spe);
    //spe.connect(ctx.destination);
}
bufferLength = fftSize;

const WIDTH = 1600
const HEIGHT = 100

window.TargetFrequency = 470;

function draw() {
  update_values()
    canvasCtx.clearRect(0,0,WIDTH,HEIGHT)
    dataArray = new Uint8Array(bufferLength);
    drawVisual = requestAnimationFrame(draw);
  
    window.analyser.getByteTimeDomainData(dataArray);
  
    canvasCtx.fillStyle = "rgb(200 200 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0 0 0)";
  
    canvasCtx.beginPath();
  
    const sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;
  
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
  
      x += sliceWidth;
    }
  
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
  
function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function drawBars(){
  update_values()
    const bufferLengthAlt = window.analyser.frequencyBinCount;
    canvasCtx.clearRect(0,0,WIDTH,HEIGHT)
    dataArrayAlt = new Uint8Array(bufferLengthAlt);
    drawVisual = requestAnimationFrame(drawBars);
    window.analyser.getByteFrequencyData(dataArrayAlt);

    canvasCtx.fillStyle = "rgb(0, 0, 0)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / bufferLengthAlt) * 2.5;
    let x = 0;
    const maxSpeed = 150/3.6
    const maxSpeedFreq = ((343 + 0)/(343 - maxSpeed))*window.TargetFrequency;
    const minSpeedFreq = ((343 + 0)/(343 + maxSpeed))*window.TargetFrequency;
    const dFreqIdx = scale(window.TargetFrequency, 0, audioCtx.sampleRate/2, 0, bufferLengthAlt);
    const dMaxFreqIdx = scale(maxSpeedFreq, 0, audioCtx.sampleRate/2, 0, bufferLengthAlt);
    const dMinFreqIdx = scale(minSpeedFreq, 0, audioCtx.sampleRate/2, 0, bufferLengthAlt);

    //console.log({minIdx: dMinFreqIdx, maxIdx: dMaxFreqIdx, minFreq: minSpeedFreq, maxFreq: maxSpeedFreq});

    for (let i = 0; i < bufferLengthAlt; i++) {
      const barHeight = dataArrayAlt[i];
      canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
      canvasCtx.fillRect(
        x,
        HEIGHT - barHeight / 2,
        barWidth,
        barHeight / 2
      );

      x += barWidth + 1;
    }
    let foundFreqIdx = -1;
    let foundFreqVal = -1;
    x = 0;
    for (let i = Math.floor(dMinFreqIdx-1); i < Math.floor(dMaxFreqIdx+1); i++) {
      const barHeight = dataArrayAlt[i];
      if(barHeight > foundFreqVal && barHeight > 28){
        foundFreqVal = barHeight;
        foundFreqIdx = i;
      }
      canvasCtx.fillStyle = "rgb(255,255,255)";
      canvasCtx.fillRect(
        x,
        HEIGHT - barHeight / 2,
        barWidth,
        barHeight / 2
      );
      x += barWidth + 1;
    }
    const foundFreq = scale(foundFreqIdx, 0, bufferLengthAlt, 0, audioCtx.sampleRate/2);
    if(foundFreqIdx != -1)
      speedview.innerHTML = "Speed: " + convertToSpeed(foundFreq, window.TargetFrequency) + " km/h"
    //console.log({found: convertToSpeed(foundFreq, TargetFrequency), freq: foundFreq})
}

function convertToSpeed(obs, base) {
  return (343 - ((343 + 0)/obs) * base) * 3.6;
}
//drawBars();

function update_values(){
  window.analyser.minDecibels = parseInt(window.minDecibels.value);
  window.analyser.maxDecibels = parseInt(window.maxDecibels.value);
  window.TargetFrequency = parseInt(window.targetFreq.value);
}