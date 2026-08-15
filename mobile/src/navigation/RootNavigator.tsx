import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TripCreateScreen } from '../screens/TripCreateScreen'

// 画面が増えたらここにルートを追加する。現時点では旅行計画登録画面のみ。
export type RootStackParamList = {
  TripCreate: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripCreate" component={TripCreateScreen} />
    </Stack.Navigator>
  )
}
