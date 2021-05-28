
package com.pollfish;

import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.pollfish.builder.Params;
import com.pollfish.builder.Platform;
import com.pollfish.builder.Position;
import com.pollfish.builder.UserProperties;
import com.pollfish.callback.PollfishClosedListener;
import com.pollfish.callback.PollfishOpenedListener;
import com.pollfish.callback.PollfishSurveyCompletedListener;
import com.pollfish.callback.PollfishSurveyNotAvailableListener;
import com.pollfish.callback.PollfishSurveyReceivedListener;
import com.pollfish.callback.PollfishUserNotEligibleListener;
import com.pollfish.callback.PollfishUserRejectedSurveyListener;
import com.pollfish.callback.SurveyInfo;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class RNPollfishModule extends ReactContextBaseJavaModule implements
        PollfishSurveyCompletedListener,
        PollfishSurveyReceivedListener,
        PollfishUserRejectedSurveyListener,
        PollfishUserNotEligibleListener,
        PollfishSurveyNotAvailableListener,
        PollfishClosedListener,
        PollfishOpenedListener {

    private final ReactApplicationContext reactContext;

    private static final String TAG = "Pollfish";

    public RNPollfishModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNPollfish";
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void init(
            String apiKey,
            int position,
            int padding,
            boolean offerwallMode,
            boolean releaseMode,
            boolean rewardMode,
            String requestUUID,
            ReadableMap userProperties
    ) {
        if (getCurrentActivity() == null) {
            Log.w(TAG, "Pollfish initialization failed because getCurrentActivity == null");
        }

        Params.Builder params = new Params.Builder(apiKey)
                .indicatorPosition(getPosition(position))
                .indicatorPadding(padding)
                .offerwallMode(offerwallMode)
                .releaseMode(releaseMode)
                .rewardMode(rewardMode)
                .pollfishSurveyReceivedListener(this)
                .pollfishSurveyCompletedListener(this)
                .pollfishSurveyNotAvailableListener(this)
                .pollfishUserNotEligibleListener(this)
                .pollfishUserRejectedSurveyListener(this)
                .pollfishOpenedListener(this)
                .pollfishClosedListener(this)
                .platform(Platform.REACT_NATIVE);

        if (requestUUID != null && !requestUUID.isEmpty()) {
            params.requestUUID(requestUUID);
        }

        if (userProperties != null) {
            UserProperties.Builder userPropertiesBuilder = new UserProperties.Builder();

            ReadableMapKeySetIterator iterator = userProperties.keySetIterator();

            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();

                try {
                    String value = userProperties.getString(key);

                    if (value != null) {
                        userPropertiesBuilder.customAttribute(key, value);
                    }
                } catch (Exception exception) {
                    Log.d(TAG, "Wrong value type for key `" + key + "`");
                }
            }

            params.userProperties(userPropertiesBuilder.build());
        }


        Pollfish.initWith(getCurrentActivity(), params.build());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void show() {
        Pollfish.show();
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void hide() {
        Pollfish.hide();
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void isPollfishPresent(Callback callback) {
        callback.invoke(Pollfish.isPollfishPresent());
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void isPollfishPanelOpen(Callback callback) {
        callback.invoke(Pollfish.isPollfishPanelOpen());
    }

    @Override
    public void onPollfishClosed() {
        sendEvent("onPollfishClosed", null);
    }

    @Override
    public void onPollfishOpened() {
        sendEvent("onPollfishOpened", null);
    }

    @Override
    public void onPollfishSurveyCompleted(@NotNull SurveyInfo surveyInfo) {
        sendEvent("onPollfishSurveyCompleted", getSurveyInfoMap(surveyInfo));
    }

    @Override
    public void onPollfishSurveyNotAvailable() {
        sendEvent("onPollfishSurveyNotAvailable", null);
    }

    @Override
    public void onPollfishSurveyReceived(@Nullable SurveyInfo surveyInfo) {
        WritableMap payload = null;

        if (surveyInfo != null) {
            payload = getSurveyInfoMap(surveyInfo);
        }

        sendEvent("onPollfishSurveyReceived", payload);
    }

    private WritableMap getSurveyInfoMap(SurveyInfo surveyInfo) {
        WritableMap payload = new WritableNativeMap();

        if (surveyInfo.getRewardName() != null && !surveyInfo.getRewardName().isEmpty())
            payload.putString("rewardName", surveyInfo.getRewardName());

        if (surveyInfo.getRewardValue() != null)
            payload.putInt("rewardValue", surveyInfo.getRewardValue());

        if (surveyInfo.getSurveyClass() != null && !surveyInfo.getSurveyClass().isEmpty())
            payload.putString("surveyClass", surveyInfo.getSurveyClass());

        if (surveyInfo.getSurveyCPA() != null)
            payload.putInt("surveyCPA", surveyInfo.getSurveyCPA());

        if (surveyInfo.getSurveyIR() != null)
            payload.putInt("surveyIR", surveyInfo.getSurveyIR());

        if (surveyInfo.getSurveyLOI() != null)
            payload.putInt("surveyLOI", surveyInfo.getSurveyLOI());

        if (surveyInfo.getRemainingCompletes() != null)
            payload.putInt("remainingCompletes", surveyInfo.getRemainingCompletes());

        return payload;
    }

    @Override
    public void onUserNotEligible() {
        sendEvent("onUserNotEligible", null);
    }

    @Override
    public void onUserRejectedSurvey() {
        sendEvent("onUserRejectedSurvey", null);
    }

    private void sendEvent(String eventName, WritableMap payload) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, payload);
    }

    private Position getPosition(int intValue) {
        switch (intValue) {
            case 1:
                return Position.TOP_RIGHT;
            case 2:
                return Position.MIDDLE_LEFT;
            case 3:
                return Position.MIDDLE_RIGHT;
            case 4:
                return Position.BOTTOM_LEFT;
            case 5:
                return Position.BOTTOM_RIGHT;
            default:
                return Position.TOP_LEFT;
        }
    }

}

