import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';

const OTPScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
    if (index === 5 && value) {
      handleVerify();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundGradient} />

      {/* Animated Circle - Cool Air Effect */}
      <View style={styles.circleAnimation}>
        <View style={[styles.circle, styles.circleLarge]} />
        <View style={[styles.circle, styles.circleMedium]} />
        <View style={[styles.circle, styles.circleSmall]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔐</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Xác thực OTP</Text>
        <Text style={styles.subtitle}>
          Vui lòng nhập mã OTP gửi đến{'\n'}
          <Text style={styles.highlightText}>email@example.com</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(index, nativeEvent.key)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Mã hết hạn sau:</Text>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>

        {/* Resend Button */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Không nhận được mã? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend}
          >
            <Text
              style={[
                styles.resendLink,
                !canResend && styles.resendLinkDisabled,
              ]}
            >
              Gửi lại
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            otp.join('').length === 6 && styles.verifyButtonActive,
          ]}
          onPress={handleVerify}
          activeOpacity={0.8}
          disabled={otp.join('').length !== 6}
        >
          <View style={styles.verifyButtonGradient}>
            <Text style={styles.verifyButtonText}>Xác thực</Text>
          </View>
        </TouchableOpacity>

        {/* Help Text */}
        <TouchableOpacity style={styles.helpContainer}>
          <Text style={styles.helpIcon}>❓</Text>
          <Text style={styles.helpText}>Cần hỗ trợ?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: `${COLORS.accent}08`,
  },
  circleAnimation: {
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: `${COLORS.accent}30`,
  },
  circleLarge: {
    width: 200,
    height: 200,
    top: -100,
    left: -100,
  },
  circleMedium: {
    width: 140,
    height: 140,
    top: -70,
    left: -70,
    borderColor: `${COLORS.accent}40`,
  },
  circleSmall: {
    width: 80,
    height: 80,
    top: -40,
    left: -40,
    borderColor: `${COLORS.accent}60`,
  },
  header: {
    paddingHorizontal: SPACING.screen_lg,
    paddingTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen_lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  lockIcon: {
    fontSize: 40,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
    textAlign: 'center',
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  timerLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  timerBadge: {
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  timerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resendText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  resendLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: COLORS.gray400,
  },
  verifyButton: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    opacity: 0.5,
  },
  verifyButtonActive: {
    opacity: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonGradient: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  verifyButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.sm,
  },
  helpIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  helpText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});

export default OTPScreen;
