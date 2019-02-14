import React from 'react';
import { ScrollView, StyleSheet, View, Text, Alert, RefreshControl, AlertIOS } from 'react-native';
import moment from 'moment';
import ItemCalendar from '../components/ItemCalendar';
import DateCalendar from '../components/DateCalendar';
import TimeCalendar from '../components/TimeCalendar';
import { Calendar, SMS, Permissions } from 'expo';
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

    handleValidateButton() {
        const _this = this;
        AlertIOS.prompt(
            'Nom du chauffeur',
            "Entrer le nom du chauffeur qui s'ajoutera à l'évenement",
            [
                {
                  text: 'Annuler',
                  style: 'cancel'
                },
                {
                  text: 'OK',
                  onPress: (text) => this.handleAssignButton.call(_this, text) ,
                },
            ],
            'plain-text',
        );
    }

    async handleAssignButton(taxiName) {
        const _this = this;
        let body = "Courses attribuées : \n\n";
        let eventsSelected = this.state.events.filter(e => e.isSelected == true);
        eventsSelected.map(event => {
            body += event.title + "\n \n";
        });

        SMS.sendSMSAsync("06", body).then( ({ result }) => {
            if(result == 'sent') {
                AlertIOS.alert(
                    'Ajouter le nom du chauffeur',
                    "Voulez-vous ajouter le nom du chauffeur qui s'ajoutera à l'évenement",
                    [
                        {
                          text: 'Non',
                          style: 'cancel',
                          onPress: () => {
                            _this.refreshEvents();
                          }
                        },
                        {
                          text: 'Oui',
                          onPress: () => _this.updateEventsSelected.call(_this, taxiName, eventsSelected) ,
                        },
                    ]
                );
            } else {
                Alert.alert("Problème lors de l'envoi", "Un problème est survenu lors de l'envoi du SMS. Aucun SMS envoyés.")
            }
        });
    }

    async updateEventsSelected(taxiName, events) {
        for(let i = 0; i < events.length; i++) {
            let event = events[i];
            let opt = {
                instanceStartDate: event.startDate, 
                futureEvents: false
            };
            let values = {
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location + " " + taxiName
            }
            try {
                let resp = await Calendar.updateEventAsync(event.id, values, opt);
            } catch (error) {
                Alert.alert("Problème lors de la mise à jour de l'évenement", 
                "Un problème est survenu lors de l'ajout du nom du chauffeur dans l'évenement, veuillez l'ajouter manuellement")
            }
        }
        this.refreshEvents();
    }

    handleToggleItems() {
        let valuesToUpdate = {}
        let newValue = this.state.toggle;
        this.state.events
            .filter(e => e.location.search(new RegExp(`${this.state.query}`, 'i')) > -1)
            .map(e => {
                let index = this.getIndexOfEventInList(e.id, e.startDate);
                valuesToUpdate[index] = {isSelected: {$set: newValue}}
            });
        this.setState({
            toggle: !newValue,
            events: update(this.state.events, valuesToUpdate)
        });
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
            console.log(i)
            console.log(event.title)
            console.log(moment(event.startDate).format("HH") !== this.lastTime)
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
                        onPress={ this.handleValidateButton.bind(this) }
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
