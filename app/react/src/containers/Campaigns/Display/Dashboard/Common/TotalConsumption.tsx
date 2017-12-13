import * as React from 'react';

import { formatMetric } from '../../../../../utils/MetricHelper';
import ReportService from '../../../../../services/ReportService';
import Progress from '../../../../../components/Progress';
import log from '../../../../../utils/Logger';
import McsMoment from '../../../../../utils/McsMoment';

interface TotalConsumptionProps {
  id: string;
  organisationId: string;
  totalBudget: number;
  loading: boolean;
  objectType: string;
  from: McsMoment;
  to: McsMoment;
  formattedMessage: string;
}

interface TotalConsumptionState {
  isLoading: boolean;
  consumedBudget: number;
}

class TotalConsumption extends React.Component<TotalConsumptionProps, TotalConsumptionState> {

  constructor(props: TotalConsumptionProps) {
    super(props);
    this.state = {
      isLoading: false,
      consumedBudget: 0,
    };
  }

  componentDidMount() {
    const {
      id,
      organisationId,
      objectType,
      from,
      to,
    } = this.props;
    this.fetchAll(organisationId, id, objectType, from, to);
  }

  componentWillReceiveProps(nextProps: TotalConsumptionProps) {
    const {
      id,
      organisationId,
      objectType,
      from,
      to,
    } = this.props;

    const {
      id: nextId,
      organisationId: nextOrganisationId,
      objectType: nextObjectType,
      from: nextFrom,
      to: nextTo,
    } = nextProps;

    if (id !== nextId ||
      organisationId !== nextOrganisationId ||
      objectType !== nextObjectType ||
      !from.toMoment().isSame(nextFrom.toMoment()) ||
      !to.toMoment().isSame(nextTo.toMoment())
    ) {
      this.fetchAll(organisationId, id, objectType, from, to);
    }

  }

  fetchAll = (organisationId: string, id: string, objectType: string, from: McsMoment, to: McsMoment) => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {
      ReportService.getSingleDisplayDeliveryReport(organisationId, id, from, to, undefined, ['impressions_cost']).then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.consumedBudget = (
            response.data && response.data.report_view && response.data.report_view.rows && response.data.report_view.rows[0]) ?
            response.data.report_view.rows[0][1]
          : 0;
          nextState.isLoading = false;
          return nextState;
        });
      }).catch(err => {
        log.error(err);
        this.setState({ isLoading: false });
      });

    });
  }

  render() {
    const {
      consumedBudget,
      isLoading,
    } = this.state;

    const {
      totalBudget,
      loading,
      formattedMessage,
    } = this.props;

    const formatPercentage = (n: number) => {
      return formatMetric(n / 100, '0.00%');
    };

    const percent = (consumedBudget / totalBudget) * 100;
    const label = `${formattedMessage} ${formatPercentage(percent)}`;

    return (loading || isLoading) ? (
      <div className="mcs-progress-wrapper">
        <i className="mcs-table-cell-loading" />
      </div>
    ) : (
      <Progress percent={percent} label={label} />
    );
  }

}

export default TotalConsumption;
