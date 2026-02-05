import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
  Linking,
  Dimensions,
} from 'react-native';
import { Icon } from './common';
import { COLORS, SHADOWS } from '../config/theme';
import { appInfoService } from '../api/appInfoService';

const zalopng = require('../assets/images/zalo.png');

const HANDLE_SIZE = 52;
const BUTTON_SIZE = 48;
const GAP = 8;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const DraggableContact: React.FC = () => {
  const expandedRef = useRef(false);
  const contactRef = useRef<{ hotline: string; zalo: string; website: string } | null>(null);

  useEffect(() => {
    appInfoService.getContactInfo().then((info) => {
      if (info) {
        contactRef.current = info;
      }
    });
  }, []);

  // Default position: bottom-right corner
  const position = useRef(
    new Animated.ValueXY({
      x: SCREEN_W - HANDLE_SIZE - 16,
      y: SCREEN_H - HANDLE_SIZE - 90, // above tab bar
    })
  ).current;

  const expandAnim = useRef(new Animated.Value(0)).current;

  // --- expand / collapse --------------------------------------------------
  // Ref so PanResponder (created once) always calls the latest version
  const toggleExpandRef = useRef<(() => void) | undefined>(undefined);
  toggleExpandRef.current = () => {
    expandedRef.current = !expandedRef.current;
    Animated.spring(expandAnim, {
      toValue: expandedRef.current ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start();
  };

  // --- drag logic ---------------------------------------------------------
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartScreen = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        isDragging.current = false;
        position.x.stopAnimation((val) => {
          dragStartScreen.current.x = val;
        });
        position.y.stopAnimation((val) => {
          dragStartScreen.current.y = val;
        });
        dragStartPos.current = {
          x: e.nativeEvent.pageX,
          y: e.nativeEvent.pageY,
        };
      },
      onPanResponderMove: (e) => {
        const dx = e.nativeEvent.pageX - dragStartPos.current.x;
        const dy = e.nativeEvent.pageY - dragStartPos.current.y;

        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          isDragging.current = true;
        }

        if (isDragging.current) {
          let newX = dragStartScreen.current.x + dx;
          let newY = dragStartScreen.current.y + dy;
          newX = Math.max(0, Math.min(newX, SCREEN_W - HANDLE_SIZE));
          newY = Math.max(0, Math.min(newY, SCREEN_H - HANDLE_SIZE));
          position.setValue({ x: newX, y: newY });
        }
      },
      onPanResponderRelease: () => {
        if (!isDragging.current) {
          toggleExpandRef.current?.();
        }
      },
    })
  ).current;

  // --- actions -------------------------------------------------------------
  const collapse = useCallback(() => {
    expandedRef.current = false;
    Animated.spring(expandAnim, { toValue: 0, useNativeDriver: true }).start();
  }, [expandAnim]);

  const handlePhone = useCallback(() => {
    const hotline = contactRef.current?.hotline;
    if (hotline) {
      Linking.openURL(`tel:${hotline.replace(/\s/g, '')}`);
    }
    collapse();
  }, [collapse]);

  const handleFacebook = useCallback(() => {
    const website = contactRef.current?.website;
    if (website) {
      Linking.openURL(website);
    }
    collapse();
  }, [collapse]);

  const handleZalo = useCallback(() => {
    const zalo = contactRef.current?.zalo;
    if (zalo) {
      Linking.openURL(`https://zalo.me/${zalo}`);
    }
    collapse();
  }, [collapse]);

  // --- animated styles for sub-buttons ------------------------------------
  const phoneOffset = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(BUTTON_SIZE + GAP)],
  });
  const facebookOffset = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(BUTTON_SIZE + GAP) * 2],
  });
  const zaloOffset = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(BUTTON_SIZE + GAP) * 3],
  });

  return (
    <Animated.View
      style={[styles.container, { left: position.x, top: position.y }]}
      {...panResponder.panHandlers}
    >
      {/* Zalo — furthest up */}
      <Animated.View
        style={[
          styles.floatButton,
          { opacity: expandAnim, transform: [{ translateY: zaloOffset }, { scale: expandAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.zaloButton]}
          onPress={handleZalo}
          activeOpacity={0.7}
        >
          <Image source={zalopng} style={styles.zaloIcon} />
        </TouchableOpacity>
      </Animated.View>

      {/* Facebook */}
      <Animated.View
        style={[
          styles.floatButton,
          { opacity: expandAnim, transform: [{ translateY: facebookOffset }, { scale: expandAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.facebookButton]}
          onPress={handleFacebook}
          activeOpacity={0.7}
        >
          <Icon name="facebook" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Phone */}
      <Animated.View
        style={[
          styles.floatButton,
          { opacity: expandAnim, transform: [{ translateY: phoneOffset }, { scale: expandAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.phoneButton]}
          onPress={handlePhone}
          activeOpacity={0.7}
        >
          <Icon name="phone" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Main draggable handle */}
      <View style={styles.handle}>
        <Icon name="phone" size={26} color={COLORS.white} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    zIndex: 999,
  },
  handle: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  // Each floating sub-button is absolutely positioned at 0,0 and animated via translateY
  floatButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  actionButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  phoneButton: {
    backgroundColor: '#4CAF50', // green
  },
  facebookButton: {
    backgroundColor: '#1877F2', // facebook blue
  },
  zaloButton: {
    backgroundColor: '#0088FF', // zalo blue
  },
  zaloIcon: {
    width: 24,
    height: 24,
    borderRadius: 16,
  },
});

export default DraggableContact;
