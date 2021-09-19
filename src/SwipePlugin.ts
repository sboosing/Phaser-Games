import * as Phaser from 'phaser';

export const enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

export class Swipe {
  isSwiping: boolean;
  scene: Phaser.Scene;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };

  constructor(scene: Phaser.Scene) {
    this.isSwiping = false;
    this.scene = scene;
    this.startPosition = { x: 0, y: 0 };
    this.endPosition = { x: 0, y: 0 };
    // Assumes a single pointer, not sure if this is safe to assume or not.
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isSwiping = true;
      this.startPosition = { x: pointer.x, y: pointer.y };
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.endPosition = { x: pointer.x, y: pointer.y };
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.isSwiping = false;
      this.endPosition = { x: pointer.x, y: pointer.y };
    });
  }

  getSwipeDirection(): Direction | undefined {
    // Still swiping, we can't tell what direction.
    const xDelta = this.endPosition.x - this.startPosition.x;
    const yDelta = this.endPosition.y - this.startPosition.y;
    if (xDelta === 0 && yDelta === 0) {
      return;
    }
    if (this.isSwiping) {
      return;
    }
    let xDirection: Direction;
    let yDirection: Direction;
    if (xDelta > 0) {
      xDirection = Direction.RIGHT;
    } else {
      xDirection = Direction.LEFT;
    }
    if (yDelta > 0) {
      yDirection = Direction.DOWN;
    } else {
      yDirection = Direction.UP;
    }
    this.startPosition = { x: 0, y: 0 };
    this.endPosition = { x: 0, y: 0 };

    // Return the direction that was swiped mostly,
    // in case the swipe is diagonal or not straight.
    if (Math.abs(xDelta) > Math.abs(yDelta)) {
      return xDirection;
    } else {
      return yDirection;
    }
  }
}
