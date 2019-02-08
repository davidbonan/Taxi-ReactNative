import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-ios-kit';
import moment from 'moment';
import localFR from '../constants/MomentI8n';
import RNCalendarEvents from 'react-native-calendar-events';
import ItemCalendar from '../components/ItemCalendar';
import Prompt from 'rn-prompt';

export default class GroupBonCoursesScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            events: this.props.navigation.getParam('events', []), 
            eventsSelected: [],
            groupedEvents: [],
            promptVisible: false
        }
    }

    getEventsWithoutEventsSelected(events, eventsSelected) {
        let arr = events.filter(e => {
            for(let i = 0; i < eventsSelected.length; i++ ) {
                let eventSelected = eventsSelected[i];
                if(eventSelected.id == e.id) {
                    return false;
                }
            }
        });
        return arr;
    }

    handleGroupEvents(clientName) {
        const _this = this;
        let groupedEvents = [
            ...this.groupedEvents,
            {
                clientName: clientName,
                events: this.state.eventsSelected
            }
        ]
        this.setState({ 
            events: _this.getEventsWithoutEventsSelected(_this.state.events, _this.state.eventSelected),
            promptVisible: false,
            groupedEvents: groupedEvents,
            eventsSelected: [],
         });
         console.warn(this.state.groupedEvents);
    }

    handleValidateGroupEvents() {
        this.setState({ promptVisible: true })
    }

    handleSelectItem(event) {
        const _this = this;
        let events = this.state.events.map(function(v) {
            if(v.id === event.id) {
                v.selected = !v.selected;
                if(v.selected) {
                    _this.setState({
                        eventsSelected: [
                            ..._this.state.eventsSelected, 
                            {
                                id: v.id, 
                                title: v.title, 
                                location: v.location,
                                startDate: v.startDate
                            }
                        ]
                    });
                } else {
                    let arrTmp = [..._this.state.eventsSelected];
                    arrTmp = arrTmp.filter(e => e.id != v.id);
                    _this.setState({
                        eventsSelected: arrTmp
                    });
                }
            }
            return v
        });
        this.setState({ events: events });
    }

    renderItem(event, i, events) {
        if(i == 0) {
            lastDate = moment(new Date()).subtract(5, 'years').format("YYYYMMDD");
        }
        const date = (
            <Text key={ event.id + '_01' } style={ styles.date } >
                { moment(event.startDate).format("DD MMMM") }
            </Text>
        )
        const itemCalendar = (
            <ItemCalendar key={ event.id } 
                title={event.title} 
                location={ event.location }
                startDate={ event.startDate }
                selected={event.selected}
                onPress={ this.handleSelectItem.bind(this, event) }
            />
        )

        if(moment(event.startDate).format("YYYYMMDD") > lastDate) {
            lastDate = moment(event.startDate).format("YYYYMMDD");
            return [date, itemCalendar];
        } else {
            return itemCalendar;
        }
    }

    render() {
        const _this = this;
        return (
            <View style={styles.container}>
                <ScrollView>
                    <View>
                        {
                            this.state.events.map((event, i, events) => _this.renderItem.call(_this, event, i, events))
                        }
                    </View>
                </ScrollView>
                <Prompt
                    title="Nom du client"
                    visible={ this.state.promptVisible }
                    onCancel={ () => this.setState({
                        promptVisible: false
                    }) }
                    onSubmit={ this.handleGroupEvents.bind(this)  }
                />
                {
                    this.state.eventsSelected.length > 0 ? (
                        <View style={styles.containerValidateButton}>
                            <Button 
                                onPress={ this.handleValidateGroupEvents.bind(this) }
                                inverted rounded
                            >
                                Grouper
                            </Button>
                        </View>
                    ) : (
                        <View></View>
                    )
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#efeff4',
    },
    date: {
        marginTop: 25,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 50,
        fontSize: 14,
        color: '#979797'
    },
    containerValidateButton: {
        margin: 10
    }
});
