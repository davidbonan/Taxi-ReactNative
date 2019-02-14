import React from "react";
import { View, StyleSheet, Text } from "react-native";
import moment from 'moment';

const TimeCalendar = ({ startDate }) => {
    return (
        <Text style={ styles.timeLabel } >
            { moment(startDate).format("HH:00") }
        </Text>
    );
}

export default TimeCalendar;

const styles = StyleSheet.create({
    timeLabel: {
        margin: 10,
        color: '#3498db'
    },
});