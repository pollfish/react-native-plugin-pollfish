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
  var builder = new RNPollfish.Builder('ANDROID_API_KEY', 'IOS_API_KEY')
    .rewardMode(true);

  if (mode == "Offerwall") {
    builder
        .offerwallMode(true);
  }

  // Note: If you are targeting iOS 14+ devices please keep in mind that Pollfish surveys can work 
  // with or without the IDFA permission on iOS 14+. If no permission is granted in the ATT popup, 
  // the SDK will serve non personalized surveys to the user. In that scenario the conversion is expected to be lower. 
  // Offerwall integrations perform better compared to single survey integrations when no IDFA permission is given
  // We recommend requesting IDFA usage permission prior to Pollfish initialization.

  RNPollfish.init(builder.build());
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

    RNPollfish.addEventListener(RNPollfish.PollfishSurveyReceivedListener, (event) => {
      
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

    RNPollfish.addEventListener(RNPollfish.PollfishSurveyCompletedListener, (event) => {
      setState({
        logText: `Survey Completed - CPA: IR: ${event.surveyIR}, LOI: ${event.surveyLOI}, Class: ${event.surveyClass}, Reward Value: ${event.rewardValue}, Reward Name: ${event.rewardName}, Remaining Completes: ${event.remainingCompletes}`,
        isPollfishReady: false
      });
    });

    RNPollfish.addEventListener(RNPollfish.PollfishSurveyNotAvailableListener, (_) => {
      setState({
        logText: "Survey Not Available",
        isPollfishReady: false
      });
    });

    RNPollfish.addEventListener(RNPollfish.PollfishUserNotEligibleListener, (_) => {
      setState({
        logText: "User Not Eligible",
        isPollfishReady: false
      });
    });

    RNPollfish.addEventListener(RNPollfish.PollfishUserRejectedSurveyListener, (_) => {
      setState({
        logText: "User Rejected Survey",
        isPollfishReady: false
      });
    });

    return () => {
      navigation.removeListener('focus', this._onFocus);
      RNPollfish.removeAllListeners();
    };
  }, []);

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

