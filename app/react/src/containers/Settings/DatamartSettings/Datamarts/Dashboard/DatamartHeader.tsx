import * as React from 'react';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';

export interface DatamartHeaderProps {
  datamart?: DatamartResource;
  isLoading?: boolean;
}

type Props = DatamartHeaderProps & InjectedIntlProps;

class DatamartHeader extends React.Component<Props> {
  render() {
    const { datamart, isLoading } = this.props;

    return <ContentHeader title={datamart && <span>{datamart.name}</span>} loading={isLoading} />;
  }
}

export default compose<Props, DatamartHeaderProps>(withRouter, injectIntl)(DatamartHeader);
