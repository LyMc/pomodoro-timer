import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native'

export default class HomeScreen extends React.Component {
  constructor() {
    super()
    this.state = {
      time: 0,
      timerState: 0,
    }
    this.timerId = 0
  }
  runTimer() {
    if (this.state.time > 0) {
      this.setState({
        time: this.state.time - 1
      })
    } else {
      this.stopTimer()
    }
  }
  setTimer(min) {
    this.stopTimer()
    this.setState({
      time: min * 60,
    })
    this.resumeTimer()
  }
  pauseTimer() {
    clearInterval(this.timerId)
    this.setState({
      timerState: 0,
    })
  }
  resumeTimer() {
    this.timerId = setInterval(this.runTimer.bind(this), 1000)
    this.setState({
      timerState: 1,
    })
  }
  stopTimer() {
    this.pauseTimer()
    this.setState({
      time: 0,
    })
  }
  renderTime() {
    return ('0' + Math.floor(this.state.time / 60)).slice(-2) + ':' + ('0' + this.state.time % 60).slice(-2)
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.timer}>{this.renderTime()}</Text>
          <View style={styles.timerActions}>
            <Button
              title="60"
              color="#ff5722"
              onPress={() => this.setTimer(60)}
            />
            <Button
              title="30"
              color="#ff5722"
              onPress={() => this.setTimer(30)}
            />
            <Button
              title="20"
              color="#ff5722"
              onPress={() => this.setTimer(20)}
            />
            <Button
              title="10"
              color="#ff5722"
              onPress={() => this.setTimer(10)}
            />
            <Button
              title=" 0 "
              color="#ff5722"
              onPress={() => this.stopTimer()}
            />
          </View>
          <Button
            title={this.state.timerState ? 'Pause' : 'Continue'}
            color="#ff5722"
            onPress={() => this.state.timerState ? this.pauseTimer() : this.resumeTimer()}
            disabled={!this.state.time}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#03a9f4',
  },
  timer: {
    fontSize: 100,
    color: '#fff',
  },
  timerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
})
