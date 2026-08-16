"use client";

import { useState } from "react";
import { verifyMessage } from "ethers";
import { useWallet } from "@/lib/wallet";

export default function VerifyPage() {
  const { address, connecting, connect, disconnect } = useWallet();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [recovered, setRecovered] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setError("");
    try {
      await connect();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDisconnect = async () => {
    setError("");
    await disconnect();
    // 断开后当前用户变化，清空旧比对结果
    setRecovered(null);
    setVerified(null);
  };

  const verify = () => {
    setError("");
    setRecovered(null);
    setVerified(null);

    // verifyMessage 签名格式无效时会抛错
    let signer: string;
    try {
      signer = verifyMessage(message, signature);
    } catch {
      setError("签名格式无效，无法恢复签名者");
      return;
    }
    setRecovered(signer);

    // 未连接钱包时无法比对，仅展示签名者
    if (!address) {
      setError("签名格式有效。连接钱包后可比对是否为当前用户所签");
      return;
    }
    setVerified(signer.toLowerCase() === address.toLowerCase());
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold tracking-wide">
          签名验证工具
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          输入消息与签名，验证签名者身份
        </p>

        {/* 连接钱包：用于比对当前用户 */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-slate-200">
            连接钱包（用于比对）
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {address ? (
              <button
                onClick={handleDisconnect}
                className="rounded-lg border border-slate-600 px-5 py-2.5 font-medium text-slate-300 transition hover:border-red-500/70 hover:text-red-400"
              >
                断开连接
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="rounded-lg bg-amber-500 px-5 py-2.5 font-medium text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {connecting ? "连接中..." : "连接钱包"}
              </button>
            )}
            <span className="break-all font-mono text-sm text-slate-400">
              当前地址：{address ? address : "未连接"}
            </span>
          </div>
        </section>

        {/* 输入：数据 + 签名 */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-slate-200">
            输入数据与签名
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="消息内容（与签名时输入的一致）..."
            rows={3}
            className="mt-3 w-full resize-y rounded-lg border border-slate-700 bg-slate-950/60 p-3 font-mono text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500/70"
          />
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="签名（0x 开头的十六进制字符串）..."
            rows={3}
            className="mt-3 w-full resize-y rounded-lg border border-slate-700 bg-slate-950/60 p-3 font-mono text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500/70"
          />
          <button
            onClick={verify}
            disabled={!message.trim() || !signature.trim()}
            className="mt-3 w-full rounded-lg bg-amber-500 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            验证
          </button>
        </section>

        {/* 验证结果 */}
        <section className="mt-8 space-y-3">
          <h2 className="text-base font-semibold text-slate-200">验证结果</h2>

          <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <span className="shrink-0 text-sm text-slate-400">谁签名</span>
            <span className="break-all text-right font-mono text-sm text-slate-200">
              {recovered ?? "—"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-sm text-slate-400">验证是否通过</span>
            {verified === true ? (
              <span className="font-semibold text-emerald-400">通过 ✓</span>
            ) : verified === false ? (
              <span className="font-semibold text-red-400">不通过 ✗</span>
            ) : (
              <span className="text-sm text-slate-500">待验证</span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <span className="shrink-0 text-sm text-slate-400">
              当前用户是谁
            </span>
            <span className="break-all text-right font-mono text-sm text-slate-200">
              {address ?? "未连接"}
            </span>
          </div>
        </section>

        {error && (
          <p className="mt-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
