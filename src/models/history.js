export class History {
  /**
   * The history
   * @type {Frame[]}
   */
  #history = [null];

  /**
   * Current index in the history
   * @type {number}
   */
  #indexInHistory = 0;

  /**
   * Add a new change
   * @param {Frame} frame
   */
  newChange(frame) {
    this.#history = this.#history.slice(0, this.#indexInHistory + 1);
    this.#history.push(frame);
    this.#indexInHistory++;
  }

  /**
   * Undo the last change
   *
   * @returns {Frame | null}
   */
  undo(currentFrame) {
    if (this.#indexInHistory > 0) {
      this.#indexInHistory--;
    }

    return this.#history[this.#indexInHistory];
  }

  /**
   * Redo the last change
   *
   * @returns {Frame | null}
   */
  redo() {
    if (this.#indexInHistory < this.#history.length - 1) {
      this.#indexInHistory++;
    }

    return this.#history[this.#indexInHistory];
  }

  /**
   * Check if there are changes to undo
   * @returns {boolean}
   */
  canUndo() {
    return this.#indexInHistory > 0;
  }

  /**
   * Check if there are changes to redo
   * @returns {boolean}
   */
  canRedo() {
    return this.#indexInHistory < this.#history.length - 1;
  }
}