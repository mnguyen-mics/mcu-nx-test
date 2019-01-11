import * as React from 'react';
import { Import } from '../../../../models/imports/imports';
import ContentHeader from '../../../../components/ContentHeader';

interface ImportHeaderProps {
  object?: Import;
}

const ImportHeader: React.SFC<ImportHeaderProps> = props => {
  const { object } = props;

  return (
    <ContentHeader
      title={(object && object.name) || ''}
      loading={object && object.name ? false : true}
    />
  );
};

export default ImportHeader;
