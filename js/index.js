import Player from "https://cdn.jsdelivr.net/gh/vanderick-lee/dino-webflow-rr@main/js/Player.js";
import Ground from "https://cdn.jsdelivr.net/gh/vanderick-lee/dino-webflow-rr@main/js/Ground.js";
import CactiController from "https://cdn.jsdelivr.net/gh/vanderick-lee/dino-webflow-rr@main/js/CactiController.js";
import Score from "https://cdn.jsdelivr.net/gh/vanderick-lee/dino-webflow-rr@main/js/Score.js";

const canvas = document.getElementById("game");

const ctx = canvas.getContext("2d");

const GAME_SPEED_START = 0.9; // 1.0
const GAME_SPEED_INCREMENT = 0.00002;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88 / 1.5; //58
const PLAYER_HEIGHT = 94 / 1.5; //62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.4;

const CACTI_CONFIG = [
  { width: 68 / 1.5, height: 70 / 1.5, image: "https://uploads-ssl.webflow.com/6476be0f5d58a4ab099e8501/64c230a76eead0e3dbbb1cab_obs1.png" },
  { width: 98 / 1.5, height: 100 / 1.5, image: "https://uploads-ssl.webflow.com/6476be0f5d58a4ab099e8501/64c230a78410f2f3de3af104_obs2.png" },
  { width: 68 / 1.5, height: 70 / 1.5, image: "https://uploads-ssl.webflow.com/6476be0f5d58a4ab099e8501/64c230a76eead0e3dbbb1cab_obs1.png" },
];

//Game Objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

function createSprites() {
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    groundWidthInGame,
    groundHeightInGame,
    GROUND_AND_CACTUS_SPEED,
    scaleRatio
  );

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image: image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(
    ctx,
    cactiImages,
    scaleRatio,
    GROUND_AND_CACTUS_SPEED
  );

  score = new Score(ctx, scaleRatio);
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
//Use setTimeout on Safari mobile rotation otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const screenWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth
  );

  //window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "grey";
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText("GAME OVER", x, y);
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", reset, { once: true });
      window.addEventListener("touchstart", reset, { once: true });
    }, 1000);
  }
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  cactiController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
  // document.getElementById("demo").innerHTML = "";
}

function showStartGameText() {
  const fontSize = 36 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "white";
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText("Nhấn W hoặc nhấn vào màn hình", x, y);
}

function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

function clearScreen() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function showAlert(txt) {
  var shouldProceed = true; // Determine if the alert should be shown based on your condition

  if (shouldProceed) {
    var confirmation = confirm("Bạn có muốn " + txt + "?");

    if (confirmation) {
      // User clicked "OK" (Yes)
      alert("Proceeding...");
      window.location.href =
        "https://giftinformation.rootrotation.com/?score=" + score.score;
    } else {
      // User clicked "Cancel" (No)
      alert("Cancelled.");
      window.location.href = "https://dino.rootrotation.com/"; // Reload the page or perform other actions
    }
  }
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }
  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameOver && !waitingToStart) {
    //Update game objects
    ground.update(gameSpeed, frameTimeDelta);
    cactiController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta);
    updateGameSpeed(frameTimeDelta);
  }

  if (!gameOver && cactiController.collideWith(player)) {
    gameOver = true;
    setupGameReset();
    score.setHighScore();
  }
//Draw game objects
ground.draw();
cactiController.draw();
player.draw();
score.draw();
startProgress();

if (gameOver) {
  showGameOver();
  result(score);
  stopProgress();

}

