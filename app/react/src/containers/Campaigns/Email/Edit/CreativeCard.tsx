// import * as React from 'react';
// import { Spin } from 'antd';
// import McsIcons from '../../../../components/McsIcons';
// import CreativeService from '../../../../services/CreativeService';
// import { DisplayAdResource } from '../../../../models/creative/CreativeResource';

// interface SubProps {
//   key: string;
//   render: (obj: object, item: DisplayAdResource) => string;
// }

// interface CreativeCardProps {
//   item: DisplayAdResource;
//   title: SubProps;
//   subtitles?: SubProps[];
//   footer: {
//     key: string;
//     keys: string[];
//     render: (obj: object, item: DisplayAdResource) => string;
//   };
// }

// interface CreativeCardState {
//   loading: boolean;
//   error: boolean;
//   success: boolean;
// }

// class CreativeCard extends React.Component<CreativeCardProps, CreativeCardState> {

//   static defaultProps: Partial<CreativeCardProps> = {
//     subtitles: undefined,
//   };

//   constructor(props: CreativeCardProps) {
//     super(props);
//     this.state = {
//       loading: false,
//       error: false,
//       success: false,
//     };
//   }

//   componentDidMount() {
//     const {
//       item,
//     } = this.props;
//     this.fetchData(item.id);
//   }

//   componentWillReceiveProps(nextProps: CreativeCardProps) {
//     const {
//       item,
//     } = this.props;

//     const {
//       item: nextItem,
//     } = nextProps;

//     if (item.id !== nextItem.id) {
//       this.fetchData(nextItem.id);
//     }

//   }

//   fetchData = (id: string) => {
//     CreativeService.getCreativeScreenshotStatus(id)
//     .then(response => {
//       if (response && response.data && response.data.status) {
//         if (response.data.status === 'SUCCEEDED') {
//           this.setState(prevState => {
//             const nextState = {
//               ...prevState,
//             };
//             nextState.success = true;
//             return nextState;
//           });
//         } else if (response.data.status === 'PENDING' || response.data.status === 'PROCESSING') {
//           this.setState(prevState => {
//             const nextState = {
//               ...prevState,
//             };
//             nextState.loading = true;
//             return nextState;
//           });
//         } else if (response.data.status === 'FAILED' || response.data.status === 'NOT_TAKEN') {
//           this.setState(prevState => {
//             const nextState = {
//               ...prevState,
//             };
//             nextState.error = true;
//             return nextState;
//           });
//         }
//       }

//     }).catch(() => {
//       this.setState(prevState => {
//         const nextState = {
//           ...prevState,
//         };
//         nextState.error = true;
//         return nextState;
//       });
//     });
//   }

//   renderSuccessScreenshot = (record: DisplayAdResource) => {
//     return (
//       <div>
//         <div
//           className="background-image"
//           style={{ backgroundImage: `url('https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}')` }}
//         />
//         <div className="image-container">
//           <div className="helper" />
//           <img className="image" src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} alt={record.name} />
//         </div>
//       </div>
//     );
//   }

//   renderLoadingScreenshot = () => {
//     return (
//       <div className="text-center" style={{ lineHeight: '200px', textAlign: 'center', backgroundColor: '#bdbdbd' }}>
//         <Spin />
//       </div>
//     );
//   }

//   renderErrorScreenshot = () => {
//     return (
//       <div className="text-center" style={{ lineHeight: '210px', textAlign: 'center', backgroundColor: '#bdbdbd' }}>
//         <McsIcons className="icon-3x" type="close-big" />
//       </div>
//     );
//   }

//   render() {
//     const {
//       item,
//       title,
//       subtitles,
//       footer,
//     } = this.props;

//     const {
//       error,
//       loading,
//       success,
//     } = this.state;

//     const dataToRender = (data: SubProps) => (data.key
//       ? item[data.key]
//       : Object.keys(item).reduce((acc, key) => (
//         data.keys.includes(key) ? { ...acc, [key]: item[key] } : acc), {},
//       )
//     );

//     return (
//       <div className="mcs-creative-card">
//         <div className="creative-cover">
//           {error ? this.renderErrorScreenshot : null}
//           {loading ? this.renderLoadingScreenshot() : null}
//           {success ? this.renderSuccessScreenshot(item) : null}
//         </div>
//         <div className="creative-details">
//           <div className="title">
//             {title.render(dataToRender(title), item) && title.render(dataToRender(title), item).props.children !== null ?
//               title.render(dataToRender(title), item) :
//               'No title'}
//           </div>
//           { subtitles && subtitles.length && subtitles.map(subtitle => (
//             <div key={subtitle.key} className="subtitle">
//               <span>{subtitle.render(item[subtitle.key], item)}</span>
//             </div>
//             ))
//           }
//         </div>
//         <div className="creative-footer">
//           {footer.render(dataToRender(footer), item)}
//         </div>
//       </div>
//     );
//   }
// }

// export default CreativeCard;
