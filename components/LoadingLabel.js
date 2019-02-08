import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadingLabel = (props) => {
  return (
      <View style={styles.container}>
        <Text {...props} style={styles.label}>Chargement...</Text>
      </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15
    },
    label: {
        fontSize: 16,
        color: '#979797'
    }
});

export default LoadingLabel;