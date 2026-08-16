"use client";

import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { shortAddress, useWallet, USER_REJECTED_CODE } from "@/lib/wallet";

export default function Home() {
  const { address, connecting, connect, disconnect } = useWallet();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [signing, setSigning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // 地址变化（连接/切换账号/断开）时清空旧签名
  useEffect(() => {
    setSignature("");
  }, [address]);

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
  };

  const sign = async () => {
    setError("");
    if (!window.ethereum || !address) return;

    setSigning(true);
    try {
      // signMessage 走 personal_sign，MetaMask 弹窗会展示完整消息内容
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const sig = await signer.signMessage(message);
      setSignature(sig);
    } catch (err) {
      if ((err as { code?: number }).code === USER_REJECTED_CODE) {
        setError("签名已取消");
      } else {
        setError("签名失败，请重试");
      }
    } finally {
      setSigning(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(signature);
    } catch {
      // 非安全上下文等场景下的降级方案
      const textarea = document.createElement("textarea");
      textarea.value = signature;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 在新窗口打开验证界面，不跳转当前页面
  const openVerify = () => {
    // 注意：features 里带 noopener 时 window.open 恒返回 null（规范规定），
    // 会导致弹窗成功打开却误报"被拦截"，所以改为打开后手动隔离
    const win = window.open("/verify", "_blank", "width=960,height=760");
    if (!win) {
      setError("弹窗被浏览器拦截，请允许本站弹出窗口后重试");
      return;
    }
    win.opener = null;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold tracking-wide">
          签名生成工具
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          使用 MetaMask 对任意消息进行签名
        </p>

        {/* 第一步：连接钱包 */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-slate-200">
            第一步 · 连接钱包
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
              当前地址：{address ? shortAddress(address) : "未连接"}
            </span>
          </div>
        </section>

        {/* 第二步：填入 Message */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-slate-200">
            第二步 · 填入 Message
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="在此输入要签名的消息内容..."
            rows={4}
            className="mt-3 w-full resize-y rounded-lg border border-slate-700 bg-slate-950/60 p-3 font-mono text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500/70"
          />
          <button
            onClick={sign}
            disabled={!address || !message.trim() || signing}
            className="mt-3 w-full rounded-lg bg-amber-500 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signing ? "签名中..." : "生成签名（Sign）"}
          </button>
        </section>

        {/* 签名结果 */}
        {signature && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">
                签名结果
              </h2>
              <button
                onClick={copy}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-amber-500/70 hover:text-amber-400"
              >
                {copied ? "已复制 ✓" : "一键复制"}
              </button>
            </div>
            <code className="mt-3 block w-full break-all rounded-lg border border-slate-800 bg-slate-950/60 p-3 font-mono text-xs leading-relaxed text-emerald-400">
              {signature}
            </code>
          </section>
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* 跳转验证界面 */}
        <button
          onClick={openVerify}
          className="mt-8 w-full rounded-lg border border-dashed border-slate-700 py-3 text-sm text-slate-400 transition hover:border-amber-500/70 hover:text-amber-400"
        >
          打开验证界面 ↗（新窗口）
        </button>
      </div>
    </main>
  );
}
