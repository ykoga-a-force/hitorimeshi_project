/**
 * デバッグ用の簡易ロガークラス
 * 実行時のイベントやエラーをメモリに蓄積し、ファイルとして書き出せるようにします。
 */
class Logger {
    private logs: string[] = [];

    constructor() {
        this.log("Logger initializedぴ！");
    }

    /**
     * 通常のログを記録
     */
    log(message: string) {
        const timestamp = new Date().toLocaleString("ja-JP");
        const formattedMessage = `[${timestamp}] INFO: ${message}`;
        this.logs.push(formattedMessage);
        console.log(formattedMessage);
    }

    /**
     * エラーログを記録
     */
    error(message: string, error?: any) {
        const timestamp = new Date().toLocaleString("ja-JP");
        let errorDetail = "";
        if (error) {
            if (error instanceof Error) {
                errorDetail = `\n  Detail: ${error.message}\n  Stack: ${error.stack}`;
            } else {
                errorDetail = `\n  Detail: ${JSON.stringify(error)}`;
            }
        }
        const formattedMessage = `[${timestamp}] ERROR: ${message}${errorDetail}`;
        this.logs.push(formattedMessage);
        console.error(formattedMessage);
    }

    /**
     * 蓄積された全てのログを文字列として取得
     */
    getLogs(): string {
        return this.logs.join("\n");
    }

    /**
     * ログを .txt ファイルとしてダウンロード
     */
    downloadLogs() {
        const blob = new Blob([this.getLogs()], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hitorimeshi_log_${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// シングルトンとしてエクスポート
export const logger = new Logger();
