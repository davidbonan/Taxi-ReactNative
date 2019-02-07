import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import SelectClientScreen from '../screens/Course/SelectClientScreen';
import SelectDateScreen from '../screens/Course/SelectDateScreen';
import AddToCalendarScreen from '../screens/Course/AddToCalendar';

import LinksScreen from '../screens/LinksScreen';

const HomeStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => ({
      header: null,
    }),
  },
  SelectClient: {
    screen: SelectClientScreen,
    navigationOptions : {
      title: 'Sélectionner un client'
    }
  },
  SelectDate: {
    screen: SelectDateScreen,
    navigationOptions : {
      title: 'Sélectionner la date du rdv'
    }
  },
  AddToCalendar: {
    screen: AddToCalendarScreen,
    navigationOptions : {
      title: 'Ajouter au calendrier'
    }
  }
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Courses',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? 'ios-car'
          : 'md-car'
      }
    />
  )
};

const LinksStack = createStackNavigator({
  Links: LinksScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Clients',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-people' : 'md-people'}
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  LinksStack
});