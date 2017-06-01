import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { CampaignDashboardTabs } from '../../../components/CampaignDashboardTabs';
import { PieChart } from '../../../components/PieChart';
import { StackedAreaPlot } from '../../../components/StackedAreaPlot';

class CampaignEmailDashboard extends Component {

  render() {

    const {
      translations
    } = this.props;

    const pieChartOptions = {
      innerRadius: true,
      endAngle: (3 * Math.PI) / 2,
    };

    const pieChartDataset = [
      {
        key: 'fsdfs',
        value: 10,
        color: '#cecece'
      },
      {
        key: 'fsdfdsds',
        value: 90,
        color: '#ff9012'
      }
    ];

    const primaryData = [{ x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 2 },
    { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 5 }];
    const secondaryData = [{ x: 1, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 2 },
    { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 1 }];

    const stackedAreaPlotDatasets = [primaryData, secondaryData];

    const items = [
      {
        title: translations.CAMPAIGN_OVERVIEW,
        display: <PieChart options={pieChartOptions} dataset={pieChartDataset} />
      },
      {
        title: translations.CAMPAIGN_DELIVERY_ANALYSIS,
        display: <StackedAreaPlot options={pieChartOptions} datasets={stackedAreaPlotDatasets} />
      }
    ];

    return <CampaignDashboardTabs items={items} />;
  }

}

CampaignEmailDashboard.propTypes = {
  translations: PropTypes.object.isRequired  // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations
});

const mapDispatchToProps = {};

CampaignEmailDashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmailDashboard);

export default CampaignEmailDashboard;
