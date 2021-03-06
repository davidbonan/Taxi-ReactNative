import React from 'react';
import { ScrollView, StyleSheet, View, Linking, Alert, RefreshControl, AlertIOS } from 'react-native';
import moment from 'moment';
import ItemCalendar from '../components/ItemCalendar';
import DateCalendar from '../components/DateCalendar';
import TimeCalendar from '../components/TimeCalendar';
import * as SMS from 'expo-sms';
import * as Permissions from 'expo-permissions';
import * as Calendar from 'expo-calendar';
import localFR from '../constants/MomentI8n';
import LoadingLabel from '../components/LoadingLabel';
import { Button } from 'react-native-ios-kit';
import { SearchBar } from 'react-native-elements';
import update from 'immutability-helper';
import { no_accent } from '../functions';

moment.locale('fr', localFR);

export default class SelectAssignationCoursesScreen extends React.Component {
    static navigationOptions = {
            header: null,
    };

    constructor(props) {
        super(props);
        
        this.state = {
            isLoading: true,
            refreshing: false,
            events: [],
            query: "",
            toggle: true
        }
    }

    componentDidMount() {
        this.refreshEvents();
    }

    onRefreshList() {
        this.setState({ query: "", refreshing: true });
        setTimeout(() => this.refreshEvents(), 500);
    }

