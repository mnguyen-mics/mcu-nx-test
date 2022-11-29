import * as React from 'react';
import { Row, Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

interface TopicsProps {
  topics: object;
}

const renderLine = (key: string, subKey?: string, value?: string) => {
  return (
    <Row key={key + subKey + value}>
      <Col className='' span={8}>
        <span>{key}</span>
      </Col>
      <Col className='' span={8}>
        <span>{subKey}</span>
      </Col>
      <Col className='' span={8}>
        <span>{value}</span>
      </Col>
    </Row>
  );
};

const Topics = (props: TopicsProps) => {
  const { topics } = props;

  return topics && Object.keys(topics).length ? (
    <Row gutter={10} className='section table-line border-top'>
      <Col span={5} className='section-title'>
        <FormattedMessage {...messages.topics} />
      </Col>
      <Col span={19}>
        {topics
          ? Object.keys(topics).map(key => {
              const topicsObj: any = topics;
              if (typeof topicsObj[key] === 'object' && !Array.isArray(topicsObj[key])) {
                if (Object.keys(topicsObj[key]).length === 0) {
                  return renderLine(key);
                }
                return Object.keys(topicsObj[key]).map(subKey => {
                  return renderLine(key, subKey, topicsObj[key][subKey]);
                });
              } else if (Array.isArray(topicsObj[key])) {
                topicsObj[key].map((value: string) => {
                  return renderLine(key, undefined, value);
                });
              }
              return renderLine(key, undefined, topicsObj[key]);
            })
          : null}
      </Col>
    </Row>
  ) : null;
};

export default Topics;
