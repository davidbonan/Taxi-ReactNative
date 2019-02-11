import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, AlertIOS } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';
import ItemCalendar from '../components/ItemCalendar';
import Icon from 'react-native-vector-icons/Ionicons';
import localFR from '../constants/MomentI8n';
import SendSMS from 'react-native-sms';
import LoadingLabel from '../components/LoadingLabel';

moment.locale('fr', localFR);

let lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");

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
            eventsSelected: []
        }
    }

    componentWillMount() {
        this.refreshEvents();
    }

    onRefreshList() {
        this.setState({refreshing: true, eventsSelected: []});
        setTimeout(() => this.refreshEvents(), 500);
    }

    refreshEvents() {
        let startDate = moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let endDate = moment(new Date().setHours(0, 0, 0)).utc().add(2, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

        let _this = this;
        RNCalendarEvents.authorizeEventStore().then(() => {
            RNCalendarEvents.fetchAllEvents(startDate, endDate).then(fulfilled => {
                if(fulfilled.length > 0) {
                    _this.setState({ isLoading: false, events: fulfilled, refreshing: false });
                } else {
                    _this.setState({ isLoading: false, events: [], refreshing: false });
                }
            })
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
        this.state.eventsSelected.map(event => {
            body += event.title + "\n \n";
        });
        SendSMS.send({
            body: body,
            recipients: ['0760558799'],
            successTypes: ['sent', 'queue']
        }, (completed, cancelled, error) => {
            if(completed) {
                _this.updateEventsSelected(taxiName);
            } else if(error) {
                Alert.alert("Problème lors de l'envoi", "Un problème est survenu lors de l'envoi du SMS. Aucun SMS envoyés.")
            }
        });
    }

    async updateEventsSelected(taxiName) {
        for(let i = 0; i < this.state.eventsSelected.length; i++) {
            let event = this.state.eventsSelected[i];
            let opt = {
                exceptionDate: event.startDate, 
                futureEvents: false
            };
            let values = {
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location + " " + taxiName
            }
            try {
                if(event.isReccurent) {
                    let msg = await RNCalendarEvents.removeEvent(event.id, opt);
                } else {
                    values = {
                        ...values,
                        id: event.id
                    }
                }
                let resp = await RNCalendarEvents.saveEvent(event.title, values, opt);
            } catch (error) {
                Alert.alert("Problème lors de la mise à jour de l'évenement", 
                "Un problème est survenu lors de l'ajout du nom du chauffeur dans l'évenement, veuillez l'ajouter manuellement")
            }
        }
        this.refreshEvents();
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
                        isReccurent: Number.isInteger(event.recurrenceRule.occurrence)
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
                { moment(event.startDate).format("DD MMMM") }
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
            <View  style={styles.container}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                          refreshing={ this.state.refreshing }
                          onRefresh={ this.onRefreshList.bind(this) }
                        />  
                    }  
                >
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
                <TouchableOpacity style={ styles.assignButton } onPress={ this.handleValidateButton.bind(this) }>
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
    date: {
        marginTop: 25,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 50,
        fontSize: 14,
        color: '#979797'
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
