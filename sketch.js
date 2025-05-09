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
let leftIndexPath = [];   // 左手食指紅色
let rightIndexPath = [];  // 右手食指黃色
let leftThumbPath = [];   // 左手大拇指綠色
let rightThumbPath = [];  // 右手大拇指青色
let circlePath = [];      // 圓心軌跡（紅色）

function draw() {
  image(video, 0, 0);

  // 畫出圓心軌跡（紅色線）
  if (circlePath.length > 1) {
    stroke(255, 0, 0);
    strokeWeight(3);
    noFill();
    beginShape();
    for (let pt of circlePath) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // 畫出左手食指紅色軌跡
  if (leftIndexPath.length > 1) {
    stroke(255, 0, 0);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let pt of leftIndexPath) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // 畫出右手食指黃色軌跡
  if (rightIndexPath.length > 1) {
    stroke(255, 255, 0);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let pt of rightIndexPath) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // 畫出左手大拇指綠色軌跡
  if (leftThumbPath.length > 1) {
    stroke(0, 255, 0);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let pt of leftThumbPath) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // 畫出右手大拇指青色軌跡
  if (rightThumbPath.length > 1) {
    stroke(0, 255, 255);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let pt of rightThumbPath) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // 畫出中間的圓
  fill(0, 200, 255, 120);
  noStroke();
  circle(circleX, circleY, circleR * 2);

  // 狀態記錄
  let leftIndexMoved = false;
  let rightIndexMoved = false;
  let leftThumbMoved = false;
  let rightThumbMoved = false;
  let circleMoved = false;

  // 手指控制圓的移動
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
        // 判斷大拇指是否碰到圓 
        let dThumb = dist(thumbTip.x, thumbTip.y, circleX, circleY);

        // 食指控制圓的移動
        if (dIndex < circleR) {
          // 圓跟隨食指移動
          circleX = indexTip.x;
          circleY = indexTip.y;
          circleMoved = true;
          circlePath.push({ x: circleX, y: circleY });

          // 記錄食指軌跡
          if (hand.handedness == "Left") {
            leftIndexMoved = true;
            leftIndexPath.push({ x: indexTip.x, y: indexTip.y });
          } else {
            rightIndexMoved = true; 
            rightIndexPath.push({ x: indexTip.x, y: indexTip.y });
          }
        }

        // 大拇指控制圓的移動
        if (dThumb < circleR) {
          // 圓跟隨大拇指移動
          circleX = thumbTip.x;
          circleY = thumbTip.y;
          circleMoved = true;
          circlePath.push({ x: circleX, y: circleY });

          // 記錄大拇指軌跡
          if (hand.handedness == "Left") {
            leftThumbMoved = true;
            leftThumbPath.push({ x: thumbTip.x, y: thumbTip.y });
          } else {
            rightThumbMoved = true;
            rightThumbPath.push({ x: thumbTip.x, y: thumbTip.y }); 
          }
        }
      }
    }
  }

  // 離開圓就清空對應軌跡
  if (!leftIndexMoved) leftIndexPath = [];
  if (!rightIndexMoved) rightIndexPath = [];
  if (!leftThumbMoved) leftThumbPath = [];
  if (!rightThumbMoved) rightThumbPath = [];
  if (!circleMoved) circlePath = [];
}
