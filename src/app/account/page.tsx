"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [telegramUsername, setTelegramUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !address) return;

    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        const localStorageKey = `signature-${address.toLowerCase()}`;
        let signature = localStorage.getItem(localStorageKey);

        if (!signature) {
          const messageToSign = `Welcome to AITA!\n\nVerify your address: ${address.toLowerCase()}`;
          signature = await signMessageAsync({ message: messageToSign });
          if (!signature) throw new Error("Failed to sign message");
          localStorage.setItem(localStorageKey, signature);
        }

        const authorizationSignature = `${address.toLowerCase()}-${signature}`;
        const response = await fetch(`/api/account`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            address: address.toLowerCase(),
            signature: authorizationSignature,
            "User-Agent": "nextjs-client",
          },
        });

        if (!response.ok) {
          console.warn("Profile not found or error");
          return;
        }

        const data = await response.json();
        if (data?.telegramUsername) {
          setTelegramUsername(data.telegramUsername);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isMounted, address, signMessageAsync]);

  const saveProfile = async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      const localStorageKey = `signature-${address.toLowerCase()}`;
      const signature = localStorage.getItem(localStorageKey);
      if (!signature) throw new Error("Missing signature");

      const authorizationSignature = `${address.toLowerCase()}-${signature}`;
      const response = await fetch(`/api/get-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          address: address.toLowerCase(),
          signature: authorizationSignature,
          "User-Agent": "nextjs-client",
        },
        body: JSON.stringify({ telegramUsername }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast.success("Profile updated!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div className="p-4 text-center text-white">
        Please connect your wallet to access profile settings.
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Left Column */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <h2 className="flex items-center text-lg font-semibold">
                <Settings className="mr-2" /> Account Settings
              </h2>
              <p className="text-sm text-neutral-400">
                Update your personal information and manage your account settings.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile();
                }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="username" className="block text-sm font-medium">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="@yourusername"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
