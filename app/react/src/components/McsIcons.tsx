import * as React from 'react';

interface McsIconsProps {
    type: string;
}

const McsIcons: React.SFC<McsIconsProps> = props => {
  return (
    <span className="icon" {...props}>
      <i className={`mcs-${props.type}`} />
    </span>
  );
}

export default McsIcons;
