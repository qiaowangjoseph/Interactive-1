// alert("this is a test");
const STEP_SIZE = 16;
const START_X = 160;
const START_Y = 320;

const heart = document.querySelector(".heart");

const square = document.querySelector(".square");
const talkbox = document.querySelector(".talkbox");

const screen1 = document.querySelector("#screen1");
const screen2 = document.querySelector("#screen2");
const screen3 = document.querySelector("#screen3");
const transitionMark = document.querySelector(".transition-mark");

const dialogBox = document.getElementById("dialogBox");
const dialogText = document.getElementById("dialogText");

const timeText = document.querySelector(".timer");
const resultText = document.querySelector(".result");

const screen4 = document.getElementById("screen4");
const screen5 = document.getElementById("screen5");

const miniMap = document.getElementById("mini-map");
const mapLabel = document.getElementById("map-label");

let currentScreen = 1;
let transitioning = false;

let gameStarted = false;

const startScreen = document.getElementById("start-screen");

function startGame() {
  gameStarted = true;
  startScreen.style.display = "none";
}

let xpos = START_X;
let ypos = START_Y;

let SquareChanged = false;
let Talking = false;

heart.classList.add("godown");

// Minigame

let MinigameActive = false;
let MinigameWon = false;
let MinigameLost = false;

let pendingRetryPrompt = false;

let movementLocked = false;
let finalResult = "";

let countdown = 5;
let countdownInterval;

let isTalking = false;
let talkIndex = 0;

const talkLines = [
  "Hello. I'm Rubber",
  "I'm your Imagination Friend.",
  "I'm going to train you",
];

let rewardDialogueActive = false;
let rewardDialogueIndex = 0;
let rewardReady = false;
let rewardClaimed = false;

let rewardReturnReady = false;

const rewardLines = ["Good Job", "Now Take my Helmet."];

// S3对话

let pendingScreen3Game = false;

const screen3Lines = [
  "Try to Dodge the Sword",
  "Get ready. The game will start now.",
];

// Boss

const boss = document.getElementById("boss");

let bossX = 320;
let bossY = 0;
let bossMoving = false;
let bossInterval = null;

const bossDialogBox = document.getElementById("bossDialogBox");
const bossDialogText = document.getElementById("bossDialogText");

const bossLines = ["Look at Who is This", "Game Time"];

let bossDialogueActive = false;
let bossDialogueIndex = 0;
let bossReadyForScreen4 = false;

const screen4BossLines = [
  "Do You Miss Me?",
  "This is where everything ends.",
  "Take my Punch",
];

const screen4EndBossLines = ["You Think you can win?"];
let screen4EndDialogueActive = false;
let screen4EndDialogueIndex = 0;

let pendingScreen4Dialogue = false;
let bossTalkIndex = 0;

function startScreen3Dialogue() {
  isTalking = true;
  talkIndex = 0;
  pendingScreen3Game = true;
  dialogBox.style.display = "block";
  dialogText.textContent = screen3Lines[talkIndex];
}

function showBossDialogue() {
  bossDialogBox.style.display = "block";
  bossDialogText.textContent = bossLines[bossDialogueIndex];
}

function closeBossDialogue() {
  bossDialogBox.style.display = "none";
  bossDialogueActive = false;
}

// hitwall
const PLAYER_SIZE = 32;

function hitWall(px, py, rx, ry, rw, rh) {
  return px < rx + rw && px + PLAYER_SIZE > rx && py < ry + rh && py + 48 > ry;
}

function squarechange() {
  square.style.backgroundColor = "black";

  if (xpos >= 440 && xpos <= 560 && ypos >= 90 && ypos <= 160) {
    square.style.backgroundColor = "yellow";
    SquareChanged = true;
  } else {
    SquareChanged = false;
  }
}

function getCurrentSafeZone() {
  if (currentGameScreen === 3) {
    return document.getElementById("safe-zone-3");
  }

  if (currentGameScreen === 4) {
    return document.getElementById("safe-zone-4");
  }

  return null;
}

function hideMinigameUI() {
  const safeZone3 = document.getElementById("safe-zone-3");
  const safeZone4 = document.getElementById("safe-zone-4");
  const finishBullet = document.getElementById("finishBullet");
  const rewardBox = document.getElementById("rewardBox");

  if (safeZone3) safeZone3.style.display = "none";
  if (safeZone4) safeZone4.style.display = "none";

  finishBullet.style.display = "none";
  timeText.style.display = "none";
  resultText.style.display = "none";
  rewardBox.style.display = "none";

  timeText.textContent = "";
  resultText.textContent = "";
}

