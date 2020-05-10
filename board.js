class Board {
    /**
     * The 'board' argument is an Array of Array of String. It represents the current
     * board state: which squares are filled in with what.
     *
     * An empty board looks like this:
     *
     * [
     *   ["E", "E", "E"],
     *   ["E", "E", "E"],
     *   ["E", "E", "E"]
     * ]
     *
     * but each square of the board can have one of 3 values:
     *   "X" - the player X has occupied this square
     *   "O" - the player O has occupied this square
     *     "E" - the square is unoccupied (it is empty)
     *
     * The 'compSymbol' argument is either 'X' or 'O' and represents the symbol which
     * the computer uses to make its moves.
     *
     * The 'isCompTurn' is a boolean which should be true if the algorithm is in the MAX stage,
     * that is it is the computer's turn; or false in the MIN stage (it is the player's turn)
     *
     * The 'tdElements' is an Array of Array of HTMLElement or it is null.
     */
    constructor(board, compSymbol, isCompTurn, cache) {
        this.state = board
        this.compSymbol = compSymbol
        this.isCompTurn = isCompTurn
        this.cache = cache
        
        this.boardSize = this.state.length
        this.humanSymbol = this.compSymbol === "X" ? "O" : "X"
    }

    /**
     * Determines the score for the Minimax algorithm, sometimes by looking
     * at cached results from previous runs.
     */
    getScore() {
        const stringState = this.state.join(";")
        
        if (this.cache[stringState]) return this.cache[stringState]
        
        const score = this.forceGetScore()
        
        this.cache[stringState] = score
        return score
    }
    
    /**
     * Determines the score for the Minimax algorithm.
     */
    forceGetScore() {
        // Win as fast as possible
        if (this.getWinner() === this.compSymbol) return 100 - this.getChildBoards().length
        
        // Lose as slowly as possible
        if (this.getWinner() === this.humanSymbol) return -100 + this.getChildBoards().length
        
        // Draw as slowly as possible
        if (this.getWinner() === "D") return 0 + this.getChildBoards().length
        
        if (this.isCompTurn) {
            return Math.max(...this.getChildBoards().map(board => board.getScore()))
        } else {
            return Math.min(...this.getChildBoards().map(board => board.getScore()))
        }
    }
    
    /**
     * Returns every single child board.
     */
    getChildBoards() {
        const childBoards = []
        const playerSymbol = this.isCompTurn ? this.compSymbol : this.humanSymbol
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.state[y][x] === "E") {
                    const newBoard = this.clone()
                    newBoard.state[y][x] = playerSymbol
                    newBoard.isCompTurn = !this.isCompTurn
                    
                    childBoards.push(newBoard)
                }
            }
        }
        
        return childBoards
    }
    
    /**
     * Takes the largest child and moves
     */
    getNextBestBoardState() {
        if (!this.isCompTurn) return;
        
        if (this.getWinner() === "L") {
            return this.getChildBoards().find(board => board.getScore() === this.getScore())
        }
    }
    
    /**
     * Makes an identical copy of this Board object.
     * The arrays are deeply cloned.
     */
    clone() {
        const newState = this.state.map(row => [...row])
        
        return new Board(newState, this.compSymbol, this.isCompTurn, this.cache)
    }
    
    /**
     * Determines who has won. This will return:
     *  "X" - the player X has won
     *  "O" - the player O has won
     *  "D" - there is no legal move but nobody has won (it's a draw)
     *  "L" - the game is still ongoing ("live")
     */
    getWinner() {
        const lines = [...this.getRows(), ...this.getCols(), ...this.getDiags()]
        
        let isDraw = true
        
        for (let line of lines) {
            const winner = Board.getLineWinner(line)
            
            if (["X", "O"].includes(winner)) {
                return winner
            }
            
            if (winner === "E") {
                isDraw = false
            }
        }
        
        return isDraw ? "D" : "L"
    }
    
    /**
     * Given a line, works out if that line indicates:
     *
     *  "X" - Player X has won
     *  "O" - Player O has won
     *  "D" - Could be a draw (all squares filled in)
     *  "E" - Could be incomplete (there is an empty gap)
     */
    static getLineWinner(line) {
        // Is there an empty square?
        if (line.includes("E")) {
            return "E"
        }
        
        // Do all the squares hold the same value
        if (line.every(square => square === line[0])) {
            return line[0]
        }
        
        return "D"
    }

    /**
     * Gets all of the horizontal lines. Returns Array of Array of String.
     * This is identical to just looking at the board state directly.
     */
    getRows() {
        return this.state
    }
    
    /**
     * Gets all of the vertical lines. Returns Array of Array of String.
     * This is like a rotation of the board state.
     */
    getCols() {
        const columns = []
        
        for (let x = 0; x < this.boardSize; x++) {
            columns.push(this.state.map(row => row[x]))
        }
        
        return columns
    }
    
    /**
     * Gets the two diagonals of the board: these are of the form:
     *   y = x; and
     *   y = 2 - x [ if 3x3 board, 0-indexed arrays ]
     */
    getDiags() {
        return [
            this.state.map((row, i) => row[i]),
            this.state.map((row, i) => row[this.boardSize - i - 1])
        ]
    }
}

