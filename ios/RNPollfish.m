
#import "RNPollfish.h"
@import Pollfish;

@implementation RNPollfish
{
    bool hasListeners;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE();

#pragma mark - Exported Methods

RCT_EXPORT_METHOD(init: (NSString *) androidApiKey
                  iOSApiKey:(NSString *) iOSApiKey
                  position:(int) position
                  padding:(int) padding
                  offerwallMode:(BOOL) offerwallMode
                  releaseMode:(BOOL) releaseMode
                  rewardMode:(BOOL) rewardMode
                  requestUUID:(NSString *) requestUUID
                  userProperties:(NSDictionary *) userProperties
                  rewardInfo:(NSDictionary *) rewardInfoDict
                  clickId:(NSString *) clickId
                  signature:(NSString *) signature)
{
    if (iOSApiKey == [NSNull null]) {
        return;
    }

    PollfishParams * params = [[PollfishParams alloc] init:iOSApiKey];
    [params indicatorPosition:position];
    [params indicatorPadding:padding];
    [params offerwallMode:offerwallMode];
    [params releaseMode:releaseMode];
    [params rewardMode:rewardMode];
    [params platform:PlatformReactNative];
    
    if (requestUUID != [NSNull null]) {
        [params requestUUID:requestUUID];
    }
    
    if (clickId != [NSNull null]) {
        [params clickId:clickId];
    }
    
    if (signature != [NSNull null]) {
        [params signature:signature];
    }
    
    if (userProperties != [NSNull null]) {
        UserProperties *userPropertiesBuilder = [[UserProperties alloc] init];
        
        [userProperties enumerateKeysAndObjectsUsingBlock:^(id key, id object, BOOL *stop) {
            [userPropertiesBuilder customAttribute:object forKey:key];
        }];
        
        [params userProperties:userPropertiesBuilder];
    }
    
    if (rewardInfoDict != [NSNull null]) {
        RewardInfo *rewardInfo = [[RewardInfo alloc] initWithRewardName: [rewardInfoDict valueForKey:@"rewardName"]
                                                       rewardConversion: [[rewardInfoDict valueForKey:@"rewardConversion"] doubleValue]];
        [params rewardInfo:rewardInfo];
    }
    
    
    [Pollfish initWith:params delegate:self];
}

RCT_EXPORT_METHOD(show)
{
    [Pollfish show];
}

RCT_EXPORT_METHOD(hide)
{
    [Pollfish hide];
}

-(void)startObserving
{
  hasListeners = YES;
}

-(void)stopObserving
{
  hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[
           @"onPollfishClosed",
           @"onPollfishOpened",
           @"onPollfishSurveyCompleted",
           @"onPollfishSurveyNotAvailable",
           @"onPollfishSurveyReceived",
           @"onUserNotEligible",
           @"onUserRejectedSurvey"
           ];
}

RCT_EXPORT_METHOD(isPollfishPresent: (RCTResponseSenderBlock)callback)
{
    NSNumber *isPollfishPresent = [NSNumber numberWithBool:[Pollfish isPollfishPresent]];
    callback(@[isPollfishPresent]);
}

RCT_EXPORT_METHOD(isPollfishPanelOpen: (RCTResponseSenderBlock)callback)
{
    NSNumber *isPollfishPanelOpen = [NSNumber numberWithBool:[Pollfish isPollfishPanelOpen]];
    callback(@[isPollfishPanelOpen]);
}

- (void)pollfishClosed
{
    [self emitEvent:@"onPollfishClosed" payload:nil];
}

- (void)pollfishOpened
{
    [self emitEvent:@"onPollfishOpened" payload:nil];
}

- (void)pollfishSurveyNotAvailable
{
    [self emitEvent:@"onPollfishSurveyNotAvailable" payload:nil];
}

- (void)pollfishUserRejectedSurvey
{
    [self emitEvent:@"onUserRejectedSurvey" payload:nil];
}

- (void)pollfishUserNotEligible
{
    [self emitEvent:@"onUserNotEligible" payload:nil];
}

- (void)pollfishSurveyReceivedWithSurveyInfo:(SurveyInfo *)surveyInfo
{
    if (surveyInfo == nil) {
        [self emitEvent:@"onPollfishSurveyReceived" payload:nil];
    } else {
        NSMutableDictionary * infoDict = [self surveyInfoDictionaryFrom:surveyInfo];
        
        [self emitEvent:@"onPollfishSurveyReceived" payload:infoDict];
    }
    
}

- (void)pollfishSurveyCompletedWithSurveyInfo:(SurveyInfo *)surveyInfo
{
    NSMutableDictionary * infoDict = [self surveyInfoDictionaryFrom:surveyInfo];
    
    [self emitEvent:@"onPollfishSurveyCompleted" payload:infoDict];
}

- (NSMutableDictionary *) surveyInfoDictionaryFrom:(SurveyInfo *) surveyInfo
{
    NSMutableDictionary * infoDict = [[NSMutableDictionary alloc] init];
    
    if (surveyInfo.surveyClass != nil) {
        [infoDict setObject:surveyInfo.surveyClass forKey:@"surveyClass"];
    }
    
    if (surveyInfo.cpa != nil) {
        [infoDict setObject:surveyInfo.cpa forKey:@"surveyCPA"];
    }
    
    if (surveyInfo.loi != nil) {
        [infoDict setObject:surveyInfo.loi forKey:@"surveyLOI"];
    }
    
    if (surveyInfo.ir != nil) {
        [infoDict setObject:surveyInfo.ir forKey:@"surveyIR"];
    }
    
    if (surveyInfo.rewardName != nil) {
        [infoDict setObject:surveyInfo.rewardName forKey:@"rewardName"];
    }
    
    if (surveyInfo.rewardValue != nil) {
        [infoDict setObject:surveyInfo.rewardValue forKey:@"rewardValue"];
    }
    
    if (surveyInfo.remainingCompletes != nil) {
        [infoDict setObject:surveyInfo.remainingCompletes forKey:@"remainingCompletes"];
    }
    
    return infoDict;
}

- (void)emitEvent:(NSString *) eventName payload: (id) payload
{
    if (hasListeners) {
        [self sendEventWithName:eventName body:payload];
    }
}

@end
  
