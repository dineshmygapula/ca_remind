"use client";

import { useState } from "react";
import {
  Menu,
  MenuItem,
  Button,
  Divider,
  ListItemIcon,
  Typography,
  Box,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";

import DescriptionIcon from "@mui/icons-material/Description";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import InfoIcon from "@mui/icons-material/Info";
import PolicyIcon from "@mui/icons-material/Policy";
import HelpIcon from "@mui/icons-material/Help";
import { useRouter } from "next/navigation";
import UserProfileDialog from "../../users/UserProfileDialog";
import BusinessProfileDialog from "../../business/BusinessProfileDialog";

interface Props {
  userName: string;
  onLogout: () => Promise<void> | void;
}

export default function UserDropdown({ userName, onLogout }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);

  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClose = () => setAnchorEl(null);

  const handleProfileClick = () => {
    handleClose();
    setProfileDialogOpen(true);
  };

  const navigate = (path: string) => {
    handleClose();
    router.push(path);
  };

  const handleLogoutClick = async () => {
    handleClose();
    await onLogout();
  };

  return (
    <>
      {/* ── Trigger Button (sits on navy AppBar) ── */}
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          color: "rgba(255,255,255,0.90)", // ✅ CHANGED: "text.primary" (dark) → white for navy AppBar
          borderColor: "rgba(255,255,255,0.35)", // ✅ CHANGED: "divider" (dark) → subtle white border
          "&:hover": {
            borderColor: "secondary.main", // ✅ CHANGED: "primary.main" (invisible) → Warm Gold on hover
            bgcolor: "rgba(255,255,255,0.08)", // ✅ CHANGED: "transparent" → subtle white tint
            color: "secondary.main", // ✅ ADDED: text turns Gold on hover — matches nav items
          },
        }}
      >
        {userName}
      </Button>

      {/* ── Dropdown Menu (white background — dark colors fine here) ── */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 260,
            maxHeight: 500,
            mt: 1, // ✅ ADDED: small gap between AppBar and menu
            boxShadow: "0 4px 16px rgba(26,47,94,0.14)", // ✅ ADDED: themed navy shadow
            border: "1px solid",
            borderColor: "divider", // ✅ ADDED: subtle border around dropdown
          },
        }}
      >
        {/* PROFILE */}
        <Box px={2} pt={1}>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main", // ✅ CHANGED: "text.secondary" → primary navy for section labels
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            PROFILE
          </Typography>
        </Box>

        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: "primary.main" }} />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
          User Profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            setBusinessDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <BusinessIcon fontSize="small" sx={{ color: "primary.main" }} />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
          Business Profile
        </MenuItem>

        <Divider />

        {/* MANAGEMENT */}
        <Box px={2} pt={1}>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main", // ✅ CHANGED: "text.secondary" → primary navy
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            MANAGEMENT
          </Typography>
        </Box>

        <MenuItem onClick={() => navigate("/staff")}>
          <ListItemIcon>
            <GroupIcon fontSize="small" sx={{ color: "primary.main" }} />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
          Staff
        </MenuItem>

        {/* <MenuItem onClick={() => navigate("/task-types")}>
          <ListItemIcon>
            <TaskIcon fontSize="small" sx={{ color: "primary.main" }} />     {/* ✅ ADDED: navy icon color
          </ListItemIcon>
          Task Types
    </MenuItem >  */}

        <MenuItem onClick={() => navigate("/templates")}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" sx={{ color: "primary.main" }} />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
          Templates
        </MenuItem>

        <Divider />

        {/* PREFERENCES */}
        <Box px={2} pt={1}>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main", // ✅ CHANGED: "text.secondary" → primary navy
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            PREFERENCES
          </Typography>
        </Box>

        <MenuItem onClick={() => navigate("/subscription")}>
          <ListItemIcon>
            <CreditCardIcon fontSize="small" sx={{ color: "primary.main" }} />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
          Subscription & Billing
        </MenuItem>

        <MenuItem onClick={() => navigate("/notifications")}>
          <ListItemIcon>
            <NotificationsIcon
              fontSize="small"
              sx={{ color: "primary.main" }}
            />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
          Notification Settings
        </MenuItem>

        <Divider />
          {/* Support */}
        <Box px={2} pt={1}>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main", // ✅ CHANGED: "text.secondary" → primary navy
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
           SUPPORT
          </Typography>
        </Box>

        <MenuItem onClick={() => navigate("/talkwithagent")}>
          <ListItemIcon>
            <CreditCardIcon fontSize="small" sx={{ color: "primary.main" }} />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
          Talk With Agent
        </MenuItem>

        <MenuItem onClick={() => navigate("/aboutapp")}>
          <ListItemIcon>
            <NotificationsIcon
              fontSize="small"
              sx={{ color: "primary.main" }}
            />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
         About App
        </MenuItem>
        <MenuItem onClick={() => navigate("/policies")}>
          <ListItemIcon>
            <NotificationsIcon
              fontSize="small"
              sx={{ color: "primary.main" }}
            />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
         Policies
        </MenuItem>
         <MenuItem onClick={() => navigate("/help&support")}>
          <ListItemIcon>
            <NotificationsIcon
              fontSize="small"
              sx={{ color: "primary.main" }}
            />{" "}
            {/* ✅ ADDED: navy icon color */}
          </ListItemIcon>
         Help & Support
        </MenuItem>

        <Divider />
       

        {/* Sign Out — keeps error.main (red) ✅ */}
        <MenuItem onClick={handleLogoutClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />{" "}
            {/* ✅ ADDED: explicit error color on icon */}
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      <UserProfileDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />
      <BusinessProfileDialog
        open={businessDialogOpen}
        onClose={() => setBusinessDialogOpen(false)}
      />
    </>
  );
}
