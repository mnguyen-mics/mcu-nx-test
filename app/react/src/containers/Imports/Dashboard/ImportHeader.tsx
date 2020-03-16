import * as React from 'react';
import { Import } from '../../../models/imports/imports';
import ContentHeader from '../../../components/ContentHeader';
import { formatDocumentTypeText, formatMimeTypeText } from '../domain';

interface ImportHeaderProps {
  object?: Import;
}

class ImportHeader extends React.Component<ImportHeaderProps> {
  render() {
    const { object } = this.props;

    return (
      <ContentHeader
        title={(object && object.name) || ''}
        subTitle={
          (object &&
            `${formatDocumentTypeText(
              object.document_type,
            )} / ${formatMimeTypeText(object.mime_type)}`) ||
          ''
        }
        loading={!(object && object.name)}
      />
    );
  }
}

export default ImportHeader;
