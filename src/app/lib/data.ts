import { supabase } from "./supabase";

export interface Post {
    id: string;
    lat: number;
    lng: number;
    image_url: string;
    comment: string;
    created_at: string;
}

/**
 * ユーザーの現在地から半径1km以内、かつ3時間以内の投稿を取得します。
 * Haversine公式をJavaScript側で適用してフィルタリングします。
 */
export const getNearbyPosts = async (userLat: number, userLng: number): Promise<Post[]> => {
    // 1. 3時間前の時刻を計算
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    // 2. Supabaseから3時間以内の投稿をすべて取得
    // ※ データ量が多い場合はDB側(RPC)で計算するのが望ましいですが、
    //   3時間以内という条件で十分絞り込めると想定し、JS側で距離判定を行います。
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .gt("created_at", threeHoursAgo.toISOString());

    if (error) {
        console.error("データ取得エラー:", error);
        return [];
    }

    if (!data) return [];

    // 3. Haversine公式による1km圏内のフィルタリング
    const radiusKm = 1;
    const filteredPosts = data.filter((post: Post) => {
        const distance = calculateDistance(userLat, userLng, post.lat, post.lng);
        return distance <= radiusKm;
    });

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
