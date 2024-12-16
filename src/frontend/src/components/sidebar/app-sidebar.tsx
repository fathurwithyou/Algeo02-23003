import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SaluSidebarContent } from "./sidebarContent";
import { ThemeTogglerBtn } from "../theme/ThemeTogglerBtn";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="">
            SALU <ThemeTogglerBtn />
          </SidebarGroupLabel>
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
