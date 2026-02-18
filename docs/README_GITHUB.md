# Network Guru Manager - Professional Network Management App

A feature-rich Android/iOS mobile application for network monitoring and management, designed for IT professionals, MSPs, and business owners managing multiple networks.

## 🎯 Overview

Network Guru Manager brings enterprise-grade network management capabilities to mobile devices. Monitor multiple networks, collaborate with teams, generate professional reports, and respond to alerts instantly—all from your mobile device.

**Inspired by:** Fing Professional  
**Built with:** React Native, Expo, TypeScript, Node.js, MySQL

## ✨ Key Features

### 🏢 Shared Workspaces
- Create logical groupings of networks for different clients or sites
- Invite team members with role-based permissions (Admin, Editor, Viewer)
- Collaborate without manual context switching
- Maintain separate access controls per workspace

### 📊 Centralized Dashboard
- High-level overview of all monitored networks
- Real-time status indicators for each network
- Quick stats: total devices, online/offline count, active alerts
- Activity feed showing recent changes and events

### 👥 Team Collaboration
- Invite colleagues with specific roles and permissions
- Assign Admin, Editor, or Viewer roles
- Activity audit trail tracking all team actions
- Shared resources: filters, reports, alert rules

### 🔍 Advanced Search & Filtering
- Search for devices across all networks simultaneously
- Filter by device type, manufacturer, status, firmware version
- Save and reuse common searches
- Built-in filter templates: Offline Devices, Outdated Firmware, Critical Alerts

### 📋 Professional Reporting
- Generate Performance, Security, and Inventory reports
- Export in PDF, CSV, or Excel formats
- Schedule recurring reports
- Include custom date ranges and network selection

### 🚨 Intelligent Alerts
- Real-time alert notifications (Critical, Warning, Info)
- Acknowledge and resolve alerts from mobile
- Configure alert rules and thresholds
- Track alert history and trends

### 🤖 Monitoring Agents
- Deploy agents on Raspberry Pi, NAS, or Docker
- 24/7 continuous network monitoring
- Deeper diagnostic data collection
- Agent health monitoring and management

### 📱 Multi-Network Management
- Monitor 3+ networks simultaneously
- Expandable to support business growth
- Per-network configuration and settings
- Support for distributed environments

## 🚀 Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm 9.12.0+
- MySQL 8.0+
- Expo Go app (for testing on mobile)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/network-guru-manager.git
cd network-guru-manager

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Mobile Testing

**iOS/Android via Expo Go:**
```bash
# Generate QR code
pnpm qr

# Scan with Expo Go app on your device
```

**Build APK for Android:**
```bash
# Build APK
pnpm build:android

# Find APK in dist/ directory
```

## 📁 Project Structure

```
network-guru-manager/
├── app/                          # Mobile app screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx             # Dashboard screen
│   │   └── ...                   # Other tab screens
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── screen-container.tsx      # SafeArea wrapper
│   └── ui/                       # UI primitives
├── server/                       # Backend API
│   ├── routers.ts                # tRPC routes
│   ├── db.ts                     # Database queries
│   └── _core/                    # Framework code
├── drizzle/                      # Database
│   ├── schema.ts                 # Table definitions
│   └── migrations/               # Database migrations
├── lib/                          # Utilities
│   ├── trpc.ts                   # tRPC client
│   └── utils.ts                  # Helper functions
├── hooks/                        # Custom React hooks
├── design.md                     # UI/UX design guide
├── FEATURES.md                   # Feature documentation
├── IMPLEMENTATION_GUIDE.md       # Development guide
└── todo.md                       # Feature tracking
```

## 🏗️ Architecture

### Frontend
- **Framework:** React Native with Expo SDK 54
- **Styling:** NativeWind (Tailwind CSS)
- **State Management:** React Context + TanStack Query
- **Navigation:** Expo Router
- **Type Safety:** TypeScript 5.9

### Backend
- **Runtime:** Node.js
- **API:** tRPC with type-safe procedures
- **Database:** MySQL with Drizzle ORM
- **Validation:** Zod schemas
- **Authentication:** Manus OAuth