if (waitingToStart) {
  showStartGameText();
}
if (score.score < 1) {
  resetProgress();
}


  function result(score) {
    var txt;
    if (score.score < 1800) {
      // txt = "";
    } else if (score.score >= 1800 && score.score < 2400) {
      // txt = "Nhận voucher giảm giá 30% mua áo Graphic T";
      var shouldProceed = true; // Determine if the alert should be shown based on your condition

      if (shouldProceed) {
        var confirmation = confirm(
          "Bạn có muốn nhận voucher giảm giá 30% mua áo Graphic T?"
        );

        if (confirmation) {
          // User clicked "OK" (Yes)
          alert("Proceeding...");
          window.location.href =
            "https://giftinformation.rootrotation.com/?score=" + score.score;
        } else {
          // User clicked "Cancel" (No)
          alert("Cancelled.");
          reset(); // Reload the page or perform other actions
        }
      }
      // showAlert("nhận voucher giảm giá 30% mua áo Graphic T");
    } else if (score.score >= 2400 && score.score < 3000) {
      // txt = "Nhận 1 cái áo Graphic T";
      var shouldProceed = true; // Determine if the alert should be shown based on your condition

      if (shouldProceed) {
        var confirmation = confirm("Bạn có muốn nhận 1 cái áo Graphic T ?");

        if (confirmation) {
          // User clicked "OK" (Yes)
          alert("Proceeding...");
          window.location.href =
            "https://giftinformation.rootrotation.com/?score=" + score.score;
        } else {
          // User clicked "Cancel" (No)
          alert("Cancelled.");
          reset(); // Reload the page or perform other actions
        }
      }
      // showAlert("nhận 1 cái áo Graphic T");
    } else if (score.score >= 3000) {
      // txt = "Nhận Art T";
      var shouldProceed = true; // Determine if the alert should be shown based on your condition

      if (shouldProceed) {
        var confirmation = confirm("Bạn có muốn nhận Art T?");

        if (confirmation) {
          // User clicked "OK" (Yes)
          alert("Proceeding...");
          window.location.href =
            "https://giftinformation.rootrotation.com/?score=" + score.score;
        } else {
          // User clicked "Cancel" (No)
          alert("Cancelled.");
          reset(); // Reload the page or perform other actions
        }
      }
      // showAlert("nhận Art T");
    }
    // document.getElementById("demo").innerHTML = txt;
  }
  // var element = document.querySelector('.js-completed-bar');
  // var scoreValue = score.score;
  // element.setAttribute('data-complete', (scoreValue*100)/3000);

  // const progress = document.querySelector(".js-completed-bar");
  // if (progress) {
  //   progress.style.width = 50 + "%";
  //   progress.style.opacity = 1;
  // }
  var progressInterval;
var width = 1;
var continueWidth = 0; // Store the progress width when the progress is stopped

function startProgress() {

  var elem = document.getElementById("myBar");
  progressInterval = setInterval(frame, 1000);

  function frame() {
    if ((score.score*100)/3000 >= 100) {
      clearInterval(progressInterval);
      resetProgress();
      
    } else {
      width =+ (score.score*100)/3000;
      elem.style.width = (score.score*100)/3000 + "%";
      elem.style.opacity=1
    }
  }
}

function stopProgress() {
  clearInterval(progressInterval);
  continueWidth = width; // Store the current progress width
  
}

function resetProgress() {
  width = 1;
  continueWidth = 0;
  

  clearInterval(progressInterval);
  document.getElementById("myBar").style.width = (score.score*100)/3000 + "%";
  document.getElementById("myBar").style.opacity=1
  
}

function continueProgress() {
  width = continueWidth + 1; // Set the progress width to continue from the stored value
  continueWidth = 0;
  document.getElementById("myBar").style.width = (score.score*100)/3000 + "%";
  document.getElementById("myBar").style.opacity=1
  

  progressInterval = setInterval(frame, 1000);

  function frame() {
    if (width >= 100) {
      clearInterval(progressInterval);
      resetProgress();
      
    } else {
      width++;
      elem.style.width = (score.score*100)/3000 + "%";
      elem.style.opacity=1
    }
  }
}
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

window.addEventListener("keyup", reset, { once: true });
window.addEventListener("touchstart", reset, { once: true });
