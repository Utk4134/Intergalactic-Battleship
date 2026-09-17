export const GameState = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover',
};

export class GameStateManager {
    constructor() {
        this.state = GameState.PLAYING;
    }

    pause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
        }
    }

    resume() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
        }
    }

    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.pause();
        } else if (this.state === GameState.PAUSED) {
            this.resume();
        }
    }

    gameOver() {
        this.state = GameState.GAMEOVER;
    }

    restart() {
        this.state = GameState.PLAYING;
    }

    isPlaying() {
        return this.state === GameState.PLAYING;
    }

    isPaused() {
        return this.state === GameState.PAUSED;
    }

    isGameOver() {
        return this.state === GameState.GAMEOVER;
    }
}
