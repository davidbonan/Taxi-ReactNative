import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, AlertIOS } from 'react-native';
import moment from 'moment';
import ItemCalendar from '../components/ItemCalendar';
import { Icon, Calendar, SMS, Permissions } from 'expo';
import localFR from '../constants/MomentI8n';
import LoadingLabel from '../components/LoadingLabel';
import { Button } from 'react-native-ios-kit';

moment.locale('fr', localFR);

let lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");
let lastTime = "00";

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

    componentDidMount() {
        this.refreshEvents();
    }

    onRefreshList() {
        this.setState({refreshing: true, eventsSelected: []});
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
        this.state.eventsSelected.map(event => {
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
                            _this.setState({ eventsSelected: [] });
                            _this.refreshEvents();
                          }
                        },
                        {
                          text: 'Oui',
                          onPress: () => _this.updateEventsSelected.call(_this, taxiName) ,
                        },
                    ]
                );
            } else {
                Alert.alert("Problème lors de l'envoi", "Un problème est survenu lors de l'envoi du SMS. Aucun SMS envoyés.")
            }
        });
    }

    async updateEventsSelected(taxiName) {
        for(let i = 0; i < this.state.eventsSelected.length; i++) {
            let event = this.state.eventsSelected[i];
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
        this.setState({ eventsSelected: [] });
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
                        isReccurent: event.recurrenceRule ? Number.isInteger(event.recurrenceRule.occurrence) : false
                    }
                ]
            });
        }
    }

    renderItem(event, i, events) {
        let isSelected = false;
        let date = null;
        let time = null;
        this.state.eventsSelected.map(e => {
            if(event.id == e.id && event.startDate == e.startDate) {
                isSelected = true;
            }
        });
        if(i == 0) {
            lastDate = moment(new Date()).subtract(7, 'years').format("YYYYMMDD");
            lastTime = "00";
        }
        
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
            date = (
                <View key={ event.id + '_01' }>
                    <Text style={ styles.date } >
                        { moment(event.startDate).format("DD MMMM") }
                    </Text>
                    <View style={styles.divider}></View>
                </View>
            )
        }

        if(moment(event.startDate).format("HH") > lastTime || moment(event.startDate).format("HH") < lastTime ) {
            lastTime = moment(event.startDate).format("HH");
            time = (
                <Text key={ event.id + '_01_' } style={ styles.time } >
                    { moment(event.startDate).format("HH:00") }
                </Text>
            )
        }

        return [
            date,
            time,
            itemCalendar
        ];
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
                {
                    this.state.eventsSelected.length > 0 ? (
                        <View style={styles.containerValidateButton}>
                            <Button 
                                onPress={ this.handleValidateButton.bind(this) }
                                inverted rounded
                            >
                                Assigner à un chauffeur
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
        paddingTop: 30,
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
    }
});
