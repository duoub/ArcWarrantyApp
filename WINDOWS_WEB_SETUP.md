# Hướng dẫn chạy ứng dụng React Native trên Web (Windows)

## Tổng quan

Hướng dẫn này giúp bạn thiết lập và chạy ứng dụng React Native Akito Warranty trên trình duyệt web (Chrome, Edge, Firefox) trên máy Windows sau khi clone code từ Git.

## Yêu cầu hệ thống

- Windows 10 hoặc cao hơn
- Node.js >= 20 (LTS)
- Git
- Trình duyệt web hiện đại (Chrome, Edge, Firefox)
- Editor: VS Code (khuyến nghị)

## Bước 1: Cài đặt môi trường cơ bản

### 1.1. Cài đặt Node.js
1. Tải Node.js LTS (version 20 trở lên) từ: https://nodejs.org/
2. Chạy file cài đặt và làm theo hướng dẫn
3. Kiểm tra cài đặt bằng cách mở Command Prompt hoặc PowerShell:
   ```bash
   node --version
   npm --version
   ```
   Kết quả mong đợi:
   ```
   v20.x.x
   10.x.x
   ```

### 1.2. Cài đặt Git
1. Tải Git từ: https://git-scm.com/download/win
2. Cài đặt với các tùy chọn mặc định
3. Kiểm tra:
   ```bash
   git --version
   ```

### 1.3. Cài đặt VS Code (Tùy chọn nhưng khuyến nghị)
1. Tải VS Code từ: https://code.visualstudio.com/
2. Cài đặt các extension hữu ích:
   - ES7+ React/Redux/React-Native snippets
   - ESLint
   - Prettier
   - TypeScript

## Bước 2: Clone code từ Git

1. Mở Command Prompt, PowerShell hoặc Git Bash
2. Di chuyển đến thư mục muốn lưu code:
   ```bash
   cd C:\Users\<YourUsername>\Projects
   ```

3. Clone repository:
   ```bash
   git clone <git-repository-url>
   cd app-bao-hanh\AkitoWarrantyApp
   ```

## Bước 3: Cài đặt dependencies cơ bản

1. Cài đặt các Node modules hiện có:
   ```bash
   npm install
   ```

2. Nếu gặp lỗi, thử xóa cache và cài lại:
   ```bash
   npm cache clean --force
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   ```

## Bước 4: Cài đặt dependencies cho React Native Web

### 4.1. Cài đặt React Native Web và React DOM
```bash
npm install react-native-web react-dom
```

### 4.2. Cài đặt Webpack và các dependencies liên quan
```bash
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader
```

### 4.3. Cài đặt các loader bổ sung
```bash
npm install --save-dev style-loader css-loader file-loader url-loader @svgr/webpack
```

### 4.4. Cài đặt Babel plugins cho web
```bash
npm install --save-dev @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread
```

## Bước 5: Cấu hình Webpack

### 5.1. Tạo file webpack.config.js

Tạo file `webpack.config.js` trong thư mục root của project:

```bash
type nul > webpack.config.js
```

Sau đó mở file và thêm nội dung sau:

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.web.js', '.js', '.web.jsx', '.jsx', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-vector-icons': 'react-native-vector-icons/dist',
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native-.*|@react-native.*|@react-navigation.*)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
```

## Bước 6: Tạo file HTML template

### 6.1. Tạo thư mục public
```bash
mkdir public
```

### 6.2. Tạo file index.html

Tạo file `public/index.html`:

```bash
type nul > public\index.html
```

Thêm nội dung:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#000000">
    <meta name="description" content="Akito Warranty App - Ứng dụng quản lý bảo hành">
    <title>Akito Warranty App</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow: hidden;
        }

        #root {
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
        }

        /* Loading spinner */
        .app-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="app-loading">
            <div class="spinner"></div>
            <p>Đang tải ứng dụng...</p>
        </div>
    </div>
</body>
</html>
```

## Bước 7: Tạo file entry point cho web

Tạo file `index.web.js` trong thư mục root:

```bash
type nul > index.web.js
```

Thêm nội dung:

```javascript
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Run the app
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
```

## Bước 8: Cấu hình Babel

### 8.1. Cập nhật file babel.config.js

Mở file `babel.config.js` và cập nhật:

```javascript
module.exports = {
  presets: [
    '@react-native/babel-preset',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
};
```

## Bước 9: Cập nhật package.json

Mở file `package.json` và thêm script cho web:

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "start": "react-native start",
    "test": "jest",
    "web": "webpack serve --mode development",
    "build:web": "webpack --mode production"
  }
}
```

## Bước 10: Xử lý các module không tương thích với web

### 10.1. Tạo file polyfill cho các module native

Một số module React Native không hoạt động trên web. Tạo thư mục `src/polyfills`:

```bash
mkdir src\polyfills
```

### 10.2. Tạo file mock cho react-native-vector-icons

Tạo `src/polyfills/react-native-vector-icons.web.js`:

```javascript
import React from 'react';
import { Text } from 'react-native';

// Mock component for web
const Icon = ({ name, size, color, style, ...props }) => {
  return (
    <Text style={[{ fontSize: size, color }, style]} {...props}>
      ⬤
    </Text>
  );
};

