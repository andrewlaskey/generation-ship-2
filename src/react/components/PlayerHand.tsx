import { HandItem } from '@/modules/PlayerHand';
import { TileBlock } from '@/modules/TileBlock';
import { getTileCellClassList } from '@/utils/getTileCellClassList';
import React from 'react';

interface PlayerHandProps {
  items: HandItem[];
  selectedIndex: number;
  deckCount: number;
  handleHandItemClick: (index: number) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  items,
  selectedIndex,
  deckCount,
  handleHandItemClick,
}) => {
  return (
    <div className="card-display">
      <div className="hand">
        {items.length === 0 && <p>No items in hand</p>}

        {items.length > 0 && (
          <div className="hand-grid">
            {items.map((item, index) => {
              if (item instanceof TileBlock) {
                const selectedClass = index === selectedIndex ? 'selected' : '';
                const layout = item.getLayout();

                return (
                  <div
                    className={`hand-item ${selectedClass}`}
                    data-index={index}
                    key={index}
                    onClick={() => handleHandItemClick(index)}
                  >
                    <div className="hand-row">
                      <div className={getTileCellClassList(layout.tiles[0])}></div>
                      <div className={getTileCellClassList(layout.tiles[1])}></div>
                    </div>
                  </div>
                );
              }

              return <div></div>;
            })}
          </div>
        )}
      </div>
      <div className="deck-counter">
        <div className={`deck ${deckCount === 0 ? 'is-empty' : ''}`}>{deckCount}</div>
      </div>
    </div>
  );
};

export default PlayerHand;
