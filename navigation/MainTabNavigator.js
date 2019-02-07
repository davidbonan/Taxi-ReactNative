import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import AddEventScreen from '../screens/Course/AddEventScreen';

import SelectAssignationCoursesScreen from '../screens/SelectAssignationCoursesScreen';

const HomeStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => ({
      header: null,
    }),
  },
  AddEvent: {
    screen: AddEventScreen,
    navigationOptions : {
      title: 'Créer une course'
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

const SelectAssignationCoursesStack = createStackNavigator({
  SelectAssignationCourses: SelectAssignationCoursesScreen,
});

SelectAssignationCoursesStack.navigationOptions = {
  tabBarLabel: 'Assignation',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-people' : 'md-people'}
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  SelectAssignationCoursesStack
});
