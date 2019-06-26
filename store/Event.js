import { AsyncStorage } from "react-native";
import _ from 'lodash';

const KEY_EVENTS_LIST = "KEY_EVENTS_LIST";

export async function addEvents(events) {
    let keys = [];
    let eventsFormated = [];
    events.map(e => {
        let key = e.id + e.startDate;
        let value = JSON.stringify(e);
        keys.push(key);
        eventsFormated.push([key, value]);
        if(e.title.indexOf("+") > -1) {
            let keyCopy = e.id + "_copy" + e.startDate;
            keys.push(keyCopy);
            eventsFormated.push([keyCopy, JSON.stringify({
                ...e,
                id: e.id + '_copy',
                isCopy: true
            })])
        }
    });
    await AsyncStorage.multiSet(eventsFormated);
    await pushMultipleKeyEvent(keys);
}

export async function addEvent(event) {
    let key = event.id + event.startDate;
    let Stringifiedvalues = JSON.stringify(values);
    await pushKeyEvent(key);
    await AsyncStorage.setItem(key, Stringifiedvalues);
}

export async function removeEvent({ id, startDate }) {
    let key = id + startDate;
    await AsyncStorage.removeItem(key);
    await popKeyEvent(key);
}

export async function getEvents() {
    let eventsIds = await AsyncStorage.getItem(KEY_EVENTS_LIST);
    if(eventsIds != null) {
        eventsIds = JSON.parse(eventsIds);
        let events = await AsyncStorage.multiGet(eventsIds);
        if(events != null) {
            eventsFormated = events.map(e => JSON.parse(e[1]));
        } else {
            eventsFormated = [];
        }
        return eventsFormated;
    } else {
        return [];
    }
}

export async function updateEvent({ id, startDate }, values) {
    let key = id + startDate;
    let Stringifiedvalues = JSON.stringify(values);
    await AsyncStorage.mergeItem(key, Stringifiedvalues);
}

export async function clear() {
    await AsyncStorage.clear();
}

export async function clearEventsGouped() {
    const events = await getEvents();
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if(_.isString(event.clientName) == true) {
            await removeEvent(event);
        }        
    }
}

async function pushKeyEvent(key) {
    let eventsIds = await getKeysEventsList();
    if(eventsIds != null) {
        for (let i = 0; i < eventsIds.length; i++) {
            const k = eventsIds[i];
            if(k == key) {
                return;
            }
        }
        eventsIds.push(key);
        await AsyncStorage.setItem(KEY_EVENTS_LIST, JSON.stringify(eventsIds));
    }
}

async function popKeyEvent(key) {
    let eventsIds = await getKeysEventsList();
    if(eventsIds != null) {
        let output = eventsIds.filter(k => k !== key);
        await AsyncStorage.setItem(KEY_EVENTS_LIST, JSON.stringify(output));
    }
}

async function pushMultipleKeyEvent(keys) {
    let eventsIds = await getKeysEventsList();
    if(eventsIds != null) {
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            let exist = false;
            for (let j = 0; j < eventsIds.length; j++) {
                const key = eventsIds[j];
                if(k == key) {
                    exist = true;
                    break;
                }
            }
            if(!exist) {
                eventsIds.push(k)
            }
        }
        await AsyncStorage.setItem(KEY_EVENTS_LIST, JSON.stringify(eventsIds));
    }
}

async function getKeysEventsList() {
    let eventsIds = await AsyncStorage.getItem(KEY_EVENTS_LIST);
    if(eventsIds != null) {
        return JSON.parse(eventsIds);
    } else {
        return [];
    }
}
