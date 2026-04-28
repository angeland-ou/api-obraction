const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require("../../../config/misc/constants");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const upload = async (bucket, path, file, mimetype, upsert = false) => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            contentType: mimetype || "application/octet-stream",
            upsert
         });

    if (error) throw new Error(error.message);
    return data;
};

const getSignedUrl = async (bucket, path, expiresIn = 3600) => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error) throw new Error(error.message);
    return data.signedUrl;
};

const deleteFile = async (bucket, path) => {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) throw new Error(error.message);
};

const getPublicUrl = (bucket, path) => {
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
};

module.exports = { upload, delete: deleteFile, getPublicUrl, getSignedUrl };