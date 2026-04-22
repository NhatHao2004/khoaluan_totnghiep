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
  // IMPORTANT: Only fallback to DEFAULT_PAGODA_CONTENT for temples (category 'ancient')
  const detailedDescription = temple.detailedDescription ||
                              contentConfig?.detailedDescription || 
                              (temple.category === 'ancient' ? DEFAULT_PAGODA_CONTENT.detailedDescription : []);
                              
  const additionalImages = temple.additionalImages || 
                           contentConfig?.additionalImages || 
                           [];

  return (
    <View style={styles.contentSection}>
      {/* Render detailed descriptions with images in correct order */}
      {(detailedDescription && detailedDescription.length > 0) ? (
        detailedDescription.map((desc, index) => (
          <View key={index}>
            {/* Description first */}
            <ThemedText style={styles.descriptionText}>{desc}</ThemedText>
            
            {/* Show image AFTER description (limited to 2 images) */}
            {index === 0 && additionalImages && additionalImages.length > 0 && (
              <View style={styles.contentImage}>
                <Image
                  source={{ uri: additionalImages[0] }}
                  style={styles.contentImageStyle}
                  resizeMode="cover"
                />
                <ThemedText style={styles.imageCaption}>Nguồn: KhmerGo</ThemedText>
              </View>
            )}
            
            {index === 1 && additionalImages && additionalImages.length > 1 && (
              <View style={styles.contentImage}>
                <Image
                  source={{ uri: additionalImages[1] }}
                  style={styles.contentImageStyle}
                  resizeMode="cover"
                />
                <ThemedText style={styles.imageCaption}>Nguồn: KhmerGo</ThemedText>
              </View>
            )}
          </View>
        ))
      ) : (
        // Generic Fallback if no detailed description array exists
        <View>
          <ThemedText style={styles.descriptionText}>
            {temple.description || "Nội dung đang được cập nhật..."}
          </ThemedText>
          
          {/* If it's a temple, show some placeholder content as we used to */}
          {temple.category === 'ancient' && (
            <>
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
            </>
          )}
        </View>
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
    marginBottom: 15,
    textAlign: 'justify',
  },
  contentImage: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  contentImageStyle: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imageCaption: {
    fontSize: 12,
    color: '#9e9e9e',
    fontStyle: 'italic',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
});