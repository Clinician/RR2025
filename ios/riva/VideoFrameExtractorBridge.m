#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoFrameExtractor, NSObject)

RCT_EXTERN_METHOD(getVideoMetadata:(NSString *)videoPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(extractFrame:(NSString *)videoPath
                  frameIndex:(NSNumber *)frameIndex
                  totalFrames:(NSNumber *)totalFrames
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(extractFrames:(NSString *)videoPath
                  frameIndices:(NSArray<NSNumber *> *)frameIndices
                  totalFrames:(NSNumber *)totalFrames
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
