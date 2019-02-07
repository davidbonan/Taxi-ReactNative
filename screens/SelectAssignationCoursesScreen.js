import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Button, TextFieldRow, CheckboxRow } from 'react-native-ios-kit';
import RNCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';
import ItemCalendar from '../components/ItemCalendar';

export default class SelectAssignationCoursesScreen extends React.Component {
    static navigationOptions = {
            header: null,
    };

    constructor(props) {
        super(props);
        
        this.state = {
            isLoading: true,
            events: [],
            eventsSelected: []
        }
    }

    componentDidMount() {
        let startDate = moment(new Date()).subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let endDate = moment(new Date()).add(7, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let _this = this;
        RNCalendarEvents.fetchAllEvents(startDate, endDate).then(fulfilled => {
            console.log(fulfilled);
            if(fulfilled.length > 0) {
                _this.setState({ isLoading: false, events: fulfilled });
            }
        })
    }

    handlerSelectItem(event) {
        let events = this.state.events.map(function(v) {
            if(v.id === event.id) {
                v.selected = !v.selected
            }
            return v
        });
        this.setState({ events: events });
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <View>
                    {
                        !this.state.isLoading ? (
                            this.state.events.map(event => (
                                <ItemCalendar key={ event.id } 
                                            title={event.title} 
                                            location={ event.location }
                                            startDate={ event.startDate }
                                            selected={event.selected}
                                            onPress={ this.handlerSelectItem.bind(this, event) }
                                />
                            ))
                        ) : (
                            <Text>Chargement</Text>
                        )
                    }
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        backgroundColor: '#efeff4',
    },
});
