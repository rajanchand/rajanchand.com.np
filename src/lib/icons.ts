import {
  Globe,
  Shield,
  Server,
  Cloud,
  Router,
  Network,
  Search,
  Lock,
  ShieldCheck,
  Terminal,
  Monitor,
  Activity,
  Code,
  GitBranch,
  Settings,
  Bell,
  Wifi,
  Tv,
  Linkedin,
  Github,
  Twitter,
  Facebook,
} from "lucide-react";
import React from "react";

// Explicit icon map to avoid unsafe type casts of the lucide-react module
const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Shield,
  Server,
  Cloud,
  Router,
  Network,
  Search,
  Lock,
  ShieldCheck,
  Terminal,
  Monitor,
  Activity,
  Code,
  GitBranch,
  Settings,
  Bell,
  Wifi,
  Tv,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Container: Server, // alias
};

export function getIcon(name: string): React.ComponentType<{ className?: string }> | undefined {
  return icons[name];
}
