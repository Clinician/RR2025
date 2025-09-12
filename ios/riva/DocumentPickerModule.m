#import "DocumentPickerModule.h"
#import <React/RCTUtils.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

@interface DocumentPickerModule () <UIDocumentPickerDelegate>
@property (nonatomic, strong) RCTPromiseResolveBlock resolve;
@property (nonatomic, strong) RCTPromiseRejectBlock reject;
@property (nonatomic, strong) NSString *tempFilePath;
@end

@implementation DocumentPickerModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(saveFileToiCloudDrive:(NSString *)filename
                  content:(NSString *)content
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        self.resolve = resolve;
        self.reject = reject;
        
        // Create temporary file
        NSString *tempDir = NSTemporaryDirectory();
        NSString *tempFilePath = [tempDir stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.json", filename]];
        self.tempFilePath = tempFilePath;
        
        NSError *error;
        BOOL success = [content writeToFile:tempFilePath
                                 atomically:YES
                                   encoding:NSUTF8StringEncoding
                                      error:&error];
        
        if (!success) {
            reject(@"FILE_WRITE_ERROR", @"Failed to create temporary file", error);
            return;
        }
        
        // Create document picker for export
        NSURL *fileURL = [NSURL fileURLWithPath:tempFilePath];
        UIDocumentPickerViewController *documentPicker = [[UIDocumentPickerViewController alloc] 
                                                         initForExportingURLs:@[fileURL]
                                                         asCopy:YES];
        
        documentPicker.delegate = self;
        documentPicker.modalPresentationStyle = UIModalPresentationFormSheet;
        
        // Find the topmost view controller to present from
        UIViewController *topViewController = [self topMostViewController];
        
        // If there's already a modal presented, dismiss it first
        if (topViewController.presentedViewController) {
            [topViewController dismissViewControllerAnimated:YES completion:^{
                // Present document picker after dismissing existing modal
                UIViewController *newTopViewController = [self topMostViewController];
                [newTopViewController presentViewController:documentPicker animated:YES completion:nil];
            }];
        } else {
            [topViewController presentViewController:documentPicker animated:YES completion:nil];
        }
    });
}

#pragma mark - UIDocumentPickerDelegate

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls {
    // File was successfully saved
    if (self.resolve) {
        self.resolve(@{
            @"success": @YES,
            @"filePath": urls.firstObject.path ?: @"",
            @"message": @"File saved successfully to selected location"
        });
    }
    
    // Clean up temporary file
    [self cleanupTempFile];
}

- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller {
    // User cancelled the picker
    if (self.reject) {
        self.reject(@"USER_CANCELLED", @"User cancelled file save operation", nil);
    }
    
    // Clean up temporary file
    [self cleanupTempFile];
}

- (void)cleanupTempFile {
    if (self.tempFilePath) {
        [[NSFileManager defaultManager] removeItemAtPath:self.tempFilePath error:nil];
        self.tempFilePath = nil;
    }
    
    self.resolve = nil;
    self.reject = nil;
}

- (UIViewController *)topMostViewController {
    UIViewController *rootViewController = RCTKeyWindow().rootViewController;
    return [self topMostViewControllerFromViewController:rootViewController];
}

- (UIViewController *)topMostViewControllerFromViewController:(UIViewController *)viewController {
    if (viewController.presentedViewController) {
        return [self topMostViewControllerFromViewController:viewController.presentedViewController];
    }
    
    if ([viewController isKindOfClass:[UINavigationController class]]) {
        UINavigationController *navigationController = (UINavigationController *)viewController;
        return [self topMostViewControllerFromViewController:navigationController.topViewController];
    }
    
    if ([viewController isKindOfClass:[UITabBarController class]]) {
        UITabBarController *tabBarController = (UITabBarController *)viewController;
        return [self topMostViewControllerFromViewController:tabBarController.selectedViewController];
    }
    
    return viewController;
}

@end
