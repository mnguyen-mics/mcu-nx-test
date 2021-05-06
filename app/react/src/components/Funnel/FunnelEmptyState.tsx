import * as React from 'react';
import { AreaChartOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { funnelMessages, FUNNEL_SEARCH_SETTING } from './Constants';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { updateSearch } from '../../utils/LocationSearchHelper';
import { InjectedIntlProps, injectIntl } from 'react-intl';

interface FunnelEmptyStateProps {}

type Props = FunnelEmptyStateProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;
class FunnelEmptyState extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  applyFunnelTemplateExample = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;

    const queryParams = {
      template: 'RETURN_ON_AD_SPEND',
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(search, queryParams, FUNNEL_SEARCH_SETTING),
    };
    history.push(nextLocation);
  };

  render() {
    const { intl } = this.props;
    return (
      <div className='mcs-funnelEmptyState'>
        <AreaChartOutlined className='mcs-funnelEmptyState_icon' />
        <p className='mcs-funnelEmptyState_desc'>
          {intl.formatMessage(funnelMessages.funnelEmptyState)}
        </p>
        <Button
          className='mcs-funnelEmptyState_showMeAnExample'
          onClick={this.applyFunnelTemplateExample}
        >
          {intl.formatMessage(funnelMessages.showMeAnExample)}
        </Button>
      </div>
    );
  }
}

export default compose<Props, FunnelEmptyStateProps>(injectIntl, withRouter)(FunnelEmptyState);
