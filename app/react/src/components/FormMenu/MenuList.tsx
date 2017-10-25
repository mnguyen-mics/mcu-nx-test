
import React from 'react';
import McsIcons from '../McsIcons';

export interface MenuListProps {
  title: string;
  subtitles?: string[];
  select: React.FormEventHandler<any>;
}

const MenuList: React.SFC<MenuListProps> = ({ title, subtitles, select }) => {

  return (
    <div className="menu-sublist">
      <button className="menu-item" onClick={select}>
        <div className={subtitles ? 'content' : 'content alone'}>
          <div className="title">{title}</div>
          {subtitles ? <div className="subtitles">{ subtitles.map((subtitle, index) => {
            return index !== subtitles.length - 1 ? `${subtitle}, ` : subtitle;
          }) }</div> : null}
        </div>
        <div className="selector">
          <McsIcons type="chevron-right" />
        </div>
      </button>
    </div>
  );
};

export default MenuList;
