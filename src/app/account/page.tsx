import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function Home() {
  return (
     <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Left Column */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <h2 className="flex items-center text-lg font-semibold"><Settings className="mr-2" /> Account Settings</h2>
              <p className="text-sm text-neutral-400">
                Update your personal information and manage your account settings.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <form className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="@yourusername"
                  />
                  <Button variant="outline" className="mt-2">Save</Button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
