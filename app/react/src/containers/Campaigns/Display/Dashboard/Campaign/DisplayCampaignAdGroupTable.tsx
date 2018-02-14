import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { Switch } from 'antd';
import { compose } from 'recompose';

import messages from '../messages';

import { TableView } from '../../../../../components/TableView/index';
import { formatMetric } from '../../../../../utils/MetricHelper';
import McsIcon from '../../../../../components/McsIcon';
import { RouteComponentProps } from 'react-router';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import { AdGroupStatus } from '../../../../../models/campaign/constants/index';
import { ExtendedTableRowSelection } from '../../../../../components/TableView/TableView';

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
      match: { params: { campaignId, organisationId } },
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
      match: { params: { campaignId, organisationId } },
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
      match: { params: { organisationId, campaignId } },
      isFetching,
      isFetchingStat,
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
      const { updateAdGroup, intl: { formatMessage } } = this.props;
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
        translationKey: 'STATUS',
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
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text: any, record: AdGroupResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${
              record.id
            }`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'CPM',
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) =>
          renderMetricData(parseFloat(text) / 100, '0.000 %'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      // TODO UNCOMMENT WHEN BACKEND IS FIXED
      // {
      //   translationKey: 'CPA',
      //   key: 'cpa',
      //   isVisibleByDefault: true,
      //   isHideable: true,
      //   render: text => renderMetricData(text, '0,0.00', 'EUR'),
      // },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCampaign,
          },
          {
            intlMessage: messages.duplicate,
            callback: this.duplicateCampaign,
          },
          // Commented for now to be improved later
          // {
          //   translationKey: 'ARCHIVE',
          //   callback: this.archiveAdGroup,
          // },
        ],
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
        if (rowSelection && rowSelection.onSelect) {
          rowSelection.onSelect();
        }
      }
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
