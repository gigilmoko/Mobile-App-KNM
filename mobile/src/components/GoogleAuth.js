// import {
//     GoogleSignin,
//     GoogleSigninButton,
//     statusCodes,
// } from "@react-native-google-signin/google-signin";
// import { useEffect, useState, View, Text} from "react";


// export default function GoogleAuth() {
//   configuregoogle = async () => {
//     await GoogleSignin.configure({  
//         webClientId: '503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com',
//         offlineAccess: false,
//     });
//     }

//     useEffect(() => {
//         configuregoogle();
//     }, []);

//     const signIn = async () => {
//         try {
//             await GoogleSignin.hasPlayServices();
//             const userInfo = await GoogleSignin.signIn();
//             console.log(userInfo);
//         } catch (error) {
//             if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//                 // user cancelled the login flow
//             } else if (error.code === statusCodes.IN_PROGRESS) {
//                 // operation (e.g. sign in) is in progress already
//             } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//                 // play services not available or outdated
//             } else {
//                 // some other error happened
//             }
//         }
//     };

    
//   return (
//     <View>
//         <GoogleSigninButton
//             style={{ width: 192, height: 48 }}
//             size={GoogleSigninButton.Size.Wide}
//             color={GoogleSigninButton.Color.Dark}
//             onPress={this.signIn}
//         />
//       <Text>GoogleAuth</Text>
//     </View>
//   )
// }