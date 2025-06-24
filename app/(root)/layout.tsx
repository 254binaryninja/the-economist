

import AppSidebar from "@/components/Layout/AppSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="">
                <div className="fixed top-2 sm:top-4 left-2 sm:left-4 z-50">
                    <SidebarTrigger />
                </div>               
                 <div className="min-h-screen pl-12 sm:pl-16 md:pl-64 pr-2 sm:pr-4 md:pr-8 pt-12 sm:pt-0">
                    <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[calc(100vh-3rem)]">
                        <div className="w-full flex flex-col items-center justify-center">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </SidebarProvider>
    )
}
