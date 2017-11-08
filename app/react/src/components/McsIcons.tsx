import * as React from 'react';

export type McsIconType =
  'adGroups' |
  'ads' |
  'automation' |
  'bell' |
  'bolt' |
  'check-rounded-inverted' |
  'check-rounded' |
  'check' |
  'chevron-right' |
  'chevron' |
  'close-big' |
  'close-rounded' |
  'close' |
  'code' |
  'creative' |
  'delete' |
  'display' |
  'dots' |
  'download' |
  'email-inverted' |
  'email' |
  'extend' |
  'filters' |
  'full-users' |
  'gears' |
  'goals-rounded' |
  'goals' |
  'image' |
  'info' |
  'laptop' |
  'library' |
  'magnifier' |
  'menu-close' |
  'minus' |
  'optimization' |
  'options' |
  'partitions' |
  'pause' |
  'pen' |
  'phone' |
  'play' |
  'plus' |
  'query' |
  'question' |
  'refresh' |
  'settings' |
  'smartphone' |
  'status' |
  'tablet' |
  'user' |
  'users' |
  'video' |
  'warning';

interface McsIconsProps {
    type: McsIconType;
    additionalClass?: string;
}

const McsIcons: React.SFC<McsIconsProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> > = props => {

  const {
    type,
    additionalClass,
    ...rest,
  } = props;

  return (
    <span className={`icon ${additionalClass}`} {...rest} >
      <i className={`mcs-${props.type}`} />
    </span>
  );
};

export default McsIcons;