function isInsideShadow1() {
  return hitRect(xpos, ypos, 32, 48, 368, -16, 272, 304);
}

function updateMap() {
  if (currentScreen === 5) {
    miniMap.style.display = "none";
    mapLabel.style.display = "none";
    return;
  }

  miniMap.style.display = "block";
  mapLabel.style.display = "block";

  let showMap2 = false;

  if (currentScreen === 2 || currentScreen === 3 || currentScreen === 4) {
    showMap2 = true;
  }

  if (currentScreen === 1 && isInsideShadow1()) {
    showMap2 = true;
  }

  if (showMap2) {
    miniMap.src = "assets/media/map-2.jpg";
    mapLabel.textContent = "Classroom";
  } else {
    miniMap.src = "assets/media/map-1.jpg";
    mapLabel.textContent = "Lobby";
  }
}

// DeBugPos

function updateDebugPos() {
  document.getElementById("debugPos").textContent = `x: ${xpos}, y: ${ypos}`;
}

updateDebugPos();
updateMap();

function isBlocked(x, y) {
  if (currentScreen === 1) {
    return isBlockedScene1(x, y);
  }

  if (currentScreen === 2) {
    return isBlockedScene2(x, y);
  }

  if (currentScreen === 3) {
    return isBlockedScene3(x, y);
  }

  if (currentScreen === 4) {
    return isBlockedScene3(x, y);
  }

  return false;
}

function isBlockedScene1(x, y) {
  if (x + PLAYER_SIZE > 640) {
    return true;
  }

  if (hitWall(x, y, 352, 0, 288, 32)) {
    return true;
  }

  if (hitWall(x, y, 352, 288, 288, 96)) {
    return true;
  }

  if (hitWall(x, y, 352, 0, 32, 192)) {
    return true;
  }

  if (hitWall(x, y, 352, 256, 32, 96)) {
    return true;
  }

  if (hitWall(x, y, 480, 128, 48, 16)) {
    return true;
  }

  return false;
}

function isBlockedScene2(x, y) {
  if (x < 0) {
    return true;
  }

  if (y < 0) {
    return true;
  }
  if (x + PLAYER_SIZE > 672) {
    return true;
  }
  if (y + 48 > 704) {
    return true;
  }

  if (y < 240 && y > 176 && x > 272 && x < 368) {
    return true;
  }

  return false;
}

function isBlockedScene3(x, y) {
  if (x < 0) {
    return true;
  }

  if (y < 304) {
    return true;
  }
  if (x + PLAYER_SIZE > 672) {
    return true;
  }
  if (y > 656) {
    return true;
  }

  return false;
}

// function talking() {
//   if (!hasMoved) {
//     return;
//   }

//   if (xpos >= 440 && xpos <= 560 && ypos >= 140 && ypos <= 260) {
//     talkbox.style.opacity = 1;
//   } else {
//     talkbox.style.opacity = 0;
//   }
// }

// function Direction(dir) {
//   heart.classList.remove("goright", "goleft", "goup", "godown");
//   heart.classList.add(dir);
// }

function showDialogue(lines, index) {
  dialogBox.style.display = "block";
  dialogText.textContent = lines[index];
}

function closeDialogue() {
  dialogBox.style.display = "none";
  isTalking = false;
  talkIndex = 0;
}

// <!-- change screen -->

function switchToScreen2() {
  if (transitioning) return;
  transitioning = true;
  hideMinigameUI();

  transitionMark.classList.add("play");

  heart.style.display = "block";
  boss.style.display = "none";

  setTimeout(() => {
    screen2.classList.add("active");
    screen1.classList.remove("active");
    currentScreen = 2;
    xpos = 320;
    ypos = 480;
    heart.style.left = `${xpos}px`;
    heart.style.top = `${ypos}px`;
  }, 500);

  setTimeout(() => {
    transitionMark.classList.remove("play");
    transitioning = false;
  }, 1000);
}

