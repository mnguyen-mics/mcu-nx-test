import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { formatMetric } from '../../../../../utils/MetricHelper';
import ReportService from '../../../../../services/ReportService';
import Progress from '../../../../../components/Progress';

class TotalConsumption extends Component {

  constructor(props) {
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

  componentWillReceiveProps(nextProps) {
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

    if (id !== nextId || organisationId !== nextOrganisationId || objectType !== nextObjectType || !from.isSame(nextFrom) || !to.isSame(nextTo)) {
      this.fetchAll(organisationId, id, objectType, from, to);
    }

  }

  fetchAll = (organisationId, id, objectType, from, to) => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {

      ReportService.getSingleDisplayDeliveryReport(organisationId, id, from, to, '', ['impressions_cost']).then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          if (response.data && response.data.report_view && response.data.report_view.rows && response.data.report_view.rows[0]) {
            nextState.consumedBudget = response.data.report_view.rows[0][1];
          } else {
            nextState.consumedBudget = 0;
          }
          nextState.isLoading = false;
          return nextState;
        });
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

    const formatPercentage = (number) => {
      return formatMetric(number / 100, '0.00%');
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

TotalConsumption.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  organisationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  totalBudget: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  objectType: PropTypes.string.isRequired,
  from: PropTypes.shape().isRequired,
  to: PropTypes.shape().isRequired,
  formattedMessage: PropTypes.string.isRequired,
};

export default TotalConsumption;
