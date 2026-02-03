import { supabase } from "./supabase";
import { logger } from "./logger";

export interface Post {
    id: string;
    lat: number;
    lng: number;
    image_url: string;
    comment: string;
    created_at: string;
    delete_password?: string; // 削除用パスワード（任意）
}

/**
 * ユーザーの現在地から半径1km以内、かつ3時間以内の投稿を取得します。
 * Haversine公式をJavaScript側で適用してフィルタリングします。
 */
export const getNearbyPosts = async (userLat: number, userLng: number): Promise<Post[]> => {
    logger.log(`Fetching nearby posts for: [${userLat}, ${userLng}]`);
    // 1. 3時間前の時刻を計算
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    // 2. Supabaseから3時間以内の投稿をすべて取得
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .gt("created_at", threeHoursAgo.toISOString());

    if (error) {
        logger.error("データの取得に失敗しました...", error);
        return [];
    }

    if (!data) return [];

    // 3. Haversine公式による1km圏内のフィルタリング
    const radiusKm = 1;
    const filteredPosts = data.filter((post: Post) => {
        const distance = calculateDistance(userLat, userLng, post.lat, post.lng);
        return distance <= radiusKm;
    });

    logger.log(`Found ${filteredPosts.length} posts within range.`);
    return filteredPosts;
};

/**
 * 2点間の距離を計算する関数 (Haversine公式)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * 新しい投稿をデータベースに保存します。
 */
export const createPost = async (
    lat: number,
    lng: number,
    imageUrl: string,
    comment: string,
    password?: string // 追加
): Promise<void> => {
    logger.log(`Creating new post: [${lat}, ${lng}], Comment: ${comment}, Pwd: ${password ? "****" : "none"}`);
    const { error } = await supabase.from("posts").insert([
        {
            lat,
            lng,
            image_url: imageUrl,
            comment,
            delete_password: password || null, // DBのカラムに合わせて保存
        },
    ]);

    if (error) {
        logger.error("投稿の作成に失敗しました...", error);
        throw new Error("投稿の保存に失敗しました。");
    }
    logger.log("Post created successfully.");
};

/**
 * 投稿を削除します。
 * パスワードが一致する場合のみ、DBのレコードとストレージの画像を物理削除します。
 */
export const deletePost = async (postId: string, password: string): Promise<void> => {
    logger.log(`Attempting to delete post: ${postId}`);

    // 1. パスワードを確認するためにまず取得
    const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("delete_password, image_url")
        .eq("id", postId)
        .single();

    if (fetchError || !post) {
        logger.error("削除用の投稿取得に失敗しました。", fetchError);
        throw new Error("投稿が見つかりませんでした。");
    }

    if (post.delete_password !== password) {
        logger.error("パスワードが一致しません。");
        throw new Error("パスワードが違います！");
    }

    // 2. DBから削除
    const { error: dbError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

    if (dbError) {
        logger.error("DBからの削除に失敗しました。", dbError);
        throw new Error("削除に失敗しました。");
    }

    // 3. ストレージから画像を削除
    if (post.image_url) {
        // image_url は公開URLなので、ファイルパス（ファイル名）を取り出す
        const imageUrlParts = post.image_url.split("/");
        const fileName = imageUrlParts[imageUrlParts.length - 1];

        if (fileName) {
            const { error: storageError } = await supabase.storage
                .from("post_images")
                .remove([fileName]);

            if (storageError) {
                logger.error(`Storage deletion failed for ${fileName}.`, storageError);
            } else {
                logger.log(`Storage file deleted: ${fileName}`);
            }
        }
    }

    logger.log("Post deleted successfully from DB and Storage.");
};