function switchToScreen1() {
  if (transitioning) return;
  transitioning = true;

  transitionMark.classList.add("play");

  setTimeout(() => {
    const shouldStartBoss = rewardClaimed;

    screen1.classList.add("active");
    screen2.classList.remove("active");
    screen3.classList.remove("active");
    screen4.classList.remove("active");
    screen5.classList.remove("active");

    currentScreen = 1;

    heart.style.display = "block";

    xpos = 480;
    ypos = 160;
    heart.style.left = `${xpos}px`;
    heart.style.top = `${ypos}px`;

    // 重置状态
    isTalking = false;
    pendingScreen3Game = false;
    MinigameActive = false;
    MinigameWon = false;
    MinigameLost = false;
    movementLocked = false;

    rewardDialogueActive = false;
    rewardDialogueIndex = 0;
    rewardReady = false;
    rewardClaimed = false;
    rewardReturnReady = false;

    bossDialogueActive = false;
    bossDialogueIndex = 0;
    bossReadyForScreen4 = false;

    gameRound = 1;
    finalResult = "";
    clearInterval(countdownInterval);
    hideMinigameUI();

    const rewardBox = document.getElementById("rewardBox");
    if (rewardBox) {
      rewardBox.style.display = "none";
    }

    if (shouldStartBoss) {
      movementLocked = true;
      xpos = 160;
      ypos = 320;
      heart.src = "assets/media/c-b.png";
      heart.style.left = `${xpos}px`;
      heart.style.top = `${ypos}px`;

      rewardClaimed = false;
      startBossEntrance();
    }

    closeDialogue();
    updateDebugPos();
    updateMap();
    squarechange();
  }, 500);

  setTimeout(() => {
    transitionMark.classList.remove("play");
    transitioning = false;
  }, 1000);
}

// S3- Game Play 01

let gameRound = 1;
let currentGameScreen = 3;

const gameConfigs = {
  3: {
    countdown: 5,
    safeZones: [
      { x: 463, y: 368, w: 64, h: 64 },
      { x: 120, y: 460, w: 64, h: 64 },
    ],
    startX: 320,
    startY: 480,
  },

  4: {
    countdown: 5,
    safeZones: [
      { x: 64, y: 576, w: 64, h: 64 },
      { x: 480, y: 416, w: 64, h: 64 },
    ],
    startX: 320,
    startY: 446,
  },
};

function hitRect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function checkSafeZone() {
  if (!MinigameActive) return false;

  const config = gameConfigs[currentGameScreen];
  const zone = config.safeZones[gameRound - 1];

  return hitRect(xpos, ypos, 32, 48, zone.x, zone.y, zone.w, zone.h);
}

// 7 Sec
function finishScreen3Game() {
  const survived = checkSafeZone();

  MinigameActive = false;
  movementLocked = true;

  if (survived) {
    if (gameRound === 1) {
      gameRound = 2;
      finalResult = "ROUND 1 CLEAR";
      playBulletFinishAnimation(true);
    } else {
      MinigameWon = true;
      MinigameLost = false;
      finalResult = "YOU WON";

      if (currentGameScreen === 3) {
        rewardDialogueActive = true;
        rewardDialogueIndex = 0;
        rewardReady = false;
        rewardClaimed = false;
      }

      if (currentGameScreen === 4) {
        screen4EndDialogueActive = true;
        screen4EndDialogueIndex = 0;
      }

      playBulletFinishAnimation(false);
    }
  } else {
    MinigameWon = false;
    MinigameLost = true;
    finalResult = "YOU LOST";
    playBulletFinishAnimation(false);

    setTimeout(() => {
      showRetryPrompt();
    }, 500);
  }
}

