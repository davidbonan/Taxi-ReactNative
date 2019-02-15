import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import GroupedEvents from './GroupedEvents';
import _ from 'lodash';

const ListGroupedEvents = ({ groupedEvents, onClearGroupedEvent }) => {
    
    const listGroupedEvents = _.map(
        groupedEvents, 
        (events, clientName) => {
            return {events: events, clientName : clientName}              
        }
    )
    
    return (
        <View>
            <FlatList
                data={ listGroupedEvents }
                keyExtractor={(item) => item.clientName}
                renderItem={({ item }) => (
                    <GroupedEvents 
                        key={item.clientName}
                        events={ item.events } 
                        clientName={ item.clientName } 
                        onClearGroupedEvent={ onClearGroupedEvent } 
                    />
                )
               }
            />
        </View>
    );
};

export default ListGroupedEvents;