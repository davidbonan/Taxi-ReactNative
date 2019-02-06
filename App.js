import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from 'react-native-ios-kit';

export default class App extends React.Component {

  render() {
    return (
      <ThemeProvider>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
