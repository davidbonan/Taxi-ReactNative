import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SearchBar } from 'react-native-ios-kit';
import moment from 'moment';
import localFR from '../constants/MomentI8n';
import RNCalendarEvents from 'react-native-calendar-events';
import ItemCalendar from '../components/ItemCalendar';

moment.locale('fr', localFR);

let lastDate = moment(new Date()).subtract(30, 'years').format("YYYYMMDD");

export default class SelectBonCoursesScreenScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            query: "",
            isLoading: false,
            events: [],
            eventsSelected: []
        }
    }

    handlerChangeQuery(query) {
        this.setState({ query: query });
        if( query.length > 2 ) {
            this.setState({ isLoading: true })
            this.updateEventsList();
        } else {
            this.setState({ isLoading: false, events: [] })
        }
    }

    updateEventsList() {
        let startDate = moment(new Date()).subtract('30', 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let endDate = moment(new Date()).add(10, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let _this = this;
        RNCalendarEvents.authorizeEventStore().then(() => {
            RNCalendarEvents.fetchAllEvents(startDate, endDate).then(fulfilled => {
                const regex = new RegExp(`${_this.state.query}`, 'i');
                events = fulfilled.filter(event => event.location.search(regex) >= 0)
                if(fulfilled.length > 0) {
                    _this.setState({ isLoading: false, events: events});
                } else {
                    _this.setState({ isLoading: false, events: [] });
                }
            })
        })
    }

    handlerSelectItem(event) {
        const _this = this;
        let events = this.state.events.map(function(v) {
            if(v.id === event.id) {
                v.selected = !v.selected;
                if(v.selected) {
                    _this.setState({
                        eventsSelected: [..._this.state.eventsSelected, {id: v.id, title: v.title, location: v.location}]
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
            lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");
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
                onPress={ this.handlerSelectItem.bind(this, event) }
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
                <View style={styles.searchbarContainer}>
                    <SearchBar
                        placeholder="Rechercher les bons"
                        value={this.state.text}
                        onValueChange={ this.handlerChangeQuery.bind(this) }
                        withCancel
                        animated
                    />
                </View>
                <ScrollView>
                    <View>
                        {
                            !this.state.isLoading ? (
                                this.state.events.map((event, i, events) => _this.renderItem.call(_this, event, i, events))
                            ) : (
                                <Text>Chargement</Text>
                            )
                        }
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
        backgroundColor: '#efeff4',
    },
    searchbarContainer: {
        paddingTop: 25,
        paddingBottom: 0,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#D1D1D1'
    },
    date: {
        marginTop: 25,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 50,
        fontSize: 14,
        color: '#979797'
    },
});
