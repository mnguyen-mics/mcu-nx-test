import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import messages from '../messages';
import { SEGMENT_QUERY_SETTINGS, AudienceReport } from '../constants';
import { updateSearch, parseSearch } from '../../../../../utils/LocationSearchHelper';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  EmptyChart,
  LoadingChart,
  McsDateRangePicker,
  BarChart,
} from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { Format } from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../IntlMessages';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';

interface AdditionDeletionProps {
  isFetching: boolean;
  dataSource: AudienceReport;
}

type Props = AdditionDeletionProps &
  InjectedThemeColorsProps &
  InjectedIntlProps &
  RouteComponentProps<{}>;

class AdditionDeletion extends React.Component<Props> {
  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, SEGMENT_QUERY_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      location: { search },
    } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });
    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;
    return (
      <McsDateRangePicker
        values={values}
        onChange={onChange}
        messages={mcsdatePickerMsg}
        className='mcs-datePicker_container'
      />
    );
  }

  renderStackedAreaCharts() {
    const {
      dataSource,
      isFetching,
      colors,
      intl: { formatMessage },
    } = this.props;

    const formattedDataSource = dataSource.length
      ? dataSource.map(item => {
          return {
            ...item,
            user_point_deletions:
              item && item.user_point_deletions ? -item.user_point_deletions : 0,
          };
        })
      : [];
    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        {
          key: 'user_point_additions',
          message: formatMessage(messages.userPointAddition),
        },
        {
          key: 'user_point_deletions',
          message: formatMessage(messages.userPointDeletion),
        },
      ],
      colors: [colors['mcs-success'], colors['mcs-error']],
      format: 'count' as Format,
    };
    return !isFetching ? (
      <BarChart {...optionsForChart} dataset={formattedDataSource} />
    ) : (
      <LoadingChart />
    );
  }

  render() {
    const { dataSource, isFetching, intl } = this.props;

    return (
      <div>
        <Row className='mcs-chart-header'>
          <Col span={12}>
            <div />
          </Col>
          <Col span={12}>
            <span className='mcs-card-button'>{this.renderDatePicker()}</span>
          </Col>
        </Row>
        {dataSource.length === 0 && !isFetching ? (
          <EmptyChart title={intl.formatMessage(messages.noAdditionDeletion)} icon='warning' />
        ) : (
          this.renderStackedAreaCharts()
        )}
      </div>
    );
  }
}

export default compose<Props, AdditionDeletionProps>(
  withRouter,
  injectIntl,
  injectThemeColors,
)(AdditionDeletion);
