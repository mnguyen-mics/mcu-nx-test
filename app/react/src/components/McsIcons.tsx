import * as React from 'react';

interface McsIconsProps {
    type: string;
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
