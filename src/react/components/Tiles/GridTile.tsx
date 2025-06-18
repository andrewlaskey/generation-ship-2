import { Tile, TileType } from '@/modules/Tile';
import React from 'react';
import TreeTile from './TreeTile';
import PeopleTile from './PeopleTile';
import FarmTile from './FarmTile';
import PowerTile from './PowerTile';
import WasteTile from './WasteTile';

interface GridTileProps {
  tile: Tile;
  animate: boolean;
}

const GridTile: React.FC<GridTileProps> = ({ tile, animate }) => {
  return (
    <>
      {tile.type === TileType.Tree && <TreeTile tile={tile} animate={animate} />}
      {tile.type === TileType.People && <PeopleTile tile={tile} animate={animate} />}
      {tile.type === TileType.Farm && <FarmTile tile={tile} animate={animate} />}
      {tile.type === TileType.Power && <PowerTile tile={tile} animate={animate} />}
      {tile.type === TileType.Waste && <WasteTile tile={tile} animate={animate} />}
    </>
  );
};

export default GridTile;
