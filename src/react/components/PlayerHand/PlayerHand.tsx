import { HandItem } from '@/modules/PlayerHand';
import { TileBlock } from '@/modules/TileBlock';
import { getTileCellClassList } from '@/utils/getTileCellClassList';
import React from 'react';
import styles from './PlayerHand.module.scss';
import GridTile from '../Tiles/GridTile';

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
    <div className={styles.cardDisplay}>
      <div className={styles.hand}>
        {items.length === 0 && <p>No items in hand</p>}

        {items.length > 0 && (
          <div className={styles.handGrid}>
            {items.map((item, index) => {
              if (item instanceof TileBlock) {
                const selectedClass = index === selectedIndex ? styles.selected : '';
                const layout = item.getLayout();

                return (
                  <div
                    className={`${styles.handItem} ${selectedClass}`}
                    data-index={index}
                    key={index}
                    onClick={() => handleHandItemClick(index)}
                  >
                    <div className={styles.handRow}>
                      <div
                        className={`${styles.handItemCell} ${getTileCellClassList(layout.tiles[0])}`}
                      >
                        {layout.tiles[0] && <GridTile tile={layout.tiles[0]} animate={false} />}
                      </div>
                      <div
                        className={`${styles.handItemCell} ${getTileCellClassList(layout.tiles[1])}`}
                      >
                        {layout.tiles[1] && <GridTile tile={layout.tiles[1]} animate={false} />}
                      </div>
                    </div>
                  </div>
                );
              }

              return <div></div>;
            })}
          </div>
        )}
      </div>
      <div className={styles.deckCounter}>
        <div className={`${styles.deckCounterDeck} ${deckCount === 0 ? 'is-empty' : ''}`}>
          {deckCount}
        </div>
      </div>
    </div>
  );
};

export default PlayerHand;
