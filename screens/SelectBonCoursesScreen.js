import React from 'react';
import { ScrollView, FlatList, StyleSheet, View, Text, RefreshControl, Button as ButtonNative } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Button } from 'react-native-ios-kit';
import moment from 'moment';
import localFR from '../constants/MomentI8n';
import { Calendar, Permissions } from 'expo';
import ItemCalendar from '../components/ItemCalendar';
import update from 'immutability-helper';
import { EventStorage } from '../store/Storage';

moment.locale('fr', localFR);

let lastDate = moment(new Date()).subtract(5, 'years').format("YYYYMMDD");

export default class SelectBonCoursesScreenScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        return {
            headerTitle: 'Bons',
            headerRight: (
                <ButtonNative
                    onPress={() => state.params.handleReset()} 
                    title="Actualiser"
                />
            ),
            headerLeft: (
                <ButtonNative
                    onPress={() => state.params.toggleAll()} 
                    title={navigation.getParam('headerLeftTitle', {title: ''}).title}
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
            refreshing: false,
            toggle: false,
        }

        this.viewabilityConfig = {
            waitForInteraction: true,
            viewAreaCoveragePercentThreshold: 95
        }
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        })
        this.refreshEvents();
        this.props.navigation.setParams({ 
            handleReset: () => this.resetState(), 
            toggleAll: () => this.toggleAll(),
            headerLeftTitle: {title: !this.state.toggle ? 'Tout sélectionner' : 'Tout désélectionner'}
        });
    }

    resetState() {
        this.setState({ isLoading: true })
        this.refreshEvents();
    }

    toggleAll() {
        let valuesToUpdate = {}
        let newValue = !this.state.toggle;
        this.state.events
            .filter(e => e.location.search(new RegExp(`${this.state.query}`, 'i')) > -1 || e.title.search(new RegExp(`${this.state.query}`, 'i')) > -1)
            .map(e => {
                let index = this.getIndexOfEventInList(e.id, e.startDate);
                valuesToUpdate[index] = {isSelected: {$set: newValue}}
            });
        this.setState({
            toggle: newValue,
            events: update(this.state.events, valuesToUpdate)
        });
        this.props.navigation.setParams({
            headerLeftTitle: {title: !newValue ? 'Tout sélectionner' : 'Tout désélectionner'}
        })
    }

    onRefreshList() {
        this.setState({refreshing: true});
        setTimeout(() => this.refreshEvents(), 500);
    }

    handleChangeQuery(query) {
        this.setState({
            query: query
        });
    }

    async refreshEvents() {
        const { status } = await Permissions.askAsync(Permissions.CALENDAR);
        if (status !== 'granted') {
            AlertIOS.alert('Vous devez authoriser l\'accès au calendrier');
        }

        let startDate = moment(new Date()).subtract(30, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let endDate = moment(new Date()).add(30, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let _this = this;
        Calendar.getEventsAsync([Calendar.DEFAULT], startDate, endDate).then(fulfilled => {
            _this.setState({ isLoading: false, events: fulfilled, refreshing: false});
        })
    }

    async handleValidate() {
        let eventsSelected = this.state.events.filter(e => e.isSelected == true);
        await EventStorage.addEvents(eventsSelected);
        this.unselectAllEvents();
        const {navigate} = this.props.navigation;
        navigate("GroupBonCourses");
    }

    unselectAllEvents() {
        let events = this.state.events.map(e => {
            e.isSelected = false;
            return e;
        });
        this.setState({ events: events });
    }

    handleSelectItem(event) {
        let index = this.getIndexOfEventInList(event.id, event.startDate);
        this.setState({
            events: update(this.state.events, {[index]: {isSelected: {$set: !event.isSelected}}}),
        });
    }

    getIndexOfEventInList(id, startDate) {
        for (let i = 0; i < this.state.events.length; i++) {
            const event = this.state.events[i];
            if(event.id == id && event.startDate == startDate) {
                return i;
            }
        }
    }

    renderItem(event, i) {
        let date = null;

        if(i == 0) {
            lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");
        }
        
        const itemCalendar = (
            <ItemCalendar key={ event.id + event.startDate } 
                title={event.title} 
                location={ event.location }
                startDate={ event.startDate }
                selected={ event.isSelected }
                onPress={ this.handleSelectItem.bind(this, event) }
            />
        )

        if(moment(event.startDate).format("YYYYMMDD") > lastDate) {
            lastDate = moment(event.startDate).format("YYYYMMDD");
            date = (
                <View key={ event.id + event.startDate + '_date' }>
                    <Text style={ styles.date } >
                        { moment(event.startDate).format("DD MMMM") }
                    </Text>
                    <View style={styles.divider}></View>
                </View>
            )
        }

        return [
            date,
            itemCalendar
        ];
    }

    _keyExtractor = (item, index) => item.id + item.startDate + index;

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
                <FlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={ this.state.refreshing }
                            onRefresh={ this.onRefreshList.bind(this) }
                        />  
                    }  
                    data={this.state.events
                        .filter(e => e.location.search(new RegExp(`${this.state.query}`, 'i')) > -1 || e.title.search(new RegExp(`${this.state.query}`, 'i')) > -1)}
                    renderItem={({item, index}) => _this.renderItem.call(_this, item, index)}
                    keyExtractor={_this._keyExtractor}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={40}
                />
                <View style={styles.containerValidateButton}>
                    <Button 
                        onPress={ this.handleValidate.bind(this) }
                        inverted rounded
                    >
                        Enregistrer et/ou voir les courses
                    </Button>
                </View>
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
