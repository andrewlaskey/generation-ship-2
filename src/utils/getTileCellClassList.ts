import { Tile } from "../modules/Tile";

export function getTileCellClassList(tile: Tile | null, additionalClasses?: string[]): string {
    const tileType = tile ? tile.type : 'empty';
    const tileLevel = tile ? tile.level : 0;
    const tileState = tile ? tile.state : 'neutral';

    return `cell ${tileType} ${tileState} l${tileLevel} ${additionalClasses ? additionalClasses.join(' ') : '' }`;
}