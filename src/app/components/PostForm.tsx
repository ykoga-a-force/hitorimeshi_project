"use client";

import { useState } from "react";
import { uploadImage } from "../lib/storage";
import { createPost } from "../lib/data";
import { logger } from "../lib/logger";

interface PostFormProps {
    lat: number;
    lng: number;
}

const PostForm = ({ lat, lng }: PostFormProps) => {
    const [comment, setComment] = useState("");
    const [password, setPassword] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLogButton, setShowLogButton] = useState(false);

    // ファイル選択の変更ハンドラ
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            logger.log(`File selected: ${e.target.files[0].name}`);
            setImageFile(e.target.files[0]);
        }
    };

    // フォーム送信
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            alert("写真を選んでください！");
            return;
        }

        logger.log("Submit button clicked.");
        setIsSubmitting(true);
        setShowLogButton(false);
        try {
            // 1. 画像をアップロード
            const imageUrl = await uploadImage(imageFile);

            // 2. DBにデータを保存
            await createPost(lat, lng, imageUrl, comment, password);

            logger.log("Entire post flow completed successfully.");
            alert("投稿に成功しました！3時間で消えるので今のうちに楽しんでくださいね！");
            setIsOpen(false);
            setComment("");
            setPassword("");
            setImageFile(null);

            // 投稿後に画面をリロードするか、親コンポーネントで投稿リストを更新するのが望ましい
            window.location.reload();
        } catch (error) {
            logger.error("Submission flow failed...", error);
            setShowLogButton(true);
            alert("投稿に失敗しました。ログを確認してください。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[1001] bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
                <span className="text-xl">＋ 投稿する</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[1001] w-80 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 transition-all overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">今の食事を投稿！</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        写真を選択
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer disabled:opacity-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        コメント（40文字以内）
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 40))}
                        disabled={isSubmitting}
                        placeholder="今何食べてる？"
                        className="w-full h-20 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm text-gray-800 disabled:opacity-50"
                        maxLength={40}
                    />
                    <div className="text-right text-[10px] text-gray-400 mt-1">
                        {comment.length} / 40
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        削除パスワード（最大8文字・任意）
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value.slice(0, 8))}
                        disabled={isSubmitting}
                        placeholder="パスワードを設定すると自分で消せるよ"
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-800 disabled:opacity-50"
                        maxLength={8}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                        ※忘れると自分でも消せなくなるので注意してください。
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-md transition-colors active:transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "アップロード中..." : "投稿を公開する"}
                </button>
            </form>

            {(showLogButton || !isSubmitting) && (
                <button
                    onClick={() => logger.downloadLogs()}
                    className="mt-4 w-full text-[10px] text-gray-400 hover:text-gray-600 underline text-center"
                >
                    ログファイルをダウンロードする
                </button>
            )}
        </div>
    );
};

export default PostForm;
