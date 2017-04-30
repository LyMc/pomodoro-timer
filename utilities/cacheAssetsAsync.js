import { Image } from 'react-native';
import { Asset } from 'expo';

export default function cacheAssetsAsync(images = []) {
  return Promise.all(...cacheImages(images))
}

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image)
    } else {
      return Asset.fromModule(image).downloadAsync()
    }
  })
}
