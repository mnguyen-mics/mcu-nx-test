import React, { Component, PropTypes } from 'react';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Sector, Text } from 'recharts';
import { Row, Col } from 'antd';

class PieChartRechart extends Component {

  render() {

    const data01 = [
      { name: 'Group A', value: 400 },
      { name: 'Group B', value: 300 },
      { name: 'Group C', value: 300 },
      { name: 'Group D', value: 200 }
    ];

    const data02 = [
      { name: 'A2', value: 300 },
      { name: 'A1', value: 100 },
      { name: 'B1', value: 100 },
      { name: 'B2', value: 80 },
      { name: 'B3', value: 40 },
      { name: 'B4', value: 30 },
      { name: 'B5', value: 50 },
      { name: 'C1', value: 100 },
      { name: 'C2', value: 200 },
      { name: 'D1', value: 150 },
      { name: 'D2', value: 50 }
    ];

    return (
      <div>
        <Row>
          <Col span={8}>
            <ResponsiveContainer width="100%" height={500} >
              <PieChart>
                <Tooltip cursor={false} />
                <Pie data={data02} dataKey="value" innerRadius={80} fill="#82ca9d" />
              </PieChart>
            </ResponsiveContainer>
          </Col>
          <Col span={16}>
            <Row>
              <Col span={12}>
                <ResponsiveContainer width="100%" height={250} >
                  <PieChart>
                    <Pie data={data02} dataKey="value" startAngle={0} endAngle={180} innerRadius={70} fill="#82ca9d" />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <ResponsiveContainer width="100%" height={250} >
                  <PieChart>
                    <Pie data={data02} dataKey="value" startAngle={0} endAngle={180} innerRadius={70} fill="#82ca9d" />
                    <Text textAnchor="middle" verticalAnchor="middle">
                      test
                    </Text>
                  </PieChart>
                </ResponsiveContainer>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <ResponsiveContainer width="100%" height={250} >
                  <PieChart>
                    <Pie data={data02} dataKey="value"startAngle={0} endAngle={180} innerRadius={70} fill="#82ca9d" />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <ResponsiveContainer width="100%" height={250} >
                  <PieChart>
                    <Pie data={data02} dataKey="value" startAngle={0} endAngle={180} innerRadius={70} fill="#82ca9d" />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }

}

PieChartRechart.propTypes = {
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

export default PieChartRechart;
