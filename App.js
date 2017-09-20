import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Linking,
  Clipboard,
  AsyncStorage,
  Alert,
} from 'react-native';

var window = {
  location: {
    hostname: 'snack.expo.io',
  },
};

global.window.location = window.location;

import Editor from 'react-native-editor';

import uuidv4 from 'uuid/v4';
import template from './snackTemplate';

import { SnackSession } from 'snack-sdk';

async function openSnack(session) {
  let url = await session.getUrlAsync();
  Clipboard.setString(url);
  Alert.alert('copied live url');
}

async function saveSnack(session) {
  let saveResult = await session.saveAsync();
  Clipboard.setString(saveResult.url);
  Alert.alert('copied saved url');
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

  onPressSave = () => {
    saveSnack(this.session);
  };

  onPressOpen = () => {
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
        <View style={styles.buttonBar}>
          <Text onPress={this.onPressOpen} style={[styles.open, styles.button]}>
            Open Preview
          </Text>
          <Text onPress={this.onPressSave} style={[styles.save, styles.button]}>
            Save
          </Text>
        </View>
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
  buttonBar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    borderBottomWidth: 1,
    borderColor: '#888888',
    flexDirection: 'row',
  },
  button: {
    height: 44,
    padding: 12,
    color: '#FFFFFF',
    margin: 4,
    overflow: 'hidden',
    borderColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 10,
  },
  open: {
    backgroundColor: '#18C188',
  },
  save: {
    backgroundColor: '#1888C1',
  },
});
