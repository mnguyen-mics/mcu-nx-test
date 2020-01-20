import * as React from 'react';
import McsIcon, { McsIconType } from '../McsIcon';

export interface MenuPresentationalProps {
  title: string;
  type: McsIconType;
  subtitles?: string[];
  select: React.FormEventHandler<any>;
  disabled?: boolean;
}

const MenuPresentational: React.SFC<MenuPresentationalProps> = ({
  title,
  subtitles,
  select,
  type,
  disabled
}) => {
  return (
    <button className="presentation-item" onClick={select} disabled={disabled}>
      <div className="content">
        <McsIcon type={type} />
        <div className="title">{title}</div>
        <div className="subtitle">
          {subtitles &&
            subtitles.map((subtitle, index, arr) => {
              // If it's the last subtitle, the comma is not needed
              if (index === arr.length - 1) {
                return `${subtitle}`;
              } else {
                return `${subtitle}, `;
              }
            })}
        </div>
      </div>
    </button>
  );
};

export default MenuPresentational;
