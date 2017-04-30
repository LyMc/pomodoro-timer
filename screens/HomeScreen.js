import React from 'react'
import Expo from 'expo'
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
  ViewPagerAndroid,
  Slider,
  AsyncStorage,
} from 'react-native'
import DrawerLayout from 'react-native-drawer-layout'
const TOMATO = '🍅'
let WORKTIME = 20
let RELAXTIME = 4

export default class HomeScreen extends React.Component {
  constructor() {
    super()
    this.state = {
      loading: true,
      time: 0,
      timerState: 0,
      relaxTime: 0,
      relaxTimerState: 0,
      workTime: WORKTIME,
      relTime: RELAXTIME,
    }
    this.timerId = 0
    this.relaxTimerId = 0
    this.drawerLayout = null
  }
  componentWillMount() {
    this.getInitialState().done()
    Expo.Notifications.addListener(() => {
      this.setState({
        time: 0,
        timerState: 0,
        relaxTime: 0,
        relaxTimerState: 0,
      })
    })
  }
  saveToStorage = async () => {
    const value = {
      workTime: this.state.workTime,
      relaxTime: this.state.relTime,
      workTimestamp: this.state.time ? new Date().getTime() + this.state.time * 1000 : 0,
      relaxTimestamp: this.state.relaxTime ? new Date().getTime() + this.state.relaxTime * 1000 : 0,
    }
    try {
      await AsyncStorage.setItem('state', JSON.stringify(value))
    } catch (error) {
      console.log(error)
    }
  }
  getInitialState = async () => {
    let value = null
    try {
      value = await AsyncStorage.getItem('state')
      if (value) {
        value = JSON.parse(value)
        let state = {}
        WORKTIME = value.workTime
        RELAXTIME = value.relaxTime
        state.workTime = value.workTime
        state.relTime = value.relaxTime
        state.time = 0
        state.timerState = 0
        state.relaxTime = 0
        state.relaxTimerState = 0
        let page = 0
        if (value.workTimestamp) {
          const workTime = (Math.floor((value.workTimestamp - new Date().getTime()) / 1000) / 60)
          if (workTime > 0) {
            state.time = workTime
            state.timerState = 1
            page = 1
          } else {
            state.relaxTime = value.relaxTime
            state.relaxTimerState = 1
            page = 2
          }
        } else if (value.relaxTimestamp) {
          const relaxTime = (Math.floor((value.relaxTimestamp - (new Date()).getTime()) / 1000) / 60)
          if (relaxTime > 0) {
            state.relaxTime = relaxTime
            state.relaxTimerState = 1
            page = 2
          } else {
            state.time = value.workTime
            state.timerState = 1
            page = 1
          }
        }
        state.loading = false
        this.setState(state, () => this.setCurrentPage(page))
      } else {
        this.setState({
          loading: false,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  setCurrentPage(page) {
    switch(page) {
      case 1:
        this.setTimer(this.state.time)
        this.relaxSetTimer(0)
        break
      case 2:
        this.setTimer(0)
        this.relaxSetTimer(this.state.relaxTime)
        break
      default:
        this.setTimer(0)
        this.relaxSetTimer(0)
    }
    this.pager.setPage(page)
  }
  runTimer() {
    if (this.state.time > 0) {
      this.setState({
        time: this.state.time - 1
      })
    } else {
      this.setState({
        time: 0,
      }, this.pauseTimer(false))
      this.relaxSetTimer(this.state.relTime)
      this.pager.setPage(2)
    }
  }
  setTimer(min) {
    this.pauseTimer()
    this.setState({
      time: min * 60,
    }, () => this.resumeTimer())
  }
  pauseTimer(removeNotification = true) {
    clearInterval(this.timerId)
    this.setState({
      timerState: 0,
    })
    removeNotification && Expo.Notifications.cancelAllScheduledNotificationsAsync()
  }
  resumeTimer() {
    if (this.state.time <= 0) {
      return
    }
    this.timerId = setInterval(this.runTimer.bind(this), 1000)
    this.setState({
      timerState: 1,
    })
    this.saveToStorage().done()
    Expo.Notifications.scheduleLocalNotificationAsync({
      title: 'Ready to relax?',
      body: 'Click to open.',
      android: {
        sound: true,
        vibrate: true,
      }
    }, {
      time: new Date().getTime() + this.state.time * 1000
    })
  }
  renderTime() {
    return ('0' + Math.floor(this.state.time / 60)).slice(-2) + ':' + ('0' + this.state.time % 60).slice(-2)
  }

  relaxRunTimer() {
    if (this.state.relaxTime > 0) {
      this.setState({
        relaxTime: this.state.relaxTime - 1
      })
    } else {
      this.setState({
        relaxTime: 0,
      }, this.relaxPauseTimer(false))
      this.setTimer(this.state.workTime)
      this.pager.setPage(1)
    }
  }
  relaxSetTimer(min) {
    this.relaxPauseTimer()
    this.setState({
      relaxTime: min * 60,
    }, () => this.relaxResumeTimer())
  }
  relaxPauseTimer(removeNotification = true) {
    clearInterval(this.relaxTimerId)
    this.setState({
      relaxTimerState: 0,
    })
    removeNotification && Expo.Notifications.cancelAllScheduledNotificationsAsync()
  }
  relaxResumeTimer() {
    if (this.state.relaxTime === 0) {
      return
    }
    this.relaxTimerId = setInterval(this.relaxRunTimer.bind(this), 1000)
    this.setState({
      relaxTimerState: 1,
    })
    this.saveToStorage().done()
    Expo.Notifications.scheduleLocalNotificationAsync({
      title: 'Ready to work?',
      body: 'Click to open.',
      android: {
        sound: true,
        vibrate: true,
      }
    }, {
      time: new Date().getTime() + this.state.relaxTime * 1000
    })
  }
  relaxRenderTime() {
    return ('0' + Math.floor(this.state.relaxTime / 60)).slice(-2) + ':' + ('0' + this.state.relaxTime % 60).slice(-2)
  }

  renderMenu() {
    return (
      <View
        style={{
          flex: 1,
          padding: 15,
          paddingTop: 50,
          backgroundColor: '#0288d1',
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 50,
          }}
        >{TOMATO}</Text>
        <Text
          style={{
            fontSize: 36,
            color: '#b3e5fc',
            borderBottomColor: '#b3e5fc',
            borderBottomWidth: 2,
            marginBottom: 15,
          }}
        >Pomodoro Timer</Text>
        <View
          style={{
            marginTop: 15,
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              paddingLeft: 15,
              color: '#ffeb3b',
            }}
          >Work time [{ this.state.workTime } min]:</Text>
          <Slider
            maximumTrackTintColor={'#ffeb3b'}
            thumbTintColor={'#ffeb3b'}
            value={ WORKTIME }
            maximumValue={ 60 }
            minimumValue={ 1 }
            step={ 1 }
            onValueChange={ time => this.setState({
              workTime: time
            }) }
          />
        </View>
        <View
          style={{
            marginTop: 15,
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              paddingLeft: 15,
              color: '#ffeb3b',
            }}
          >Relax time [{ this.state.relTime } min]:</Text>
          <Slider
            maximumTrackTintColor={'#ffeb3b'}
            thumbTintColor={'#ffeb3b'}
            value={ RELAXTIME }
            maximumValue={ 10 }
            minimumValue={ 1 }
            step={ 1 }
            onValueChange={ time => this.setState({
              relTime: time
            }) }
          />
        </View>
        <Text
          onPress={() => Linking.openURL('https://cirillocompany.de/pages/pomodoro-technique')}
          style={{
            marginTop: 50,
            fontSize: 20,
            color: '#b3e5fc',
            textDecorationColor: '#b3e5fc',
            textDecorationLine: 'underline',
          }}
        >About Pomodoro Technique</Text>
      </View>
    )
  }

  renderScreen() {
    return (
      <View style={{ flex: 1 }}>
        <DrawerLayout
          ref={ view => this.drawerLayout = view }
          drawerWidth={Dimensions.get('window').width - 50}
          renderNavigationView={this.renderMenu.bind(this)}
        >
          <TouchableOpacity
            hitSlop={{ top: 15, left: 15, right: 15, bottom: 15 }}
            onPress={ () => this.drawerLayout.openDrawer() }
            style={{
              position: 'absolute',
              top: 45,
              left: 15,
              zIndex: 100,
            }}>
            <Image
              style={{
                width: 25,
                height: 17,
              }}
              source={{
                uri: 'https://s3.amazonaws.com/pomodoro-exp/menu-button.png',
              }}
            />
          </TouchableOpacity>
          <ViewPagerAndroid
            ref={ pager => this.pager = pager }
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={event => {
              switch(event.nativeEvent.position) {
                case 1:
                  this.setTimer(this.state.workTime)
                  this.relaxSetTimer(0)
                  break
                case 2:
                  this.setTimer(0)
                  this.relaxSetTimer(this.state.relTime)
                  break
                default:
                  this.setTimer(0)
                  this.relaxSetTimer(0)
              }
            }}
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <TouchableOpacity
                activeOpacity={ 0.9 }
                onPress={() => {
                  this.pager.setPage(1)
                  this.setTimer(this.state.workTime)
                  this.relaxSetTimer(0)
                }}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#3f51b5',
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    color: '#fff',
                    paddingBottom: 15,
                    textAlign: 'center',
                  }}
                >1. Set a goal</Text>
                <Text>Tap to Start</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              flex: 1,
            }}>
              <TouchableOpacity
                activeOpacity={ 0.9 }
                onPress={() => this.state.timerState ? this.pauseTimer() : this.resumeTimer()}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#03a9f4',
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >2. Work</Text>
                <Text style={styles.timer}>{this.renderTime()}</Text>
                <Text
                  style={{
                    textAlign: 'center',
                  }}
                >Tap to {this.state.timerState ? 'Stop' : 'Continue'}</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <TouchableOpacity
                activeOpacity={ 0.9 }
                onPress={() => this.state.relaxTimerState ? this.relaxPauseTimer() : this.relaxResumeTimer()}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#2e7d32',
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    color: '#fff',
                    paddingBottom: 15,
                    textAlign: 'center',
                  }}
                >3. Relax</Text>
                <Text style={styles.timer}>{this.relaxRenderTime()}</Text>
                <Text
                  style={{
                    textAlign: 'center',
                  }}
                >Tap to {this.state.relaxTimerState ? 'Stop' : 'Continue'}</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <TouchableOpacity
                activeOpacity={ 0.9 }
                onPress={() => {
                  this.pager.setPage(0)
                  this.setTimer(0)
                  this.relaxSetTimer(0)
                }}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#1b5e20',
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    color: '#fff',
                    paddingBottom: 15,
                    textAlign: 'center',
                  }}
                >4. Achieve your goal</Text>
                <Text>Tap to start again</Text>
              </TouchableOpacity>
            </View>
          </ViewPagerAndroid>
        </DrawerLayout>
      </View>
    )
  }
  render() {
    return this.state.loading
      ? <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      ><Text>Loading...</Text></View>
      : this.renderScreen()
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
