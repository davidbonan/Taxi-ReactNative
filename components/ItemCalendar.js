import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Switch } from "react-native";
import { CheckBox } from 'react-native-elements'

export default class ItemCalendar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            checked: false
        }
    }

    handleCheckIterative() {
        const { onCheck } = this.props;
        //this.setState({checked: !this.state.checked});
        if(onCheck)
            onCheck();
    }

    render () {
        const { title, location, selected, enableSwitch, isChecked } = this.props;

        return (
            <TouchableOpacity {...this.props}>
                <View style={styles.itemContainer}>
                    <View style={styles.checkboxContainer}>
                            <View style={styles.checkbox}>
                                {
                                    selected ? (
                                        <View style={styles.checkboxInner}>
                                        </View>
                                    ) : (
                                        <View></View>
                                    )
                                }
                                
                            </View>
                    </View>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>
                            { title }
                        </Text>
                        <Text style={styles.location}>
                            { location }
                        </Text>
                        {
                            enableSwitch ? (
                                <CheckBox
                                    containerStyle={{ backgroundColor: '#fff', borderWidth: 0, margin: 0, padding: 0 }}
                                    right
                                    title='Course itérative'
                                    checked={isChecked}
                                    onPress={ this.handleCheckIterative.bind(this) }
                                />
                            ) : (
                                <View></View>
                            )
                        }
                        
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
    }
});