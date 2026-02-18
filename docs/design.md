# Network Guru Manager - Mobile App Design

## Overview
Network Guru Manager is a professional network monitoring and management application designed for IT consultants, MSPs, and business owners managing multiple networks. The app provides centralized monitoring, collaboration, and advanced analytics across distributed network environments.

**Design Principle:** iOS-first, one-handed usage, professional yet accessible interface following Apple Human Interface Guidelines.

---

## Screen List

### Authentication & Onboarding
1. **Splash Screen** - App launch with branding
2. **Login Screen** - Email/password authentication
3. **Sign Up Screen** - New account creation
4. **Workspace Selection** - Choose workspace on login
5. **Onboarding Tour** - First-time user walkthrough

### Core Navigation (Tab Bar)
1. **Dashboard** (Home Tab)
2. **Networks** (Networks Tab)
3. **Search & Filters** (Search Tab)
4. **Reports** (Reports Tab)
5. **Settings** (Settings Tab)

### Dashboard Screens
1. **Multi-Network Dashboard** - High-level status across all networks
2. **Network Health Overview** - Real-time metrics and alerts
3. **Device Status Summary** - Quick view of device states
4. **Activity Feed** - Recent events and changes

### Network Management
1. **Networks List** - All monitored networks with status
2. **Network Detail** - Detailed view of a single network
3. **Device List** - All devices in a network
4. **Device Detail** - Individual device information and history
5. **Network Settings** - Configure monitoring and alerts

### Collaboration & Workspaces
1. **Workspaces List** - All accessible workspaces
2. **Workspace Settings** - Manage workspace configuration
3. **Team Members** - View and manage collaborators
4. **Invite Team Member** - Add users with role assignment
5. **Permissions Management** - Configure role-based access

### Search & Filtering
1. **Advanced Search** - Cross-network device/asset search
2. **Filter Templates** - Predefined smart filters
3. **Custom Filters** - Create and save custom filter rules
4. **Search Results** - Display filtered device/network results

### Reporting & Analytics
1. **Reports List** - Available and scheduled reports
2. **Report Generator** - Create custom reports
3. **Report Detail** - View generated report with export options
4. **Performance Metrics** - Network performance analytics
5. **Device Inventory Report** - Comprehensive device listing

### Monitoring & Alerts
1. **Alerts Dashboard** - Active and historical alerts
2. **Alert Configuration** - Set alert thresholds and rules
3. **Alert Detail** - View alert details and history
4. **Offline Devices** - Devices currently offline
5. **Firmware Status** - Outdated firmware notifications

### Settings & Configuration
1. **Account Settings** - User profile and preferences
2. **Notification Preferences** - Alert and notification settings
3. **App Settings** - General app configuration
4. **About & Help** - App information and support
5. **Logout** - Session management

### Agent Management
1. **Monitoring Agents** - List of deployed agents
2. **Agent Configuration** - Add and configure agents
3. **Agent Status** - Real-time agent health
4. **Agent Logs** - Agent activity and diagnostics

---

## Primary Content and Functionality

### Dashboard Screen
**Content:**
- Network status cards (online/offline, device count, alerts)
- Quick stats: Total networks, monitored devices, offline devices, critical alerts
- Activity timeline showing recent changes
- Quick action buttons (Add Network, View Reports)

**Functionality:**
- Tap network card to navigate to network detail
- Pull-to-refresh to sync data
- Swipe to see more networks
- Quick access to common actions

### Networks List
**Content:**
- Network name, location, status indicator
- Device count and health percentage
- Last sync time
- Workspace indicator

**Functionality:**
- Tap to view network details
- Swipe actions: Edit, Delete, Share
- Long-press for bulk actions
- Search within networks

### Device List (Network Detail)
**Content:**
- Device name, IP address, MAC address
- Device type and manufacturer
- Status (online/offline/idle)
- Last seen timestamp
- Signal strength (if WiFi)

**Functionality:**
- Tap device for detailed view
- Filter by status, type, or manufacturer
- Sort by name, status, or last seen
- Bulk actions on selected devices

### Advanced Search
**Content:**
- Search input with autocomplete
- Filter chips: Device type, Status, Manufacturer, Network, Workspace
- Search results with relevance ranking
- Saved search history

**Functionality:**
- Real-time search across all networks
- Apply multiple filters simultaneously
- Save frequent searches
- Export search results

### Filter Templates
**Content:**
- Predefined templates: Offline Devices, Outdated Firmware, Critical Alerts, New Devices
- Custom filters created by user
- Filter criteria display
- Active filter indicator

**Functionality:**
- Tap template to apply filter
- Create new custom filter
- Edit existing filters
- Delete saved filters

### Reports
**Content:**
- Report type selector (Performance, Security, Inventory)
- Date range picker
- Network/workspace selector
- Report preview
- Export options (PDF, CSV, Excel)

**Functionality:**
- Generate on-demand reports
- Schedule recurring reports
- View report history
- Share reports with team members

### Collaboration Features
**Content:**
- Team member list with roles
- Invite form with email input
- Role selector (Admin, Editor, Viewer)
- Permission matrix

**Functionality:**
- Add team members
- Edit member roles
- Remove members
- View member activity

