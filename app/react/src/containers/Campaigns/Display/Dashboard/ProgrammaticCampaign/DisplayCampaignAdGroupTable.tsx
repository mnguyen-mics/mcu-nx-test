import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Switch } from 'antd';
import { compose } from 'recompose';

import messages from '../messages';

import { TableView } from '../../../../../components/TableView/index';
import { formatMetric } from '../../../../../utils/MetricHelper';
import McsIcon from '../../../../../components/McsIcon';
import { RouteComponentProps } from 'react-router';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import { AdGroupStatus } from '../../../../../models/campaign/constants/index';
import {
  ExtendedTableRowSelection,
  ActionsColumnDefinition,
  ActionDefinition,
} from '../../../../../components/TableView/TableView';
import { DisplayCampaignInfoResource } from '../../../../../models/campaign/display';
import { ButtonStyleless } from '../../../../../components';

export interface UpdateMessage {
  title: string;
  body: string;
}

interface DisplayCampaignAdGroupTableProps {
  isFetching: boolean;
  isFetchingStat: boolean;
  dataSet?: AdGroupResource[];
  updateAdGroup: (
    id: string,
    adGroupInfo: {
      status: AdGroupStatus;
    },
    successMessage: UpdateMessage,
    errorMessage: UpdateMessage,
    adGroupInititalInfo: {
      status: AdGroupStatus;
    },
  ) => void;
  rowSelection: ExtendedTableRowSelection;
  campaign?: Omit<DisplayCampaignInfoResource, 'ad_groups'>;
}

interface DisplayCampaignAdGroupTableState {
  pageSize: number;
}

type JoinedProps = DisplayCampaignAdGroupTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }>;

class DisplayCampaignAdGroupTable extends React.Component<
  JoinedProps,
  DisplayCampaignAdGroupTableState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      pageSize: 10,
    };
  }

  editCampaign = (adgroup: AdGroupResource) => {
    const {
      match: {
        params: { campaignId, organisationId },
      },
      history,
      location,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/edit/${
        adgroup.id
      }`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  duplicateCampaign = (adGroup: AdGroupResource) => {
    const {
      match: {
        params: { campaignId, organisationId },
      },
      history,
      location,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/create`,
      state: {
        from: `${location.pathname}${location.search}`,
        adGroupId: adGroup.id,
      },
    });
  };

  archiveAdGroup = () => {
    // TODO
  };

  render() {
    const {
      match: {
        params: { campaignId },
      },
      isFetching,
      isFetchingStat,
      history,
      dataSet,
      rowSelection,
    } = this.props;

    const renderMetricData = (
      value: any,
      numeralFormat: string,
      currency = '',
    ) => {
      if (isFetchingStat) {
        return <i className="mcs-table-cell-loading" />;
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const changeAdGroupStatus = (record: AdGroupResource, checked: boolean) => {
      const {
        updateAdGroup,
        intl: { formatMessage },
      } = this.props;
      const status: AdGroupStatus = checked ? 'ACTIVE' : 'PAUSED';
      const initialStatus = checked ? 'PAUSED' : 'ACTIVE';
      const successMessage = checked
        ? {
            title: formatMessage(messages.notificationSuccess),
            body: formatMessage(messages.notificationAdGroupActivationSuccess, {
              name: record.name,
            }),
          }
        : {
            title: formatMessage(messages.notificationSuccess),
            body: formatMessage(messages.notificationAdGroupPauseSuccess, {
              name: record.name,
            }),
          };
      const errorMessage = checked
        ? {
            title: formatMessage(messages.notificationError),
            body: formatMessage(messages.notificationAdGroupActivationError, {
              name: record.name,
            }),
          }
        : {
            title: formatMessage(messages.notificationError),
            body: formatMessage(messages.notificationAdGroupPauseError, {
              name: record.name,
            }),
          };

      updateAdGroup(
        record.id,
        {
          status: status,
        },
        successMessage,
        errorMessage,
        {
          status: initialStatus,
        },
      );
    };

    const dataColumns = [
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text: string, record: AdGroupResource) => {
          const onChange = (checked: boolean) => {
            changeAdGroupStatus(record, checked);
          };
          return (
            <span>
              <Switch
                className="mcs-table-switch"
                checked={text === 'ACTIVE'}
                onChange={onChange}
                checkedChildren={
                  <McsIcon style={{ verticalAlign: 'middle' }} type="play" />
                }
                unCheckedChildren={
                  <McsIcon style={{ verticalAlign: 'middle' }} type="pause" />
                }
              />
            </span>
          );
        },
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: any, record: AdGroupResource) => {
          const toAdGroupDashboard = () => {
            history.push({
              pathname: `${campaignId}/adgroups/${record.id}`,
              state: { from: `${location.pathname}${location.search}` },
            });
          };
          return (
            <ButtonStyleless onClick={toAdGroupDashboard}>
              <a>{text}</a>
            </ButtonStyleless>
          );
        },
      },

      {
        intlMessage: messages.impressions,
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.clicks,
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.cpm,
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        intlMessage: messages.ctr,
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) =>
          renderMetricData(parseFloat(text) / 100, '0.000 %'),
      },
      {
        intlMessage: messages.cpc,
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        intlMessage: messages.impressions_cost,
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      // TODO UNCOMMENT WHEN BACKEND IS FIXED
      // {
      //   intlMessage: messages.cpa,
      //   key: 'cpa',
      //   isVisibleByDefault: true,
      //   isHideable: true,
      //   render: text => renderMetricData(text, '0,0.00', 'EUR'),
      // },
    ];

    const actions: Array<ActionDefinition<AdGroupResource>> = [];

    if (
      this.props.campaign &&
      this.props.campaign.model_version !== 'V2014_06'
    ) {
      actions.push(
        {
          intlMessage: messages.editCampaign,
          callback: this.editCampaign,
        },
        {
          intlMessage: messages.duplicate,
          callback: this.duplicateCampaign,
        },
      );
    }

    const actionColumns: Array<ActionsColumnDefinition<AdGroupResource>> = [
      {
        key: 'action',
        actions: () => actions,
      },
    ];

    const pagination = {
      pageSize: this.state.pageSize,
      total: this.props.dataSet ? this.props.dataSet.length : 0,
      onShowSizeChange: (current: number, size: number) =>
        this.setState({
          pageSize: size,
        }),
      onChange: (page: number) => {
        if (
          rowSelection &&
          rowSelection.unselectAllItemIds &&
          rowSelection.allRowsAreSelected
        ) {
          rowSelection.unselectAllItemIds();
        }
      },
    };

    return (
      <TableView
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        dataSource={dataSet}
        loading={isFetching}
        rowSelection={rowSelection}
        pagination={pagination}
      />
    );
  }
}

export default compose<JoinedProps, DisplayCampaignAdGroupTableProps>(
  injectIntl,
  withRouter,
)(DisplayCampaignAdGroupTable);
