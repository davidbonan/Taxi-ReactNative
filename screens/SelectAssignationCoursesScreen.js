import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button, TextFieldRow, CheckboxRow } from 'react-native-ios-kit';
import RNCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';
import ItemCalendar from '../components/ItemCalendar';
import Icon from 'react-native-vector-icons/Ionicons';

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

    renderItem(event) {
        return (
            <ItemCalendar key={ event.id } 
                title={event.title} 
                location={ event.location }
                startDate={ event.startDate }
                selected={event.selected}
                onPress={ this.handlerSelectItem.bind(this, event) }
            />
        )
    }

    render() {
        const _this = this;
        return (
            <View  style={styles.container}>
                <ScrollView>
                    <View>
                        {
                            !this.state.isLoading ? (
                                this.state.events.map(event => _this.renderItem.call(_this, event))
                            ) : (
                                <Text>Chargement</Text>
                            )
                        }
                    </View>
                </ScrollView>
                <TouchableOpacity style={ styles.assignButton }>
                    <Icon
                        name='ios-checkmark'
                        size={50}
                        color='#fff'
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        backgroundColor: '#efeff4',
    },
    assignButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: '#27ae60',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    }
});
