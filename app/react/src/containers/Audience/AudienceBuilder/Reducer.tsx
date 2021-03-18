import { Action } from 'redux-actions';
import { Payload } from '../../../utils/ReduxHelper';

const initialState = {
    formValues: {},
    message: ""
};

const reducer = (state = initialState, action: Action<Payload>) => {
    switch (action.type) {
        case "ADD_FEATURE":
            console.log("Received ADD_FEATURE action", state.formValues);
            return {
                ...state,
                formValues: action.payload
            };
        default:
            return state;
    }
};

export default reducer;