function playBulletFinishAnimation(goNextRound) {
  console.log("bullet animation start");

  const bullet = document.getElementById("finishBullet");

  resultText.textContent = "";

  // 先清掉旧class
  bullet.classList.remove(
    "play",
    "play-screen3",
    "play-screen4",
    "finishbullet-screen3",
    "finishbullet-screen4",
  );

  if (currentGameScreen === 3) {
    bullet.classList.add("finishbullet-screen3");
  }

  if (currentGameScreen === 4) {
    bullet.classList.add("finishbullet-screen4");
  }

  void bullet.offsetWidth;

  if (currentGameScreen === 3) {
    bullet.classList.add("play-screen3");
  }

  if (currentGameScreen === 4) {
    bullet.classList.add("play-screen4");
  }

  setTimeout(() => {
    bullet.classList.remove("play-screen3", "play-screen4");
    resultText.textContent = finalResult;

    if (goNextRound) {
      setTimeout(() => {
        movementLocked = false;
        resultText.textContent = "";
        startMinigame(currentGameScreen);
      }, 800);
    } else {
      if (MinigameWon && currentGameScreen === 3 && rewardDialogueActive) {
        setTimeout(() => {
          isTalking = true;
          showDialogue(rewardLines, rewardDialogueIndex);
        }, 800);
      }

      if (MinigameWon && currentGameScreen === 4 && screen4EndDialogueActive) {
        setTimeout(() => {
          isTalking = true;
          movementLocked = true;
          bossDialogBox.style.display = "block";
          bossDialogText.textContent =
            screen4EndBossLines[screen4EndDialogueIndex];
        }, 800);
      }
    }
  }, 1000);
}

function updateSafeZone() {
  const config = gameConfigs[currentGameScreen];
  const zone = config.safeZones[gameRound - 1];
  const safeZone = getCurrentSafeZone();

  if (!safeZone) return;

  safeZone.style.left = `${zone.x}px`;
  safeZone.style.top = `${zone.y}px`;
  safeZone.style.width = `${zone.w}px`;
  safeZone.style.height = `${zone.h}px`;
}

function startMinigame(screenNumber) {
  currentGameScreen = screenNumber;

  MinigameActive = true;
  MinigameWon = false;
  MinigameLost = false;

  hideMinigameUI();

  const safeZone = getCurrentSafeZone();
  if (safeZone) {
    safeZone.style.display = "block";
  }

  document.getElementById("finishBullet").style.display = "block";
  document.querySelector(".timer").style.display = "block";
  document.querySelector(".result").style.display = "block";

  updateSafeZone();

  const config = gameConfigs[currentGameScreen];

  countdown = config.countdown;
  timeText.textContent = countdown;
  resultText.textContent = `ROUND ${gameRound}`;

  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    countdown--;
    timeText.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(countdownInterval);
      finishScreen3Game();
    }
  }, 1000);
}

function showRetryPrompt() {
  isTalking = true;
  pendingRetryPrompt = true;
  movementLocked = true;

  dialogBox.style.display = "block";
  dialogText.innerHTML = "Try again?<br>Press SPACE to restart";
}

function resetMinigame() {
  MinigameActive = false;
  MinigameWon = false;
  MinigameLost = false;

  pendingRetryPrompt = false;
  isTalking = false;
  movementLocked = false;
  finalResult = "";

  clearInterval(countdownInterval);

  const config = gameConfigs[currentGameScreen];

  gameRound = 1;

  countdown = config.countdown;
  timeText.textContent = countdown;
  resultText.textContent = "";

  hideMinigameUI();

  const safeZone = getCurrentSafeZone();
  if (safeZone) {
    safeZone.style.display = "block";
  }

  document.getElementById("finishBullet").style.display = "block";
  document.querySelector(".timer").style.display = "block";
  document.querySelector(".result").style.display = "block";

  updateSafeZone();

  xpos = config.startX;
  ypos = config.startY;
  heart.style.left = `${xpos}px`;
  heart.style.top = `${ypos}px`;

  updateDebugPos();

  updateMap();
}

function switchToScreen3() {
  if (transitioning) return;
  transitioning = true;

  transitionMark.classList.add("play");

  heart.style.display = "block";
  boss.style.display = "none";

  setTimeout(() => {
    screen3.classList.add("active");
    screen2.classList.remove("active");
    currentScreen = 3;
    xpos = 320;
    ypos = 480;
    heart.style.left = `${xpos}px`;
    heart.style.top = `${ypos}px`;

    startScreen3Dialogue();
  }, 500);

  setTimeout(() => {
    transitionMark.classList.remove("play");
    transitioning = false;
  }, 1000);

  //
  //   isTalking = true;
  //   talkIndex = 0;
  //   pendingScreen3Game = true;
  //   showDialogue(screen3Lines);
  // }, 500);

  // setTimeout(() => {
  //   transitionMark.classList.remove("play");
  //   transitioning = false;
  // }, 1000);
}