    async refreshEvents() {
        const { status } = await Permissions.askAsync(Permissions.CALENDAR);
        if (status !== 'granted') {
            AlertIOS.alert('Vous devez authoriser l\'accès au calendrier');
        }

        let startDate = moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let endDate = moment(new Date().setHours(0, 0, 0)).utc().add(2, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

        let _this = this;
        Calendar.getEventsAsync([Calendar.DEFAULT], startDate, endDate).then(fulfilled => {
            if(fulfilled.length > 0) {
                _this.setState({ isLoading: false, events: fulfilled, refreshing: false });
            } else {
                _this.setState({ isLoading: false, events: [], refreshing: false });
            }
        })
    }

    constructBodyOfMessage() {
        let eventsSelected = this.state.events.filter(e => e.isSelected == true);
        let headerWithDate = eventsSelected.length > 0 ? " pour le " + moment(eventsSelected[0].startDate).format("DD/MM") : "";
        let body = "Courses attribuées"+ headerWithDate + " : \n\n";
        eventsSelected.map(event => {
            body += event.title + "\n\n\n";
        });
        return body;
    }

    async sendBySms() {
        let body = this.constructBodyOfMessage();
        SMS.sendSMSAsync(" ", body).then( ({ result }) => {
            if(result == 'sent') {
                Alert.alert("Les courses ont correctement été envoyées.")
                this.toggleItems(false);
            } else {
                Alert.alert("Problème lors de l'envoi", "Un problème est survenu lors de l'envoi du SMS. Aucun SMS envoyés.")
            }
        });
    }

    sendByWhatsapp() {
        const _this = this;
        let body = this.constructBodyOfMessage();
        let link = "whatsapp://send?text=" + encodeURIComponent(body);
        Linking.canOpenURL(link)
            .then(r => {
                Linking.openURL(link);
                AlertIOS.alert(
                    'Désélection des courses',
                    'Voulez-vous désélectionner les courses envoyées ?',
                    [
                        {
                            text: 'Non',
                            style: 'cancel',
                        },
                        {
                            text: 'Oui',
                            onPress: () => {
                                _this.toggleItems(false);
                            }
                        },
                    ],
                );
            })
            .catch(r => {
                Alert.alert("Impossible de trouver l'application Whatsapp")
            })
    }

    toggleItems(value) {
        let valuesToUpdate = {}
        this.state.events
            .filter(e => e.location.search(new RegExp(`${this.state.query}`, 'i')) > -1)
            .map(e => {
                let index = this.getIndexOfEventInList(e.id, e.startDate);
                valuesToUpdate[index] = {isSelected: {$set: value}}
            });
        this.setState({
            toggle: !value,
            events: update(this.state.events, valuesToUpdate)
        });
    }

    handleAssignButton() {
        AlertIOS.alert(
            'Méthode d\'envoi',
            'Voulez-vous envoyer les courses par SMS ou par Whatsapp ?',
            [
                {
                    text: 'Non',
                    style: 'cancel',
                },
                {
                    text: 'SMS',
                    onPress: () => {
                        this.sendBySms()
                    }
                },
                {
                    text: 'Whatsapp',
                    onPress: () => {
                        this.sendByWhatsapp()
                    }
                },
            ],
        );
    }

    handleToggleItems() {
        let value = this.state.toggle;
        this.toggleItems(value);
    }

    handleChangeQuery(query) {
        this.setState({
            query: query
        });
    }

    handleSelectItem(event) {
        let index = this.getIndexOfEventInList(event.id, event.startDate)
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

    renderItem(event, i, events) {
        let date = null;
        let time = null;

        if(i == 0) {
            this.lastDate = false;
            this.lastTime = false;
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

        if(moment(event.startDate).format("YYYYMMDD") !== this.lastDate) {
            this.lastDate = moment(event.startDate).format("YYYYMMDD");
            date = (
                <DateCalendar key={ event.id + event.startDate + '_date' } startDate={event.startDate} />
            )
        }

        if(moment(event.startDate).format("HH") !== this.lastTime) {
            this.lastTime = moment(event.startDate).format("HH");
            time = (
                <TimeCalendar  key={ event.id + event.startDate + '_time' } startDate={ event.startDate } />
            )
        }

        return [
            date,
            time,
            itemCalendar
        ];
    }

    _filter = (e) => {
        let location = no_accent(e.location);
        let query = no_accent(this.state.query);
        return location.search(new RegExp(`${query}`, 'i')) > -1
    }

    render() {
        const _this = this;
        return (
            <View  style={styles.container}>
                <View style={styles.searchbarContainer}>
                    <SearchBar
                        placeholder="Rechercher un chauffeur"
                        value={this.state.query}
                        onChangeText={ this.handleChangeQuery.bind(this) }
                        round={true}
                        lightTheme={true}
                        containerStyle={styles.searchBar}
                        inputContainerStyle={styles.inputContainer}
                        cancelButtonTitle="Annuler"
                        withCancel={false}
                    />
                </View>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                          refreshing={ this.state.refreshing }
                          onRefresh={ this.onRefreshList.bind(this) }
                        />  
                    }  
                >
                    <Button 
                        style={ styles.toggleContainer }
                        onPress={ this.handleToggleItems.bind(this) }
                        inline
                    >
                        {this.state.toggle ? 'Tout sélectionner' : 'Tout désélectionner'}
                    </Button>
                    {
                        !this.state.isLoading ? (
                            this.state.events.filter(this._filter)
                                            .map((event, i, events) => _this.renderItem.call(_this, event, i, events))
                        ) : (
                            <LoadingLabel />
                        )
                    }
                </ScrollView>
                <View style={styles.containerValidateButton}>
                    <Button 
                        onPress={ this.handleAssignButton.bind(this) }
                        inverted rounded
                    >
                        Assigner à un chauffeur
                    </Button>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //paddingTop: 30,
        backgroundColor: '#efeff4',
    },
    divider: {
        position: 'absolute',
        top: 32,
        right: 0,
        left: 90,
        height: 1,
        backgroundColor: 'red',
        opacity: 0.3
    },
    date: {
        marginTop: 25,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 10,
        fontSize: 14,
        color: '#979797'
    },
    time: {
        margin: 10,
        color: '#3498db'
    },
    containerValidateButton: {
        margin: 10
    },
    searchbarContainer: {
        paddingTop: 35,
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
    toggleContainer: {
        marginTop: 10,
        marginLeft: 10
    }
});
