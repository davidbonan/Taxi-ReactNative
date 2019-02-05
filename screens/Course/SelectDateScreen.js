import React from 'react';
import { ScrollView, StyleSheet, DatePickerIOS, View } from 'react-native';

export default class SelectDateScreen extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {chosenDate: new Date()};
  }

  render() {
    return (
      <View style={styles.container}>
        <DatePickerIOS
          date={this.state.chosenDate}
        />
      </View>
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
