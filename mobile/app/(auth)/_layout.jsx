
import React from 'react'
import { Slot } from 'expo-router'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { Text } from 'react-native'
export default function _layout() {

  return (
    // <SafeAreaView>
      // <Text className='text-2xl font-bold text-center'>Auth Header</Text>
      <Slot/>
    // </SafeAreaView>
  )
}