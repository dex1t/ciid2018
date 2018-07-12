let video;
let yolo;
let status;
let objects = [];
let count;

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

function detect() {
  yolo.detect(function(results) {
    objects = results;

    count = _.filter(objects, { 'className': 'person' }).length;
    status.html(`Number of person: ${count}`);

    if (count > 0) {
      videoControl('playVideo');
      console.log('play')
      videoStatus.html('Playing video ▶️')
    } else {
      videoControl('pauseVideo');
      console.log('pause')
      videoStatus.html('Pausing video ⏸')
    }
    detect();
  });
}

$(function(){
    videoControl("playVideo"); 
    videoControl('pauseVideo');
});

function videoControl(action){ 
  var $playerWindow = $('#popup-youtube-player')[0].contentWindow;
  $playerWindow.postMessage('{"event":"command","func":"'+action+'","args":""}', '*');
}
