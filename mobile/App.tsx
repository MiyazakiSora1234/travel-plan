import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { queryClient } from './src/lib/queryClient'
import { RootNavigator } from './src/navigation/RootNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
