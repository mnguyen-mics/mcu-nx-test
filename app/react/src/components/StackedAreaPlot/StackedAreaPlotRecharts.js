import React, { Component, PropTypes } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Row, Col } from 'antd';

class StackedAreaPlotRechart extends Component {

  render() {

    const {
      dataset
    } = this.props;

    return (
      <div>
        <ResponsiveContainer width="100%" height={500} >
          <AreaChart width={730} height={250} data={dataset} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1" >
                <stop offset="5%" stopColor="#ff9012" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff9012" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEmail_hard_bounced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00a1df" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00a1df" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEmail_sent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3d627e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3d627e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEmail_soft_bounced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f12f2f" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f12f2f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ad68" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00ad68" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="days" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="clicks" stroke="#ff9012" fillOpacity={1} fill="url(#colorClicks)" />
            <Area type="monotone" dataKey="email_hard_bounced" stroke="#00a1df" fillOpacity={1} fill="url(#colorEmail_hard_bounced)" />
            <Area type="monotone" dataKey="email_sent" stroke="#3d627e" fillOpacity={1} fill="url(#colorEmail_sent)" />
            <Area type="monotone" dataKey="email_soft_bounced" stroke="#f12f2f" fillOpacity={1} fill="url(#colorEmail_soft_bounced)" />
            <Area type="monotone" dataKey="impressions" stroke="#00ad68" fillOpacity={1} fill="url(#colorImpressions)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

}

StackedAreaPlotRechart.propTypes = {
  dataset: PropTypes.arrayOf(
    PropTypes.shape({
      days: PropTypes.string,
      clicks: PropTypes.number,
      email_hard_bounced: PropTypes.number,
      email_soft_bounced: PropTypes.number,
      email_sent: PropTypes.number,
      impressions: PropTypes.number,
    })
  ).isRequired
};

export default StackedAreaPlotRechart;
