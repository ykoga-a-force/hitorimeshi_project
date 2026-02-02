"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useCallback } from "react";

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

import { Post } from "../lib/data";

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
    const [userIcon, setUserIcon] = useState<L.Icon | L.DivIcon>(defaultIcon);
    const [foodIcon, setFoodIcon] = useState<L.Icon | L.DivIcon>(defaultIcon);
    const [hasUserIcon, setHasUserIcon] = useState(false);
    const [hasFoodIcon, setHasFoodIcon] = useState(false);

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
            <Marker position={center} icon={userIcon}>
                <Popup>
                    あなたの現在地
                </Popup>
            </Marker>

            {/* 投稿データのマーカー */}
            {posts.map((post) => (
                <Marker
                    key={post.id}
                    position={[post.lat, post.lng]}
                    icon={foodIcon}
                >
                    <Popup>
                        <div className="flex flex-col items-center min-w-[150px]">
                            {post.image_url && (
                                <img
                                    src={post.image_url}
                                    alt="投稿写真"
                                    className="w-full max-w-[150px] h-auto rounded-md mb-2 shadow-sm"
                                />
                            )}
                            <p className="text-sm font-medium">{post.comment}</p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {new Date(post.created_at).toLocaleString('ja-JP')}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