function switchToScreen4() {
  if (transitioning) return;
  transitioning = true;

  transitionMark.classList.add("play");

  setTimeout(() => {
    screen1.classList.remove("active");
    screen2.classList.remove("active");
    screen3.classList.remove("active");
    screen4.classList.add("active");

    currentScreen = 4;

    heart.style.display = "block";
    boss.style.display = "block";

    closeDialogue();
    closeBossDialogue();
    hideMinigameUI();

    movementLocked = false;

    xpos = 320;
    ypos = 446;
    heart.style.left = `${xpos}px`;
    heart.style.top = `${ypos}px`;

    boss.style.left = `${304}px`;
    boss.style.top = `${224}px`;
    updateDebugPos();
    updateMap();

    startScreen4Dialogue();
  }, 500);

  setTimeout(() => {
    transitionMark.classList.remove("play");
    transitioning = false;
  }, 1000);
}

function switchToScreen5() {
  if (transitioning) return;
  transitioning = true;

  transitionMark.classList.add("play");

  setTimeout(() => {
    screen1.classList.remove("active");
    screen2.classList.remove("active");
    screen3.classList.remove("active");
    screen4.classList.remove("active");
    screen5.classList.add("active");

    currentScreen = 5;

    updateMap();

    closeDialogue();
    closeBossDialogue();
    hideMinigameUI();

    // screen5 不要 heart 和 boss
    heart.style.display = "none";
    boss.style.display = "none";

    movementLocked = true;

    startScreen5Battle();
  }, 500);

  setTimeout(() => {
    transitionMark.classList.remove("play");
    transitioning = false;
  }, 1000);
}

// Boss Coming

function onBossEntranceComplete() {
  bossDialogueActive = true;
  bossDialogueIndex = 0;
  bossReadyForScreen4 = true;
  showBossDialogue();
}

function startBossEntrance() {
  bossMoving = true;
  boss.style.display = "block";

  bossX = 160;
  bossY = 0;

  boss.style.left = `${bossX}px`;
  boss.style.top = `${bossY}px`;
  // boss.style.backgroundImage = 'url("../media/")';

  const targetY = 256;

  clearInterval(bossInterval);
  bossInterval = setInterval(() => {
    if (bossY < targetY) {
      bossY += 16;

      if (bossY > targetY) {
        bossY = targetY;
      }

      boss.style.top = `${bossY}px`;
    } else {
      clearInterval(bossInterval);
      onBossEntranceComplete();
      bossMoving = false;
    }
  }, 80);
}

function startScreen4Dialogue() {
  pendingScreen4Dialogue = true;
  bossTalkIndex = 0;
  movementLocked = true;
  bossDialogueActive = true;

  bossDialogBox.style.display = "block";
  bossDialogText.textContent = screen4BossLines[bossTalkIndex];
}

