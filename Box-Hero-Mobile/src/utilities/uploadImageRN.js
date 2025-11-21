import request from '../config/axiosConfig';

export const uploadImageFromURI = async (imageAsset) => {
    try {
        if (!imageAsset || !imageAsset.uri) {
            throw new Error('Invalid image asset');
        }

        const formData = new FormData();

        // Create file object for React Native
        const file = {
            uri: imageAsset.uri,
            type: imageAsset.type || 'image/jpeg', // Default to jpeg if type not specified
            name: imageAsset.fileName || `image_${Date.now()}.jpg`,
        };

        formData.append('image', file);

        const response = await request.post('/image/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.imageUrl;
    } catch (err) {
        console.error('Upload image error:', err);
        throw new Error(err.response?.data?.message || 'Failed to upload image');
    }
};

export const uploadImageFromBase64 = async (base64String) => {
    try {
        const formData = new FormData();

        // Extract mime type from base64 string
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 string');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Create file object
        const file = {
            uri: `data:${mimeType};base64,${base64Data}`,
            type: mimeType,
            name: `image_${Date.now()}.${mimeType.split('/')[1]}`,
        };

        formData.append('image', file);

        const response = await request.post('/image/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.imageUrl;
    } catch (err) {
        console.error('Upload image error:', err);
        throw new Error(err.response?.data?.message || 'Failed to upload image');
    }
};
