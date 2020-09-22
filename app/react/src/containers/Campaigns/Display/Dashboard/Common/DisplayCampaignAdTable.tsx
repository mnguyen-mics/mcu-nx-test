import * as React from 'react';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Switch, Modal } from 'antd';
import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';

import { TableView } from '../../../../../components/TableView/index';
import { formatMetric } from '../../../../../utils/MetricHelper';
import McsIcon from '../../../../../components/McsIcon';
import { Button } from '@mediarithmics-private/mcs-components-library';
import messages from '../messages';
import {
  AdResource,
  AdInfoResource,
} from '../../../../../models/campaign/display/index';
import { Popover } from '../../../../../components/PopupContainers/index';
import { UpdateMessage } from '../ProgrammaticCampaign/DisplayCampaignAdGroupTable';
import {
  ExtendedTableRowSelection,
  ActionsColumnDefinition,
} from '../../../../../components/TableView/TableView';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';

interface DisplayCampaignAdTableProps {
  isFetching: boolean;
  isFetchingStat: boolean;
  dataSet?: AdInfoResource[];
  updateAd: (
    adId: string,
    body: Partial<AdResource>,
    undoBody: Partial<AdResource>,
    successMessage: UpdateMessage,
    errorMessage: UpdateMessage,
  ) => void;
  rowSelection?: ExtendedTableRowSelection;
}

interface DisplayCampaignAdTableState {
  pageSize: number;
}

type JoinedProps = DisplayCampaignAdTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> &
  InjectedDrawerProps;

class DisplayCampaignAdTable extends React.Component<
  JoinedProps,
  DisplayCampaignAdTableState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      pageSize: 10,
    };
  }

  editCampaign = (ad: AdResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/creatives/display/edit/${
      ad.creative_id
    }`;

    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  archiveAd = (ad: AdResource) => {
    const {
      intl: { formatMessage },
    } = this.props;

    Modal.confirm({
      title: formatMessage(messages.creativeModalConfirmArchivedTitle),
      content: formatMessage(messages.creativeModalConfirmArchivedContent),
      iconType: 'exclamation-circle',
      okText: formatMessage(messages.creativeModalConfirmArchivedOk),
      cancelText: formatMessage(messages.cancelText),
      onOk() {
        //
      },
      onCancel() {
        //
      },
    });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
      isFetching,
      isFetchingStat,
      dataSet,
      intl: { formatMessage },
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

    const sorter = (a: any, b: any, key: string) => {
      if (a[key] === undefined && b[key] === undefined) {
        return 0;
      }
      if (a[key] === undefined) {
        return -b[key];
      }
      if (b[key] === undefined) {
        return a[key];
      }
      return a[key] - b[key];
    };

    const changeAdStatus = (record: AdResource, checked: boolean) => {
      const { updateAd } = this.props;

      const status = checked ? 'ACTIVE' : 'PAUSED';
      const initialStatus = checked ? 'PAUSED' : 'ACTIVE';
      const successMessage = checked
        ? {
            title: formatMessage(messages.notificationSuccess),
            body: formatMessage(messages.notificationAdActivationSuccess, {
              name: record.name,
            }),
          }
        : {
            title: formatMessage(messages.notificationSuccess),
            body: formatMessage(messages.notificationAdPauseSuccess, {
              name: record.name,
            }),
          };
      const errorMessage = checked
        ? {
            title: formatMessage(messages.notificationError),
            body: formatMessage(messages.notificationAdActivationError, {
              name: record.name,
            }),
          }
        : {
            title: formatMessage(messages.notificationError),
            body: formatMessage(messages.notificationAdPauseError, {
              name: record.name,
            }),
          };
      updateAd(
        record.id,
        {
          status,
        },
        {
          status: initialStatus,
        },
        successMessage,
        errorMessage,
      );
    };

    const dataColumns = [
      {
        key: 'creative_audit_status',
        isHideable: false,
        render: (text: string) => (
          // Popover used instead of tooltip because of row translation bug on hover
          <Popover
            content={
              text === 'AUDIT_PASSED' ? (
                <FormattedMessage
                  id="display.campaign.adtable.ad.auditpassed.msg"
                  defaultMessage="Audit successful"
                />
              ) : (
                <FormattedMessage
                  id="display.campaign.adtable.ad.noaudit.msg"
                  defaultMessage="You need to pass the Audit first"
                />
              )
            }
          >
            <McsIcon
              className={
                text === 'AUDIT_PASSED' ? 'font-success' : 'font-error'
              }
              type={text === 'AUDIT_PASSED' ? 'check' : 'close'}
            />
          </Popover>
        ),
        width: 10,
      },
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text: string, record: AdResource) => {
          const onChange = (checked: boolean) => {
            changeAdStatus(record, checked);
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
        key: 'image',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: AdResource) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              minWidth: '100px',
              minHeight: '100px',
            }}
          >
            <img
              src={`https://ads.mediarithmics.com/ads/screenshot?rid=${
                record.creative_id
              }`}
              alt={record.name}
              style={{ maxHeight: 100, maxWidth: 100 }}
            />
          </div>
        ),
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: AdResource) => {
          const editCreative = () => {
            history.push({
              pathname: `/v2/o/${organisationId}/creatives/display/edit/${
                record.creative_id
              }`,
              state: { from: `${location.pathname}${location.search}` },
            });
          };
          return (
            <Button onClick={editCreative}>
              <a>{text}</a>
            </Button>
          );
        },
      },
      {
        intlMessage: messages.impressions,
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
        sorter: (a: any, b: any) => sorter(a, b, 'impressions'),
      },
      {
        intlMessage: messages.clicks,
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
        sorter: (a: any, b: any) => sorter(a, b, 'clicks'),
      },
      {
        intlMessage: messages.cpm,
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: any, b: any) => sorter(a, b, 'cpm'),
      },
      {
        intlMessage: messages.ctr,
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) =>
          renderMetricData(parseFloat(text) / 100, '0.000 %'),
        sorter: (a: any, b: any) => sorter(a, b, 'ctr'),
      },
      {
        intlMessage: messages.cpc,
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: any, b: any) => sorter(a, b, 'cpc'),
      },
      {
        intlMessage: messages.impressions_cost,
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: any, b: any) => sorter(a, b, 'impressions_cost'),
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<AdResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.editCampaign,
            callback: this.editCampaign,
          },
          {
            intlMessage: messages.archiveCampaign,
            callback: this.archiveAd,
          },
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
        pagination={pagination}
        rowSelection={rowSelection}
      />
    );
  }
}

export default compose<JoinedProps, DisplayCampaignAdTableProps>(
  injectIntl,
  withRouter,
)(DisplayCampaignAdTable);
