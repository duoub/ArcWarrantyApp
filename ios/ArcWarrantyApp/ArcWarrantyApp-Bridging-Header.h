//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

// Cho phép dùng view manager cũ (BVLinearGradient / react-native-linear-gradient)
// dưới New Architecture thông qua legacy interop layer.
// Dùng wrapper ObjC thuần để tránh kéo header C++ của Fabric vào bridging header.
#import "LegacyInterop.h"
