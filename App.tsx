import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text>ChanguiApp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
