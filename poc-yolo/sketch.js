let video;
let yolo;
let status;
let objects = [];
let count;
let player;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  console.log('starting');

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

let videoFlag = 'blank';
function detect() {
  yolo.detect(function(results) {
    objects = results;

    count = _.filter(objects, { 'className': 'person' }).length;
    status.html(`Number of person: ${count}`);

    if (count > 0) {
      console.log('play')
      if (videoFlag != 'movie') {
        playMovieVideo();
        // player.playVideo();
        videoFlag = 'movie'
      }
      videoStatus.html('Playing video ▶️')
    } else {
      console.log('pause')
      if (videoFlag != 'blank') {
        playBlankVideo();
        // player.pauseVideo();
        videoFlag = 'blank'
      }
      videoStatus.html('Pausing video ⏸')
    }
    detect();
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
    videoId: '',
    videoId: '8tPnX7OPo0Q',
    playerVars: { 'autoplay': 1, 'rel': 0, 'showinfo': 0 },
    events: {
      'onReady': onPlayerReady,
      // 'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function playBlankVideo() {
  player.loadVideoById({'videoId': '8tPnX7OPo0Q'});
}

function playMovieVideo() {
  player.loadVideoById({'videoId': 'g_Czx6qdKJo'});
}

// var done = false;
// function onPlayerStateChange(event) {
//   if (event.data == YT.PlayerState.PLAYING && !done) {
//     // setTimeout(stopVideo, 6000);
//     done = true;
//   }
// }
