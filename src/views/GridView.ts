import { BoardSpace } from "../modules/BoardSpace";
import { GameBoard } from "../modules/GameBoard";
import { Tile } from "../modules/Tile";
import { GameView } from "../types/GameViewInterface";
import { getTileCellClassList } from "../utils/getTileCellClassList";

export class GridView implements GameView {
    public document: Document;
    public readonly div: HTMLDivElement | null;
    private gameBoard: GameBoard;

    constructor(document: Document, selector: string, gameBoard: GameBoard) {
        this.document = document;
        this.div = document.querySelector<HTMLDivElement>(selector);
        this.gameBoard = gameBoard;

        this.initializeGridView();

        this.animateFolksWalking();
        setInterval(() => {
            this.animateFolksWalking()
        }, 1000 * 2);
    }
    
    updateGrid(): void {
        this.gameBoard.getGrid((space: BoardSpace): void => {
            this.updateCell(space);
        });
    }

    private initializeGridView(): void {
        if (!this.div) return;

        const gameSize = this.gameBoard.size;

        for (let row = 0; row < gameSize; row++) {
            const newRow = this.document.createElement('div');
            newRow.className = 'row';

            for (let col = 0; col < gameSize; col++) {
                const space = this.gameBoard.getSpace(col, row);
                
                if (space) {
                    const newCell = this.document.createElement('div');
                    // Mapping rows and columns to x,y coords
                    newCell.dataset.x = `${col}`;
                    newCell.dataset.y = `${row}`;
                    newCell.className = this.getCellClassList(space);

                    newRow.appendChild(newCell);
                }
            }

            this.div.appendChild(newRow);
        }
    }

    private updateCell(space: BoardSpace): void {
        const tile = space ? space.tile : undefined;
        const classList = this.getCellClassList(space);

        // Find the cell element in the DOM
        const cell = this.document.querySelector<HTMLDivElement>(`.cell[data-x="${space.x}"][data-y="${space.y}"]`);

        if (cell) {
            // Update the class names based on the current state
            cell.className = classList;
            this.updatePeopleCellFolks(tile, cell);
        }
    }

    private getCellClassList(space: BoardSpace) {
        const additionalClasses = space && space.isHighlighted ? ['highlight'] : [];

        return getTileCellClassList(space.tile, additionalClasses);
    }

    private updatePeopleCellFolks(tile: Tile | null | undefined, cellDiv: HTMLDivElement): void {
        const folkSpans = cellDiv.querySelectorAll('span');

        if (tile && tile.type == 'people') {
            const folksNum = tile.level * 2;
            const adjustment = folksNum - folkSpans.length;

            if (adjustment > 0) {
                for (let i = 0; i < adjustment; i++) {
                    const newFolkSpan = this.document.createElement('span');
                    newFolkSpan.textContent = '⫯';
                    cellDiv.appendChild(newFolkSpan);
                }
            } else {
                for (let i = 0; i < Math.abs(adjustment); i++) {
                    const lastSpan = folkSpans[folkSpans.length - 1];
                    
                    if (lastSpan) {
                        cellDiv.removeChild(lastSpan); // Remove the last span
                    }
                }
            }
        } else {
            folkSpans.forEach(span => {
                cellDiv.removeChild(span);
            });
        }
    }

    private animateFolksWalking(): void {
        if (!this.div) return;

        const folkSpans = this.div.querySelectorAll<HTMLSpanElement>('.cell.people span');

        for (const span of folkSpans) {
            const x = Math.random() * 600 - 300; // Random x between -100 and 100
            const y = Math.random() * 200 - 100; // Random y between -100 and 100

            span.style.transform = `translate(${x}%, ${y}%)`;
        }
    }
}