export default Icon;
```

### 10.3. Tạo mock cho các module camera/image picker

Các module như `react-native-vision-camera` và `react-native-image-picker` không hoạt động trên web. Bạn cần tạo web alternatives hoặc disable chúng trong web build.

## Bước 11: Chạy ứng dụng trên Web

### 11.1. Khởi động development server

```bash
npm run web
```

Lệnh này sẽ:
- Build ứng dụng với Webpack
- Khởi động development server tại http://localhost:3000
- Tự động mở trình duyệt
- Enable hot reload (tự động reload khi có thay đổi code)

### 11.2. Truy cập ứng dụng

- Ứng dụng sẽ tự động mở trong trình duyệt mặc định
- Hoặc bạn có thể mở thủ công: http://localhost:3000
- Để xem trên thiết bị khác trong cùng mạng: http://<IP-máy-tính>:3000

## Bước 12: Build production cho web

Khi muốn build version production để deploy:

```bash
npm run build:web
```

File build sẽ được tạo trong thư mục `dist/`. Bạn có thể deploy thư mục này lên:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting
- Bất kỳ web server nào

## Xử lý sự cố thường gặp

### Lỗi: "Module not found" cho react-native modules

**Nguyên nhân**: Một số module React Native không có version web

**Giải pháp**:
1. Tạo file `.web.js` để override module cho web
2. Hoặc cài đặt alternative package cho web
3. Hoặc mock module trong webpack config

### Lỗi: "Cannot resolve 'react-native-vector-icons'"

**Giải pháp**: Cài đặt web fonts cho icons:

```bash
npm install react-native-vector-icons
```

Sau đó import fonts trong `public/index.html`:
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

### Lỗi: AsyncStorage không hoạt động

**Giải pháp**: Sử dụng localStorage wrapper:

```bash
npm install @react-native-async-storage/async-storage
```

Module này đã hỗ trợ web sẵn.

### Lỗi: Camera/Image Picker không hoạt động

**Giải pháp**: Sử dụng HTML5 File API cho web:

```javascript
// Trong component web
const pickImage = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    // Xử lý file
  };
  input.click();
};
```

### Lỗi: Port 3000 đã được sử dụng

**Giải pháp**: Thay đổi port trong webpack.config.js:
```javascript
devServer: {
  port: 3001, // Thay đổi port
}
```

### Lỗi: Webpack compilation failed

**Giải pháp**:
```bash
# Xóa cache
rmdir /s /q node_modules\.cache
rmdir /s /q dist

# Build lại
npm run web
```

### Lỗi: "Cannot find module '@react-native/babel-preset'"

**Giải pháp**:
```bash
npm install --save-dev @react-native/babel-preset @babel/preset-env @babel/preset-react @babel/preset-typescript
```

## Tối ưu hóa cho Web

### Responsive Design

Thêm media queries để responsive trên các kích thước màn hình:

```javascript
import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;
```

### PWA (Progressive Web App)

Để biến ứng dụng thành PWA, thêm file `public/manifest.json`:

```json
{
  "short_name": "Akito Warranty",
  "name": "Akito Warranty App",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

Và thêm vào `index.html`:
```html
<link rel="manifest" href="%PUBLIC_URL%/manifest.json">
```

## Debugging trên Web

### Chrome DevTools

1. Mở DevTools: `F12` hoặc `Ctrl + Shift + I`
2. Tab Console: Xem logs và errors
3. Tab Network: Monitor API calls
4. Tab Application: Xem Local Storage, Session Storage
5. Tab Sources: Debug với breakpoints

### React DevTools

Cài đặt extension:
- Chrome: https://chrome.google.com/webstore (tìm "React Developer Tools")
- Edge: https://microsoftedge.microsoft.com/addons (tìm "React Developer Tools")

## Cấu trúc Project sau khi setup Web

```
AkitoWarrantyApp/
├── android/                    # Android native code
├── ios/                        # iOS native code
├── src/                        # Source code React Native
│   ├── components/
│   ├── screens/
│   ├── store/
│   └── polyfills/             # Web polyfills (MỚI)
├── public/                     # Web static files (MỚI)
│   └── index.html             # HTML template (MỚI)
├── dist/                       # Production build output (MỚI)
├── webpack.config.js          # Webpack configuration (MỚI)
├── index.web.js               # Web entry point (MỚI)
├── App.tsx                    # App component
├── package.json               # Dependencies
└── babel.config.js            # Babel configuration
```

## Scripts tổng hợp

```bash
# Development
npm run web              # Chạy web dev server
npm start                # Chạy React Native Metro
npm run android          # Chạy Android
npm run ios              # Chạy iOS (chỉ macOS)

# Production
npm run build:web        # Build production cho web

# Maintenance
npm run lint             # Check code style
npm test                 # Run tests
npm install              # Cài đặt dependencies
```

## Lưu ý quan trọng

1. **Module compatibility**: Không phải tất cả React Native modules đều hoạt động trên web. Cần kiểm tra từng module.

2. **Platform-specific code**: Sử dụng Platform API để viết code riêng cho web:
   ```javascript
   import { Platform } from 'react-native';

   if (Platform.OS === 'web') {
     // Web-specific code
   }
   ```

3. **Styling**: Một số style property của React Native không hoạt động trên web. Test kỹ UI.

4. **Navigation**: React Navigation hoạt động tốt trên web, nhưng cần config thêm cho deep linking.

5. **APIs**: Camera, Bluetooth, NFC không hoạt động trên web. Cần disable hoặc provide alternatives.

6. **Performance**: Web bundle size lớn hơn native. Sử dụng code splitting và lazy loading.

## Deploy lên Production

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build:web

# Deploy
netlify deploy --prod --dir=dist
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages
1. Build: `npm run build:web`
2. Push folder `dist/` lên branch `gh-pages`
3. Enable GitHub Pages trong repository settings

## Hỗ trợ và tài liệu

- React Native Web: https://necolas.github.io/react-native-web/
- Webpack Documentation: https://webpack.js.org/
- React Native Docs: https://reactnative.dev/

## Cập nhật code

```bash
# Pull code mới từ Git
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install

# Chạy lại
npm run web
```

---

**Chúc bạn setup thành công! 🚀**
