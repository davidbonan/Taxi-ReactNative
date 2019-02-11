import React from 'react';
import { ScrollView, StyleSheet, View, Text, AlertIOS, Linking, Button as ButtonNative, Alert } from 'react-native';
import { Button } from 'react-native-ios-kit';
import { Calendar, Permissions } from 'expo';
import moment from 'moment';
import localFR from '../constants/MomentI8n';
import ItemCalendar from '../components/ItemCalendar';
import _ from 'lodash';
import update from 'immutability-helper';

let lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");

export default class GroupBonCoursesScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        return {
            headerTitle: 'Grouper les courses',
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
            events: this.props.navigation.getParam('events', []), 
            eventsSelected: [],
            groupedEvents: []
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleReset: () => this.resetState() })
    }

    resetState() {
        this.setState({
            events: this.props.navigation.getParam('events', []), 
            eventsSelected: [],
            groupedEvents: []
        })
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
        let clientExist = false;
        let groupedEvents = [...this.state.groupedEvents];
        for (let i = 0; i < groupedEvents.length; i++) {
            let groupedEvent = groupedEvents[i];
            if(groupedEvent.clientName == clientName) {
                clientExist = true;
                groupedEvent.events = groupedEvent.events.concat(this.state.eventsSelected)
            }
        }
        if(!clientExist) {
            groupedEvents.push({
                clientName: clientName,
                events: this.state.eventsSelected
            });
        }
        
        this.setState({ 
            events: this.getEventsWithoutEventsSelected(),
            groupedEvents: groupedEvents,
            eventsSelected: [],
         });
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
                  onPress: (text) => this.handleGroupEvents.call(_this, text) ,
                },
            ],
            'plain-text',
          );
    }

    handleOpenMail() {
        let body = encodeURI(this.getFormatedBody());
        let subject = encodeURI("Demande de bons")
        Linking.openURL('mailto:support@example.com?subject=' + subject + '&body=' + body);
        AlertIOS.alert(
            'Supprimer mention "Bon"',
            'Voulez-vous supprimer la mention "Bon" des courses sélectionnées ?',
            [
                {
                    text: 'Non',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Oui',
                    onPress: () => this.removeMentionBon(),
                },
            ],
        );
    }

    getFormatedBody() {
        let body = "Bonjour Mme/Mr. xxxx, \nJe te fais la liste des bons. \n\n";
        let eventsIterative = [];
        this.state.groupedEvents.map(groupedEvent => {
            let previousDate = null;
            let events = _.sortBy([...groupedEvent.events], function(e) { return new moment(e.startDate); });
            body += "- " + groupedEvent.clientName + "\n";

            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                
                if(event.isIterative) {
                    eventsIterative.push(groupedEvent.clientName);
                    continue;
                }

                let currentDate = moment(event.startDate);
                if(previousDate && previousDate.format('YYYYMM') < currentDate.format('YYYYMM')) {
                    body = body.slice(0, -1);
                    body += "/" + previousDate.format('MM/YYYY') + "\n";
                }
                body += currentDate.format('DD') + '-';
                previousDate = currentDate;
            }
            body = body.slice(0, -1);
            body += "/" + previousDate.format('MM/YYYY') + "\n\n";
        });

        for (let i = 0; i < eventsIterative.length; i++) {
            const clientName = eventsIterative[i];
            body += '- ' + clientName + "\n35 courses\n\n";
        }
        body += "\n\nMerci beaucoup"
        return body;
    }

    async removeMentionBon() {
        const { status } = await Permissions.askAsync(Permissions.CALENDAR);
        if (status !== 'granted') {
            AlertIOS.alert('Vous devez authoriser l\'accès au calendrier');
            return;
        }

        for(let i = 0; i < this.state.groupedEvents.length; i++) {
            const events = this.state.groupedEvents[i].events;
            for (let j = 0; j < events.length; j++) {
                const event = events[j];
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
            }
        }
        const {navigate} = this.props.navigation;
        navigate("SelectBonCourses", { refreshEvents: true });
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
                        isReccurent: event.isReccurent,
                        isIterative: event.isIterative
                    }
                ]
            });
        }
    }

    handleCheckItem(event, index, isSelected) {
        let eventsSelected = this.state.eventsSelected;
        if(isSelected) {
            eventsSelected = update(this.state.eventsSelected, {[index]: {isIterative: {$set: !event.isIterative}}})
        }
        this.setState({
            events: update(this.state.events, {[index]: {isIterative: {$set: !event.isIterative}}}),
            eventsSelected: eventsSelected
        });
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
                enableSwitch={ true }
                location={ event.location }
                startDate={ event.startDate }
                selected={ isSelected }
                isChecked={ event.isIterative }
                onPress={ this.handleSelectItem.bind(this, event) }
                onCheck={ this.handleCheckItem.bind(this, event, i, isSelected) }
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
                    {
                        this.state.groupedEvents.map((groupedEvent, i) => {
                            return <Text key={i} style={styles.groupedEvent} >{ groupedEvent.clientName + ' (' + groupedEvent.events.length + ')' }</Text>
                        })
                    }
                    {
                        this.state.groupedEvents.length > 0 ? (
                            <View style={styles.containerValidateButton}>
                                <Button 
                                    onPress={ this.handleOpenMail.bind(this) }
                                    inverted rounded
                                >
                                Préparer le mail
                                </Button>
                            </View>                            
                        ) : (
                            <View></View>
                        )
                    }
                    <View>
                        {
                            this.state.events.map((event, i, events) => _this.renderItem.call(_this, event, i, events))
                        }
                    </View>
                </ScrollView>
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
    },
    groupedEvent: {
        padding: 10,
        backgroundColor: '#fff'
    }
});
