const providerName = process.env.STORAGE_PROVIDER || "supabase";
const provider = require(`./providers/${providerName}Provider`);

const uploadFile = async (bucket, path, file, mimetype) => {
    return await provider.upload(bucket, path, file, mimetype);
};

const deleteFile = async (bucket, path) => {
    return await provider.delete(bucket, path);
};

const getPublicUrl = (bucket, path) => {
    return provider.getPublicUrl(bucket, path);
};

module.exports = { uploadFile, deleteFile, getPublicUrl };