### Alerts Dashboard
**Content:**
- Alert severity indicator (Critical, Warning, Info)
- Alert message and affected device/network
- Timestamp and status (New, Acknowledged, Resolved)
- Alert type badge

**Functionality:**
- Filter by severity or status
- Mark as acknowledged/resolved
- View alert history
- Configure alert rules

### Agent Management
**Content:**
- Agent name and deployment location
- Agent status (Online, Offline, Error)
- Last heartbeat timestamp
- Data collection metrics

**Functionality:**
- Add new agent (generate configuration)
- View agent logs
- Restart agent
- Remove agent

---

## Key User Flows

### Flow 1: Monitor Multiple Networks
1. User logs in → Workspace selection
2. Dashboard displays all networks
3. Tap network card → Network detail screen
4. View devices in network
5. Tap device → Device detail with history
6. Return to dashboard via back or tab

### Flow 2: Search for Specific Device Across Networks
1. Tap Search tab
2. Enter device name or IP in search box
3. Results appear across all networks
4. Apply filters (type, status, manufacturer)
5. Tap result → Device detail
6. View device information and history

### Flow 3: Generate and Share Report
1. Tap Reports tab
2. Select report type (Performance/Security/Inventory)
3. Choose date range and networks
4. Preview report
5. Export as PDF/CSV
6. Share via email or messaging

### Flow 4: Collaborate with Team Member
1. Tap Settings → Team Members
2. Tap "Invite Member"
3. Enter email and select role (Admin/Editor/Viewer)
4. Send invitation
5. Team member receives invite and joins workspace
6. Permissions applied automatically

### Flow 5: Set Up Monitoring Agent
1. Tap Settings → Monitoring Agents
2. Tap "Add Agent"
3. Select deployment type (Raspberry Pi/NAS/Docker)
4. Copy configuration/command
5. Deploy agent on device
6. Agent appears in list when online
7. Real-time data flows to dashboard

### Flow 6: Configure Alerts
1. Tap Settings → Alert Configuration
2. Select alert type (Offline, Firmware, Performance)
3. Set threshold values
4. Choose notification method (Push, Email, In-app)
5. Enable/disable alert
6. Save configuration

### Flow 7: Filter and Highlight Priority Issues
1. Tap Search tab
2. Select filter template (e.g., "Offline Devices")
3. Results show only offline devices
4. Or create custom filter with multiple criteria
5. Save filter for future use
6. Apply saved filters from quick access

---

## Color Choices

### Brand Colors
- **Primary Blue:** `#0a7ea4` - Professional, trustworthy, tech-forward
- **Accent Teal:** `#17a2b8` - Complementary for highlights
- **Success Green:** `#22c55e` - Online/healthy status
- **Warning Orange:** `#f59e0b` - Caution/attention needed
- **Error Red:** `#ef4444` - Offline/critical issues

### Neutral Palette
- **Background:** `#ffffff` (light), `#151718` (dark)
- **Surface:** `#f5f5f5` (light), `#1e2022` (dark)
- **Foreground:** `#11181c` (light), `#ecedee` (dark)
- **Muted:** `#687076` (light), `#9ba1a6` (dark)
- **Border:** `#e5e7eb` (light), `#334155` (dark)

### Status Indicators
- **Online:** Green (`#22c55e`)
- **Offline:** Red (`#ef4444`)
- **Idle:** Gray (`#9ba1a6`)
- **Warning:** Orange (`#f59e0b`)
- **Critical:** Dark Red (`#dc2626`)

---

## Typography & Spacing

### Font Sizes
- **Display:** 32pt (screen titles)
- **Heading 1:** 28pt (section headers)
- **Heading 2:** 24pt (subsection headers)
- **Title:** 18pt (card titles)
- **Body:** 16pt (main text)
- **Caption:** 14pt (secondary text)
- **Small:** 12pt (metadata, timestamps)

### Spacing
- **Extra Small:** 4pt
- **Small:** 8pt
- **Medium:** 12pt
- **Large:** 16pt
- **Extra Large:** 24pt
- **Huge:** 32pt

---

## Interaction Patterns

### Touch Feedback
- **Primary Buttons:** Scale 0.97 + haptic light feedback
- **List Items:** Opacity 0.7 on tap
- **Icons/Secondary Actions:** Opacity 0.6 on tap

### Gestures
- **Swipe Left:** Quick actions (Edit, Delete, Share)
- **Swipe Right:** Go back (alternative to back button)
- **Pull Down:** Refresh data
- **Long Press:** Select item for bulk actions
- **Pinch:** Zoom on charts/graphs

### Loading States
- Skeleton loaders for list items
- Spinner for full-screen operations
- Progress bar for file uploads/exports

### Empty States
- Descriptive message
- Illustration or icon
- Call-to-action button (Add Network, Invite Member, etc.)

---

## Accessibility Considerations

- High contrast colors for status indicators
- Minimum touch target size: 44pt × 44pt
- Clear hierarchy with font weights
- Descriptive labels for all interactive elements
- Support for system font size adjustments
- Dark mode support for reduced eye strain

---

## Performance Optimization

- Lazy load device lists (pagination)
- Cache network data with sync indicators
- Background sync for agent data
- Offline support for cached data
- Efficient search indexing for cross-network queries

