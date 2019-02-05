import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import AutocompleteClient from '../../components/AutocompleteClient';

export default class SelectClientScreen extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      idClient : null
    }
  }

  handleSelectClient (client) {
    console.log("clientID : " + client.id);
    this.setState({
      idClient : client.id
    })
  }

  handleSubmit () {
    const {navigate} = this.props.navigation;
    navigate("SelectDate", {idClient: this.state.idClient});
  }

  handleCreateClient () {

  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <AutocompleteClient handleSelectClient={ this.handleSelectClient.bind(this) } />
        {
          Number.isInteger(this.state.idClient) ? (
            <TouchableOpacity onPress={this.handleSubmit.bind(this)} >
              <Text>Valider</Text>
            </TouchableOpacity>
          ) : (
            <View></View>
          )
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
