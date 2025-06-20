

import AppSidebar from "@/components/Layout/AppSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="">
                <div className="fixed top-4 z-50">
                    <SidebarTrigger />
                </div>
                <div className="min-h-screen pl-16 md:pl-64 pr-4 md:pr-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </SidebarProvider>
    )
}
