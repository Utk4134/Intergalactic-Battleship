export class ScoreManager {
    constructor() {
        this.score = 0;
    }

    add(amount) {
        this.score += Math.floor(amount);
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
    }
}
