import {v2 as cloudinary} from "cloudinary"
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// upload image on cloudinary
const uploadImage = async (filePath) => {
    try {
        if (!filePath){ 
            return null;
        }
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'salesforce-buddy',
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            resource_type: 'auto'
        });
        console.log('Image uploaded', result);
        return result.secure_url;
    } catch (error) {
        console.log("Cloudinary error:", error);
        console.log("Error message:", error?.message);
        console.log("Error response:", error?.response);
        fs.unlinkSync(filePath); // Delete the local file in case of error
        throw error;
    }
}

const getPublicIdFromUrl = (url) => {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.findIndex((segment) => segment === 'upload');
    if (uploadIndex < 0) {
        throw new Error('Invalid Cloudinary URL: missing /upload/');
    }

    const afterUpload = segments.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments = versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;

    if (!publicIdSegments.length) {
        throw new Error('Invalid Cloudinary URL: cannot parse public_id');
    }

    const publicIdWithExt = publicIdSegments.join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
}

const deleteImageByUrl = async (url) => {
    if (!url) {
        throw new Error('Cloudinary URL is required');
    }

    const publicId = getPublicIdFromUrl(url);
    return await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image'
    });
}

// delete bulk images by public_ids
const deleteImagesByPublicIds = async (publicIds) => {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
        throw new Error('An array of public_ids is required');
    }
    return await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image'
    });
}

export {uploadImage, deleteImageByUrl, getPublicIdFromUrl, deleteImagesByPublicIds}