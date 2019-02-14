import React from "react";
import { View, StyleSheet, Text } from "react-native";
import moment from 'moment';

const DateCalendar = ({ startDate }) => {
    return (
        <View>
            <Text style={ styles.dateLabel } >
                { moment(startDate).format("DD MMMM") }
            </Text>
            <View style={ styles.divider }></View>
        </View>
    );
}

export default DateCalendar;

const styles = StyleSheet.create({
    dateLabel: {
        marginTop: 25,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 10,
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