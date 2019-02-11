import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';

import SelectAssignationCoursesScreen from '../screens/SelectAssignationCoursesScreen';

import SelectBonCoursesScreen from '../screens/SelectBonCoursesScreen';
import GroupBonCoursesScreen from '../screens/GroupBonCoursesScreen';

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
    screen: SelectBonCoursesScreen
  },
  GroupBonCourses: {
    screen: GroupBonCoursesScreen
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
  SelectAssignationCoursesStack,
  SelectBonCoursesStack
});
