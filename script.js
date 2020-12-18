class Pipe {
  constructor(height, rightPosition) {
    this.height = height;
    this.rightPosition = rightPosition;
    return this.createPipe();
  }
  createPipe() {
    const pipeElement = document.createElement("div");
    pipeElement.className = "pipeElement";
    // pipeElement.style.height = this.height;
    const hole = document.createElement("span");
    hole.className = "pipeElement-hole";
    hole.style.top = this.height;
    pipeElement.append(hole);
    pipeElement.style.right = this.rightPosition + "px";
    return pipeElement;
  }
}

class Bird {
  constructor() {
    const bird = document.createElement("div");
    bird.id = "bird";
    return bird;
  }
}

class ScoreBanner {
  constructor(score, highestScore, action) {
    this.score = score;
    const scoreContainer = document.createElement("div");
    scoreContainer.id = "scoreContainer";
    const scoreCard = document.createElement("div");
    scoreCard.id = "socoreCard";
    scoreCard.innerHTML =
      "<h4>Your Score: " +
      score +
      "</h4><h5>Highest Score: " +
      highestScore +
      "</h5>";
    const buttonAction = document.createElement("input");
    buttonAction.onclick = action;
    buttonAction.type = "button";
    buttonAction.value = "start again";
    scoreCard.append(buttonAction);
    scoreContainer.append(scoreCard);
    window.localStorage.setItem("higherScore", highestScore);
    return scoreContainer;
  }
}

class FixedScoreBanner {
  constructor(score) {
    this.fixedScore = document.createElement("div");
    this.fixedScore.id = "fixedScoreBanner";
    this.fixedScore.innerHTML = "<b>Your Score: " + score + "</b>";
    return this.fixedScore;
  }
  update(score) {
    this.fixedScore.innerHTML = "<b>Your Score: " + score + "</b>";
  }
}

class GameManager {
  constructor() {
    this.currentPipes = [];
    this.pipesContainer = document.createElement("div");
    this.pipesContainer.id = "pipesContainer";
    this.playGround = document.getElementById("playGround");
    this.playGround.append(this.pipesContainer);
    this.containerPosition = 0;
    this.pipesMaxDistance = 90;
    this.currentUpdateCount = this.pipesMaxDistance;
    this.moveingUp = false;
    this.birdTop = 0;
    this.score = 0;
    const bird = new Bird();
    this.bird = bird;
    this.highestScore = window.localStorage.getItem("higherScore") || 0;
    this.fixedScoreBanner = new FixedScoreBanner(0);
    // this.fixedScoreBanner.update(0);
    this.playGround.append(this.fixedScoreBanner);
    this.playGroundSound = document.getElementById("playsound-background");
    this.failSound = document.getElementById("fail-sound");
    this.jumpSound = document.getElementById("jump-sound");
    this.successSound = document.getElementById("success-sound");
  }
  startGame() {
    this.playGroundSound.play();
    this.playGround.onclick = () => {
      this.jumpSound.play();
      clearTimeout(this.timeoutBirdUp);
      this.moveingUp = true;
      this.timeoutBirdUp = setTimeout(() => {
        this.moveingUp = false;
      }, 300);
    };
    this.createBird();
    this.interval = setInterval(() => {
      this.update();
    }, 33);
  }

  pauseGame() {
    this.failSound.play();
    this.playGroundSound.pause();
    clearInterval(this.interval);
    setTimeout(() => {
      this.showScore();
    }, 330);
  }

  update() {
    this.moveContainer();
    this.moveBird();
    if (this.currentUpdateCount === this.pipesMaxDistance) {
      this.createNewPipe();
      this.currentUpdateCount = 0;
    }
    this.currentUpdateCount += 1;
    const allPipes = document.getElementsByClassName("pipeElement");
    // console.log(allPipes[allPipes.length - 1]);
    if (allPipes.length) {
      const firstPipe = allPipes[0];
      const positionOfFirstPipe = firstPipe.getBoundingClientRect().right;
      if (positionOfFirstPipe < 0) {
        firstPipe.remove();
        this.score += 1;
        this.fixedScoreBanner.innerHTML =
          "<b>Your Score: " + this.score + "</b>";
        if (this.score > this.highestScore) {
          this.highestScore = this.score;
          this.successSound.play();
        }
      }
      const activePipeBound = firstPipe.getBoundingClientRect();
      const activePipeRight = activePipeBound.right;
      const activePipeLeft = activePipeBound.left;
      if (activePipeLeft < 150 && activePipeRight > 100) {
        const holePositionActivePipe = firstPipe.children[0].getBoundingClientRect();
        const holePositionActivePipeTop = parseInt(holePositionActivePipe.top);
        const holePositionActivePipeBottom = parseInt(
          holePositionActivePipe.bottom
        );
        if (
          this.birdTop - 25 < holePositionActivePipeTop ||
          this.birdTop + 30 > holePositionActivePipeBottom
        ) {
          this.pauseGame();
        }
        // console.log(
        //   this.birdTop,
        //   holePositionActivePipeTop,
        //   holePositionActivePipeBottom
        // );
      }
    }

    if (this.birdTop < 0 || this.birdTop > this.playGround.clientHeight - 40)
      this.pauseGame();
  }

  createNewPipe() {
    const pipeRight = this.pipesContainer.getBoundingClientRect().left - 55;
    const pipeHeight = randomIntFromInterval(5, 70) + "vh";
    const thePipe = new Pipe(pipeHeight, pipeRight);
    this.pipesContainer.append(thePipe);
    this.currentPipes.push(thePipe);
  }

  moveContainer() {
    this.containerPosition += 4;
    this.pipesContainer.style.right = this.containerPosition + "px";
  }

  createBird() {
    this.playGround.append(this.bird);
  }

  moveBird() {
    if (this.moveingUp) {
      this.birdTop -= 7;
      this.bird.style.top = this.birdTop + "px";
      this.bird.className = "going-down";
    } else {
      this.birdTop += 7;
      this.bird.style.top = this.birdTop + "px";
      this.bird.className = "going-up";
    }
  }

  startAgain = () => {
    document.getElementById("scoreContainer").remove();
    document.querySelectorAll(".pipeElement").forEach((e) => e.remove());
    document.getElementById("pipesContainer").style.right = 0;
    this.birdTop = 200;
    this.score = 0;
    this.fixedScoreBanner.innerHTML = "<b>Your Score: " + this.score + "</b>";
    this.startGame();
    // this.removeBanner();
  };

  showScore() {
    this.scoreBanner = new ScoreBanner(
      this.score,
      this.highestScore,
      this.startAgain
    );
    this.playGround.append(this.scoreBanner);
  }

  removeBanner() {
    console.log("remove banner called");
  }
}

const start = () => {
  document.getElementById("start").remove();
  const gameManagert = new GameManager();
  gameManagert.startGame();
};

// gameManagert.startGame();

document.getElementById("start-highscore").innerHTML =
  "Your HighScore is: " + window.localStorage.getItem("higherScore");

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
