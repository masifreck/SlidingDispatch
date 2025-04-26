import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Button,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  PermissionsAndroid,
  Alert,
  
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Camera,
  useCameraPermission,
  useCodeScanner,
  useCameraDevice,
} from 'react-native-vision-camera';
import RNRestart from 'react-native-restart';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import NetworkError from './NetworkError';
import NetworkStatus from './NetworkStatus';
import {MMKVLoader, useMMKVStorage} from 'react-native-mmkv-storage';
import { bgColor, secondaryColor } from './constant';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
const storage = new MMKVLoader().initialize();
// storage.clearStore();
const wW = Dimensions.get('screen').width;
const wH = Dimensions.get('screen').height;
let isFine;
wW < 400 ? (isFine = true) : (isFine = false);
const Width=Dimensions.get('window').width
const ScannerScreen = () => {
  const navigation = useNavigation();
  const isConnected = NetworkStatus(); // Use the hook
  // const [isConnected, setIsConnected] = useState(false); // State for network status
  // console.log(isConnected);

  //Keyboard Variables=========================================================================

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const showAlert = () => {
    Alert.alert(
      'Info',
      'Restart App after Permissions',
      [
        {
          text: 'OK',
          onPress: () => checkAndRequestCameraPermission(),
        },
      ],
      {cancelable: false},
    );
  };
  async function checkAndRequestCameraPermission() {
    console.log('restart kindly===========================================');
    console.log(
      PermissionsAndroid.RESULTS.GRANTED,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    try {
      // Check if the permission is already granted
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (granted) {
        console.log('Camera permission already granted');
        return PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // If permission is not granted, request it
        const requestResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Note : After Accepting, It restarts',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
          RNRestart.restart();
          console.log('Camera permission granted');
          console.log(
            'restart kindly===========================================',
          );
          console.log(
            PermissionsAndroid.RESULTS.GRANTED,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
        } else {
          console.log('Camera permission denied');
          // Optionally, you can show an alert to inform the user
          Alert.alert(
            'Permission Denied',
            'You denied camera access. This app requires camera access to function properly.',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
        }

        return requestResult;
      }
    } catch (error) {
      console.error(`Error checking/requesting camera permission: ${error}`);
      return PermissionsAndroid.RESULTS.DENIED;
    }
  }

  // Camera variables==========================================================================

  const [ScannedData, setScannedData] = useState('');
  const device = useCameraDevice('back');
  const {hasPermission} = useCameraPermission();
  // const [hasPermission, setHasPermission] = useState(true);

  const [cameraActive, setCameraActive] = useState(false); // State to manage camera activation
const [Uid,setUid]=useState('');
useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const response = await AsyncStorage.getItem('response'); // Check if the response exists in AsyncStorage
      console.log('Response: on main screen', response);  // Log the response to check what you have
      
      if (response) {
        setUid(response)
      } else {
        alert.Alert('Error','please login againg')
        navigation.navigate('Login')
      }
    } catch (error) {
      console.error('Error retrieving response:', error);
      // If there was an error in retrieving the response, navigate to Login screen
      navigation.navigate('Login');
    }
  };

  // Trigger checkLoginStatus after a delay of 3 seconds
  setTimeout(checkLoginStatus, 3000);
}, [navigation]);
  const NoCameraErrorView = () => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text
        style={{
          color: secondaryColor,
          textAlign: 'center',
          fontSize: isFine ? 13 : 15,

          textTransform: 'uppercase',
          fontFamily: 'PoppinsBold',
          marginTop: 5,
          letterSpacing: 1,
        }}>
        Allow Camera Permission
      </Text>
      <TouchableOpacity style={styles.button2} onPress={showAlert}>
        <Text style={styles.text}>Allow</Text>
      </TouchableOpacity>
    </View>
  );



  if (!hasPermission) {
    // Handle permission denied case
    console.log('Permission denied');
    return <NoCameraErrorView />;
  }

  if (device === null) {
    // Handle no camera device found case
    console.log('No camera device found');
    return <NoCameraErrorView />;
  }



  const [littleLoading, setlittleLoading] = useState(false);

 

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async codes => {
      try {
        const scannedCode = codes[0]?.value; // <-- Correct way to get value
        if (scannedCode) {
          setCameraActive(false);        // Stop camera
          setlittleLoading(true);        // Start showing loader
  
          console.log('Scanned QR Code:', scannedCode);
  
          setTimeout(() => {             // After 2 seconds show scanned data
            setlittleLoading(false);     // Stop showing loader
            setScannedData(scannedCode); // Show the scanned data
          }, 1000);
        }
      } catch (error) {
        console.error('Error during scanning:', error);
        setScannedData('Scan Error!');
        setlittleLoading(false);
      }
    },
  });
  

  // modal data===========================================================================
  const [modalVisible, setModalVisible] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = () => {
    setLocationCode(textInputValue);
    setModalVisible(false);
    AsyncStorage.setItem('LocationCode', textInputValue);
  };



  const [IsLoading, setIsLoading] = useState(false);



  const postData = async (Uid, ScannedData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('Uid', Uid);
      formData.append('data', ScannedData);
  
      const response = await fetch('https://tsm.tranzol.com/sidingsagfdgfdhhjghjfgfdsda/postdata', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
  console.log('formdata',formData)
      const result = await response.text();
      console.log('Post result:', result);
  
      if (result.includes('MSUCCESS')) {
        Alert.alert('Success', 'Data posted successfully!');
        setScannedData('');
      } else {
        Alert.alert('Error', 'Failed to post data. Please try again.');
      }
    } catch (error) {
      console.error('Error during post request:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePostRequest = () => {
    postData(Uid, ScannedData);
  };
  

  return (
    <AlertNotificationRoot>
      <NetworkError />
     
        <ScrollView
          contentContainerStyle={[
            styles.scrollView,
            {backgroundColor: 'white'},
          ]}
          showsVerticalScrollIndicator={false}>
          {IsLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '90%',
              }}>
              <ActivityIndicator
                animating={true}
                color={bgColor}
                size="large"
              />

              <Text
                style={{
                  color: secondaryColor,
                  textAlign: 'center',
                  fontSize: 15,
                  textTransform: 'uppercase',
                  fontFamily: 'PoppinsBold',
                  marginTop: 5,
                  letterSpacing: 2,
                }}>
                Loading
              </Text>
            </View>
          ) : (
            <View style={styles.container}>
              {/* Header==================================== */}
              <View
                style={{
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'space-between',
                  width: Width,
                  height: 60,
                  padding: 10,
                  marginBottom: 5,
                marginTop:20,position:'absolute',top:10,paddingHorizontal:20
                  
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../screen/assets/tranzolLogo.png')}
                    style={{width: 50, height: 50}}
                  />
                  <Text
                    style={{
                      fontWeight: 900,
                      fontSize: isFine ? 18 : 20,
                      color: secondaryColor,
                      // textAlign:"center"
                      margin: 'auto',
                    }}>
                    Tranzol
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    flexDirection: 'column',
                    marginRight: 10,
                    marginBottom:10,
                  }}>
                  <TouchableOpacity
                    style={{padding: 0, margin: 0, height: '90%'}}
                    // onPress={handleOpenModal}
                  >
                
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{padding: 0, marginTop: 5, height: '100%'}}
                    onPress={() => {
                      Alert.alert(
                        'Sign Out',
                        'Do you want to continue?',
                        [
                          {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                          },
                          {
                            text: 'OK',
                            onPress: () => {
                              AsyncStorage.setItem('response', '');
                              navigation.replace('Login');
                              storage.clearStore();
                            },
                          },
                        ],
                        {cancelable: true},
                      );
                    }}>
                    <Image
                      source={require('../screen/assets/logout.png')}
                      style={{
                        width: 30,
                        height: 30,
                        tintColor: secondaryColor,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View></View>
              <View
  style={{
    height: 350,
    width: '85%',
    backgroundColor: '#d8e2dc',
    borderRadius: 10,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    alignItems:'center',
    marginTop:50
  }}
>
  {cameraActive ? (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={cameraActive}
      codeScanner={codeScanner}
    />
  ) : littleLoading ? (
    <ActivityIndicator
      animating={true}
      color="#000" // better visible color
      size="large"
    />
  ) : (
    <>
     
     <Text style={{ color: '#000', fontSize: 16, textAlign: 'justify' }}>{ScannedData}</Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 5,
          marginVertical: '5%',
          height: 40,
          width: 130,
          alignItems: 'center',
          justifyContent: 'center',marginTop:50
        }}
        onPress={() => {
          setScannedData('');        // Clear old scanned data
          setCameraActive(true);     // Re-activate camera
        }}
      >
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '900',
          }}
        >
          Scan Again
        </Text>
      </TouchableOpacity>
    </>
  )}
