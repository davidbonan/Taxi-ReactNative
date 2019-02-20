import update from 'immutability-helper';
import { EventStorage } from '../../store/Storage';


const LOAD = "groupedCourses/LOAD";
const ADD = "groupedCourses/ADD";
const CLEAR = "groupedCourses/CLEAR";
const UPDATE = "groupedCourses/UPDATE";

const initialState = { events: [] };

export default function reducer(state = initialState, action = {}) {
    const { payload, type } = action;

    switch (type) {

        case LOAD:
            console.log('P3')
            return { ...state, events: payload.events };
        
        case ADD:
            return {...state, events: [...state.events, payload.events]}

        case CLEAR:
            return { ...state, events: [] }

        case UPDATE:
            return { ...state, events: [] }

        default:
            return state;
    }
};

export function loadEvents() {
    console.log('P1')
    return (dispatch) => {
        EventStorage.getEvents().then(events => {
            console.log('P2')
            dispatch({
                type: LOAD,
                payload: { events: events }
            })
        });
    }
}

export function addEvents(events) {
    return true;
}

export function updateEvent({ id, startDate}, values) {
    return true;
}

export function clearEvents() {
    return true;
}