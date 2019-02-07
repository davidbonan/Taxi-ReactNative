import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';

export default class LinksScreen extends React.Component {
    static navigationOptions = {
            header: null,
    };

    constructor(props) {
        super(props);
        
        this.state = {
            isLoading: true,
            events: []
        }
    }

    componentDidMount() {
        let startDate = moment(new Date()).subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let endDate = moment(new Date()).add(7, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        let _this = this;
        RNCalendarEvents.fetchAllEvents(startDate, endDate).then(fulfilled => {
            console.log(fulfilled);
            if(fulfilled.length > 0) {
                _this.setState({ isLoading: false, events: fulfilled });
            }
        })
    }

    render() {
        return (
            <ScrollView style={styles.container}>

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
