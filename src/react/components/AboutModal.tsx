import React, { ReactNode } from 'react';

interface AboutModalProps {
  isShowing: boolean;
  handleClose: () => void;
  children?: ReactNode;
}

const AboutModal: React.FC<AboutModalProps> = ({ isShowing, handleClose, children }) => {
  return (
    <div id="about" className={`about ${isShowing ? 'is-visible' : ''}`}>
      <h3>Lore</h3>
      <p>
        Billions of years from now, our Sun's output is increasing, making the Earth uninhabitable.
      </p>
      <p>
        The future inhabitants of Earth decide to build generation ships in order to find and
        colonize new home world.
      </p>
      <p>
        At sublight speeds it will take centuries to reach the nearest star systems with habitable
        planets. The generation ships are designed to be self-contained ecosystems that must endure
        until they reach their destinations.
      </p>
      <h3>Goal</h3>
      <p>
        Your goal is to sustain a viable population and ecology that will be able to colonize the
        planet.
      </p>
      <p>
        Place tiles on the grid to build the generation ship's resources. Maximize the ship's
        population and ecosystem until there are no more tiles in the deck. If the ship's population
        drops to zero, that is game over.
      </p>
      <p>Tap a grid cell to place the tile. Tap the cell again to rotate the tile.</p>
      <h3>Tiles</h3>
      <dl>
        <dt>
          <span className="text-tree">ᚫ</span>
        </dt>
        <dd>
          Trees represent the natural ecology you want to transport to the destination world. They
          thrive when next to each other, but will die from overcrowding or too many people nearby.
        </dd>
        <dt>
          <span className="text-people">ᨊ</span>
        </dt>
        <dd>
          Habitats are where the human population lives. People require a balance of nature, farms,
          and power in order to grow.
        </dd>
        <dt>
          <span className="text-farm">፠</span>
        </dt>
        <dd>
          Farms are required to feed your population, and also depend on people to be maintained or
          improve. Farms can also suffer from overwilding if surrounded by too many trees.
        </dd>
        <dt>
          <span className="text-power">ᚢ</span>
        </dt>
        <dd>
          Fusion reactor power stations allow your population centers to grow. They need people to
          maintain them and they can suffer if the grid is overloaded with too much nearby power.
        </dd>
        <dt>
          <span className="text-waste">░</span>
        </dt>
        <dd>Waste is created when farms or habitats die. Excess waste will produce more waste</dd>
      </dl>
      <button className="button" onClick={handleClose}>
        ✓
      </button>
      {children}
    </div>
  );
};

export default AboutModal;
