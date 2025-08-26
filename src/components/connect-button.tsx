"use client";

import React from "react";
import { Button } from './ui/button';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

export const CustomConnectButton = (): React.ReactElement => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}

                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        variant="outline"
                                        className="text-neutral-300 border-2"
                                        type="button"
                                    >
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button onClick={openChainModal} variant="outline"
                                        type="button"
                                    >
                                        Wrong network
                                    </Button>
                                );
                            }
                            return (
                                <div className="flex space-x-2 items-center">
                                    <Button onClick={openChainModal}
                                        variant="outline"
                                        type="button"
                                        className="hidden md:flex"
                                    >
                                        {chain.iconUrl && (
                                            <img
                                                alt={chain.name}
                                                className="w-4 h-4 md:w-6 md:h-6 rounded-full"
                                                src={chain.iconUrl}
                                            />
                                        )}
                                    </Button>

                                    <Button variant="outline"
                                        type="button"
                                    >
                                        <span className="hidden text-xs md:text-sm">

                                            {account.displayBalance
                                                ? ` ${account.displayBalance} `
                                                : ''}
                                        </span>
                                        <div onClick={openAccountModal}
                                            className="flex items-center rounded-full text-white"
                                            
                                        >
                                            <Wallet className="w-4 h-4 md:w-6 md:h-6 rounded-full mr-0 md:mr-1" />
                                            <div className="hidden md:block text-xs md:text-sm">
                                                {account.displayName}
                                            </div>

                                        </div>
                                    </Button>

                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
