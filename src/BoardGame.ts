import * as Phaser from 'phaser';

const BRICK_KEY = 'brick';
const KNIGHT_KEY = 'knight';

class GameScene extends Phaser.Scene {
  board: { x: number; y: number }[][];
  correctPath: { x: number; y: number }[];
  currStep: number;
  maxX: number;
  maxY: number;

  constructor() {
    super('Game');
    this.maxX = 40;
    this.maxY = 30;
    this.board = this.generateBoard();
    this.currStep = 0;
    this.correctPath = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
      { x: 9, y: 5 },
      { x: 10, y: 5 },
      { x: 11, y: 5 },
      { x: 11, y: 6 },
      { x: 11, y: 7 },
      { x: 11, y: 8 },
      { x: 12, y: 8 },
      { x: 13, y: 8 },
      { x: 14, y: 8 },
      { x: 15, y: 8 },
      { x: 16, y: 8 },
      { x: 17, y: 8 },
      { x: 18, y: 8 },
      { x: 18, y: 9 },
      { x: 19, y: 9 }
    ];
  }

  preload() {
    this.load.image(BRICK_KEY, '/assets/Brick.png');
    this.load.spritesheet(KNIGHT_KEY, '/assets/HeroKnight.png', {
      frameWidth: 100,
      frameHeight: 55,
      startFrame: 0,
      endFrame: 90
    });
  }

  create() {
    for (let i = 0; i < this.correctPath.length; i++) {
      this.createBrick(this.correctPath[i].x, this.correctPath[i].y);
    }

    const idleSprite = this.add.sprite(-32, 0, KNIGHT_KEY);
    idleSprite.setOrigin(0, 0);
    idleSprite.setDisplaySize(100, 55);
    idleSprite.anims.create({
      key: 'idle',
      repeat: -1,
      frames: this.anims.generateFrameNumbers(KNIGHT_KEY, {
        start: 0,
        end: 7
      })
    });
    idleSprite.play('idle');
    let i = 0;
    // TODO: Probably not the correct way to move the position in Phaser.
    //  Should probably use the update method.
    // Make the character "walk" the board.
    setInterval(() => {
      const path = this.correctPath[i];
      const location = this.board[path.y][path.x];
      idleSprite.setPosition(location.x, location.y);
      i++;
      if (i >= this.correctPath.length) {
        i = 0;
      }
    }, 1250);

    // const walkSprite = this.add.sprite(0, 75, KNIGHT_KEY);
    // walkSprite.setOrigin(0, 0);
    // walkSprite.anims.create({
    //   key: 'walk',
    //   repeat: -1,
    //   frames: this.anims.generateFrameNumbers(KNIGHT_KEY, {
    //     start: 8,
    //     end: 15
    //   })
    // });
    // walkSprite.play('walk');
  }

  update(time: number, delta: number) {
    super.update(time, delta);
  }

  generateBoard() {
    const board: { x: number; y: number }[][] = [];
    for (let y = -1; y < this.maxY - 1; y++) {
      board[y + 1] = [];
      for (let x = -1; x < this.maxX - 1; x++) {
        board[y + 1][x + 1] = { x: x * 32, y: y * 32 };
      }
    }

    return board;
  }

  createBrick(x: number, y: number) {
    if (x < 0 || x >= this.maxX || y < 0 || y >= this.maxY) {
      throw new Error('Brick cannot be placed outside of board.');
    }
    const brick = this.add.image(x * 32, y * 32, BRICK_KEY);
    brick.setScale(1 / 8, 1 / 8);
    brick.setOrigin(0, 0);
  }
}

export const createBoardGame = () => {
  return new Phaser.Game({
    title: 'Board Game',
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
