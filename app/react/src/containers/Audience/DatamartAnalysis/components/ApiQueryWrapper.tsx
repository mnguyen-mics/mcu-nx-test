import * as React from 'react';
import FormatData from './FormatData';

export interface ApiQueryWrapperProps {
    query: string;
    charts: any;
}

// const apiResponse = {
//     "status": "ok",
//     "data": {
//         "report_view": {
//             "items_per_page": 100,
//             "total_items": 3,
//             "columns_headers": [
//                 "device_name",
//                 "user_point_count",
//             ],
//             "rows": [
//                 [
//                     "Desktop",
//                     60
//                 ],
//                 [
//                     "Smartphone",
//                     10
//                 ],
//                 [
//                     "Tablet",
//                     20
//                 ],
//             ]
//         }
//     }
// };

const apiResponse2 = {
    "status": "ok",
    "data": {
        "report_view": {
            "items_per_page": 100,
            "total_items": 3,
            "columns_headers": [
                "date",
                "type",
                "active_users_count",
            ],
            "rows": [
                [
                    "15-09-2019",
                    "1 days",
                    60
                ],
                [
                    "22-09-2019",
                    "1 days",
                    55
                ],
                [
                    "29-09-2019",
                    "1 days",
                    65
                ],
                [
                    "06-10-2019",
                    "1 days",
                    70
                ],
                [
                    "15-09-2019",
                    "7 days",
                    105
                ],
                [
                    "22-09-2019",
                    "7 days",
                    130
                ],
                [
                    "29-09-2019",
                    "7 days",
                    110
                ],
                [
                    "06-10-2019",
                    "7 days",
                    135
                ],
                [
                    "15-09-2019",
                    "30 days",
                    250
                ],
                [
                    "22-09-2019",
                    "30 days",
                    300
                ],
                [
                    "29-09-2019",
                    "30 days",
                    275
                ],
                [
                    "06-10-2019",
                    "30 days",
                    240
                ]
            ]
        }
    }
};

class ApiQueryWrapper extends React.Component<ApiQueryWrapperProps, {}> {
    render() {
        const { charts } = this.props;
        return (<FormatData apiResponse={apiResponse2.data.report_view} charts={charts} />)
    }
}

export default ApiQueryWrapper;

