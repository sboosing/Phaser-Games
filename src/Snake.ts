/***********************************************************************************************************************
 * Original code came from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/games/snake/part7.js.
 * It was then modified to work with the newer Phaser version, TypeScript, and JavaScript classes instead of Phaser.Class.
 **********************************************************************************************************************/

import * as Phaser from 'phaser';
import { Direction, Swipe } from './SwipePlugin';
import { Game } from './Game';

const FOOD_KEY = 'food';
const BODY_KEY = 'body';
const LOGO_WITH_NAME_KEY = 'logo_with_name';

class GameScene extends Phaser.Scene {
  food!: Food;
  snake!: Snake;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  sponsorText!: Phaser.GameObjects.Text;
  canvas!: HTMLCanvasElement;
  isMobile!: boolean;
  swipe!: Swipe;

  constructor() {
    super('Game');
  }

  preload() {
    this.load.image(FOOD_KEY, '/assets/food.png');
    this.load.image(BODY_KEY, '/assets/body.png');
    this.load.image(LOGO_WITH_NAME_KEY, '/assets/LogoWithName.png');
  }

  create() {
    this.isMobile = !this.sys.game.device.os.desktop;
    this.swipe = new Swipe(this);
    this.canvas = this.sys.canvas;
    this.cursors = this.input.keyboard.createCursorKeys();

    const background = this.add.image(0, 0, LOGO_WITH_NAME_KEY);
    background.setOrigin(0, 0);
    this.snake = new Snake(this, 8, 8);
    this.food = new Food(this, 3, 4);

    this.sponsorText = this.add.text(0, 0, 'Sponsor 1', { fontSize: '48px' });
    // Set the point that will be rotated about.
    this.sponsorText.setOrigin(0.5, 0.5);
    // Position text in the center of the screen.
    this.sponsorText.setPosition(this.canvas.width / 2, this.canvas.height / 2);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    // Rotate the text.
    this.sponsorText.angle += 1;
    if (!this.snake.alive) {
      this.sponsorText.destroy(true);
      const gameOver = this.add.text(0, 0, 'GAME OVER', {
        fontSize: '96px',
        color: 'red'
      });
      gameOver.setOrigin(0.5, 0.5);
      gameOver.setPosition(this.canvas.width / 2, this.canvas.height / 2);
      return;
    }

    let isLeft = false;
    let isRight;
    let isUp;
    let isDown;
    if (this.isMobile) {
      const swipeDirection = this.swipe.getSwipeDirection();
      if (swipeDirection === Direction.LEFT) {
        isLeft = true;
      } else if (swipeDirection === Direction.RIGHT) {
        isRight = true;
      } else if (swipeDirection === Direction.DOWN) {
        isDown = true;
      } else if (swipeDirection === Direction.UP) {
        isUp = true;
      }
    } else {
      if (this.cursors.left.isDown) {
        isLeft = true;
      } else if (this.cursors.right.isDown) {
        isRight = true;
      } else if (this.cursors.up.isDown) {
        isUp = true;
      } else if (this.cursors.down.isDown) {
        isDown = true;
      }
    }

    /**
     * Check which key is pressed, and then change the direction the snake
     * is heading based on that. The checks ensure you don't double-back
     * on yourself, for example if you're moving to the right and you press
     * the LEFT cursor, it ignores it, because the only valid directions you
     * can move in at that time is up and down.
     */
    if (isLeft) {
      this.snake.faceLeft();
    } else if (isRight) {
      this.snake.faceRight();
    } else if (isUp) {
      this.snake.faceUp();
    } else if (isDown) {
      this.snake.faceDown();
    }

    if (this.snake.update(time, delta)) {
      //  If the snake updated, we need to check for collision against food

      if (this.snake.collideWithFood(this.food)) {
        this.repositionFood();
      }
    }
  }

  /**
   * We can place the food anywhere in our 40x30 grid
   * *except* on-top of the snake, so we need
   * to filter those out of the possible food locations.
   * If there aren't any locations left, they've won!
   *
   * @method repositionFood
   * @return {boolean} true if the food was placed, otherwise false
   */
  repositionFood() {
    //  First create an array that assumes all positions
    //  are valid for the new piece of food

    //  A Grid we'll use to reposition the food each time it's eaten
    const testGrid: boolean[][] = [];

    for (let y = 0; y < 30; y++) {
      testGrid[y] = [];

      for (let x = 0; x < 40; x++) {
        testGrid[y][x] = true;
      }
    }

    this.snake.updateGrid(testGrid);

    //  Purge out false positions
    const validLocations: { x: number; y: number }[] = [];

    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 40; x++) {
        if (testGrid[y][x]) {
          //  Is this position valid for food? If so, add it here ...
          validLocations.push({ x: x, y: y });
        }
      }
    }

    if (validLocations.length > 0) {
      //  Use the RNG to pick a random food position
      const pos = Phaser.Math.RND.pick(validLocations);

      //  And place it
      this.food.setPosition(pos.x * 16, pos.y * 16);

      return true;
    } else {
      return false;
    }
  }
}

