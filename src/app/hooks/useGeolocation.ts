"use client";

import { useState, useEffect } from "react";

interface Location {
    lat: number;
    lng: number;
}

export const useGeolocation = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("お使いのブラウザは位置情報をサポートしていません。");
            setLoading(false);
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
            setLoading(false);
        };

        const handleError = (error: GeolocationPositionError) => {
            setError(`位置情報の取得に失敗しました: ${error.message}`);
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }, []);

    return { location, loading, error };
};
