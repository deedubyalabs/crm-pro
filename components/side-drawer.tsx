"use client"

import * as React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SideDrawerProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function SideDrawer({ title, description, isOpen, onClose, children }: SideDrawerProps) {
  // The parent component will manage isOpen and onClose based on route changes.
  // No need for internal route change listener here.

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full w-full md:w-1/2 lg:w-1/3 fixed right-0 top-0 mt-0 rounded-none">
        <ScrollArea className="h-full">
          <DrawerHeader className="p-6 border-b">
            <DrawerTitle className="text-2xl font-bold">{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
