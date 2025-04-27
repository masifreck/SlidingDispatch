
import * as React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Login from './screen/Login';
import Splash from './screen/Splash';
import ScannerScreen from './screen/ScannerScreen';
import { bgColor } from './screen/constant';

const Stack = createNativeStackNavigator();


const App = () => {
  return (
    <NavigationContainer>
       <StatusBar backgroundColor={bgColor} barStyle="light-content" />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainScreen"
          component={ScannerScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
