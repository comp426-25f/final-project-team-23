"use client";

import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";


export default function ItineraryPage() {

    return (
        <SidebarProvider>
            <div className="flex flex-col min-h-screen w-full">
                <Header />
                <Sidebar className="border-b mt-18">
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarHeader className="font-bold">Trips</SidebarHeader>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>Placeholder</SidebarMenuItem>
                                    <SidebarMenuItem><Button className="w-full" variant={"outline"}>Add Trip</Button></SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            </div>
        </SidebarProvider>
    );
}
