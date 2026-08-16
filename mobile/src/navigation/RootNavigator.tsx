import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TripCreateScreen } from '../screens/TripCreateScreen'
import { TripListScreen } from '../screens/TripListScreen'

// 画面が増えたらここにルートを追加する。
export type RootStackParamList = {
  TripList: undefined
  TripCreate: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="TripList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripList" component={TripListScreen} />
      <Stack.Screen name="TripCreate" component={TripCreateScreen} />
    </Stack.Navigator>
  )
}
