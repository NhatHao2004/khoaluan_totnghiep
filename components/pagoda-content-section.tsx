import { ThemedText } from '@/components/themed-text';
import { Temple } from '@/services/firebase-service';
import { Image, StyleSheet, View } from 'react-native';
import { DEFAULT_PAGODA_CONTENT, PAGODA_CONTENT_CONFIG } from '../config/pagoda-content-config';

// Local images for pagodas
const PAGODA_IMAGES = {
  'chua-ang': require('@/assets/images/chuaang1.jpg'),
  'chua-hang': require('@/assets/images/chuahang.jpg'),
  'chua-sleng-cu': require('@/assets/images/chuaslengcu.jpg'),
  'default': require('@/assets/images/chua1.jpg'),
};

const getPagodaImage = (templeId: string, templeName: string) => {
  if (PAGODA_IMAGES[templeId as keyof typeof PAGODA_IMAGES]) {
    return PAGODA_IMAGES[templeId as keyof typeof PAGODA_IMAGES];
  }
  
  const nameKey = templeName.toLowerCase()
    .replace(/chùa\s*/g, 'chua-')
    .replace(/\s+/g, '-')
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd');
    
  if (PAGODA_IMAGES[nameKey as keyof typeof PAGODA_IMAGES]) {
    return PAGODA_IMAGES[nameKey as keyof typeof PAGODA_IMAGES];
  }
  
  return PAGODA_IMAGES.default;
};

interface PagodaContentSectionProps {
  temple: Temple;
}

export default function PagodaContentSection({ temple }: PagodaContentSectionProps) {
  // Get content from config based on temple name or ID
  const getContentConfig = () => {
    const templeKey = temple.name || temple.id || '';
    return PAGODA_CONTENT_CONFIG[templeKey] || null;
  };

  const contentConfig = getContentConfig();
  
  // Use Firebase data first, then fallback to config or default
  const detailedDescription = temple.detailedDescription ||
                             contentConfig?.detailedDescription || 
                             DEFAULT_PAGODA_CONTENT.detailedDescription;
                             
  const additionalImages = temple.additionalImages || 
                          contentConfig?.additionalImages || 
                          [];

  return (
    <View style={styles.contentSection}>
      {/* Render detailed descriptions with images in correct order */}
      {detailedDescription && detailedDescription.length > 0 ? (
        detailedDescription.map((desc, index) => (
          <View key={index}>
            {/* Description first */}
            <ThemedText style={styles.descriptionText}>{desc}</ThemedText>
            
            {/* Show image AFTER description (skip first image as it's in hero) */}
            {index === 0 && additionalImages && additionalImages.length > 0 && (
              <View style={styles.contentImage}>
                <Image
                  source={additionalImages[0]?.startsWith('local://') ? 
                    PAGODA_IMAGES[additionalImages[0].replace('local://', '') as keyof typeof PAGODA_IMAGES] || PAGODA_IMAGES['chua-hang'] :
                    additionalImages[0] ? 
                      { uri: additionalImages[0] } : 
                      PAGODA_IMAGES['chua-hang']
                  }
                  style={styles.contentImageStyle}
                  resizeMode="cover"
                />
                <ThemedText style={styles.imageCaption}>Nguồn: KhmerGo</ThemedText>
              </View>
            )}
            
            {index === 1 && additionalImages && additionalImages.length > 1 && (
              <View style={styles.contentImage}>
                <Image
                  source={additionalImages[1]?.startsWith('local://') ? 
                    PAGODA_IMAGES[additionalImages[1].replace('local://', '') as keyof typeof PAGODA_IMAGES] || PAGODA_IMAGES['chua-sleng-cu'] :
                    additionalImages[1] ? 
                      { uri: additionalImages[1] } : 
                      PAGODA_IMAGES['chua-sleng-cu']
                  }
                  style={styles.contentImageStyle}
                  resizeMode="cover"
                />
                <ThemedText style={styles.imageCaption}>Nguồn: KhmerGo</ThemedText>
              </View>
            )}
          </View>
        ))
      ) : (
        // Fallback content if no detailed description
        <>
          <ThemedText style={styles.descriptionText}>
            {temple.description || DEFAULT_PAGODA_CONTENT.detailedDescription[0]}
          </ThemedText>

          <View style={styles.contentImage}>
            <Image
              source={PAGODA_IMAGES['chua-hang']}
              style={styles.contentImageStyle}
            />
            <ThemedText style={styles.imageCaption}>Nguồn: KhmerGo</ThemedText>
          </View>

          <ThemedText style={styles.descriptionText}>
            {DEFAULT_PAGODA_CONTENT.detailedDescription[1]}
          </ThemedText>

          <View style={styles.contentImage}>
            <Image
              source={PAGODA_IMAGES['chua-sleng-cu']}
              style={styles.contentImageStyle}
            />
            <ThemedText style={styles.imageCaption}>Nguồn: KhmerGo</ThemedText>
          </View>

          <ThemedText style={styles.descriptionText}>
            {DEFAULT_PAGODA_CONTENT.detailedDescription[2]}
          </ThemedText>
        </>
      )}  
    </View>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 20,
    marginTop: -20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 27,
    color: '#555555',
    marginBottom: 5,
    textAlign: 'justify',
  },
  contentImage: {
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },
  contentImageStyle: {
    width: '80%',
    height: 180,
    resizeMode: 'cover',
  },
  imageCaption: {
    fontSize: 12,
    color: '#9e9e9e',
    fontStyle: 'italic',
    marginTop: 0,
    alignSelf: 'flex-end',
  },
});