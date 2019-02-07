import React from "react";
import { TouchableOpacity, StyleSheet, Text, View} from "react-native";
import Autocomplete from 'react-native-autocomplete-input';
import Icon from 'react-native-vector-icons/Ionicons';
import Contacts from 'react-native-contacts';

export default class AutocompleteClient extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            query: '',
            hideResults: true,
            clients: []
        }
    }

    componentDidMount() {
        Contacts.checkPermission((err, permission) => {
            if (err) throw err;
            if (permission === 'undefined') {
                Contacts.requestPermission((err, permission) => {
                    if (err) throw err;
                    if (permission === 'authorized') {
                        this.updateListClients();
                    }
                })
            }
            if (permission === 'authorized') {
                this.updateListClients();
            }
        })
    }

    updateListClients() {
        let _this = this;
        Contacts.getAll((err, contacts) => {
            if (err) {
              throw err;
            }
            // contacts returned
            _this.setState({ clients: contacts })
        })
    }

    findClients(query) {
        if (query === '') {
            return [];
        }

        const regex = new RegExp(`${query}`, 'i');
        return this.state.clients.filter(client => client.familyName.search(regex) >= 0 || client.givenName.search(regex) >= 0);
    }

    handleChangeText (text) {
        const { handleChangeText } = this.props;
        this.setState({ query: text, hideResults: false });
        handleChangeText(text);
    }

    handleSelectClient (client) {
        const { handleSelectClient } = this.props;
        this.setState({query: client.name, hideResults: true});
        handleSelectClient(client);
    }

    render () {
        const { query } = this.state;
        const clients = this.findClients(query);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

        return (
            <View style={styles.container}>
                <Icon
                    name='ios-person'
                    size={26}
                    style={ styles.autocompleteIcon }
                    color='#333'
                />
                <Autocomplete
                    data={clients.length === 1 && (comp(query, clients[0].familyName) || comp(query, clients[0].givenName)) ? [] : clients}
                    defaultValue={query}
                    keyboardShouldPersistTaps="always"
                    autoCorrect={false}
                    hideResults={this.state.hideResults}
                    containerStyle={styles.autocompleteContainer}
                    placeholder="Entrer le nom d'un client"
                    inputContainerStyle={styles.autocompleteInputContainer}
                    listContainerStyle={styles.autocompleteListContainer}
                    listStyle={styles.autocompleteList}
                    onChangeText={this.handleChangeText.bind(this)}
                    renderItem={item => (
                    <TouchableOpacity style={styles.itemContainer} onPress={this.handleSelectClient.bind(this, item)}>
                        <Text style={styles.itemText}>{ item.givenName + item.familyName }</Text>
                        {
                            item.postalAddresses.length > 0 ? (
                                <Text style={styles.adrText}>{ 
                                    item.postalAddresses[0].street + ' ' +
                                    item.postalAddresses[0].city + ' ' +
                                    item.postalAddresses[0].postCode
                                }</Text>
                            ) : (
                                <Text style={styles.adrText}>Aucune adresse</Text>
                            )
                        }
                    </TouchableOpacity>
                    )}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        backgroundColor: '#fff',
        paddingTop: 5
    },
    autocompleteIcon: {
        position: 'absolute',
        top: 8,
        left: 10,
        height: 26,
        width: 26,
        zIndex:1
    },
    autocompleteContainer: {
        flex: 1,
        zIndex:0
    },
    autocompleteInputContainer: {
        borderWidth: 0,
        paddingLeft: 40,
        paddingRight: 10,
    },
    autocompleteListContainer: {
        borderTopWidth: 1,
        borderTopColor: '#D2D2D2'
    },
    autocompleteList: {

    },
    itemContainer: {
        margin: 10
    },
    itemText: {
        fontSize: 15,
    },
    adrText: {
        fontSize: 11,
        color: '#979797'
    },
});