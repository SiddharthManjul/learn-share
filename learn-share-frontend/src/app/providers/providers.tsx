"use client";

import { ArweaveWalletKit } from "arweave-wallet-kit";
import React from "react";

function ArweaveProvider({ children }: { children: React.ReactNode }) {
  return (
    <ArweaveWalletKit
      config={{
        permissions: [
          "ACCESS_ADDRESS",
          "ACCESS_ALL_ADDRESSES",
          "SIGN_TRANSACTION",
          "DISPATCH",
        ],
        ensurePermissions: true,
      }}
    >
      {children}
    </ArweaveWalletKit>
  );
}

export default ArweaveProvider;
