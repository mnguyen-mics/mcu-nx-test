
import * as React from 'react';
import McsIcon, { McsIconType } from '../McsIcon';

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
        <div>
          <McsIcon type={type} />
          <div className="title">
            {title}
          </div>
          <div className="subtitle">
            {subtitles && subtitles.map(subtitle => {
              return `${subtitle}, `;
            })}
          </div>
        </div>
      </div>
    </button>
  );
};

export default MenuPresentational;
