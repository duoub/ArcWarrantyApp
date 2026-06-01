//
//  LegacyInterop.h
//  Wrapper Objective-C thuần (không C++) để Swift gọi được qua bridging header.
//  Phần C++ của Fabric được cô lập trong LegacyInterop.mm.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface LegacyInterop : NSObject

/// Đăng ký các legacy view manager (vd: BVLinearGradient) với
/// New Architecture interop layer để render được dưới Fabric.
+ (void)registerLegacyViewManagers;

@end

NS_ASSUME_NONNULL_END
