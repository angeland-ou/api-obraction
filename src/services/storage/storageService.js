const providerName = process.env.STORAGE_PROVIDER || "supabase";
const provider = require(`./providers/${providerName}Provider`);

const uploadFile = async (bucket, path, file, mimetype, upsert = false) => {
    return await provider.upload(bucket, path, file, mimetype, upsert);
};

const deleteFile = async (bucket, path) => {
    return await provider.delete(bucket, path);
};

const getPublicUrl = (bucket, path) => {
    return provider.getPublicUrl(bucket, path);
};

const getSignedUrl = async (bucket, path, expiresIn = 3600) => {
    return await provider.getSignedUrl(bucket, path, expiresIn);
};

module.exports = { uploadFile, deleteFile, getPublicUrl, getSignedUrl };