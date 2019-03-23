import React from 'react';
import { StyleSheet, AlertIOS, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-ios-kit';
import { EventStorage } from '../store/Storage';
import moment from 'moment';
import _ from 'lodash';

class GroupedEvents extends React.Component {
    constructor(props) {
        super(props)
    }

    async handlerClearEvents() {
        this.props.events.map(async (e) => {
            await EventStorage.updateEvent(e, { clientName: null });
        });
        await this.props.onClearGroupedEvent();
    }

    handleViewEvents() {
        let eventsFormated = "\n";
        let lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");
        let events = _.sortBy(this.props.events, event => { return new moment(event.startDate); });
        events.map(e => {
            let currentDate = moment(e.startDate).format("YYYYMMDD")
            if(currentDate > lastDate) {
                eventsFormated += "\n===========\n";
                eventsFormated += moment(e.startDate).format("DD MMMM");
                eventsFormated += "\n===========\n\n\n\n";
            }
            eventsFormated += e.title + "\n";
            if(e.destination) {
                eventsFormated += e.destination + "\n";
            }
            eventsFormated += "\n\n";
            lastDate = currentDate;
        })
        AlertIOS.alert(
            "Liste des courses pour " + this.props.clientName,
            eventsFormated
        );
    }

    render() {
        const { events, clientName } = this.props
        return (
            <View style={styles.groupedEventContainer}>
                <Button 
                    style={styles.groupedEvent}
                    onPress={ this.handleViewEvents.bind(this) }
                    inline
                >
                    { clientName + ' (' + events.length + ')' }
                </Button>
                <Button 
                    style={styles.buttonClearEvents}
                    onPress={ this.handlerClearEvents.bind(this) }
                    inline
                >
                    Vider
                </Button>
            </View>
        );
    }
}

export default withNavigation(GroupedEvents);

const styles = StyleSheet.create({
    groupedEventContainer: {
        padding: 10,
        backgroundColor: '#fff',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    groupedEvent: {
        
    },
    buttonClearEvents: {

    }
})