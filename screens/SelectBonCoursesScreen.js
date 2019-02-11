import React from 'react';
import { ScrollView, StyleSheet, View, Text, Button as ButtonNative } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Button } from 'react-native-ios-kit';
import moment from 'moment';
import localFR from '../constants/MomentI8n';
import { Calendar, Permissions } from 'expo';
import ItemCalendar from '../components/ItemCalendar';
import LoadingLabel from '../components/LoadingLabel';

moment.locale('fr', localFR);

let lastDate = moment(new Date()).subtract(5, 'years').format("YYYYMMDD");

export default class SelectBonCoursesScreenScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        return {
            headerTitle: 'Sélectionner les bons',
            headerRight: (
                <ButtonNative
                    onPress={() => state.params.handleReset()} 
                    title="Reset"
                />
            ),
        }
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

    componentDidMount() {
        this.props.navigation.setParams({ handleReset: () => this.resetState() });
    }

    componentDidUpdate() {
        if(this.props.navigation.getParam('refreshEvents', false)) {
            this.props.navigation.setParams({ refreshEvents: false});
            this.updateEventsList();
        }
    }

    resetState() {
        this.setState({
            query: "",
            isLoading: false,
            events: [],
            eventsSelected: []
        })
    }

    handleChangeQuery(query) {
        this.setState({ query: query });
        if( query.length > 2 ) {
            this.setState({ isLoading: true })
            this.updateEventsList();
        } else {
            this.setState({ isLoading: false, events: [] })
        }
    }

    async updateEventsList() {
        const { status } = await Permissions.askAsync(Permissions.CALENDAR);
        if (status !== 'granted') {
            AlertIOS.alert('Vous devez authoriser l\'accès au calendrier');
        }

        let startDate = moment(new Date()).subtract(120, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let endDate = moment(new Date()).add(120, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let _this = this;
        Calendar.getEventsAsync([Calendar.DEFAULT], startDate, endDate).then(fulfilled => {
            const regex = new RegExp(`${_this.state.query.trim()}`, 'i');
            events = fulfilled.filter(event => event.location.search(regex) >= 0)
            if(fulfilled.length > 0) {
                _this.setState({ isLoading: false, events: events});
            } else {
                _this.setState({ isLoading: false, events: [] });
            }
        })
    }

    handleValidate() {
        const {navigate} = this.props.navigation;
        navigate("GroupBonCourses", { events: this.state.eventsSelected });
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
                        isReccurent: event.recurrenceRule ? Number.isInteger(event.recurrenceRule.occurrence) : false,
                        isIterative: false
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
                <View style={styles.searchbarContainer}>
                    <SearchBar
                        placeholder="Rechercher les bons"
                        value={this.state.query}
                        onChangeText={ this.handleChangeQuery.bind(this) }
                        showLoading={this.state.isLoading}
                        round={true}
                        lightTheme={true}
                        containerStyle={styles.searchBar}
                        inputContainerStyle={styles.inputContainer}
                        cancelButtonTitle="Annuler"
                    />
                </View>
                <ScrollView>
                    <View>
                        {
                            !this.state.isLoading ? (
                                this.state.events.map((event, i, events) => _this.renderItem.call(_this, event, i, events))
                            ) : (
                                <LoadingLabel />
                            )
                        }
                    </View>
                </ScrollView>
                {
                    this.state.eventsSelected.length > 0 ? (
                        <View style={styles.containerValidateButton}>
                            <Button 
                                onPress={ this.handleValidate.bind(this) }
                                inverted rounded
                            >
                                Valider
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
        paddingTop: 0,
        backgroundColor: '#efeff4',
    },
    searchbarContainer: {
        paddingBottom: 0,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#D1D1D1'
    },
    searchBar: {
        backgroundColor: '#ffffff'
    },
    inputContainer: {
        backgroundColor: '#efeff4'
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
