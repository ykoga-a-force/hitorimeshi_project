"use client";

import { useState } from "react";

const Header = () => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[5000] bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🍚</span>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] text-transparent">
                        ひとりめし
                    </h1>
                </div>

                <button
                    onClick={() => setShowHelp(true)}
                    className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg hover:bg-orange-100 transition-colors shadow-sm border border-orange-100"
                    title="アプリの使い方"
                >
                    ？
                </button>
            </header>

            {/* ヘルプモーダル */}
            {showHelp && (
                <div
                    className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
                    onClick={() => setShowHelp(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 space-y-6 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center space-y-2">
                            <span className="text-5xl block mb-4">🍚</span>
                            <h2 className="text-2xl font-bold text-gray-800">「ひとりめし」とは？</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                今、この瞬間の食事を<br />ゆるやかに共有するアプリです
                            </p>
                        </div>

                        <ul className="space-y-4 text-gray-700 text-sm">
                            <li className="flex gap-3">
                                <span className="text-orange-500 font-bold">・</span>
                                <div>
                                    <p className="font-bold text-gray-800">3時間で消える</p>
                                    <p className="text-gray-500 text-[12px]">投稿は3時間経つと自動で消えます。今の気分を気軽に投稿しましょう。</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-orange-500 font-bold">・</span>
                                <div>
                                    <p className="font-bold text-gray-800">1km以内の仲間</p>
                                    <p className="text-gray-500 text-[12px]">あなたの周り1km以内にいる人のご飯だけが地図に表示されます。</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-orange-500 font-bold">・</span>
                                <div>
                                    <p className="font-bold text-gray-800">匿名で安心</p>
                                    <p className="text-gray-500 text-[12px]">アカウント登録は不要。パスワードを設定すれば自分で消すこともできます。</p>
                                </div>
                            </li>
                        </ul>

                        <button
                            onClick={() => setShowHelp(false)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95"
                        >
                            分かった！
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
