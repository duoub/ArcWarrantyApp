import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import ImageEditor from '@react-native-community/image-editor';
import BarcodeScanning, { BarcodeFormat } from '@react-native-ml-kit/barcode-scanning';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

// Tạm ẩn tính năng đọc QR từ ảnh tĩnh ("Tải ảnh lên"). Đặt true để bật lại.
const ENABLE_PICK_IMAGE = false;

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;
// Lề thêm quanh box QR. Để nhỏ để khung ôm SÁT mã QR thật (boundingBox đã rộng
// hơn QR đôi chút). Trước đây 14 → khung phình to hơn QR rõ rệt.
const PADDING = 4;
const DEFAULT_FRAME_SIZE = 260;
// Thời lượng mỗi bước animate khung (ms). Phải DÀI HƠN nhịp callback để bước animate
// mới tới khi bước cũ CÒN ĐANG CHẠY → chuyển động liên tục, không stop-start (giật).
// iOS (AVCaptureMetadataOutput) bắn callback thưa & KHÔNG đều → cần duration dài hơn
// hẳn để cầu các khoảng trống; Android (ML Kit ~30fps đều) ngắn hơn vẫn mượt.
const FRAME_ANIM_MS = Platform.OS === 'ios' ? 320 : 160;
// Khung phải ĐỨNG YÊN (đã focus đúng QR) liên tục bao lâu thì mới scan trả data.
// Lớn hơn = chắc ăn đã focus nhưng chờ lâu hơn.
const FOCUS_HOLD_MS = 600;

