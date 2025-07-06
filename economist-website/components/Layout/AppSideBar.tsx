"use client";

import { UserButton } from "@clerk/nextjs";
import { Bug, MessageSquare, Settings } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import BugReport from "../BugReport/BugReport";
import Preferences from "../Preferences/Preference";
import Vaults from "../vault/Vaults";
import Workspaces from "../workspace/Workspaces";

export default function AppSidebar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDiscordJoin = () => {
    window.open("https://discord.gg/your-server-invite", "_blank");
  };

  return (
    <Sidebar className="transition-all duration-300 ease-in-out">
      <SidebarHeader>
        <div className="p-4 border-b transition-colors duration-200">
          <div className="flex items-center gap-2 group">
            <div className="transform group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logo.png"
                alt="The Economist logo"
                width={100}
                height={100}
              />
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
              The Economist
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col space-y-4 px-4 mt-4">
            <Vaults />
            <Workspaces />
          </div>
          <div className="mt-8 border-t pt-4">
            <SidebarGroupLabel className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4">
              Support & Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Dialog>
                    <DialogTrigger asChild>
                      <SidebarMenuButton className="w-full flex items-center gap-2 ">
                        <Bug className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>Report a Bug</span>
                      </SidebarMenuButton>
                    </DialogTrigger>
                    <BugReport />
                  </Dialog>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="w-full flex items-center gap-2 "
                    onClick={handleDiscordJoin}
                  >
                    <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span>Join Discord</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Dialog>
                    <DialogTrigger asChild>
                      <SidebarMenuButton className="w-full flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold mb-4">
                          Settings
                        </DialogTitle>
                      </DialogHeader>
                      <Preferences />
                    </DialogContent>
                  </Dialog>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col items-center">
          {mounted && <UserButton />}
          <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Manage your account and profile info here
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
