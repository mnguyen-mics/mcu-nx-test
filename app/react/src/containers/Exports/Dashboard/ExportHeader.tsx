import * as React from 'react';
import { Export } from '../../../models/exports/exports';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';

interface ExportHeaderProps {
  object?: Export;
}

const ExportHeader: React.SFC<ExportHeaderProps> = props => {
  const { object } = props;

  return (
    <ContentHeader
      title={(object && object.name) || ''}
      loading={object && object.name ? false : true}
    />
  );
};

export default ExportHeader;