// iOS: AVCaptureMetadataOutput trả bounds ở KHÔNG GIAN LANDSCAPE của cảm biến,
// camera sau ở portrait cần xoay 90° (landscape-right → portrait):
//     nx = 1 - y/H,  ny = x/W
// Nếu chạy thực tế thấy khung bị LẬT (đối xứng gương) — đổi cờ này sang false để
// dùng biến thể ngược: nx = y/H, ny = 1 - x/W. Mặc định theo convention .portrait.
const IOS_ROTATE_STANDARD = true;

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  title = 'Quét mã',
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isDecodingImage, setIsDecodingImage] = useState(false);

  const hasScannedRef = useRef(false);
  const pendingCodeRef = useRef<string | null>(null);
  const stableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearFrameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraSizeRef = useRef({ width: 0, height: 0 });
  // Khung đang được GIỮ (snap & hold) — null khi chưa có QR/đã reset.
  const smoothFrameRef = useRef<{ x: number; y: number; w: number; h: number; r: number } | null>(null);
  const currentFrameRef = useRef({ x: 0, y: 0, w: DEFAULT_FRAME_SIZE, h: DEFAULT_FRAME_SIZE, r: 0 });

  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animW = useRef(new Animated.Value(DEFAULT_FRAME_SIZE)).current;
  const animH = useRef(new Animated.Value(DEFAULT_FRAME_SIZE)).current;
  const animR = useRef(new Animated.Value(0)).current; // rotation degrees

  const device = useCameraDevice('back');

  const animateFrameTo = (x: number, y: number, w: number, h: number, r: number) => {
    // Normalize rotation để không animate theo đường vòng (e.g. 350° → -10°)
    const prev = currentFrameRef.current;
    let targetR = r;
    const diff = r - prev.r;
    if (diff > 180) targetR = r - 360;
    if (diff < -180) targetR = r + 360;

    // DÙNG timing (KHÔNG spring): spring bị restart mỗi callback → overshoot + GIẬT.
    // easing out(quad): mỗi bước GIẢM TỐC dần, nên khi bước mới cắt ngang bước cũ thì
    // KHÔNG có cú nhảy vận tốc (như linear) → các bước blend mượt, hết giật stop-start.
    const ease = Easing.out(Easing.quad);
    Animated.parallel([
      Animated.timing(animX, { toValue: x, duration: FRAME_ANIM_MS, easing: ease, useNativeDriver: false }),
      Animated.timing(animY, { toValue: y, duration: FRAME_ANIM_MS, easing: ease, useNativeDriver: false }),
      Animated.timing(animW, { toValue: w, duration: FRAME_ANIM_MS, easing: ease, useNativeDriver: false }),
      Animated.timing(animH, { toValue: h, duration: FRAME_ANIM_MS, easing: ease, useNativeDriver: false }),
      Animated.timing(animR, { toValue: targetR, duration: FRAME_ANIM_MS, easing: ease, useNativeDriver: false }),
    ]).start();
    currentFrameRef.current = { x, y, w, h, r: targetR };
  };

  const resetFrameToCenter = () => {
    const { width, height } = cameraSizeRef.current;
    if (width === 0) return;
    const cx = (width - DEFAULT_FRAME_SIZE) / 2;
    const cy = (height - DEFAULT_FRAME_SIZE) / 2;
    animX.stopAnimation(); animX.setValue(cx);
    animY.stopAnimation(); animY.setValue(cy);
    animW.stopAnimation(); animW.setValue(DEFAULT_FRAME_SIZE);
    animH.stopAnimation(); animH.setValue(DEFAULT_FRAME_SIZE);
    animR.stopAnimation(); animR.setValue(0);
    currentFrameRef.current = { x: cx, y: cy, w: DEFAULT_FRAME_SIZE, h: DEFAULT_FRAME_SIZE, r: 0 };
    // Xoá khung đang giữ: QR mới sẽ SNAP đúng vị trí & đếm focus lại từ đầu.
    smoothFrameRef.current = null;
  };

  const clearAllTimers = () => {
    if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
    if (clearFrameTimerRef.current) clearTimeout(clearFrameTimerRef.current);
    stableTimerRef.current = null;
    clearFrameTimerRef.current = null;
  };

  useEffect(() => {
    if (visible) {
      hasScannedRef.current = false;
      pendingCodeRef.current = null;
      resetFrameToCenter();
      checkCameraPermission();
    } else {
      setIsActive(false);
      hasScannedRef.current = false;
      pendingCodeRef.current = null;
      clearAllTimers();
      resetFrameToCenter();
    }
  }, [visible]);

  const checkCameraPermission = async () => {
    try {
      const permission = await Camera.requestCameraPermission();
      if (permission === 'granted') {
        setHasPermission(true);
        setIsActive(true);
      } else if (permission === 'denied') {
        Alert.alert(
          'Quyền truy cập camera',
          'Vui lòng cấp quyền truy cập camera trong cài đặt để sử dụng tính năng quét mã.',
          [
            { text: 'Hủy', onPress: onClose },
            { text: 'Mở cài đặt', onPress: () => Camera.requestCameraPermission() },
          ]
        );
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể truy cập camera. Vui lòng thử lại.');
      onClose();
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'code-93',
      'codabar', 'itf', 'upc-a', 'upc-e', 'pdf-417', 'aztec', 'data-matrix',
    ],
    onCodeScanned: (codes, frame) => {
      if (hasScannedRef.current) return;

      if (codes.length === 0) {
        // QR ra khỏi tầm nhìn — reset khung về giữa sau delay
        clearAllTimers();
        clearFrameTimerRef.current = setTimeout(() => {
          resetFrameToCenter();
          pendingCodeRef.current = null;
        }, 400);
        return;
      }

      if (clearFrameTimerRef.current) {
        clearTimeout(clearFrameTimerRef.current);
        clearFrameTimerRef.current = null;
      }

      const code = codes[0];
      const { width: camW, height: camH } = cameraSizeRef.current;

      // Không có frame info → scan ngay
      if (!code.frame || camW === 0) {
        if (code.value) {
          hasScannedRef.current = true;
          setIsActive(false);
          onScan(code.value);
        }
        return;
      }

      // Map code.frame (toạ độ buffer của VisionCamera) → toạ độ preview trên màn hình.
      // iOS và Android trả toạ độ ở 2 hệ KHÁC NHAU (đã kiểm chứng từ source native):
      //
      //  • Android (CodeScannerPipeline.kt): dùng ML Kit InputImage.fromMediaImage(img,
      //    rotationDegrees) → ảnh đã được XOAY THẲNG ĐỨNG. boundingBox khớp preview.
      //    GIỮ NGUYÊN công thức cũ đang chạy tốt (bufW=frame.height, bufH=frame.width,
      //    map thẳng x→ngang, y→dọc) — không đổi gì cho Android.
      //
      //  • iOS (CameraSession+CodeScanner.swift): dùng AVCaptureMetadataOutput. bounds
      //    normalized [0,1] theo KHÔNG GIAN LANDSCAPE của cảm biến rồi nhân với
      //    activeFormat.videoDimensions (vd 1920×1080, landscape). Apple KHÔNG xoay
      //    bounds về portrait → phải tự xoay 90° (landscape-right → portrait):
      //        nx_preview = 1 - (y_sensor / frame.height)   (đảo trục dọc cảm biến)
      //        ny_preview =      x_sensor / frame.width
      // mapPoint trả điểm chuẩn hoá [0,1] trong KHÔNG GIAN PREVIEW PORTRAIT, dùng
      // chung phần cover-scale bên dưới.
      //
      // bufW(ngang) × bufH(dọc) = tỉ lệ preview portrait. Cả 2 nền tảng đều là
      // (frame.height × frame.width) vì frame của VisionCamera luôn ở landscape-buffer
      // (Android: ML Kit báo width<height nhưng giá trị sau swap khớp công thức cũ).
      const isIOS = Platform.OS === 'ios';
      const mapPoint = (x: number, y: number): { nx: number; ny: number } => {
        if (isIOS) {
          return IOS_ROTATE_STANDARD
            ? { nx: 1 - y / frame.height, ny: x / frame.width }
            : { nx: y / frame.height, ny: 1 - x / frame.width };
        }
        // Android: giữ đúng hành vi cũ — x chuẩn hoá theo bufW(=frame.height),
        // y theo bufH(=frame.width).
        return { nx: x / frame.height, ny: y / frame.width };
      };

      const bufW = frame.height; // ngang
      const bufH = frame.width;  // dọc
      const scale = Math.max(camW / bufW, camH / bufH);
      const offsetX = (bufW * scale - camW) / 2;
      const offsetY = (bufH * scale - camH) / 2;

      // Chuyển 1 điểm normalized preview → toạ độ px trên màn hình (đã cover-scale).
      const toScreen = (nx: number, ny: number) => ({
        sx: nx * bufW * scale - offsetX,
        sy: ny * bufH * scale - offsetY,
      });

      // Ưu tiên dùng code.corners (4 góc THẬT của QR — ôm sát) thay vì code.frame
      // (bounding rect lỏng, rộng hơn QR + nhiễu nhiều hơn mỗi frame). Chỉ fallback
      // về code.frame khi không có corners.
      const hasCorners = !!(code.corners && code.corners.length >= 4);
      const rawPts = hasCorners
        ? code.corners!.map((c) => mapPoint(c.x, c.y))
        : [
            mapPoint(code.frame.x, code.frame.y),
            mapPoint(code.frame.x + code.frame.width, code.frame.y),
            mapPoint(code.frame.x, code.frame.y + code.frame.height),
            mapPoint(code.frame.x + code.frame.width, code.frame.y + code.frame.height),
          ];
      const screenPts = rawPts.map((p) => toScreen(p.nx, p.ny));

      const boxLeft = Math.min(...screenPts.map((p) => p.sx));
      const boxTop = Math.min(...screenPts.map((p) => p.sy));
      const pw = Math.max(...screenPts.map((p) => p.sx)) - boxLeft;
      const ph = Math.max(...screenPts.map((p) => p.sy)) - boxTop;

      const rawX = Math.max(0, boxLeft - PADDING);
      const rawY = Math.max(0, boxTop - PADDING);
      const rawW = Math.min(pw + PADDING * 2, camW - rawX);
      const rawH = Math.min(ph + PADDING * 2, camH - rawY);

      // Góc xoay: từ 2 góc đầu của QR (đã map sang màn hình). Khi dùng corners thật,
      // cạnh c0→c1 là 1 cạnh của QR nên góc rất chính xác.
      let rawR = 0;
      if (hasCorners) {
        const dx = screenPts[1].sx - screenPts[0].sx;
        const dy = screenPts[1].sy - screenPts[0].sy;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        // Normalize về [-45, 45] — QR vuông nên góc ngoài range này là nhiễu
        rawR = ((angle % 90) + 90) % 90;
        if (rawR > 45) rawR -= 90;
      }

      if (code.value) pendingCodeRef.current = code.value;

      // SNAP & HOLD (deadband + hysteresis) — diệt tận gốc "scale to/nhỏ liên tục":
      // KHÔNG bám/animate mỗi frame. Khung GIỮ NGUYÊN nếu QR mới chỉ lệch trong VÙNG
      // CHẾT (nhiễu pixel). Chỉ khi QR di chuyển/đổi size VƯỢT vùng chết mới snap tới
      // vị trí mới (animate 1 lần) rồi giữ. Ngưỡng tính theo % cạnh QR + có SÀN tối
      // thiểu để QR bé không bị nhiễu vài pixel khuếch đại lên thành giật.
      const held = smoothFrameRef.current;
      const sizeRef = Math.max(rawW, rawH);
      // Vùng chết: vị trí 8% cạnh QR (≥10px), kích thước 12% cạnh QR (≥16px).
      const dbXY = Math.max(10, sizeRef * 0.08);
      const dbWH = Math.max(16, sizeRef * 0.12);

      let committed = false;
      if (!held) {
        // Lần đầu thấy QR → snap thẳng.
        animateFrameTo(rawX, rawY, rawW, rawH, rawR);
        smoothFrameRef.current = { x: rawX, y: rawY, w: rawW, h: rawH, r: rawR };
        committed = true;
      } else {
        const movedPos =
          Math.abs(held.x - rawX) > dbXY || Math.abs(held.y - rawY) > dbXY;
        const movedSize =
          Math.abs(held.w - rawW) > dbWH || Math.abs(held.h - rawH) > dbWH;
        const movedRot = Math.abs(held.r - rawR) > 6;
        if (movedPos || movedSize || movedRot) {
          // QR thực sự di chuyển/đổi khoảng cách → cập nhật khung 1 lần.
          animateFrameTo(rawX, rawY, rawW, rawH, rawR);
          smoothFrameRef.current = { x: rawX, y: rawY, w: rawW, h: rawH, r: rawR };
          committed = true;
        }
        // Trong vùng chết → GIỮ NGUYÊN khung, không animate (không giật).
      }

      // FOCUS XONG MỚI SCAN: khi khung đang GIỮ (không phải vừa snap) tức QR đã đứng
      // yên/đã focus đúng → bắt đầu đếm giữ-yên, hết FOCUS_HOLD_MS thì trả data.
      // Nếu vừa snap (committed) → khung còn đang chỉnh, huỷ đồng hồ, chờ ổn định.
      if (committed) {
        if (stableTimerRef.current) {
          clearTimeout(stableTimerRef.current);
          stableTimerRef.current = null;
        }
      } else if (!stableTimerRef.current) {
        stableTimerRef.current = setTimeout(() => {
          stableTimerRef.current = null;
          if (!hasScannedRef.current && pendingCodeRef.current) {
            hasScannedRef.current = true;
            setIsActive(false);
            onScan(pendingCodeRef.current);
          }
        }, FOCUS_HOLD_MS);
      }
    },
  });

  const handleClose = () => {
    setIsActive(false);
    hasScannedRef.current = false;
    pendingCodeRef.current = null;
    clearAllTimers();
    onClose();
  };

  // Decode QR từ 1 đường dẫn ảnh bằng ML Kit → trả về value (ưu tiên QR_CODE).
  // ML Kit cần URI có scheme file://; chuẩn hoá để InputImage load được ảnh.
  const decodeQrFromPath = async (path: string): Promise<string | null> => {
    const uri = /^[a-z]+:\/\//i.test(path) ? path : `file://${path}`;
    let barcodes: { format: number; value: string }[] = [];
    let usedUri = uri;
    const t0 = Date.now();
    try {
      barcodes = await BarcodeScanning.scan(uri);
    } catch (e) {
      console.log('[QRPIPE] scan(uri) threw, retry với path gốc:', String(e));
      try {
        usedUri = path;
        barcodes = await BarcodeScanning.scan(path);
      } catch (e2) {
        console.log('[QRPIPE] scan(path) cũng threw:', String(e2));
        barcodes = [];
      }
    }
    // Log toàn bộ mã ML Kit thấy: format + độ dài value (không in full value cho gọn)
    console.log(
      `[QRPIPE] MLKit scan uri=${usedUri.slice(-40)} took=${Date.now() - t0}ms count=${barcodes.length}`,
      JSON.stringify(
        barcodes.map((b) => ({
          format: b.format,
          isQR: b.format === BarcodeFormat.QR_CODE,
          len: b.value ? b.value.length : 0,
        })),
      ),
    );
    const qr =
      barcodes.find((b) => b.format === BarcodeFormat.QR_CODE && !!b.value) ||
      barcodes.find((b) => !!b.value);
    return qr?.value ?? null;
  };

  // Cắt 1 ô (theo tỉ lệ ảnh) → CHỈ phóng to nếu ô nhỏ → ML Kit. Trả về value/null.
  const cropAndScan = async (
    sourceUri: string,
    x: number,
    y: number,
    w: number,
    h: number,
    upscaleFloor: number,
    tag: string,
  ): Promise<string | null> => {
    // Chỉ phóng to ô nhỏ (scale ≥ 1), không tự thu ô lớn (tránh mờ 2 lần).
    const scale = Math.max(1, upscaleFloor / Math.max(w, h));
    console.log(
      `[QRPIPE] tile ${tag} ô=${Math.round(w)}x${Math.round(h)} @(${Math.round(x)},${Math.round(y)}) scale=${scale.toFixed(2)}`,
    );
    const cropped = await ImageEditor.cropImage(sourceUri, {
      offset: { x, y },
      size: { width: w, height: h },
      displaySize: { width: Math.round(w * scale), height: Math.round(h * scale) },
      format: 'jpeg',
      quality: 1,
    });
    return decodeQrFromPath(cropped.uri || cropped.path);
  };

  // Sinh các ô VUÔNG cạnh `win` px (chồng lấp `overlap`), trượt phủ kín ảnh.
  // Ưu tiên trên→dưới, phải→trái (QR CCCD hay ở góc trên-phải).
  const buildWindows = (imgW: number, imgH: number, win: number, overlap: number) => {
    const w = Math.min(win, imgW);
    const h = Math.min(win, imgH);
    const stepX = w * (1 - overlap);
    const stepY = h * (1 - overlap);
    const xs: number[] = [];
    for (let x = 0; x + w < imgW; x += stepX) xs.push(x);
    xs.push(Math.max(0, imgW - w));
    const ys: number[] = [];
    for (let y = 0; y + h < imgH; y += stepY) ys.push(y);
    ys.push(Math.max(0, imgH - h));
    const uxs = [...new Set(xs.map(Math.round))].sort((a, b) => b - a); // phải trước
    const uys = [...new Set(ys.map(Math.round))].sort((a, b) => a - b); // trên trước
    const tiles: { x: number; y: number; w: number; h: number; tag: string }[] = [];
    for (const y of uys) for (const x of uxs) {
      tiles.push({ x, y, w, h, tag: `w${win}@(${x},${y})` });
    }
    return tiles;
  };

  // NGUYÊN LÝ (đã kiểm chứng bằng log + tính toán): ML Kit luôn thu ảnh về ~1024px
  // rồi mới decode. QR CCCD ~29 module, cần mỗi module ≥ ~6-8px → QR phải ≥ ~200px
  // TRONG ảnh 1024px mà ML Kit xử lý, tức QR phải chiếm ≥ ~20% cạnh ảnh đưa vào.
  // Trên ảnh gốc QR chỉ ~150-300px / cạnh ảnh ~3000-4080px (≈ 7%) → luôn trượt nếu
  // đưa ô lớn. ⇒ Phải cắt ô NHỎ chứa QR rồi PHÓNG TO lên ~1100px để QR đủ lớn.
  // Không biết QR to bao nhiêu nên thử nhiều cạnh ô (win) từ nhỏ→lớn, mỗi cỡ trượt
  // phủ kín + chồng 50% (QR luôn lọt trọn ≥1 ô). Mỗi ô phóng to về 1100px.
  const decodeQrSmart = async (
    sourceUri: string,
    imgW: number,
    imgH: number,
  ): Promise<string | null> => {
    // Pass 0: toàn ảnh (ca QR đã đủ lớn so với khung)
    const whole = await decodeQrFromPath(sourceUri);
    if (whole) {
      console.log('[QRPIPE] HIT toàn ảnh');
      return whole;
    }
    if (!imgW || !imgH) return null;

    const TARGET = 1100; // phóng cạnh dài mỗi ô về ~1100px → QR to lên rõ rệt
    // 2 cạnh ô phủ QR nhỏ→to: ~1/4 và ~1/2 cạnh ngắn (kẹp 700..1400). Ô ~1/4 cạnh
    // ngắn (~570-760px) đủ chứa QR (~300px) + lề, phóng lên 1100 → QR ~430-560px.
    const shortSide = Math.min(imgW, imgH);
    const wins = Array.from(
      new Set(
        [shortSide / 4, shortSide / 2].map((v) =>
          Math.round(Math.min(1400, Math.max(700, v))),
        ),
      ),
    );

    // Chồng 0.5 (step = 0.5·win): với win ~700px và QR ~300px, mọi vị trí QR đều
    // lọt TRỌN (kèm lề) vào ≥1 ô — không còn "khe" giữa các hàng/cột làm QR bị cắt.
    for (const win of wins) {
      for (const t of buildWindows(imgW, imgH, win, 0.5)) {
        if (hasScannedRef.current) return null;
        try {
          const value = await cropAndScan(sourceUri, t.x, t.y, t.w, t.h, TARGET, t.tag);
          if (value) {
            console.log(`[QRPIPE] HIT ${t.tag}`);
            return value;
          }
        } catch (e) {
          console.log(`[QRPIPE] ${t.tag} lỗi:`, String(e));
        }
      }
    }

    console.log('[QRPIPE] quét đa cỡ ô kết thúc, không đọc được');
    return null;
  };

  // Chọn ảnh CCCD (có chứa QR) từ thư viện → ML Kit decode (toàn ảnh + tiling) → fill form.
  // Giữ độ phân giải gốc khi chọn ảnh để QR không bị thu nhỏ làm mờ.
  const handlePickImage = async () => {
    if (isDecodingImage || hasScannedRef.current) return;
    try {
      const image = await ImagePicker.openPicker({
        multiple: false,
        mediaType: 'photo',
        // Giữ độ phân giải gốc: image-crop-picker mặc định thu nhỏ ảnh (~1280px)
        // làm QR trên CCCD bị mờ trước khi decode. Ép giới hạn lớn để giữ ảnh gốc.
        compressImageQuality: 1,
        compressImageMaxWidth: 4096,
        compressImageMaxHeight: 4096,
      });

      // Thông số ảnh sau khi pick: kích thước thực + dung lượng + mime + path
      console.log(
        '[QRPIPE] ===== pick ảnh mới =====',
        JSON.stringify({
          width: image.width,
          height: image.height,
          sizeKB: (image as any).size ? Math.round((image as any).size / 1024) : null,
          mime: (image as any).mime,
          path: image.path,
        }),
      );

      setIsDecodingImage(true);
      // Tạm dừng camera trong lúc đọc ảnh để tiết kiệm tài nguyên
      setIsActive(false);

      const srcUri = /^[a-z]+:\/\//i.test(image.path)
        ? image.path
        : `file://${image.path}`;
      const value = await decodeQrSmart(srcUri, image.width, image.height);
      console.log('[QRPIPE] KẾT QUẢ:', value ? `ĐỌC ĐƯỢC (len=${value.length})` : 'TRƯỢT (null)');

      if (!value) {
        setIsDecodingImage(false);
        setIsActive(true);
        Alert.alert(
          'Không tìm thấy mã QR',
          'Không đọc được mã QR trong ảnh. Vui lòng chọn ảnh CCCD rõ nét, đủ sáng, không bị mờ hoặc loá.',
          [{ text: 'Đóng' }]
        );
        return;
      }

      hasScannedRef.current = true;
      clearAllTimers();
      setIsDecodingImage(false);
      onScan(value);
    } catch (error: any) {
      setIsDecodingImage(false);
      // Người dùng huỷ chọn ảnh → không báo lỗi, mở lại camera
      if (error?.code === 'E_PICKER_CANCELLED') {
        if (!hasScannedRef.current) setIsActive(true);
        return;
      }
      if (!hasScannedRef.current) setIsActive(true);
      Alert.alert('Lỗi', 'Không thể đọc mã QR từ ảnh. Vui lòng thử lại.', [
        { text: 'Đóng' },
      ]);
    }
  };

  if (!visible) return null;

  const content = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={styles.cameraContainer}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          cameraSizeRef.current = { width, height };
          // Đặt khung giữa màn hình ngay khi layout sẵn sàng
          const cx = (width - DEFAULT_FRAME_SIZE) / 2;
          const cy = (height - DEFAULT_FRAME_SIZE) / 2;
          animX.setValue(cx);
          animY.setValue(cy);
          animW.setValue(DEFAULT_FRAME_SIZE);
          animH.setValue(DEFAULT_FRAME_SIZE);
          currentFrameRef.current = { x: cx, y: cy, w: DEFAULT_FRAME_SIZE, h: DEFAULT_FRAME_SIZE, r: 0 };
        }}
      >
        {device && hasPermission ? (
          <>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              codeScanner={codeScanner}
              enableZoomGesture
              torch={flashEnabled ? 'on' : 'off'}
            />

            {/* Instruction text */}
            <View style={styles.instructionRow} pointerEvents="none">
              <Text style={styles.instructionText}>
                Đưa mã vạch/QR code vào khung hình
              </Text>
            </View>

            {/* Khung vàng animated */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.trackingFrame,
                {
                  left: animX,
                  top: animY,
                  width: animW,
                  height: animH,
                  transform: [{ rotate: animR.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) }],
                },
              ]}
            >
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </Animated.View>

            {/* Flash + Tải ảnh lên */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setFlashEnabled(v => !v)}
                activeOpacity={0.7}
              >
                <Text style={styles.controlIcon}>{flashEnabled ? '⚡' : '🔦'}</Text>
                <Text style={styles.controlText}>{flashEnabled ? 'Tắt đèn' : 'Bật đèn'}</Text>
              </TouchableOpacity>

              {/* TẠM ẨN: đọc QR từ ảnh tĩnh chưa ổn định với QR CCCD nghiêng/tương
                  phản thấp. Logic decode (handlePickImage/decodeQrSmart) vẫn giữ
                  nguyên bên dưới — đổi ENABLE_PICK_IMAGE thành true để bật lại. */}
              {ENABLE_PICK_IMAGE && (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                  disabled={isDecodingImage}
                >
                  <Text style={styles.controlIcon}>🖼️</Text>
                  <Text style={styles.controlText}>Tải ảnh lên</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Overlay khi đang đọc QR từ ảnh */}
            {isDecodingImage && (
              <View style={styles.decodingOverlay} pointerEvents="auto">
                <ActivityIndicator size="large" color={COLORS.white} />
                <Text style={styles.decodingText}>Đang đọc mã QR từ ảnh...</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang khởi động camera...</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {Platform.OS === 'ios' ? (
          <SafeAreaView style={styles.container} edges={['top']}>
            {content}
          </SafeAreaView>
        ) : (
          <View style={styles.container}>
            {content}
          </View>
        )}
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 26,
    color: COLORS.white,
    fontWeight: '300',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.white,
  },
  instructionRow: {
    position: 'absolute',
    bottom: SPACING.xl + 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: SPACING.xl,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  trackingFrame: {
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FFD600',
  },
  cornerTopLeft: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: BORDER_RADIUS.sm,
  },
  cornerTopRight: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: BORDER_RADIUS.sm,
  },
  cornerBottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  cornerBottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  controlsRow: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  controlButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  controlIcon: { fontSize: 20 },
  controlText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  decodingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  decodingText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default BarcodeScanner;
