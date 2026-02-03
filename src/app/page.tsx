"use client";

import dynamic from "next/dynamic";
import { useGeolocation } from "./hooks/useGeolocation";
import { useState, useEffect } from "react";
import { getNearbyPosts, Post } from "./lib/data";
import PostForm from "./components/PostForm";
import Header from "./components/Header";

// Leafletはブラウザでのみ動作するため、SSRを無効にして読み込みます
const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
  loading: () => <p className="p-4 text-center">地図を読み込み中...</p>,
});

export default function Home() {
  const { location, loading: geoLoading, error: geoError } = useGeolocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (location) {
        setIsLoadingPosts(true);
        const nearbyPosts = await getNearbyPosts(location.lat, location.lng);
        setPosts(nearbyPosts);
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [location]);

  if (geoLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold">現在地を取得中...</p>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-2">エラーが発生しました</p>
          <p>{geoError}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-full relative">
      <Header />
      {isLoadingPosts && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-md backdrop-blur-sm pointer-events-none border border-orange-50 animate-pulse">
          <span className="text-sm font-medium text-orange-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            近くの投稿を読み込み中...
          </span>
        </div>
      )}
      {location && (
        <>
          <MapComponent
            center={[location.lat, location.lng]}
            zoom={16}
            posts={posts}
          />
          <PostForm lat={location.lat} lng={location.lng} />
        </>
      )}
    </main>
  );
}