class HTMLBoard {
    constructor(vBoard, tdElements, whoHasWonEl, predictionEl) {
        this.vBoard = vBoard
        this.tdElements = tdElements
        this.whoHasWonEl = whoHasWonEl
        this.predictionEl = predictionEl
        
        if (this.vBoard.isCompTurn) {
            this.vBoard = this.vBoard.getNextBestBoardState() || this.vBoard
            this.render()
        }
        
        this.attachEventListeners()
    }
    
    /**
     * A function which iterates over every single TD element (if the array was provided)
     * and attaches the this.onClick event listener to them. It is bound to the arguments
     * of the x and y coordinates.
     */
    attachEventListeners() {
        for (let x = 0; x < this.vBoard.boardSize; x++) {
            for (let y = 0; y < this.vBoard.boardSize; y++) {
                this.tdElements[y][x].addEventListener("click", () => this.onClick(x, y))
            }
        }
    }
    
    /**
     * The 'click' event listener for every TD element of the HTML board table
     */
    onClick(x, y) {
        if (this.vBoard.state[y][x] === "E" && !this.vBoard.isCompTurn) {
            if (this.vBoard.getWinner() !== "L") return;
            
            const newBoard = this.vBoard.clone()
            newBoard.state[y][x] = this.vBoard.humanSymbol
            newBoard.isCompTurn = true
            
            this.vBoard = newBoard
            this.render()
            
            this.vBoard = this.vBoard.getNextBestBoardState() || this.vBoard
            this.render()
        }
    }

    /**
     * This updates the board with the new game state
     */
    render() {
        const humanWon = this.vBoard.getWinner() === this.vBoard.humanSymbol
        const computerWon = this.vBoard.getWinner() === this.vBoard.compSymbol
        const gameOngoing = this.vBoard.getWinner() === "L"
        const wasDraw = this.vBoard.getWinner() === "D"
        
        for (let x = 0; x < this.vBoard.boardSize; x++) {
            for (let y = 0; y < this.vBoard.boardSize; y++) {
                const tileState = this.vBoard.state[y][x]
                if (tileState === "E") {
                    this.tdElements[y][x].textContent = ""
                    this.tdElements[y][x].classList.add("legal")
                } else {
                    this.tdElements[y][x].textContent = tileState
                    this.tdElements[y][x].classList.remove("legal")
                }
                
                if (!gameOngoing) this.tdElements[y][x].classList.remove("legal")
                if (humanWon) this.tdElements[y][x].classList.add("good")
                if (computerWon) this.tdElements[y][x].classList.add("bad")
                if (wasDraw) this.tdElements[y][x].classList.add("maybe")
            }
        }
        
        const resultStrings = {
            [this.vBoard.compSymbol]: {class: 'bad', msg: `Computer (${this.vBoard.compSymbol})`},
            [this.vBoard.humanSymbol]: {class: 'good', msg: `Human (${this.vBoard.humanSymbol})`},
            "D": {class: 'maybe', msg: `Draw!`},
            "L": {class: 'exciting', msg: `Game is ongoing`}
        }
        
        let predictedResult = ""
        const score = this.vBoard.getScore()
        
        if (score < -50) {
            predictedResult = this.vBoard.humanSymbol
        } else if (score > 50) {
            predictedResult = this.vBoard.compSymbol
        } else {
            predictedResult = "D"
        }
        
        this.whoHasWonEl.textContent = resultStrings[this.vBoard.getWinner()].msg
        this.whoHasWonEl.classList.remove("bad", "good", "maybe", "exciting")
        this.whoHasWonEl.classList.add(resultStrings[this.vBoard.getWinner()].class)
        
        this.predictionEl.textContent = resultStrings[predictedResult].msg
        this.predictionEl.classList.remove("bad", "good", "maybe", "exciting")
        this.predictionEl.classList.add(resultStrings[predictedResult].class)
    }
}