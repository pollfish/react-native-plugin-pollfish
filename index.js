import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPollfish } = NativeModules;
const PollfishEventEmitter = new NativeEventEmitter(RNPollfish);

const PollfishClosedListener = "onPollfishClosed";
const PollfishOpenedListener = "onPollfishOpened";
const PollfishSurveyNotAvailableListener = "onPollfishSurveyNotAvailable";
const PollfishUserRejectedSurveyListener = "onUserRejectedSurvey";
const PollfishSurveyReceivedListener = "onPollfishSurveyReceived";
const PollfishSurveyCompletedListener = "onPollfishSurveyCompleted";
const PollfishUserNotEligibleListener = "onUserNotEligible";

const eventHandlers = {
    onPollfishClosed: new Map(),
    onPollfishOpened: new Map(),
    onPollfishSurveyNotAvailable: new Map(),
    onUserRejectedSurvey: new Map(),
    onUserNotEligible: new Map(),
    onPollfishSurveyReceived: new Map(),
    onPollfishSurveyCompleted: new Map()
};

const removeAllListeners = () => {
    PollfishEventEmitter.removeAllListeners(PollfishClosedListener);
    PollfishEventEmitter.removeAllListeners(PollfishOpenedListener);
    PollfishEventEmitter.removeAllListeners(PollfishSurveyNotAvailableListener);
    PollfishEventEmitter.removeAllListeners(PollfishUserRejectedSurveyListener);
    PollfishEventEmitter.removeAllListeners(PollfishUserNotEligibleListener);
    PollfishEventEmitter.removeAllListeners(PollfishSurveyReceivedListener);
    PollfishEventEmitter.removeAllListeners(PollfishSurveyCompletedListener);
};

const addEventListener = (type, handler) => {
    switch (type) {
        case PollfishClosedListener:
        case PollfishOpenedListener:
        case PollfishSurveyNotAvailableListener:
        case PollfishUserRejectedSurveyListener:
        case PollfishUserNotEligibleListener:
        case PollfishSurveyReceivedListener:
        case PollfishSurveyCompletedListener:
            eventHandlers[type].set(handler, PollfishEventEmitter.addListener(type, handler));
            break;
        default:
          console.log(`Event with type ${type} does not exist.`);
    }
}

const removeEventListener = (type, handler) => {
    if (!eventHandlers[type].has(handler)) {
      return;
    }

    eventHandlers[type].get(handler).remove();
    eventHandlers[type].delete(handler);
};

const Position = {
    topLeft: 0,
    topRight: 1,
    middleLeft: 2,
    middleRight: 3,
    bottomLeft: 4,
    bottomRight: 5
}

class Builder {

    constructor(apiKey) {
        this._apiKey = apiKey;
        this._indicatorPosition = Position.topLeft;
        this._indicatorPadding = 8;
        this._offerwallMode = false;
        this._releaseMode = false;
        this._rewardMode = false;
        this._requestUUID = null;
        this._userProperties = null;
    }

    indicatorPosition(indicatorPosition) {
        this._indicatorPosition = indicatorPosition;
        return this;
    }

    indicatorPadding(indicatorPadding) {
        this._indicatorPadding = indicatorPadding;
        return this;
    }

    offerwallMode(offerwallMode) {
        this._offerwallMode = offerwallMode;
        return this;
    }

    releaseMode(releaseMode) {
        this._releaseMode = releaseMode;
        return this;
    }

    rewardMode(rewardMode) {
        this._rewardMode = rewardMode;
        return this;
    }

    requestUUID(requestUUID) {
        this._requestUUID = requestUUID;
        return this;
    }

    userProperties(userProperties) {
        this._userProperties = userProperties;
        return this;
    }

    build() {
        return {
            apiKey: this.apiKey,
            indicatorPosition: this._indicatorPosition,
            indicatorPadding: this._indicatorPadding,
            offerwallMode: this._offerwallMode,
            releaseMode: this._releaseMode,
            rewardMode: this._rewardMode,
            requestUUID: this._requestUUID,
            userProperties: this._userProperties
        };
    }
}

module.exports = {
    ...RNPollfish,
    Position,
    Builder,
    PollfishClosedListener,
    PollfishOpenedListener,
    PollfishSurveyReceivedListener,
    PollfishSurveyCompletedListener,
    PollfishSurveyNotAvailableListener,
    PollfishUserNotEligibleListener,
    PollfishUserRejectedSurveyListener,
    init: (params) => RNPollfish.init(params._apiKey, params._indicatorPosition, params._indicatorPadding, params._offerwallMode, params._releaseMode, params._rewardMode, params._requestUUID, params._userProperties),
    show: () => RNPollfish.show(),
    hide: () => RNPollfish.hide(),
    isPollfishPanelOpen: (func) => RNPollfish.isPollfishPanelOpen(func),
    isPollfishPresent: (func) => RNPollfish.isPollfishPresent(func),
    removeAllListeners,
    removeEventListener,
    addEventListener
};


