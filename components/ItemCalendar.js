import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert, AlertIOS } from "react-native";
import { Button } from 'react-native-ios-kit';
import { CheckBox } from 'react-native-elements'
import Locations from '../constants/Locations';

export default class ItemCalendar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            checked: false
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { isChecked, destination, selected } = this.props;
        if(
            nextProps.isChecked == isChecked &&
            nextProps.destination == destination &&
            nextProps.selected == selected
            ) {
                return false;
            } else {
                return true;
            }
    }

    handleCheckIterative() {
        const { onCheck } = this.props;
        if(onCheck)
            onCheck();
    }

    handleChangeDestination() {
        const { onChangeDestination } = this.props;
        let buttons = Locations.map(location => {
            return {
                text: location.value,
                onPress: () => { onChangeDestination(location.value) }
            }
        });
        buttons.push({
            text: 'Autre', 
            onPress: () => {
                AlertIOS.prompt(
                    'Destination',
                    'Entrer la destination qui sera affiché dans l\'email',
                    [
                        {
                          text: 'Annuler',
                          style: 'cancel'
                        },
                        {
                          text: 'OK',
                          onPress: (text) => { onChangeDestination(text) } ,
                        },
                    ],
                    'plain-text',
                );
            }
        });
        buttons.push({text: 'Annuler', style: 'cancel'});
        Alert.alert(
            'Destination',
            'Changer la destination qui sera affiché dans l\'email',
            buttons,
            {cancelable: true},
        );
    }

    render () {
        const { title, location, isCopy, selected, enableSwitch, isChecked, destination, enableDestination } = this.props;

        return (
            <TouchableOpacity {...this.props}>
                <View style={styles.itemContainer}>
                    <View style={styles.checkboxContainer}>
                            <View style={styles.checkbox}>
                                {
                                    selected ? (
                                        <View style={styles.checkboxInner}>
                                        </View>
                                    ) : (null)
                                }
                                
                            </View>
                    </View>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>
                            {title}
                            {isCopy && ' (COPIE)'}
                        </Text>
                        <Text style={styles.location}>
                            { location }
                        </Text>
                        <View style={ styles.detail }>
                            {
                                enableDestination ? (
                                    <Button 
                                        style={ styles.destination }
                                        onPress={ this.handleChangeDestination.bind(this) }  
                                        rounded              
                                    >
                                        { destination ? destination : 'Pour...' }
                                    </Button>
                                ) : (null)
                            }
                            {
                                enableSwitch ? (
                                    <CheckBox
                                        containerStyle={ styles.checkBoxIterative }
                                        right
                                        title='Course itérative'
                                        checked={isChecked}
                                        onPress={ this.handleCheckIterative.bind(this) }
                                    />
                                ) : (null)
                            }
                        </View>                        
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#ffffff'
    },
    checkboxContainer: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: '#1c84e5',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: '#1c84e5'
    },
    contentContainer: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#D1D1D1'
    },
    title: {
        fontSize: 16
    },
    location: {
        paddingTop: 5,
        fontSize: 12,
        color: '#979797'
    },
    detail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'flex-end',
    },
    destination: {
        flex: 1,
        padding: 5,
        marginTop: 5
    },
    checkBoxIterative: {
        flex: 1,
        backgroundColor: '#fff', 
        borderWidth: 0, 
        margin: 0, 
        padding: 0
    }
});