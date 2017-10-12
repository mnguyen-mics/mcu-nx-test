import * as React from 'react';

interface McsIconsProps {
    type: string;
}

const McsIcons: React.SFC<McsIconsProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> > = props => {

  const {
    type,
    ...rest,
  } = props;

  return (
    <span className="icon" {...rest} >
      <i className={`mcs-${props.type}`} />
    </span>
  );
};

export default McsIcons;
