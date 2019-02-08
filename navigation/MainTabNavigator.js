import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import AddEventScreen from '../screens/AddEventScreen';

import SelectAssignationCoursesScreen from '../screens/SelectAssignationCoursesScreen';

import SelectBonCoursesScreen from '../screens/SelectBonCoursesScreen';
import GroupBonCoursesScreen from '../screens/GroupBonCoursesScreen';

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
  SelectAssignationCourses: {
    screen: SelectAssignationCoursesScreen,
    navigationOptions: ({ navigation }) => ({
      header: null,
    }),
  },
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

const SelectBonCoursesStack = createStackNavigator({
  SelectBonCourses: {
    screen: SelectBonCoursesScreen,
    navigationOptions: ({ navigation }) => ({
      header: null,
    }),
  },
  GroupBonCourses: {
    screen: GroupBonCoursesScreen,
    navigationOptions : {
      title: 'Grouper les courses'
    }
  }
});

SelectBonCoursesStack.navigationOptions = {
  tabBarLabel: 'Bon',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-copy' : 'md-copy'}
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  SelectAssignationCoursesStack,
  SelectBonCoursesStack
});
