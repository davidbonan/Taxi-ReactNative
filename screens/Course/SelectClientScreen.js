import React from 'react';
import { ScrollView, StyleSheet, DatePickerIOS, Text, View } from 'react-native';
import AutocompleteClient from '../../components/AutocompleteClient';
import { Button, TableView, TextFieldRow, CheckboxRow } from 'react-native-ios-kit';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as AddCalendarEvent from 'react-native-add-calendar-event';

export default class SelectClientScreen extends React.Component {

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
      bonFor: ''

    }
  }

  handleSelectClient (client) {
    this.setState({
      idClient : client.id,
      name: client.name,
      addressStart: client.address
    })
  }

  handleChangeText (text) {
    this.setState({
      idClient : null
    })
  }

  handleSubmit () {
    const eventConfig = {
      title: this.state.name,
      // and other options
    };
    AddCalendarEvent.presentEventCreatingDialog(eventConfig)
    .then((eventInfo) => {
      // handle success - receives an object with `calendarItemIdentifier` and `eventIdentifier` keys, both of type string.
      // These are two different identifiers on iOS.
      // On Android, where they are both equal and represent the event id, also strings.
      // when { action: 'CANCELED' } is returned, the dialog was dismissed
      console.warn(JSON.stringify(eventInfo));
    })
    .catch((error) => {
      // handle error such as when user rejected permissions
      console.warn(error);
    });

    //const {navigate} = this.props.navigation;
    //navigate("Home");
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
  }
});
