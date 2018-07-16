// ------- yolo ------
let video;
let yolo;
let status;
let objects = [];
let count;
let player;

// ------- knn ------
var k = 3; //k can be any integer
var machine = new kNear(k);
var currentClass = 0;
var nSamples = 0;

var audio;
var normalized = [];

var mfcc;
var loudness = 0;
var loudnessThreshold = 11;
var soundReady = false;

//TRIGGER MODE
var predictionAlpha = 255;

var singleTrigger = true;
var startTime;
var triggerTimerThreshold = 300;
var timer; 
var test = 0;

let yoloMode = false;
let demoMode = false;
let prevPredicted = test;

let videoIds = [
  'g_Czx6qdKJo',
  'dxWvtMOGAhw',
  'vP_1T4ilm8M',
  'y31A2NSzZOQ'
];
let blankVideoId = '8tPnX7OPo0Q';
let currentVideoId = 0;
let triggerCount = 1; // yolo

function setup() {
  createCanvas(640, 480);
  audio = new MicrophoneInput(512);
  startTime = millis();

  video = createCapture(VIDEO);
  video.size(640, 480);

  // Create a YOLO method
  yolo = ml5.YOLO(video, () => {
    status.html('Model Loaded👌');
    detect();
  });

  // Hide the original video
  video.hide();
  status = select('#status');
  videoStatus = select('#video-status');

  setupYoutube();
}

function draw() {
  if (demoMode) {
    drawKNN();
    drawYOLO();
  } else if (yoloMode) {
    drawYOLO();
  } else {
    drawKNN();
  }
}

function drawYOLO() {
  image(video, 0, 0, width, height);
  for (let i = 0; i < objects.length; i++) {
    noStroke();
    fill(0, 255, 0);
    text(objects[i].className, objects[i].x * width, objects[i].y * height - 5);
    noFill();
    strokeWeight(4);
    stroke(0, 255, 0);
    rect(objects[i].x * width, objects[i].y * height, objects[i].w * width, objects[i].h * height);
  }
}

function drawKNN() {
    background(255);
    textSize(12);

    timer = millis() - startTime;
    if (timer>triggerTimerThreshold) {
        singleTrigger = true;
    }


    if (soundReady) {
        fill(0);
        noStroke();
        text("LOUDNESS " + nf(loudness, 1, 2), width/2 + 25, 375);
        text("MFCCs", + 10,  375);

        if (loudness > loudnessThreshold) {
            fill(0,255,0);
        } else {
            fill(122);
        }

        if (singleTrigger == false) {
            fill (255,0,0);
        }

        stroke(0);
        ellipse(width /2 + 175, 375, loudness*3, loudness*3);

        fill(0,255,0);
        for (var i = 0; i < 13; i++) {
            rect(i*(15)+ 100, 375, 10, mfcc[i]*5);
        }
    }

    //TEST
    if (mouseIsPressed && (loudness > loudnessThreshold) && singleTrigger ) {
        machine.learn(mfcc, currentClass);
        nSamples++;

        fill(255, 0, 0);
        noStroke();
        ellipse(width - 25, 25, 25, 25);

        singleTrigger = false;
        startTime = millis();


    } else if (nSamples >0 && (loudness > loudnessThreshold) && singleTrigger)  {
        fill(0,255,0);
        if (loudness > loudnessThreshold) {

            prevPredicted = test;
            test = machine.classify(mfcc);
            // if (test != prevPredicted) {
              if (test == 1) {
                playNextVideo();
                console.log('class: 1');
              } else {
                console.log('class: others')
              }
            // }

            singleTrigger = false;
            startTime = millis();
            predictionAlpha = 255;
        }
    }

    noStroke();
    fill(0, 255, 0, predictionAlpha);
    textSize(126);
    text(test, width/3, height/2);

    noStroke();
    fill(0);
    textSize(12);
    text("press [0-9] to change current class --- hold mouse to record samples", 10, 15);
    textSize(12);
    text("trainingClass: " + currentClass, 10, 35);
    text(" nSamples: " + nSamples, width -350, 35);

    if (predictionAlpha > 0) predictionAlpha-=5;
}

function soundDataCallback(soundData) {
    soundReady = true;
    mfcc = soundData.mfcc;
    loudness= soundData.loudness.total;

    var peaked = false;

    for (var i = 0; i < 13; i++) {
        normalized[i] = map(mfcc[i],-10,30,0,1);
    }
}


function keyPressed() {
    if (key == '0') {
        currentClass = 0;
    } else if (key == '1') {
        currentClass = 1;
    } else if (key == '2') {
        currentClass = 2;
    } else if (key == '3') {
        currentClass = 3;
    } else if (key == '4') {
        currentClass = 4;
    } else if (key == '5') {
        currentClass = 5;
    } else if (key == '6') {
        currentClass = 6;
    } else if (key == '7') {
        currentClass = 7;
    } else if (key == '8') {
        currentClass = 8;
    } else if (key == '9') {
        currentClass = 9;
    }
}

let videoFlag = 'blank';
function detect() {
  yolo.detect(function(results) {
    objects = results;

    count = _.filter(objects, { 'className': 'person' }).length;
    status.html(`Number of person: ${count}`);

    if (count > triggerCount) {
      if (videoFlag != 'movie') {
        player.loadVideoById({'videoId': videoIds[currentVideoId]});
        videoFlag = 'movie'
      }
      videoStatus.html('Playing video ▶️')
    } else {
      if (videoFlag != 'blank') {
        player.loadVideoById({'videoId': blankVideoId});
        videoFlag = 'blank'
      }
      videoStatus.html('Pausing video ⏸')
    }

    // if (yoloMode || demoMode) {
      detect();
    // }
  });
}

// --------- youtube -----------

function setupYoutube() {
  let tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube', {
    height: '360',
    width: '640',
    videoId: videoIds[currentVideoId],
    playerVars: { 'autoplay': 1, 'rel': 0, 'showinfo': 0 },
    events: {
      'onReady': onPlayerReady,
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function playNextVideo() {
  if (currentVideoId + 1 == videoIds.length) {
    // loop
    currentVideoId = 0;
  } else {
    currentVideoId = currentVideoId + 1;
  }
  player.loadVideoById({'videoId': videoIds[currentVideoId]});
  console.log('next');
}

$(function(){
  $("#demo").on( "click", function() {
    demoMode = true;
    redraw(); 
  });
  $("#knn-mode").on( "click", function() {
    yoloMode = false;
    console.log('change mode: knn');
    redraw(); 
  });
  $("#yolo-mode").on( "click", function() {
    yoloMode = true;
    detect();
    redraw(); 
    console.log('change mode: yolo');
  });
  $("#next").on('click', function() {
    playNextVideo();
  })
});
