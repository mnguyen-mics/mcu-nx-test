import * as React from 'react';
import { Button, message } from 'antd';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import McsIcon from '../../../../components/McsIcon';
import ExportService from '../../../../services/ExportService';
import ReportService from '../../../../services/ReportService';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { EMAIL_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import messages from './messages';
import { Index } from '../../../../utils';
import { CampaignsOptions } from '../../../../services/DisplayCampaignService';
import { IEmailCampaignService } from '../../../../services/EmailCampaignService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';

interface State {
  exportIsRunning: boolean;
}

type Props = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class EmailCampaignsActionbar extends React.Component<Props, State> {
  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  constructor(props: Props) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = {
      exportIsRunning: false,
    };
  }

  fetchExportData = (organisationId: string, filter: Index<any>) => {
    const campaignType = 'EMAIL';

    const buildOptionsForGetCampaigns = () => {
      const options: CampaignsOptions = {
        archived: filter.statuses.includes('ARCHIVED'),
        first_result: 0,
        max_results: 2000,
      };

      if (filter.keywords) {
        options.keywords = filter.keywords;
      }

      return options;
    };

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = ['campaign_id'];

    const apiResults = Promise.all([
      this._emailCampaignService.getEmailCampaigns(
        organisationId,
        campaignType,
        buildOptionsForGetCampaigns(),
      ),
      ReportService.getEmailDeliveryReport(
        organisationId,
        startDate,
        endDate,
        dimension,
      ),
    ]);

    return apiResults.then(results => {
      const displayCampaigns = normalizeArrayOfObject(results[0].data, 'id');
      const performanceReport = normalizeArrayOfObject(
        normalizeReportView(results[1].data.report_view),
        'campaign_id',
      );

      const mergedData = Object.keys(displayCampaigns).map(campaignId => {
        return {
          ...displayCampaigns[campaignId],
          ...performanceReport[campaignId],
        };
      });

      return mergedData;
    });
  };

  handleRunExport() {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      EMAIL_SEARCH_SETTINGS,
    );

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(
      intl.formatMessage(messages.exportInProgress),
      0,
    );

    this.fetchExportData(organisationId, filter)
      .then(data => {
        ExportService.exportEmailCampaigns(
          organisationId,
          data,
          filter,
          intl.formatMessage,
        );
        this.setState({
          exportIsRunning: false,
        });
        hideExportLoadingMsg();
      })
      .catch(() => {
        this.setState({
          exportIsRunning: false,
        });
        hideExportLoadingMsg();
      });
  }

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.emails),
        path: `/v2/o/${organisationId}/campaigns/email`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/campaigns/email/create`}>
          <Button type="primary" className="mcs-primary">
            <McsIcon type="plus" />{' '}
            <FormattedMessage
              id="email.campaigns.list.actionbar.newCampaign"
              defaultMessage="New Campaign"
            />
          </Button>
        </Link>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type="download" />}
          <FormattedMessage
            id="email.campaigns.list.actionbar.export"
            defaultMessage="Export"
          />
        </Button>
      </Actionbar>
    );
  }
}
export default compose(injectIntl, withRouter)(EmailCampaignsActionbar);
