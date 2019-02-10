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

    getEventsWithoutEventsSelected() {
        const _this = this;
        let arr = this.state.events.filter(e => {
            for(let i = 0; i < _this.state.eventsSelected.length; i++ ) {
                let eventSelected = _this.state.eventsSelected[i];
                if(eventSelected.id == e.id && eventSelected.startDate == e.startDate) {
                    return false;
                }
            }
            return true;
        });
        return arr;
    }

    handleGroupEvents(clientName) {
        let groupedEvents = [
            ...this.state.groupedEvents,
            {
                clientName: clientName,
                events: this.state.eventsSelected
            }
        ]
        
        this.setState({ 
            events: this.getEventsWithoutEventsSelected(),
            promptVisible: false,
            groupedEvents: groupedEvents,
            eventsSelected: [],
         });
    }

    handleValidateGroupEvents() {
        this.setState({ promptVisible: true })
    }

    handleSelectItem(event) {
        const _this = this;
        let isSelected = false;
        this.state.eventsSelected.map(es => {
            if(es.id === event.id && es.startDate == event.startDate) {
                isSelected = true
            }
        });
        
        if(isSelected) {
            // We remove the event
            let arrTmp = [...this.state.eventsSelected];
            arrTmp = arrTmp.filter(es => event.id != es.id && event.startDate != es.startDate);
            this.setState({
                eventsSelected: arrTmp
            });
        } else {
            // We add the event
            this.setState({
                eventsSelected: [
                    ..._this.state.eventsSelected, 
                    {
                        id: event.id, 
                        title: event.title, 
                        location: event.location,
                        startDate: event.startDate,
                        endDate: event.endDate,
                        isReccurent: event.isReccurent
                    }
                ]
            });
        }
    }

    renderItem(event, i, events) {
        let isSelected = false;
        this.state.eventsSelected.map(e => {
            if(event.id == e.id && event.startDate == e.startDate) {
                isSelected = true;
            }
        });
        if(i == 0) {
            lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");
        }
        const date = (
            <Text key={ event.id + '_01' } style={ styles.date } >
                { moment(event.startDate).format("DD MMMM YYYY") }
            </Text>
        )
        const itemCalendar = (
            <ItemCalendar key={ event.id + event.startDate } 
                title={event.title} 
                location={ event.location }
                startDate={ event.startDate }
                selected={ isSelected }
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
