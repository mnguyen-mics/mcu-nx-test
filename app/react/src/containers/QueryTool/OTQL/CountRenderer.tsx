import { BorderlessTableOutlined } from '@ant-design/icons';
import { McsTabs } from '@mediarithmics-private/mcs-components-library';
import React from 'react';
import { chartType, renderQuickOptions } from './utils/ChartOptionsUtils';
import { Card } from 'antd';
import CountUp from 'react-countup';

interface CountRendererProps {
  count: number;
}

interface State {
  selectedChart: chartType;
  selectedQuickOptions: { [key: string]: string };
}

export class CountRenderer extends React.Component<CountRendererProps, State> {
  constructor(props: CountRendererProps) {
    super(props);
    this.state = {
      selectedChart: 'table',
      selectedQuickOptions: {},
    };
  }

  onSelectQuickOption(title: string, value: string) {
    const { selectedQuickOptions } = this.state;
    const newState = {
      selectedQuickOptions: {
        ...selectedQuickOptions,
        [title]: value,
      },
    };
    this.setState(newState);
  }

  render() {
    const { count } = this.props;
    const tabs = [
      {
        title: <BorderlessTableOutlined className='mcs-otqlChart_icons' />,
        key: 'pie',
        display: (
          <Card>
            <CountUp
              className={'mcs-otqlChart_resultMetrics'}
              start={0}
              end={count}
              separator=','
              decimal='.'
              duration={0.5}
            />
          </Card>
        ),
      },
    ];

    const onChangeQuickOption = this.onSelectQuickOption.bind(this);
    return (
      <McsTabs items={tabs} animated={false} className='mcs-otqlChart_tabs'>
        {renderQuickOptions(this.state.selectedChart, onChangeQuickOption)}
      </McsTabs>
    );
  }
}
