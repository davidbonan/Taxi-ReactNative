import React from 'react';
import { ScrollView, StyleSheet, View, Text, AlertIOS, Linking, FlatList, Button as ButtonNative, Alert } from 'react-native';
import { Button } from 'react-native-ios-kit';
import { SearchBar } from 'react-native-elements';
import { Calendar, Permissions } from 'expo';
import moment from 'moment';
import ItemCalendar from '../components/ItemCalendar';
import _ from 'lodash';
import update from 'immutability-helper';
import Locations from '../constants/Locations';
import { EventStorage } from '../store/Storage';
import { no_accent } from '../functions';

let lastDate = moment(new Date()).subtract(5, 'years').format("YYYYMMDD");

export default class GroupBonCoursesScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        return {
            headerTitle: 'Grouper les courses',
            headerRight: (
                <ButtonNative
                    onPress={() => state.params.clearStorage()} 
                    title="Vider"
                />
            ),
        }
    };

    constructor(props) {
        super(props);
        
        this.state = {
            query: "",
            events: [],
            toggle: false
        }
    }

    async componentDidMount() {
        this.props.navigation.setParams({ clearStorage: () => this.clearStorage() })
        let eventsInStorage = await EventStorage.getEvents();
        this.setState({
            events: this.matchEventWithDestination(eventsInStorage),
        })
    }

    clearStorage() {
        const _this = this;
        EventStorage.clear().then(() => {
            Alert.alert("Le stockage a bien été vidé.")
            _this.setState({
                events: []
            });
        });
    }

    matchEventWithDestination(events) {
        return events.map(e => {
            if(!e.destination) {
                for (let i = 0; i < Locations.length; i++) {
                    const location = Locations[i];
                    location.key.map(k => {
                        let regex = new RegExp(`${k}`, 'i');
                        if(e.title.search(regex) != -1) {
                            e.destination = location.value;
                        }
                    });
                }
            }
            return e;
        });
    }

    async groupEventByClientName(clientName) {
        const _this = this
        let selectedEvents = this.state.events.filter(e => e.isSelected == true);
        selectedEvents.map( async (e) => {
            // Suppression de la selection
            await _this.handleSelectItem.call(_this, e);
            // Ajout du nom du client à l'évenement
            await _this.handleGroupItemWithClientName.call(_this, e, clientName);
        })
    }

    handleValidateGroupEvents() {
        const _this = this;
        AlertIOS.prompt(
            'Nom du client',
            "Entrer le nom du client pour la préparation du mail.",
            [
                {
                  text: 'Annuler',
                  style: 'cancel'
                },
                {
                  text: 'OK',
                  onPress: (clientName) => _this.groupEventByClientName.call(_this, clientName) ,
                },
            ],
            'plain-text',
        );
    }

    getFormatedBody() {
        let body = "Bonjour Mme/Mr. xxxx, \nJe te fais la liste des bons. \n\n";
        _.map(
            _.groupBy(this.state.events.filter(e => _.isString(e.clientName) == true), "clientName"), 
            (events, clientName) => {
                
                body += "- " + clientName + "\n";
                events = _.sortBy(events, e => { return new moment(e.startDate); });
                let iterativeEvents = [];
                let eventsGroupedByDestination = {};
                for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    let destination = event.destination ? event.destination : "n/c";
                    if(event.isIterative) {
                        iterativeEvents.push(event);
                        continue;
                    }
                    if(!eventsGroupedByDestination[destination]) {
                        eventsGroupedByDestination[destination] = [];
                    }
                    eventsGroupedByDestination[destination].push(event);
                }
                // Parcour des tableaux d'évenements par destinations
                for (let destinationName in eventsGroupedByDestination) {
                    let previousDate = null;
                    // Parcour des évenements par destination
                    for (let j = 0; j < eventsGroupedByDestination[destinationName].length; j++) {
                        const event = eventsGroupedByDestination[destinationName][j];
                        let currentDate = moment(event.startDate);
                        // Si l'on change de jour
                        if(previousDate && previousDate.format('YYYYMM') < currentDate.format('YYYYMM')) {
                            body = body.slice(0, -1);
                            body += "/" + previousDate.format('MM/YY') + "\n";
                        }
                        body += currentDate.format('DD') + '-';
                        previousDate = currentDate;
                    }
                    body = body.slice(0, -1);
                    body += "/" + previousDate.format('MM/YY') + " pour " + destinationName + "\n";
                }

                // Ajout des demandes de bons itératifs
                for (let y = 0; y < iterativeEvents.length; y++) {
                    const iterativeEvent = iterativeEvents[y];
                    body += moment(iterativeEvent.startDate).format("DD/MM/YY") + " bon itératif 35 transports aller retour\n";  
                }

                body += "\n";
            }
        ); 

        body += "\n\nMerci beaucoup"
        return body;
    }

    async removeMentionBon() {
        const { status } = await Permissions.askAsync(Permissions.CALENDAR);
        if (status !== 'granted') {
            AlertIOS.alert('Vous devez authoriser l\'accès au calendrier');
            return;
        }

        this.state.events.filter(e => _.isString(e.clientName)).map(async event => {
            let newlocation = event.location.replace(new RegExp("bon", "ig"), '');
            let opt = {
                instanceStartDate: event.startDate, 
                futureEvents: false
            };
            let values = {
                startDate: event.startDate,
                endDate: event.endDate,
                location: newlocation
            }
            try {
                let resp = await Calendar.updateEventAsync(event.id, values, opt);
            } catch (error) {
                Alert.alert("Problème lors de la mise à jour de l'évenement", 
                "Un problème est survenu lors du retrait de la mention \"Bon\" dans l'évenement, veuillez le retirer manuellement")
            }
        });
        Alert.alert("Tous les bons ont été retiré", "Vider le stockage pour faire un nouveau envoi");
    }

    handleOpenClientMail() {
        const _this = this;
        let body = encodeURI(this.getFormatedBody());
        let subject = encodeURI("Demande de bons");
        Linking.openURL("mailto:?subject="+subject+"&body="+body)
        AlertIOS.alert(
            'Supprimer mention "Bon"',
            'Voulez-vous supprimer la mention "Bon" des courses sélectionnées ?',
            [
                {
                    text: 'Non',
                    style: 'cancel',
                },
                {
                    text: 'Oui',
                    onPress: () => {
                        _this.removeMentionBon();
                    }
                },
            ],
        );
    }

    handleChangeQuery(query) {
        this.setState({
            query: query
        });
    }

    async handleToggleItems() {
        let valuesToUpdate = {}
        let newValue = this.state.toggle;
        await this.state.events
            .filter(e => !_.isString(e.clientName) && (e.location.search(new RegExp(`${this.state.query}`, 'i')) > -1 || e.title.search(new RegExp(`${this.state.query}`, 'i')) > -1))
            .map(async e => {
                let index = this.getIndexOfEventInList(e.id, e.startDate);
                valuesToUpdate[index] = {isSelected: {$set: newValue}}
                await EventStorage.updateEvent(e, { isSelected: newValue });
            });
        this.setState({
            toggle: !newValue,
            events: update(this.state.events, valuesToUpdate)
        });
    }

    async handleGroupItemWithClientName(event, clientName) {
        let index = this.getIndexOfEventInList(event.id, event.startDate)
        this.setState({
            events: update(this.state.events, {[index]: {clientName: {$set: clientName}}}),
        });
        await EventStorage.updateEvent(event, { clientName: clientName });
    }

    async handleSelectItem(event) {
        let index = this.getIndexOfEventInList(event.id, event.startDate)
        this.setState({
            events: update(this.state.events, {[index]: {isSelected: {$set: !event.isSelected}}}),
        });
        await EventStorage.updateEvent(event, { isSelected: !event.isSelected });
    }

    async handleToggleIterativeCheckbox(event) {
        let index = this.getIndexOfEventInList(event.id, event.startDate)
        this.setState({
            events: update(this.state.events, {[index]: {isIterative: {$set: !event.isIterative}}}),
        });
        await EventStorage.updateEvent(event, { isIterative: !event.isIterative });
    }

    async handleChangeDestination(event, destination) {
        let index = this.getIndexOfEventInList(event.id, event.startDate)
        this.setState({
            events: update(this.state.events, {[index]: {destination: {$set: destination}}}),
        });
        await EventStorage.updateEvent(event, { destination: destination });
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
                enableSwitch={ true }
                isChecked={ event.isIterative }
                onCheck={ this.handleToggleIterativeCheckbox.bind(this, event) }
                enableDestination={ true }
                destination={ event.destination }
                onChangeDestination={(destination) => this.handleChangeDestination.call(this, event, destination) }
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

    _filter = (e) => {
        let title = no_accent(e.title);
        let location = no_accent(e.location);
        let query = no_accent(this.state.query);
        return !_.isString(e.clientName) && (location.search(new RegExp(`${query}`, 'i')) > -1 || title.search(new RegExp(`${query}`, 'i')) > -1);
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
                    {
                        _.map(
                            _.groupBy(this.state.events.filter(e => _.isString(e.clientName) == true), "clientName"), 
                            (events, clientName) => {
                                return <Text key={clientName} style={styles.groupedEvent} >{ clientName + ' (' + events.length + ')' }</Text>
                            }
                        )
                    }
                    <View style={styles.containerValidateButton}>
                        <Button 
                            onPress={ this.handleOpenClientMail.bind(this) }
                            inverted rounded
                        >
                        Préparer le mail
                        </Button>
                    </View> 
                    <Button 
                        style={ styles.toggleContainer }
                        onPress={ this.handleToggleItems.bind(this) }
                        inline
                    >
                        {this.state.toggle ? 'Tout sélectionner' : 'Tout désélectionner'}
                    </Button>
                    <FlatList
                        data={this.state.events
                            .filter(this._filter)}
                        renderItem={({item, index}) => _this.renderItem.call(_this, item, index)}
                        keyExtractor={_this._keyExtractor}
                    />
                </ScrollView>
                <View style={styles.containerValidateButton}>
                    <Button 
                        onPress={ this.handleValidateGroupEvents.bind(this) }
                        inverted rounded
                    >
                        Grouper les courses sélectionnées
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
    },
    groupedEvent: {
        padding: 10,
        backgroundColor: '#fff'
    },
    toggleContainer: {
        marginTop: 10,
        marginLeft: 10
    }
});