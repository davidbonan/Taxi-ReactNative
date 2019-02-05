import React from "react";
import { TouchableOpacity, StyleSheet, Text, View} from "react-native";
import Autocomplete from 'react-native-autocomplete-input';
import { Icon } from 'expo';

import Colors from '../constants/Colors';
import data from '../constants/data-client.json'

export default class AutocompleteClient extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            query: ''
        }
    }

    findClients(query) {
        if (query === '') {
            return [];
        }

        const regex = new RegExp(`${query.trim()}`, 'i');
        return data.filter(client => client.name.search(regex) >= 0);
    }

    handleSelectClient (client) {
        const { handleSelectClient } = this.props;
        this.setState({query: client.name});
        handleSelectClient(client);
    }

    render () {
        const { query } = this.state;
        const clients = this.findClients(query);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

        return (
            <View style={styles.container}>
                <Autocomplete
                    data={clients.length === 1 && comp(query, clients[0].name) ? [] : clients}
                    defaultValue={query}
                    autoCorrect={false}
                    containerStyle={styles.autocompleteContainer}
                    placeholder="Entrer le nom d'un client"
                    onChangeText={text => this.setState({ query: text })}
                    renderItem={item => (
                    <TouchableOpacity style={styles.itemContainer} onPress={this.handleSelectClient.bind(this, item)}>
                        <Text style={styles.itemText}>{item.name}</Text>
                        <Text style={styles.adrText}>{item.adr}</Text>
                    </TouchableOpacity>
                    )}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        
    },
    autocompleteContainer: {
        marginLeft: 10,
        marginRight: 10
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