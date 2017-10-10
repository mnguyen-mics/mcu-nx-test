// import * as React from 'react';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import { Row, Col, Tag, Icon, Tooltip, Button, Input, AutoComplete } from 'antd';
// import { FormattedMessage } from 'react-intl';

// interface LabelListViewProps {
//   label?: string;
//   translations: {};
//   filters: {};
//   isInputVisible?: boolean;
//   onClickOnClose: () => void;
//   onInputSubmit?: () => void;
//   className?: string;
//   listItems: [{
//     id?: number,
//     name?: string,
//   }];
// }

// interface LabelListViewState {
//   inputValue: string;
//   inputVisible: boolean;
//   data: Array<{
//     value?: string;
//     text?: string;
//   }>;
// }

// let LabelListView = class LabelListView extends React.Component<LabelListViewProps, LabelListViewState> {

//   static defaultprops = {
//     onInputSubmit: () => {},
//     label: '',
//     isInputVisible: false,
//     className: '',
//   }

//   inputElement: {
//     focus?: Function;
//   };

//   constructor(props) {
//     super(props);

//     this.state = {
//       inputVisible: false,
//       inputValue: '',
//       data: this.props.listItems.map(item => {
//         const filter = {
//           value: item.id,
//           text: item.name,
//         };
//         return filter;
//       }),
//     };
//   }

//   buildFilterItems() {
//     const { filters, translations } = this.props;
//     const items = [];

//     Object.keys(filters).forEach(filter => {
//       return filters[filter].data.forEach(value => {
//         items.push({
//           id: value,
//           type: filter,
//           value: translations[value],
//           isClosable: filters[filter].closable,
//         });
//       });
//     });

//     return items;
//   }

//   handleInputBlur = () => {
//     this.setState({ inputVisible: false });
//   }

//   handleInputChange = (e) => {
//     this.setState({ inputValue: e.target.value });
//   }

//   handleInputConfirm = () => {
//     const { inputValue } = this.state;

//     if (inputValue !== '') {
//       this.props.onInputSubmit(inputValue);
//     }

//     this.setState({
//       inputVisible: false,
//       inputValue: '',
//     });
//   }

//   handleClick = (e) => {
//     this.inputElement.focus(e);
//   };

//   handleMenuClick = (e) => {
//     this.setState({ inputVisible: false });
//     this.props.onInputSubmit(e.key, true);
//   }

//   handleSearch = (value) => {
//     this.setState({ data: this.setData(value) });
//   }

//   setData = (value) => {
//     if (value) {
//       return this.state.data.filter(element => element.text.indexOf(value) > -1);
//     }

//     return this.props.listItems.map(item => {
//       const filter = {
//         value: item.id,
//         text: item.name,
//       };

//       return filter;
//     });
//   }

//   showInput = () => {
//     this.setState({ inputVisible: true }, () => { this.inputElement.focus(); });
//   }

//   render() {
//     const {
//       isInputVisible,
//       onClickOnClose,
//       label,
//       className,
//       listItems,
//       filters,
//     } = this.props;

//     const items: any = filters;

//     const selectedTags = listItems.map(item => {
//       const filter = {
//         value: item.id,
//         text: item.name,
//       };

//       return filter;
//     });

//     const { inputVisible } = this.state;

//     const onClickCloseTag = (tag) => onClickOnClose(tag);

//     const displayContent = (item) => (item.icon
//       ? <span><Icon type={item.icon} /> {item.name}</span>
//       : <span>{item.name}</span>
//     );

//     const generateTag = (item) => {
//       const isLongTag = item.name.length > 20;
//       const tagElem = (
//         <Tag
//           closable
//           key={item.id}
//           afterClose={() => { onClickCloseTag(item); }}
//         >{ displayContent(item) }
//         </Tag>
//       );

//       return isLongTag ? <Tooltip title={item.name}>{tagElem}</Tooltip> : tagElem;
//     };

//     return (
//       <Row className={className} >
//         { label && (
//           <Col className="mcs-label-list-view-label" span={24}>
//             <FormattedMessage id={label} />
//           </Col>)}
//         <Col span={24}>
//           {items.map((tag) => {
//             return generateTag(tag);
//           })}
//           {isInputVisible && inputVisible && (
//           <AutoComplete
//             dataSource={selectedTags}
//             onChange={this.handleSearch}
//             placeholder="website"
//             style={{ width: 200 }}
//           >
//             <Input size="small" />
//           </AutoComplete>
//         )}
//           {isInputVisible && !inputVisible && (
//             <Button
//               size="small"
//               type="dashed"
//               onClick={e => { this.showInput(); this.handleClick(e); }}
//             >Add New Tag
//             </Button>
//           )}
//         </Col>
//       </Row>
//     );
//   }
// }

// const mapStateToProps = state => ({
//   translations: state.translations,
// });

// LabelListView = connect(mapStateToProps)(LabelListView);
// /*
// * EXAMPLE :
//   <LabelListView
//     filters={filters}
//     label="Filtered by:"
//     onClickOnClose={returnFunc}
//     isInputVisible
//     onInputSubmit={returnFunc}
//   />
// */

// export default LabelListView;
