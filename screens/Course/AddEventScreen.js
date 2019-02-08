import React from 'react';
import { ScrollView, StyleSheet, DatePickerIOS, Alert, View } from 'react-native';
import AutocompleteClient from '../../components/AutocompleteClient';
import { Button, TableView, TextFieldRow, CheckboxRow } from 'react-native-ios-kit';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as AddCalendarEvent from 'react-native-add-calendar-event';
import moment from 'moment';
import Contacts from 'react-native-contacts';

export default class AddEventScreen extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      idClient: null,
      name: '',
      addressStart: '',
      addressEnd: '',
      datetimeStart: new Date(),
      typeRdv: '',
      bonToReceipt: false,
      bon: false,
      bonFor: '',
      makeStart: true,
      makeEnd: true,
      caisse: ''
    }
  }

  handleSelectClient (client) {
    if(!client)
        return;
    let address = "";
    if(client.postalAddresses && client.postalAddresses.length > 0) {
      address = client.postalAddresses[0].street + ' ' +
                client.postalAddresses[0].city + ' ' +
                client.postalAddresses[0].postCode
    }
    
    this.setState({
      idClient : client.recordID,
      name: client.familyName + ' ' + client.givenName,
      addressStart: address,
      caisse: client.company
    })
  }

  handleChangeText (text) {
    this.setState({
      idClient : null
    })
  }

  handleSubmit () {
    let title = {
      date: moment(this.state.datetimeStart).format("HH[h]mm"),
      name: this.state.name,
      adrStart: this.state.addressStart,
      adrEnd: this.state.addressEnd,
      type: this.state.typeRdv,
      caisse: this.state.caisse ? "caisse " + this.state.caisse : "",
      makeStart: this.state.makeStart ? "Aller"  : "",
      makeEnd: this.state.makeEnd ? "Retour"  : "",
      bonToReceipt: this.state.bonToReceipt ? "Bon à récupérer"  : ""
    }
    let concatTitle = title.date + 
                      " " + title.adrStart + 
                      " pour " + title.adrEnd + 
                      " " + title.type + 
                      " " + title.makeStart + 
                      " " + title.makeEnd + 
                      " " + title.name + 
                      " " + title.caisse +
                      " " + title.bonToReceipt;

    const eventConfig = {
      title: concatTitle,
      startDate: moment(this.state.datetimeStart).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      endDate: moment(this.state.datetimeStart).utc().add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      location: this.state.bon ? "Bon " + this.state.bonFor : "",
      notes: "Généré par MyTaxis {test}"
    };
    AddCalendarEvent.presentEventCreatingDialog(eventConfig)
    .then((eventInfo) => {
      // handle success - receives an object with `calendarItemIdentifier` and `eventIdentifier` keys, both of type string.
      // These are two different identifiers on iOS.
      // On Android, where they are both equal and represent the event id, also strings.
      // when { action: 'CANCELED' } is returned, the dialog was dismissed
      //console.warn(JSON.stringify(eventInfo));
      if(eventInfo.action != 'CANCELED') {
        const {navigate} = this.props.navigation;
        navigate("Home");
      }      
    })
    .catch((error) => {
      // handle error such as when user rejected permissions
      console.warn(error);
      Alert.alert("Problème lors de l'enregistrement", "Un problème est survenu lors de l'enregistrement de la course.")
    });
  }

  handleAddClient() {
    let _this = this;
    Contacts.openContactForm({company: 'Générale'}, (err, contact) => {
      if (err) throw err;
      _this.handleSelectClient(contact)
    })
  }

  render() {
    
    return (
      <KeyboardAwareScrollView style={{backgroundColor: '#efeff4'}}>
        <ScrollView style={styles.container}>
          <View style={styles.autocompleteContainer}>
            <AutocompleteClient handleSelectClient={ this.handleSelectClient.bind(this) }
                                handleChangeText={ this.handleChangeText.bind(this) }
            />
          </View>
          <View style={styles.newClientContainer}>
            <Button onPress={this.handleAddClient.bind(this)}>
              Nouveau client ?
            </Button>
          </View>
          <TableView header="Course" >
            <TextFieldRow
              placeholder="Nom/Prénom"
              value={this.state.name}
              onValueChange={text => this.setState({ name: text })}
            />
            <TextFieldRow
              placeholder="Départ"
              value={this.state.addressStart}
              onValueChange={text => this.setState({ addressStart: text })}
            />
            <TextFieldRow
              placeholder="Arrivée"
              value={this.state.addressEnd}
              onValueChange={text => this.setState({ addressEnd: text })}
            />
            <DatePickerIOS
              style={{backgroundColor: '#fff'}}
              date={this.state.datetimeStart}
              onDateChange={date => this.setState({ datetimeStart: date })}
            />
            <CheckboxRow
              selected={this.state.makeStart}
              onPress={() =>
                this.setState(state => ({
                  makeStart: !state.makeStart,
                }))
              }
              title='Aller'
            />
            <CheckboxRow
              selected={this.state.makeEnd}
              onPress={() =>
                this.setState(state => ({
                  makeEnd: !state.makeEnd,
                }))
              }
              title='Retour'
            />
            <TextFieldRow
              placeholder="Type de Rendez-vous"
              value={this.state.typeRdv}
              onValueChange={text => this.setState({ typeRdv: text })}
            />
            <TextFieldRow
              placeholder="Type de caisse"
              value={this.state.caisse}
              onValueChange={text => this.setState({ caisse: text })}
            />
            <CheckboxRow
              selected={this.state.bonToReceipt}
              onPress={() =>
                this.setState(state => ({
                  bonToReceipt: !state.bonToReceipt,
                }))
              }
              title='Ajouter "Bon à récupérer"'
            />
            <CheckboxRow
              selected={this.state.bon}
              onPress={() =>
                this.setState(state => ({
                  bon: !state.bon,
                }))
              }
              title='Ajouter "Bon"'
            />
            {
              this.state.bon ? (
                <TextFieldRow
                  placeholder="Bon pour"
                  value={this.state.bonFor}
                  onValueChange={text => this.setState({ bonFor: text })}
                />
              ) : (<View></View>)
            }
          
          </TableView>


          <View style={ styles.buttonContainer }>
            <Button rounded inverted onPress={this.handleSubmit.bind(this)}>
              Ajouter au calendrier
            </Button>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#efeff4',
  },
  autocompleteContainer: {
    flex: 1,
    zIndex: 1
  },
  buttonContainer: {
    margin: 10
  },
  newClientContainer: {
    margin: 10,
  }
});
