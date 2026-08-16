"use client";

import { useEffect, useState } from "react";
import type { Eip1193Provider } from "ethers";

// MetaMask 注入到 window.ethereum 的类型声明
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      on: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener: (
        event: string,
        listener: (...args: unknown[]) => void
      ) => void;
    };
  }
}

/** MetaMask 拒绝请求时返回的错误码 */
export const USER_REJECTED_CODE = 4001;

/** 地址缩略显示：0x1234...abcd */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** 钱包连接状态管理：连接 / 断开 / 账号切换监听 */
export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // 监听 MetaMask 账号切换
  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const list = (accounts as string[]) ?? [];
      setAddress(list.length > 0 ? list[0] : null);
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    return () =>
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  /** 连接钱包，成功后返回地址；失败时抛出用户可读的错误信息 */
  const connect = async (): Promise<string> => {
    if (!window.ethereum) {
      throw new Error("未检测到 MetaMask，请先安装 MetaMask 浏览器插件");
    }

    setConnecting(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAddress(accounts[0]);
      return accounts[0];
    } catch (err) {
      if ((err as { code?: number }).code === USER_REJECTED_CODE) {
        throw new Error("连接已取消");
      }
      throw new Error("连接钱包失败，请重试");
    } finally {
      setConnecting(false);
    }
  };

  /** 断开连接：撤销 MetaMask 站点授权，下次连接会重新弹出连接请求 */
  const disconnect = async () => {
    try {
      await window.ethereum?.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      // 撤销失败（如权限已不存在）时忽略，仍然清空本地状态
    }
    setAddress(null);
  };

  return { address, connecting, connect, disconnect };
}
