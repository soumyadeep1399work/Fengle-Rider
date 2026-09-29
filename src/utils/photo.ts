import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const SELFIE_MAX_WIDTH = 900;
const SELFIE_JPEG_QUALITY = 0.75;

/**
 * Camera only — no gallery option. This is the rider's identity-verification
 * photo for the in-app agreement, so it must be taken live, not chosen from
 * an existing file. `cameraType: front` only sets the camera the shutter
 * opens on — most camera UIs let the person flip to the back camera, so this
 * is a nudge, not a hard guarantee; the real check is a human (admin)
 * reviewing the photo later. Returns a resized JPEG's local URI, or null if
 * the person backed out of the camera.
 */
export async function takeSelfie(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('Camera access is off. Allow it in your phone settings to take the verification photo.');

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    cameraType: ImagePicker.CameraType.front,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > SELFIE_MAX_WIDTH) context.resize({ width: SELFIE_MAX_WIDTH });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: SELFIE_JPEG_QUALITY });
  return saved.uri;
}
