import * as React from 'react';
import { Row, Col } from 'antd';
import AudienceFeatureListPage from '../../AudienceBuilder/List/AudienceFeatureListPage';

class AudienceBuilderTab extends React.Component<{}> {
  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <div>
        <Row>
          <Col>
            <AudienceFeatureListPage />
          </Col>
        </Row>
      </div>
    );
  }
}

export default AudienceBuilderTab;