// Main- Control Character
document.addEventListener("keydown", (event) => {
  if (!gameStarted) {
    if (event.key === " ") {
      event.preventDefault();
      startGame();
    }

    return;
  }

  if (currentScreen === 5 && battleEnded && event.key === " ") {
    event.preventDefault();
    restartGame();
    return;
  }

  let key = event.key;

  if (
    currentScreen === 1 &&
    key === " " &&
    bossDialogueActive &&
    bossReadyForScreen4
  ) {
    bossDialogueIndex++;

    if (bossDialogueIndex < bossLines.length) {
      showBossDialogue();
    } else {
      closeBossDialogue();
      bossReadyForScreen4 = false;
      switchToScreen4();
    }

    return;
  }

  if (
    (currentScreen === 3 || currentScreen === 4) &&
    key === " " &&
    pendingRetryPrompt
  ) {
    closeDialogue();

    pendingRetryPrompt = false;
    isTalking = false;
    movementLocked = false;

    resetMinigame();
    startMinigame(currentGameScreen);
    return;
  }

  if (currentScreen === 4 && key === " " && pendingScreen4Dialogue) {
    bossTalkIndex++;

    if (bossTalkIndex < screen4BossLines.length) {
      bossDialogBox.style.display = "block";
      bossDialogText.textContent = screen4BossLines[bossTalkIndex];
    } else {
      closeBossDialogue();
      pendingScreen4Dialogue = false;
      movementLocked = false;

      gameRound = 1;
      startMinigame(4);
    }

    return;
  }

  if (currentScreen === 4 && key === " " && screen4EndDialogueActive) {
    screen4EndDialogueIndex++;

    if (screen4EndDialogueIndex < screen4EndBossLines.length) {
      bossDialogBox.style.display = "block";
      bossDialogText.textContent = screen4EndBossLines[screen4EndDialogueIndex];
    } else {
      closeBossDialogue();
      screen4EndDialogueActive = false;
      isTalking = false;
      switchToScreen5();
    }

    return;
  }

  if (key === " " && SquareChanged === true && currentScreen === 1) {
    switchToScreen2();
    return;
  }

  if (ypos + 48 > 608 && currentScreen === 2) {
    switchToScreen1();
    return;
  }

  if (currentScreen === 2 && key === " ") {
    const inTalkingArea =
      ypos <= 272 && ypos >= 160 && xpos <= 384 && xpos >= 256;

    if (isTalking) {
      talkIndex++;

      if (talkIndex < talkLines.length) {
        showDialogue(talkLines, talkIndex);
      } else {
        closeDialogue();
        isTalking = false;
        switchToScreen3();
      }

      return;
    }

    if (inTalkingArea) {
      isTalking = true;
      talkIndex = 0;
      showDialogue(talkLines, talkIndex);
      return;
    }
  }

  if (currentScreen === 3 && key === " " && isTalking && pendingScreen3Game) {
    talkIndex++;

    if (talkIndex < screen3Lines.length) {
      showDialogue(screen3Lines, talkIndex);
    } else {
      closeDialogue();
      pendingScreen3Game = false;

      gameRound = 1;
      startMinigame(3);
    }

    return;
  }

  if (currentScreen === 3 && key === " " && rewardDialogueActive) {
    rewardDialogueIndex++;

    if (rewardDialogueIndex < rewardLines.length) {
      showDialogue(rewardLines, rewardDialogueIndex);
    } else {
      closeDialogue();
      rewardDialogueActive = false;
      isTalking = false;
      rewardReady = true;
    }

    return;
  }

  if (currentScreen === 3 && key === " " && rewardReady && !rewardClaimed) {
    const rewardBox = document.getElementById("rewardBox");
    rewardBox.style.display = "block";

    rewardClaimed = true;
    rewardReady = false;
    rewardReturnReady = true;
    return;
  }

  if (currentScreen === 3 && key === " " && rewardReturnReady) {
    switchToScreen1();
    return;
  }

  if (currentScreen === 5 && battleActive && !battleEnded) {
    const key = event.key;

    if (key === "a" || key === "A" || key === "ArrowLeft") {
      if (!battleBusy) {
        selectedSkill--;
        if (selectedSkill < 0) selectedSkill = playerSkills.length - 1;
        renderBattleUI();
      }
      return;
    }

    if (key === "d" || key === "D" || key === "ArrowRight") {
      if (!battleBusy) {
        selectedSkill++;
        if (selectedSkill >= playerSkills.length) selectedSkill = 0;
        renderBattleUI();
      }
      return;
    }

    if (key === " ") {
      event.preventDefault();

      if (!battleBusy) {
        usePlayerSkill(selectedSkill);
      }
      return;
    }
  }

  if (isTalking) {
    return;
  }

  if (movementLocked) return;

  let nextX = xpos;
  let nextY = ypos;

  if (key === "ArrowRight" || key === "d") {
    nextX += STEP_SIZE;
    heart.src = "assets/media/c-r.png";
  }
  if (key === "ArrowLeft" || key === "a") {
    nextX -= STEP_SIZE;
    heart.src = "assets/media/c-l.png";
  }
  if (key === "ArrowUp" || key === "w") {
    nextY -= STEP_SIZE;
    heart.src = "assets/media/c-b.png";
  }
  if (key === "ArrowDown" || key === "s") {
    nextY += STEP_SIZE;
    heart.src = "assets/media/c-f.png";
  }

  if (!isBlocked(nextX, nextY)) {
    xpos = nextX;
    ypos = nextY;
  }

  heart.style.left = xpos + "px";
  heart.style.top = ypos + "px";

  updateDebugPos();
  updateMap();

  squarechange();
});

// Battle Duel

const enemyHpFill = document.getElementById("enemyHpFill");
const enemyHpText = document.getElementById("enemyHpText");
const playerHpFill = document.getElementById("playerHpFill");
const playerHpText = document.getElementById("playerHpText");

