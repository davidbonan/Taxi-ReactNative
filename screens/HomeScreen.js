import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AddButton from '../components/AddButton';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <View style={styles.container} >
          <AddButton backgroundColor='blue' routeName='AddEvent' navigateTo={this.navigateTo.bind(this)} />
      </View>
    );
  }

  navigateTo (routeName) {
    const {navigate} = this.props.navigation;
    navigate(routeName);
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
