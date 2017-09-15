import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Linking,
  Clipboard,
  AsyncStorage,
} from 'react-native';

import Editor from 'react-native-editor';

import uuidv4 from 'uuid/v4';
import template from './snackTemplate';

import { SnackSession } from 'snack-sdk';

var window = {
  location: {
    hostname: 'mobile-snack.com',
  },
};

async function openSnack(session) {
  let saveResult = await session.saveAsync();
  console.log(saveResult);
  Clipboard.setString(saveResult.url);
  Linking.openURL(saveResult.url);
}

async function updateCode(session, code) {
  try {
    await session.sendCodeAsync(code);
  } catch (error) {
    console.log(error);
  }
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {};

    AsyncStorage.getItem('uuid', (error, resultUUID) => {
      const uuid = resultUUID || uuidv4();

      AsyncStorage.getItem('data', (error, resultData) => {
        const data = resultData || template;

        this.session = new SnackSession({
          code: data,
          sessionId: uuid,
          verbose: true,
        });

        this.setState({ data });

        this.session.addErrorListener(this.onSnackError);
        this.session.addLogListener(this.onSnackLog);
        this.session.addPresenceListener(this.onSnackPresence);

        AsyncStorage.setItem('uuid', uuid);
        AsyncStorage.setItem('data', data);
      });
    });
  }

  onSnackError = errors => {
    console.log('errors', errors);
  };
  onSnackLog = log => {
    console.log('log', log);
  };
  onSnackPresence = event => {
    console.log('presence', event);
  };

  onPress = () => {
    openSnack(this.session);
  };

  onUpdateCode = data => {
    updateCode(this.session, data);
    AsyncStorage.setItem('data', data);
  };

  render() {
    const dimensions = Dimensions.get('window');
    if (this.state.data == null) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>loading...</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text onPress={this.onPress} style={styles.title}>
          tap here to publish + open
        </Text>
        <Editor
          onUpdateData={this.onUpdateCode}
          dimensions={dimensions}
          data={this.state.data}
          style={styles.editor}
          isEditing={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editor: {
    flex: 1,
  },
  title: {
    backgroundColor: '#CCCCCC',
    paddingTop: 20,
  },
});
