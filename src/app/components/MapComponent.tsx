"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useCallback } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";

// クラスター用のスタイルは layout.tsx に移動しました。

// Leafletのデフォルトアイコンのパス修正（Next.jsで必要）
const fixLeafletIcon = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
};

import { Post, deletePost } from "../lib/data";

interface MapComponentProps {
    center: [number, number];
    zoom: number;
    posts: Post[];
}

// デフォルトのアイコン設定
const defaultIcon = new L.Icon.Default();

// カスタムアイコンの定義関数
const createCustomIcon = (url: string, size: number) => L.icon({
    iconUrl: url,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
});

// ズームレベルに応じたサイズ計算
const calculateIconSize = (zoom: number) => {
    // 標準ズームレベル(15)を 40px とする
    // ズームレベルが1上がるごとに1.2倍、下がるごとに0.8倍するイメージ（適宜調整）
    const baseSize = 40;
    const baseZoom = 15;
    const factor = Math.pow(1.2, zoom - baseZoom);
    const size = baseSize * factor;
    // 最小・最大サイズを制限（例: 20px 〜 100px）
    return Math.min(Math.max(size, 20), 100);
};

// ズームイベントを処理するコンポーネント
const ZoomHandler = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
    useMapEvents({
        zoomend: (e) => {
            onZoomChange(e.target.getZoom());
        },
    });
    return null;
};

const MapComponent = ({ center, zoom, posts }: MapComponentProps) => {
    const [currentZoom, setCurrentZoom] = useState(zoom);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [userIcon, setUserIcon] = useState<L.Icon | L.DivIcon>(defaultIcon);
    const [foodIcon, setFoodIcon] = useState<L.Icon | L.DivIcon>(defaultIcon);
    const [hasUserIcon, setHasUserIcon] = useState(false);
    const [hasFoodIcon, setHasFoodIcon] = useState(false);

    // クラスター用のカスタムアイコン作成関数
    const createClusterCustomIcon = useCallback((cluster: any) => {
        const count = cluster.getChildCount();
        const size = calculateIconSize(currentZoom);

        // 投稿ピン画像をベースに、右上に件数バッジを重ねる
        return L.divIcon({
            html: `
                <div class="cluster-pin-container" style="width: ${size}px; height: ${size}px;">
                    <img src="/images/food-pin.png" class="cluster-pin-img" alt="cluster" />
                    <div class="cluster-badge">${count}</div>
                </div>
            `,
            className: "custom-cluster-icon",
            iconSize: L.point(size, size),
            iconAnchor: L.point(size / 2, size),
        });
    }, [currentZoom]);

    // 削除処理のハンドラ
    const handleDelete = async (postId: string) => {
        const password = window.prompt("削除パスワードを入力してください。");
        if (password === null) return; // キャンセル

        try {
            await deletePost(postId, password);
            alert("削除に成功しました！");
            window.location.reload();
        } catch (error: any) {
            alert(error.message || "削除に失敗しました...");
        }
    };

    useEffect(() => {
        fixLeafletIcon();

        // 画像の存在を確認する
        const checkIcons = async () => {
            try {
                const userRes = await fetch("/images/user-icon.png", { method: "HEAD" });
                setHasUserIcon(userRes.ok);
            } catch (e) {
                setHasUserIcon(false);
            }

            try {
                const foodRes = await fetch("/images/food-pin.png", { method: "HEAD" });
                setHasFoodIcon(foodRes.ok);
            } catch (e) {
                setHasFoodIcon(false);
            }
        };

        checkIcons();
    }, []);

    // ズームや存在フラグが変わったときにアイコンを更新
    useEffect(() => {
        const size = calculateIconSize(currentZoom);

        if (hasUserIcon) {
            setUserIcon(createCustomIcon("/images/user-icon.png", size));
        } else {
            setUserIcon(defaultIcon); // デフォルトアイコンはズームで変えない設定
        }

        if (hasFoodIcon) {
            setFoodIcon(createCustomIcon("/images/food-pin.png", size));
        } else {
            setFoodIcon(defaultIcon);
        }
    }, [currentZoom, hasUserIcon, hasFoodIcon]);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            maxZoom={20}
            scrollWheelZoom={true}
            style={{ height: "100vh", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={20}
                maxNativeZoom={18}
            />

            <ZoomHandler onZoomChange={setCurrentZoom} />

            {/* ユーザーの現在地マーカー */}
            <Marker position={center} icon={userIcon} zIndexOffset={-1000}>
                <Popup>
                    あなたの現在地
                </Popup>
            </Marker>

            {/* 投稿データのマーカー（クラスター化） */}
            <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
                spiderfyDistanceMultiplier={2}
                iconCreateFunction={createClusterCustomIcon}
            >
                {posts.map((post) => (
                    <Marker
                        key={post.id}
                        position={[post.lat, post.lng]}
                        icon={foodIcon}
                        zIndexOffset={100} // 投稿ピンを前面に表示
                    >
                        <Popup>
                            <div className="flex flex-col items-center min-w-[150px]">
                                {post.image_url && (
                                    <img
                                        src={post.image_url}
                                        alt="投稿写真"
                                        className="w-full max-w-[150px] h-auto rounded-md mb-2 shadow-sm cursor-zoom-in active:scale-95 transition-transform"
                                        onClick={() => setSelectedImageUrl(post.image_url)}
                                    />
                                )}
                                <p className="text-sm font-medium">{post.comment}</p>
                                <div className="flex justify-between items-center w-full mt-2 pt-2 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-500">
                                        {new Date(post.created_at).toLocaleString('ja-JP', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                    {post.delete_password && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-[10px] text-red-500 hover:text-red-700 font-bold underline"
                                        >
                                            削除する
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>

            {/* 画像拡大表示用モーダル */}
            {selectedImageUrl && (
                <div
                    className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImageUrl(null)}
                >
                    <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
                        <img
                            src={selectedImageUrl}
                            alt="拡大写真"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                        <button
                            className="absolute top-4 right-4 text-white text-4xl font-light hover:text-gray-300 transition-colors bg-black/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                            onClick={() => setSelectedImageUrl(null)}
                        >
                            ×
                        </button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                            画面をタップして閉じる
                        </div>
                    </div>
                </div>
            )}
        </MapContainer>
    );
};

export default MapComponent;
