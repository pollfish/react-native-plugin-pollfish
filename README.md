React Native plugin to allow integration of Pollfish surveys into Android and iOS apps.

Pollfish is a mobile monetization platform delivering surveys instead of ads through mobile apps. Developers get paid per completed surveys through their apps.

<br/>

# Prerequisites

* Android SDK 21 or higher using Google Play Services
* iOS 9.0 or higher
* React Native v0.40 or higher
* CocoaPods v1.10.0 or higher

<br/>

# Quick Guide

* Create Pollfish Developer account, create a new app and grap it's API key
* Install Pollfish plugin and call init function
* Set to Release mode and release in AppStore and Google Play
* Update your app's privacy policy
* Request your account to get verified from the Pollfish Dashboard

<br/>

> **Note:** Apps designed for [Children and Families program](https://play.google.com/about/families/ads-monetization/) should not be using Pollfish SDK, since Pollfish does not collect responses from users less than 16 years old

> **Note:** Pollfish iOS SDK utilizes Apple's Advertising ID (IDFA) to identify and retarget users with Pollfish surveys. As of iOS 14 you should initialize Pollfish React Native plugin in iOS only if the relevant IDFA permission was granted by the user

<br/>

# Installation

To add Pollfish plugin just type: 

Using `yarn`
```bash
yarn add react-native-plugin-pollfish
```

Using `npm`
```bash
npm install react-native-plugin-pollfish
```

And for iOS builds

```bash
cd ios && pod install && cd ..
```

<br/>

# Initialization

## 1. Import `RNPollfish` module

```js
import RNPollfish from 'react-native-plugin-pollfish';
```

<br/>

## 2. Create a `RNPollfish.Builder` instance

The Pollfish plugin must be initialized with one or two api keys depending on which platforms are you targeting. You can retrieve an API key from Pollfish Dashboard when you [sign up](https://www.pollfish.com/signup/publisher) and create a new app.

```js
var builder = new RNPollfish.Builder('ANDROID_API_KEY', 'IOS_API_KEY'); // Android & iOS
```

```js
var builder = new RNPollfish.Builder('ANDROID_API_KEY', null); // Android only
```

```js
var builder = new RNPollfish.Builder(null, 'IOS_API_KEY'); // iOS only
```

### 2.1 Configure Pollfish behaviour (Optional)

You can set several params to control the behaviour of Pollfish survey panel within your app with the use of the `RNPollfish.Builder` instance. Below you can see all the available options. Apart from the constructor all the other methods are optional.

Param               | Description
--------------------|:---------
**`constructor(String, String)`**               | Sets Your Android and iOS API Keys (from step 2)
**`.indicatorPosition(RNPollfish.Position)`**   | Sets the Position where you wish to place the Pollfish indicator. There are six different options RNPollfish.Position.{topLeft, topRight, middleLeft, middleRight, bottomLeft, bottom Right}: 
**`.indicatorPadding(Int)`**                    | Sets the padding from top or bottom depending on the position of the indicator specified before (if used in middle position, padding is calculated from the top).
**`.offerwallMode(Boolean)`**                   | Sets Pollfish to offerwall mode
**`.releaseMode(Boolean)`**                     | Choose Debug or Release Mode
**`.rewardMode(Boolean)`**                      | Init in reward mode (skip Pollfish indicator to show a custom prompt)
**`.requestUUID(String)`**                      | Sets a unique id to identify a user and be passed through server-to-server callbacks
**`.userProperties(Json)`**                     | Send attributes that you receive from your app regarding a user, in order to receive a better fill rate and higher priced surveys. You can see a detailed list of the user attributes you can pass with their keys at the following [link](https://www.pollfish.com/docs/demographic-surveys)
**`.rewardInfo(Json)`**                         | An object holding information regarding the survey completion reward.  If set, `signature` must be calculated in order to receive surveys. See [here](https://www.pollfish.com/docs/api-documentation) in section **`Notes for sig query parameter`**
**`.clickId(String)`**                          | A pass throught param that will be passed back through server-to-server callback
**`.signature(String)`**                        | An optional parameter used to secure the `rewardConversion` and `rewardName` parameters passed on `rewardInfo` `Json` object

<br/>

Example of Pollfish configuration using all the available options

```js
builder.indicatorPosition(RNPollfish.Position.topLeft)
    .indicatorPadding(10)
    .offerwallMode(false)
    .rewardMode(false)
    .releaseMode(false)
    .requestUUID('REQUEST_UUID')
    .userProperties({
        gender: '1',
        education: '1',
        ... 
    })
    .clickId('CLICK_ID')
    .signature('SINGNATURE')
    .rewardInfo({
        rewardName: 'Points',
        rewardConversion: 1.3
    });
```

<br/>

> ### Debug vs Release Mode
>
> You can use Pollfish either in Debug or in Release mode. 
>  
> * **Debug mode** is used to show to the developer how Pollfish will be shown through an app (useful during development and testing).
> * **Release mode** is the mode to be used for a released app (start receiving paid surveys).
> 
> **Note:** Be careful to set the `releaseMode` parameter to `true` when you release your app in a relevant app store!!

<br/>

> ### Reward Mode 
> 
> Setting the `rewardMode` to `false` during initialization enables controlling the behavior of Pollfish in an app from the Pollfish panel. Enabling reward mode ignores Pollfish behavior from Pollfish panel. It always skips showing Pollfish indicator (small button) and always force open Pollfish view to app users. This method is usually used when app developers want to somehow incentivize their users before completing surveys to increase completion rates.

<br/>

## 3. Initialize Pollfish

Last but not least. Build the `Params` object by invoking `.build()` on the `RNPollfish.Builder` instance that you've configured earlier and call `RNPollfish.init(params)` passing the `Params` object as an argument.

```js
var params = builder.build();
RNPollfish.init(params);

// OR

RNPollfish.init(builder.build());
```

<br/>

# Optional Section

In this section we will list several options that can be used to control Pollfish surveys behaviour, how to listen to several notifications or how to be eligible to more targeted (high-paid) surveys. All these steps are optional.

<br/>

## Get notified when a Pollfish survey is received

You can get notified when a Pollfish survey is received. With this notification, you can also get informed about the type of survey that was received, money to be earned if survey gets completed, shown in USD cents and other info around the survey such as LOI and IR.

<br/>

> **Note:** If Pollfish is initialized in offerwall mode then the event parameter will be `undefined`, otherwise it will include info around the received survey.

<br/>

```js
RNPollfish.addEventListener(RNPollfish.PollfishSurveyReceivedListener, (event) => {
    if (event === undefined) {
        console.log("Pollfish Offerwall Received");
    } else {
        console.log(`Pollfish Survey Received - CPA: ${event.surveyCPA}, IR: ${event.surveyIR}, LOI: ${event.surveyLOI}, Class: ${event.surveyClass}, Reward Value: ${event.rewardValue}, Reward Name: ${event.rewardName}, Remaining Completes: ${event.remainingCompletes}`);
    }
});
```

<br/>

## Get notified when a Pollfish survey is completed

You can get notified when a user completed a survey. With this notification, you can also get informed about the type of survey, money earned from that survey in USD cents and other info around the survey such as LOI and IR.

```js
RNPollfish.addEventListener(RNPollfish.PollfishSurveyCompletedListener, (event) => {
    console.log(`Pollfish Survey Completed - CPA: ${event.surveyCPA}, IR: ${event.surveyIR}, LOI: ${event.surveyLOI}, Class: ${event.surveyClass}, Reward Value: ${event.rewardValue}, Reward Name: ${event.rewardName}, Remaining Completes: ${event.remainingCompletes}`);
});
```

<br/>

## Get notified when a user is not eligible for a Pollfish survey

You can get notified when a user is not eligible for a Pollfish survey. In market research monetization, users can get screened out while completing a survey beucase they are not relevant with the audience that the market researcher was looking for. In that case the user not eligible notification will fire and the publisher will make no money from that survey. The user not eligible notification will fire after the surveyReceived event, when the user starts completing the survey.

```js
RNPollfish.addEventListener(RNPollfish.PollfishUserNotEligibleListener, (_) => {
    console.log("Pollfish User Not Eligible");
});
```

<br/>

## Get notified when a Pollfish survey is not available

You can be notified when a Pollfish survey is not available.

```js
RNPollfish.addEventListener(RNPollfish.PollfishSurveyNotAvailableListener, (_) => {
    console.log("Pollfish Survey Not Available");
});
```

<br/>

## Get notified when a user has rejected a Pollfish survey

You can be notified when a user has rejected a Pollfish survey.

```js
RNPollfish.addEventListener(RNPollfish.PollfishUserRejectedSurveyListener, (_) => {
    console.log("Pollfish User Rejected Survey");
});
```

<br/>

## Get notified when a Pollfish survey panel has opened

You can register and get notified when a Pollfish survey panel has opened. Publishers usually use this notification to pause a game until the pollfish panel is closed again.

```js
RNPollfish.addEventListener(RNPollfish.PollfishOpenedListener, (_) => {
    console.log("Pollfish Opened");
});
```

<br/>

## Get notified when a Pollfish survey panel has closed

You can register and get notified when a Pollfish survey panel has closed. Publishers usually use this notification to resume a game that they have previously paused when the Pollfish panel was opened.

```js
RNPollfish.addEventListener(RNPollfish.PollfishClosedListener, (_) => {
    console.log("Pollfish Closed");
});
```

<br/>

## Manually show/hide Pollfish panel

You can manually hide and show Pollfish by calling the functions below, after initialization.

```js
RNPollfish.show();
```

```js
RNPollfish.hide();
```

<br/>

## Check if Pollfish surveys are available on your device

After you initialize Pollfish and a survey is received you can check at any time if the survey is available at the device by calling the following function.

```js
RNPollfish.isPollfishPresent((isPollfishPresent) => {
    console.log(isPollfishPresent ? 'Pollfish is available' : 'Pollfish is not available');
});
```

<br/>

## Check if Pollfish panel is open

You can check at any time if the survey panel is open by calling the following function.

```js
RNPollfish.isPollfishPanelOpen((isPollfishPanelOpen) => {
    console.log(isPollfishPanelOpen ? 'Pollfish panel is open' : 'Pollfish panel is closed');
});
```

<br/>

## More info

You can read more info on how the Native Pollfish SDKs work on Android and iOS or how to set up properly a React Native environment at the following links:

<br/>

[Pollfish React Native Plugin Documentation](https://pollfish.com/docs/react-native)

[Pollfish Android SDK Integration Guide](https://pollfish.com/docs/android)

[Pollfish iOS SDK Integration Guide](https://pollfish.com/docs/ios)

[React Native Starting Guide](https://reactnative.dev/docs/getting-started)
