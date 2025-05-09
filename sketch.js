// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

// 新增圓的位置與大小
let circleX = 320;
let circleY = 240;
const circleR = 50; // 半徑=50，直徑=100

// 軌跡陣列
let indexPath = []; // 食指紅色軌跡
let thumbPath = []; // 大拇指綠色軌跡

// 狀態記錄
let isIndexMoving = false;
let isThumbMoving = false;

function draw() {
  image(video, 0, 0);

  // 畫出紅色食指軌跡
  stroke(255, 0, 0);
  strokeWeight(4);
  noFill();
  if (indexPath.length > 1) {
    beginShape();
    for (let pt of indexPath) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // 畫出綠色大拇指軌跡
  stroke(0, 255, 0);
  strokeWeight(4);
  noFill();
  if (thumbPath.length > 1) {
    beginShape();
    for (let pt of thumbPath) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // 畫出中間的圓
  fill(0, 200, 255, 120);
  noStroke();
  circle(circleX, circleY, circleR * 2);

  // 預設為未移動
  let indexMoved = false;
  let thumbMoved = false;

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 畫出每個手指的線段
        let fingerIndices = [
          [0, 1, 2, 3, 4],     // 大拇指
          [5, 6, 7, 8],        // 食指
          [9, 10, 11, 12],     // 中指
          [13, 14, 15, 16],    // 無名指
          [17, 18, 19, 20]     // 小指
        ];

        // 根據左右手設定顏色
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
        } else {
          stroke(255, 255, 0);
        }
        strokeWeight(4);

        // 畫出每根手指的線
        for (let finger of fingerIndices) {
          for (let i = 0; i < finger.length - 1; i++) {
            let kpA = hand.keypoints[finger[i]];
            let kpB = hand.keypoints[finger[i + 1]];
            line(kpA.x, kpA.y, kpB.x, kpB.y);
          }
        }

        // 畫出每個關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }
          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 取得食指指尖(keypoints[8])與大拇指指尖(keypoints[4])
        let indexTip = hand.keypoints[8];
        let thumbTip = hand.keypoints[4];

        // 判斷食指是否碰到圓
        let dIndex = dist(indexTip.x, indexTip.y, circleX, circleY);
        if (dIndex < circleR) {
          circleX = indexTip.x;
          circleY = indexTip.y;
          indexMoved = true;
          indexPath.push({ x: circleX, y: circleY });
        }

        // 判斷大拇指是否碰到圓
        let dThumb = dist(thumbTip.x, thumbTip.y, circleX, circleY);
        if (dThumb < circleR) {
          circleX = thumbTip.x;
          circleY = thumbTip.y;
          thumbMoved = true;
          thumbPath.push({ x: circleX, y: circleY });
        }
      }
    }
  }

  // 若食指沒碰到圓，清空食指軌跡
  if (!indexMoved) {
    indexPath = [];
  }
  // 若大拇指沒碰到圓，清空大拇指軌跡
  if (!thumbMoved) {
    thumbPath = [];
  }
}
