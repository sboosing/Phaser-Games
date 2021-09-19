import { createBoardGame } from './BoardGame';
import { createSnakeGame } from './Snake';

let currGame: Phaser.Game | null = null;
const appEle = document.getElementById('app');
if (!appEle) {
  throw new Error('Element with id "app" could not be found.');
}

const snake = document.createElement('option');
snake.text = 'Snake';

const board = document.createElement('option');
board.text = 'Board';

const select = document.createElement('select');
select.add(snake);
select.add(board);
select.addEventListener('change', (e) => {
  const oldGame = currGame;
  const val = (e.target as HTMLSelectElement).value;
  if (val === 'Snake') {
    currGame = createSnakeGame();
  } else if (val === 'Board') {
    currGame = createBoardGame();
  }
  if (oldGame !== currGame) {
    oldGame?.destroy(true);
  }
  localStorage.setItem('GAME', val);
});
appEle.prepend(select);

select.value = localStorage.getItem('GAME') || 'Snake';
select.dispatchEvent(new Event('change'));
