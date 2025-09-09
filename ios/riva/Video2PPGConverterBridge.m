#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Video2PPGConverter, NSObject)

RCT_EXTERN_METHOD(initAlgorithm:(nonnull NSNumber *)width
                  height:(nonnull NSNumber *)height
                  phoneModel:(nonnull NSNumber *)phoneModel
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(convertFrameiOS:(nonnull NSNumber *)timestamp
                  yData:(nonnull NSString *)yData
                  uvData:(nonnull NSString *)uvData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
