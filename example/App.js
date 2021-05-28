/**
 * Sample Pollfish React Native App
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import RNPollfish from 'react-native-plugin-pollfish';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import {
  Button,
  Text,
  View,
} from 'react-native';

function initPollfish(mode) {
  var builder = new RNPollfish.Builder('API_KEY')
    .indicatorPosition(RNPollfish.Position.bottomLeft)
  
  switch (mode) {
    case "Rewarded":
      builder.rewardMode(true);
      break;
    case "Offerwall":
      builder
        .offerwallMode(true)
        .rewardMode(true);
      break;
  }

  RNPollfish.init(builder);
}

function showPollfish() {
  RNPollfish.show();
}

const Tab = createMaterialBottomTabNavigator();

const Details = ({ navigation, route }) => { 
  
  const [state, setState] = useState({
    logText: "Pollfish Initialized!", 
    isPollfishReady: false
  })

  const isFocused = useIsFocused();

  _onFocus = () => {
    initPollfish(route.params.name);
    setState({
      logText: "Pollfish Initialized!", 
      isPollfishReady: false
    });
  };

  useEffect(() => {
    navigation.addListener('focus', this._onFocus);

    RNPollfish.addEventListener("onPollfishSurveyReceived", (event) => {
      
      if (event === undefined || event === null) {
        setState({
          logText: "Offerwall Received",
          isPollfishReady: true
        });
      } else {
        setState({
          logText: `Survey Received - CPA: ${event.surveyCPA}, IR: ${event.surveyIR}, LOI: ${event.surveyLOI}, Class: ${event.surveyClass}, Reward Value: ${event.rewardValue}, Reward Name: ${event.rewardName}, Remaining Completes: ${event.remainingCompletes}`,
          isPollfishReady: true
        });
      }
      
    });

    RNPollfish.addEventListener("onPollfishSurveyCompleted", (event) => {
      setState({
        logText: `Survey Completed - CPA: IR: ${event.surveyIR}, LOI: ${event.surveyLOI}, Class: ${event.surveyClass}, Reward Value: ${event.rewardValue}, Reward Name: ${event.rewardName}, Remaining Completes: ${event.remainingCompletes}`,
        isPollfishReady: false
      });
    });

    RNPollfish.addEventListener("onPollfishSurveyNotAvailable", (_) => {
      setState({
        logText: "Survey Not Available",
        isPollfishReady: false
      });
    });

    RNPollfish.addEventListener("onUserNotEligible", (_) => {
      setState({
        logText: "User Not Eligible",
        isPollfishReady: false
      });
    });

    RNPollfish.addEventListener("onUserRejectedSurvey", (_) => {
      setState({
        logText: "User Rejected Survey",
        isPollfishReady: false
      });
    });

    return () => {
      navigation.removeListener('focus', this._onFocus);
      RNPollfish.removeAllListeners();
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>{state.logText}</Text>
        {
          (route.params.name == "Rewarded" || route.params.name == "Offerwall") && state.isPollfishReady &&
          <Button onPress={showPollfish} title="Show" style={{display: 'none'}} />
        }
      </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        activeColor="#e91e63"
        barStyle={{ backgroundColor: 'tomato' }} >
        <Tab.Screen 
          name="Default" 
          component={Details} 
          initialParams={{ name: "Default" }} />
        <Tab.Screen 
          name="Rewarded" 
          component={Details}
          initialParams={{ name: "Rewarded" }} />
        <Tab.Screen 
          name="Offerwall" 
          component={Details} 
          initialParams={{ name: "Offerwall" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

