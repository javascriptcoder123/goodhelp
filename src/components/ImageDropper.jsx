import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, View } from "react-native";
import Button from './Button'
import { store } from '../../firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const resolveContentType = (uri, mimeType, blobType) => {
  if (mimeType) return mimeType;
  if (blobType) return blobType;

  const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'heic' || extension === 'heif') return 'image/heic';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
};

const ImageDropper = forwardRef(function ImageDropper(props, forwardedRef) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const uploadIdRef = useRef(0);

  useEffect(() => {
    props.onUploadingChange?.(uploading);
  }, [uploading]);

  useImperativeHandle(forwardedRef, () => ({
    reset: () => {
      // Invalidate any in-flight upload callbacks so a stale response
      // can't repopulate the image after the form has moved on.
      uploadIdRef.current++;
      setImage(null);
      setUploading(false);
    },
  }));

  const uploadImage = async (uri, mimeType) => {
    const uploadId = ++uploadIdRef.current;
    setUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      if (uploadId !== uploadIdRef.current) return;

      const filename = `images/IMG${Date.now()}-${Math.round(Math.random() * 100000)}`;
      const storageRef = ref(store, filename);
      const contentType = resolveContentType(uri, mimeType, blob.type);

      const downloadUrl = await new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob, { contentType });

        uploadTask.on(
          'state_changed',
          null,
          reject,
          async () => {
            if (uploadId !== uploadIdRef.current) return;
            resolve(await getDownloadURL(uploadTask.snapshot.ref));
          }
        );
      });

      if (uploadId === uploadIdRef.current) {
        props.setImageURL?.(downloadUrl);
      }
    } catch (error) {
      if (uploadId !== uploadIdRef.current) return;

      props.setImageURL?.('');
      setImage(null);

      if (error?.code === 'storage/quota-exceeded') {
        Alert.alert(
          'Photo upload unavailable',
          'Photo storage is full right now. You can still post your listing without a photo.'
        );
        return;
      }

      console.error('Image upload failed:', error);
      Alert.alert(
        'Photo upload failed',
        'Could not upload your photo. Please try again or post without a photo.'
      );
    } finally {
      if (uploadId === uploadIdRef.current) {
        setUploading(false);
      }
    }
  };

  const openImagePicker = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      return;
    }

    const asset = pickerResult.assets[0];
    setImage(asset.uri);
    await uploadImage(asset.uri, asset.mimeType);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera access needed',
        'Please allow camera access in your device settings to take a photo.'
      );
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (cameraResult.canceled || !cameraResult.assets?.length) {
      return;
    }

    const asset = cameraResult.assets[0];
    setImage(asset.uri);
    await uploadImage(asset.uri, asset.mimeType);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          color="black"
          onPress={takePhoto}
          disabled={uploading}
          style={styles.button}>
          {uploading ? 'Uploading...' : 'Take Photo'}
        </Button>
        <Button
          mode="outlined"
          color="black"
          onPress={openImagePicker}
          disabled={uploading}
          style={styles.button}>
          {uploading ? 'Uploading...' : image ? 'Replace Image' : 'Choose from Library'}
        </Button>
      </View>
      {image ? <Image source={{ uri: image }} style={styles.preview} /> : null}
    </View>
  );
});

export default ImageDropper;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 2,
    borderStyle: 'dashed',
    borderColor: 'black',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    marginVertical: 0,
  },
  preview: {
    width: 200,
    height: 200,
    marginTop: 12,
  },
});
