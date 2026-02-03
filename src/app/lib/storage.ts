import { supabase } from "./supabase";
import { logger } from "./logger";

/**
 * 画像をSupabase Storageの 'post-images' バケットにアップロードします。
 * @param file アップロードする画像ファイル
 * @returns 画像の公開URL
 */
export const uploadImage = async (file: File): Promise<string> => {
    logger.log(`Starting image upload: ${file.name} (${file.size} bytes)`);

    // 1. 一意なファイル名を生成 (UUID + 拡張子)
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Supabase Storage にアップロード
    const { data, error } = await supabase.storage
        .from("post_images")
        .upload(filePath, file);

    if (error) {
        logger.error("ストレージへのアップロードに失敗しました...", error);
        throw new Error("画像のアップロードに失敗しました。");
    }

    logger.log(`Upload successful: ${filePath}`);

    // 3. 公開URLを取得
    const { data: publicUrlData } = supabase.storage
        .from("post_images")
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
};
