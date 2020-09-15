import * as React from 'react';
import { Card, Input, Select, Row, Col, Button } from "antd";
import * as Antd from 'antd';
class FunnelQueryBuilder extends React.Component {


  render() {
    const data = [
      {
        title: 'Ant Design Title 1',
      }
    ];

    const Option = Antd.Select.Option;

    return (<Card title="Steps">
      {data.map((toto, index) => {
        return (
          <div>
            <div className={"mcs-funnelQueryBuilder_step"}>
              <Row>
                <Col span={24}>
                  <span>{`${index + 1}.`}</span> <Input size="small" placeholder="Step name" className={"mcs-funnelQueryBuilder_stepName"} />
                </Col>
              </Row>
              <div className={"mcs-funnelQueryBuilder_step_dimensions"}>
                <Select
                  showSearch
                  showArrow={false}
                  style={{ width: 176 }}
                  placeholder="Dimension name"
                  className={"mcs-funnelQueryBuilder_select"}
                >
                  <Option key={"1"} value={"Dimension name 1"}>
                    {"Dimension name 1"}
                  </Option>
                  <Option key={"1"} value={"Dimension name 2"}>
                    {"Dimension name 2"}
                  </Option>
                </Select>
                <Select
                  showArrow={false}
                  style={{ width: 50 }}
                  className={"mcs-funnelQueryBuilder_select"}
                  defaultValue="is"
                >
                  <Option key={"1"} value={"is"}>
                    {"is"}
                  </Option>
                  <Option key={"1"} value={"is not"}>
                    {"is not"}
                  </Option>
                </Select>
                <Input size="small" style={{ width: 176 }} placeholder="Dimension value" className={"mcs-funnelQueryBuilder_dimensionValue"} />
                <Button type="primary" shape="circle" icon="cross" className={"mcs-funnelQueryBuilder_removeStepBtn"} />
              </div>
              <Select
                showArrow={false}
                style={{ width: 50, display: "block" }}
                defaultValue={"or"}
                className={"mcs-funnelQueryBuilder_select "}
                
              >
                <Option key={"1"} value={"or"}>
                  {"or"}
                </Option>
                <Option key={"1"} value={"and"}>
                  {"and"}
                </Option>
              </Select>
              <div className={"mcs-funnelQueryBuilder_step_dimensions"}>
                <Select
                  showSearch
                  showArrow={false}
                  style={{ width: 176 }}
                  placeholder="Dimension name"
                  className={"mcs-funnelQueryBuilder_select"}
                >
                  <Option key={"1"} value={"Dimension name 1"}>
                    {"Dimension name 1"}
                  </Option>
                  <Option key={"1"} value={"Dimension name 2"}>
                    {"Dimension name 2"}
                  </Option>
                </Select>
                <Select
                  showArrow={false}
                  style={{ width: 50 }}
                  defaultValue={"is"}
                  className={"mcs-funnelQueryBuilder_select"}
                >
                  <Option key={"1"} value={"is"}>
                    {"is"}
                  </Option>
                  <Option key={"1"} value={"or"}>
                    {"or"}
                  </Option>
                </Select>
                <Input size="small" style={{ width: 176 }} placeholder="Dimension value" className={"mcs-funnelQueryBuilder_dimensionValue"} />
                <Button type="primary" shape="circle" icon="cross" className={"mcs-funnelQueryBuilder_removeStepBtn"} />
              </div>
              <Button className={"mcs-funnelQueryBuilder_addDimensionBtn"}>Add dimension</Button>
            </div>
            <div className={"mcs-funnelQueryBuilder_step"}>
              <Row>
                <Col span={24}>
                  <span>{`${data.length + 1}.`}</span> <Button className={"mcs-funnelQueryBuilder_addDimensionBtn"}>Add step</Button>
                </Col>
              </Row>
            </div>
          </div>
        )
      })}
    </Card>)
  }
}

export default FunnelQueryBuilder;