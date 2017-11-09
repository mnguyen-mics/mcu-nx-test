
import React from 'react';
import McsIcons, { McsIconType } from '../McsIcons';

export interface MenuPresentationalProps {
  title: string;
  type: McsIconType;
  subtitles?: string[];
  select: React.FormEventHandler<any>;
}

const MenuPresentational: React.SFC<MenuPresentationalProps> = ({
  title,
  subtitles,
  select,
  type,
}) => {

  return (
    <button className="presentation-item" onClick={select}>
      <div className="content">
        <McsIcons type={type} />
        <div className="title">
          {title}
        </div>
        <div className="subtitle">
          { subtitles && subtitles.map(subtitle => {
            return `${subtitle}, `;
          }) }
        </div>
      </div>
    </button>
  );
};

export default MenuPresentational;
