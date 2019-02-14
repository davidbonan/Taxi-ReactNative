import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert, AlertIOS } from "react-native";
import moment from 'moment';

export default class ItemCalendar extends React.Component {
    constructor(props) {
        super(props)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    render () {
        const { startDate } = this.props;

        return (
            <View>
                <Text style={ styles.date } >
                    { moment(startDate).format("DD MMMM") }
                </Text>
                <View></View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    date: {
        marginTop: 25,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 50,
        fontSize: 14,
        color: '#979797'
    },
    divider: {
        position: 'absolute',
        top: 32,
        right: 0,
        left: 90,
        height: 1,
        backgroundColor: 'red',
        opacity: 0.3
    }
});