### Database Schema
- **Users:** Authentication and user profiles
- **Workspaces:** Team collaboration containers
- **Networks:** Monitored network definitions
- **Devices:** Network device inventory
- **Alerts:** Alert management and history
- **MonitoringAgents:** Deployed monitoring agents
- **Reports:** Generated reports and history
- **FilterTemplates:** Saved search filters
- **AlertRules:** Alert configuration rules
- **ActivityLog:** Audit trail

## 🔐 Security

- **Authentication:** OAuth 2.0 via Manus
- **Authorization:** Role-based access control (RBAC)
- **Data Protection:** HTTPS for all communications
- **Token Storage:** Secure storage on mobile devices
- **Audit Trail:** Complete activity logging

## 📊 Database Schema

```
users (1) ──→ (many) workspaces
users (1) ──→ (many) workspaceMembers
workspaces (1) ──→ (many) networks
workspaces (1) ──→ (many) alerts
networks (1) ──→ (many) devices
networks (1) ──→ (many) monitoringAgents
devices (1) ──→ (many) alerts
```

## 🛠️ Development

### Available Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev:server       # Start backend only
pnpm dev:metro        # Start Metro bundler only

# Database
pnpm db:push          # Generate and run migrations

# Testing
pnpm test             # Run tests
pnpm test:watch       # Watch mode

# Building
pnpm build            # Build for production
pnpm build:android    # Build APK
pnpm build:ios        # Build IPA

# Code Quality
pnpm lint             # Run linter
pnpm format           # Format code
pnpm check            # Type check
```

### API Routes

All API routes are type-safe tRPC procedures:

```typescript
// Workspaces
trpc.workspaces.list.useQuery()
trpc.workspaces.create.useMutation()

// Networks
trpc.networks.list.useQuery({ workspaceId: 1 })
trpc.networks.create.useMutation()

// Devices
trpc.devices.list.useQuery({ networkId: 1 })
trpc.devices.update.useMutation()

// Alerts
trpc.alerts.list.useQuery({ workspaceId: 1 })
trpc.alerts.updateStatus.useMutation()

// Reports
trpc.reports.create.useMutation()
trpc.reports.list.useQuery({ workspaceId: 1 })
```

## 📱 Mobile Features

### iOS
- Native iOS design following Human Interface Guidelines
- Face ID / Touch ID biometric authentication
- Push notifications
- Background sync
- Offline support

### Android
- Material Design 3
- Biometric authentication
- Push notifications
- Background sync
- Offline support

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm test:e2e
```

## 📈 Performance

- Lazy loading for large device lists
- Efficient data caching
- Optimized database queries
- Background sync
- Minimal battery consumption

## 🚀 Deployment

### GitHub Actions CI/CD
- Automated testing on push
- Build APK on release
- Publish to app stores

### Manual Build

```bash
# Build APK
eas build --platform android --local

# Build IPA
eas build --platform ios --local
```

## 📚 Documentation

- **[Design Guide](./design.md)** - UI/UX design principles
- **[Features](./FEATURES.md)** - Detailed feature documentation
- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Development guide
- **[Server README](./server/README.md)** - Backend documentation
- **[TODO](./todo.md)** - Feature tracking and progress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Fing Professional](https://www.fing.com/)
- Built with [Expo](https://expo.dev/)
- Powered by [React Native](https://reactnative.dev/)
- Type-safe APIs with [tRPC](https://trpc.io/)

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the implementation guide

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Multi-network management
- ✅ Team collaboration
- ✅ Alert management
- ✅ Monitoring agents
- ⏳ Mobile UI implementation

### Phase 2 (Q2 2026)
- Advanced analytics
- Predictive alerting
- Workflow automation
- Third-party integrations

### Phase 3 (Q3 2026)
- Machine learning anomaly detection
- Mobile agent deployment
- White-label support
- Multi-language support

### Phase 4 (Q4 2026)
- Advanced API
- Custom integrations
- Enterprise SSO
- Compliance certifications

---

**Built with ❤️ for network professionals**