class Food extends Phaser.GameObjects.Image {
  total = 0;

  constructor(gameScene: GameScene, x: number, y: number) {
    super(gameScene, x * 16, y * 16, FOOD_KEY);
    this.setOrigin(0, 0);

    gameScene.add.existing(this);
  }

  eat() {
    this.total++;
  }
}

class Snake extends Phaser.Scene {
  headPosition: Phaser.Geom.Point;
  body: Phaser.GameObjects.Group;
  head: Phaser.GameObjects.Image;
  alive: boolean;
  speed: number;
  moveTime: number;
  tail: Phaser.Geom.Point;
  heading: Direction;
  direction: Direction;

  constructor(gameScene: GameScene, x: number, y: number) {
    super('Snake');
    this.headPosition = new Phaser.Geom.Point(x, y);

    this.body = gameScene.add.group();

    this.head = this.body.create(x * 16, y * 16, BODY_KEY);
    this.head.setOrigin(0);

    this.alive = true;

    this.speed = 100;

    this.moveTime = 0;

    this.tail = new Phaser.Geom.Point(x, y);

    this.heading = Direction.RIGHT;
    this.direction = Direction.RIGHT;
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    if (time >= this.moveTime) {
      return this.move(time);
    }
    return false;
  }

  faceLeft() {
    if (this.direction === Direction.UP || this.direction === Direction.DOWN) {
      this.heading = Direction.LEFT;
    }
  }

  faceRight() {
    if (this.direction === Direction.UP || this.direction === Direction.DOWN) {
      this.heading = Direction.RIGHT;
    }
  }

  faceUp() {
    if (
      this.direction === Direction.LEFT ||
      this.direction === Direction.RIGHT
    ) {
      this.heading = Direction.UP;
    }
  }

  faceDown() {
    if (
      this.direction === Direction.LEFT ||
      this.direction === Direction.RIGHT
    ) {
      this.heading = Direction.DOWN;
    }
  }

  /**
   * Based on the heading property (which is the direction the pgroup pressed)
   * we update the headPosition value accordingly.
   *
   * The Math.wrap call allow the snake to wrap around the screen, so when
   * it goes off any of the sides it re-appears on the other.
   */
  move(time: number) {
    switch (this.heading) {
      case Direction.LEFT:
        this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40);
        break;

      case Direction.RIGHT:
        this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
        break;

      case Direction.UP:
        this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
        break;

      case Direction.DOWN:
        this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
        break;
    }

    this.direction = this.heading;

    //  Update the body segments and place the last coordinate into this.tail
    const { x, y } = Phaser.Actions.ShiftPosition(
      this.body.getChildren(),
      this.headPosition.x * 16,
      this.headPosition.y * 16,
      1
    );
    this.tail = new Phaser.Geom.Point(x, y);

    //  Check to see if any of the body pieces have the same x/y as the head
    //  If they do, the head ran into the body

    const hitBody = Phaser.Actions.GetFirst(
      this.body.getChildren(),
      { x: this.head.x, y: this.head.y },
      1
    );

    if (hitBody) {
      this.alive = false;
      return false;
    } else {
      //  Update the timer ready for the next movement
      this.moveTime = time + this.speed;

      return true;
    }
  }

  grow() {
    const newPart = this.body.create(this.tail.x, this.tail.y, BODY_KEY);

    newPart.setOrigin(0);
  }

  collideWithFood(food: Food) {
    if (this.head.x === food.x && this.head.y === food.y) {
      this.grow();

      food.eat();

      //  For every 5 items of food eaten we'll increase the snake speed a little
      if (this.speed > 20 && food.total % 5 === 0) {
        this.speed -= 5;
      }

      return true;
    } else {
      return false;
    }
  }

  updateGrid(grid: boolean[][]) {
    //  Remove all body pieces from valid positions list
    this.body.children.each(function (segment) {
      const image = segment as Phaser.GameObjects.Image;
      const bx = image.x / 16;
      const by = image.y / 16;

      grid[by][bx] = false;
    });

    return grid;
  }
}

export class SnakeGame extends Game {
  game: Phaser.Game;

  constructor() {
    super();
    this.game = new Phaser.Game({
      title: 'Snake',
      type: Phaser.WEBGL,
      width: 640,
      height: 480,
      backgroundColor: '#bfcc00',
      parent: 'game',
      scene: [GameScene],
      audio: {
        disableWebAudio: true
      }
    });
  }
}

export const createSnakeGame = () => {
  return new Phaser.Game({
    title: 'Snake',
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#bfcc00',
    parent: 'game',
    scene: [GameScene],
    audio: {
      disableWebAudio: true
    }
  });
};
