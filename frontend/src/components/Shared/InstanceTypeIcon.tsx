import React from "react";
import Avatar from "@mui/joy/Avatar";

const typeIcon: Record<string, string> = {
  lemmy: "/icons/lemmy_64px.png",
  mbin: "/icons/mbin_64px.png",
  piefed: "/icons/piefed_64px.png",
};

export default function InstanceTypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  const src = typeIcon[type];
  if (!src) return null;
  return <Avatar src={src} alt={type} sx={{ mr: 0.5, width: size, height: size }} />;
}
