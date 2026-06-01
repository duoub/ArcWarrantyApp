//
//  LegacyInterop.mm
//  Objective-C++ — include header Fabric (C++) ở đây, tách khỏi bridging header.
//

#import "LegacyInterop.h"
#import <React/RCTLegacyViewManagerInteropComponentView.h>

@implementation LegacyInterop

+ (void)registerLegacyViewManagers {
  [RCTLegacyViewManagerInteropComponentView supportLegacyViewManagerWithName:@"BVLinearGradient"];
}

@end
