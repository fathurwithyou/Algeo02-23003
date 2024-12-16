import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SaluSidebarContent } from "./sidebarContent";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel className=""></SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              <SaluSidebarContent />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