const battleMessage = document.getElementById("battle-message");
const battleResult = document.getElementById("battle-result");
const skillOptions = document.querySelectorAll(".skill-option");

let battleActive = false;
let battleEnded = false;
let battleBusy = false;
let selectedSkill = 0;

let playerHp = 100;
let playerMaxHp = 100;
let enemyHp = 100;
let enemyMaxHp = 100;

const playerSkills = [
  { name: "PUNCH", damage: 18 },
  { name: "KICK", damage: 28 },
];

function renderBattleUI() {
  const playerPercent = Math.max(0, (playerHp / playerMaxHp) * 100);
  const enemyPercent = Math.max(0, (enemyHp / enemyMaxHp) * 100);

  playerHpFill.style.width = `${playerPercent}%`;
  enemyHpFill.style.width = `${enemyPercent}%`;

  playerHpText.textContent = `${playerHp} / ${playerMaxHp}`;
  enemyHpText.textContent = `${enemyHp} / ${enemyMaxHp}`;

  skillOptions.forEach((option, index) => {
    option.classList.toggle("selected", index === selectedSkill);
  });
}

// 初始化战斗

function renderBattleUI() {
  const playerPercent = Math.max(0, (playerHp / playerMaxHp) * 100);
  const enemyPercent = Math.max(0, (enemyHp / enemyMaxHp) * 100);

  playerHpFill.style.width = `${playerPercent}%`;
  enemyHpFill.style.width = `${enemyPercent}%`;

  playerHpText.textContent = `${playerHp} / ${playerMaxHp}`;
  enemyHpText.textContent = `${enemyHp} / ${enemyMaxHp}`;

  skillOptions.forEach((option, index) => {
    option.classList.toggle("selected", index === selectedSkill);
  });
}

function usePlayerSkill(index) {
  battleBusy = true;

  const skill = playerSkills[index];
  enemyHp -= skill.damage;
  battleMessage.textContent = `You used ${skill.name}!`;
  renderBattleUI();

  if (checkBattleEnd()) return;

  setTimeout(() => {
    const enemyDamage = 20;
    playerHp -= enemyDamage;
    battleMessage.textContent = `Enemy attacks! -${enemyDamage}`;
    renderBattleUI();

    if (checkBattleEnd()) return;

    battleBusy = false;
    battleMessage.textContent = "Choose your skill.";
  }, 700);
}

// 结算

function startScreen5Battle() {
  battleActive = true;
  battleEnded = false;
  battleBusy = false;

  playerHp = 100;
  enemyHp = 100;
  selectedSkill = 0;

  battleMessage.textContent = "Choose your skill.";
  battleResult.style.display = "none";
  battleResult.textContent = "";

  renderBattleUI();
}

function restartGame() {
  battleActive = false;
  battleEnded = false;
  battleBusy = false;

  currentScreen = 1;
  gameStarted = false;

  screen1.classList.add("active");
  screen2.classList.remove("active");
  screen3.classList.remove("active");
  screen4.classList.remove("active");
  screen5.classList.remove("active");

  heart.style.display = "block";
  boss.style.display = "none";

  xpos = START_X;
  ypos = START_Y;
  heart.src = "assets/media/c-f.png";
  heart.style.left = `${xpos}px`;
  heart.style.top = `${ypos}px`;

  movementLocked = false;
  transitioning = false;

  closeDialogue();
  closeBossDialogue();
  hideMinigameUI();

  battleResult.style.display = "none";
  battleResult.textContent = "";

  startScreen.style.display = "flex";

  updateDebugPos();
  updateMap();
  squarechange();
}

function checkBattleEnd() {
  if (enemyHp <= 0) {
    enemyHp = 0;
    renderBattleUI();

    battleEnded = true;
    battleActive = false;
    battleBusy = true;

    battleMessage.textContent = "BOB fainted.";
    battleResult.innerHTML =
      "YOU WIN</br><span>PRESS SPACE TO START AGAIN</span>";
    battleResult.style.display = "flex";
    return true;
    return true;
  }

  if (playerHp <= 0) {
    playerHp = 0;
    renderBattleUI();

    battleEnded = true;
    battleActive = false;
    battleBusy = true;

    battleMessage.textContent = "You fainted.";
    battleResult.textContent = "YOU LOSE";
    battleResult.style.display = "flex";
    return true;
  }

  return false;
}
