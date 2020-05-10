// Generate the board cells

const boardEl = document.createElement("TABLE")
document.body.appendChild(boardEl)

const whoHasWonEl = document.querySelector(".result")

const predictionEl = document.querySelector(".prediction")

const tdElements = []

for (let y = 0; y < 3; y++) {
	const tr = document.createElement("TR")
	boardEl.appendChild(tr)
	
	const tdRow = []
	
	for (let x = 0; x < 3; x++) {
		const td = document.createElement("TD")
		tr.appendChild(td)
		tdRow.push(td)
	}
	
	tdElements.push(tdRow)
}

// The board below isn't guaranteed to stay the same.
const ourBoard = new HTMLBoard(
	new Board(
		[["E","E","E"],["E","E","E"],["E","E","E"]],
		"X",
		false,
        {}
	),
	tdElements,
	whoHasWonEl,
    predictionEl
)

ourBoard.render()