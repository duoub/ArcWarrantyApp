import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../config/theme';

interface AvatarProps {
  uri?: string;
  size?: number;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({ uri, size = 40, style }) => {
  const [imageError, setImageError] = useState(false);
  const avatarSize = size;
  const borderRadius = size / 2;

  // Reset imageError when uri changes
  useEffect(() => {
    setImageError(false);
  }, [uri]);

  // Always show default avatar if no URI is provided or if image fails to load
  const showDefaultAvatar = !uri || uri.trim() === '' || imageError;

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: borderRadius,
        },
        style,
      ]}
    >
      {showDefaultAvatar ? (
        <View
          style={[
            styles.defaultContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: borderRadius,
            },
          ]}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={[
              styles.logo,
              {
                width: avatarSize * 0.7,
                height: avatarSize * 0.7,
              },
            ]}
            resizeMode="contain"
          />
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: borderRadius,
            },
          ]}
          resizeMode="cover"
          onError={() => {
            setImageError(true);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  defaultContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '70%',
    height: '70%',
  },
});

export default Avatar;