</View>

              {/* Bottom===================================== */}
            
              {/* Last Buttons=============================== */}
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  marginTop: 0,
                }}>
          <TouchableOpacity
  style={styles.button2}
  onPress={handlePostRequest}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {/* <Icon name="save" size={20} color="white" style={{ marginRight: 8 }} /> */}
    <Text style={styles.text}>Save</Text>
  </View>
</TouchableOpacity>

              </View>
            </View>
          )}

          {/* Modal Data */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCloseModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.textInput}
                  onChangeText={setTextInputValue}
                  value={textInputValue}
                  placeholderTextColor={'black'}
                  placeholder="Enter Code"
                  autoFocus={true}
                />
                <View style={styles.buttonContainer}>
                  <View style={styles.button1}>
                    <Button title="Cancel" onPress={handleCloseModal} />
                  </View>
                  <View style={styles.button1}>
                    <Button title="OK" onPress={handleConfirm} />
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   // backgroundColor: 'red',
  // },
  scrollView: {
    // flexGrow: 1,
    flex:1,
    backgroundColor: 'white',
  },
  container: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputContainer: {
    height: isFine ? wH * 0.06 : wH * 0.06,
    width: isFine ? wW * 0.8 : wW * 0.8,
    height:'20%',
    borderRadius: 10,
    // borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    // marginVertical: '3%',
    marginBottom: '5%',
    borderBlockColor: '#276A76',
    borderWidth: 1,
    flexDirection: 'row',
  },
  button2: {
    backgroundColor: bgColor,
    borderRadius: 5,
    marginVertical: '5%',
    height: 50,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:10,
    elevation:4
  },
  text: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',

    fontWeight: '900',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 20,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button1: {
    width: '40%', // Adjust width as needed
  },
});
export default ScannerScreen;
