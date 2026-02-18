# Network Guru Manager - Testing Guide

## Overview

This guide covers testing procedures for all major features of the Network Guru Manager mobile app.

---

## Test Environment Setup

### Prerequisites
- Node.js 22.13.0+
- pnpm 9.12.0+
- MySQL 8.0+ (running)
- Expo Go app on iOS/Android device or emulator

### Starting the App

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Generate QR code for mobile testing
pnpm qr
```

### Accessing the Web Preview
- Metro Bundler: https://8081-i3sogtn13lh0sft70dy7x-5601f49b.us2.manus.computer
- Backend API: http://127.0.0.1:3000

---

## Feature Testing Checklist

### 1. Authentication & Login

**Test Cases:**
- [ ] User can log in with valid credentials
- [ ] Invalid credentials show error message
- [ ] Session persists after app restart
- [ ] Logout clears session and returns to login screen
- [ ] Token refresh works automatically

**Steps:**
1. Launch app
2. Tap "Login" button
3. Enter valid credentials
4. Verify dashboard loads
5. Close and reopen app
6. Verify session is maintained

---

### 2. Dashboard Screen

**Test Cases:**
- [ ] Dashboard loads with network overview
- [ ] Quick stats display correct values
- [ ] Network cards show status indicators
- [ ] Pull-to-refresh updates data
- [ ] Activity feed displays recent events
- [ ] Tap network card navigates to detail

**Steps:**
1. Log in successfully
2. Verify dashboard displays:
   - Network count
   - Device count
   - Alert count
   - Status indicator
3. Pull down to refresh
4. Verify data updates
5. Tap on network card
6. Verify navigation works

**Expected Results:**
- Dashboard loads within 2 seconds
- All stats are accurate
- Refresh completes within 3 seconds
- Navigation is smooth

---

### 3. Workspace Management

**Test Cases:**
- [ ] User can create new workspace
- [ ] Workspace name is required
- [ ] Workspace appears in list immediately
- [ ] User can view workspace details
- [ ] User can invite team members
- [ ] Role assignment works correctly
- [ ] Member list updates after invitation

**Steps:**
1. Navigate to Workspaces tab
2. Tap "+ New" button
3. Enter workspace name and description
4. Tap "Create"
5. Verify workspace appears in list
6. Tap workspace to view details
7. Tap "+ Invite Member"
8. Enter email and select role
9. Tap "Invite"
10. Verify member appears in list

**Expected Results:**
- Workspace creation completes within 2 seconds
- Form validation works
- Member invitation succeeds
- UI updates immediately

---

### 4. Network Management

**Test Cases:**
- [ ] User can add new network
- [ ] Network appears in dashboard
- [ ] Network status updates correctly
- [ ] Device list loads for network
- [ ] Device status indicators work
- [ ] Filtering devices works
- [ ] Sorting devices works

**Steps:**
1. From Dashboard, tap "+ Add" button
2. Enter network name and location
3. Tap "Create"
4. Verify network appears in list
5. Tap network to view devices
6. Verify device list loads
7. Test filtering by status
8. Test sorting by name

**Expected Results:**
- Network creation succeeds
- Device list loads within 2 seconds
- Filtering/sorting is instant
- UI is responsive

---

### 5. Real-Time Updates

**Test Cases:**
- [ ] Device status changes appear instantly
- [ ] New alerts appear in real-time
- [ ] Alert banner displays for critical alerts
- [ ] Activity feed updates live
- [ ] WebSocket reconnects on disconnect
- [ ] Offline data is cached

**Steps:**
1. Open Dashboard on two devices
2. Change device status on one device
3. Verify change appears on other device
4. Create alert from backend
5. Verify alert appears instantly
6. Disconnect network on one device
7. Verify cached data still displays
8. Reconnect and verify sync

**Expected Results:**
- Updates appear within 1 second
- WebSocket reconnects automatically
- Offline mode works gracefully
- Data syncs when reconnected

---

### 6. Alerts & Notifications

**Test Cases:**
- [ ] Alerts display with correct severity
- [ ] Critical alerts show red banner
- [ ] User can acknowledge alerts
- [ ] User can resolve alerts
- [ ] Alert history is maintained
- [ ] Notification preferences work
- [ ] Push notifications are received

**Steps:**
1. Navigate to Alerts tab
2. Verify alert list displays
3. Tap critical alert
4. Verify banner shows
5. Tap "Acknowledge"
6. Verify status changes
7. Tap "Resolve"
8. Verify alert moves to resolved

**Expected Results:**
- Alerts display correctly
- Status changes are immediate
- Notifications are received
- History is maintained

---

### 7. Search & Filtering

**Test Cases:**
- [ ] Search finds devices by name
- [ ] Search finds devices by IP
- [ ] Search finds devices by MAC
- [ ] Filters narrow results correctly
- [ ] Multiple filters work together
- [ ] Saved filters persist
- [ ] Filter templates apply correctly

**Steps:**
1. Navigate to Search tab
2. Enter device name in search
3. Verify results appear
4. Apply status filter
5. Verify results narrow
6. Apply manufacturer filter
7. Verify combined filtering works
8. Save filter
9. Close app and reopen
10. Verify saved filter still exists

**Expected Results:**
- Search returns results within 1 second
- Filters work independently and together
- Saved filters persist
- Results are accurate

---

### 8. Reporting

**Test Cases:**
- [ ] User can create performance report
- [ ] User can create security report
- [ ] User can create inventory report
- [ ] Reports generate successfully
- [ ] Reports can be exported as PDF
- [ ] Reports can be exported as CSV
- [ ] Report history is maintained
- [ ] Scheduled reports work

**Steps:**
1. Navigate to Reports tab
2. Tap "Generate Report"
3. Select report type
4. Choose date range
5. Select networks
6. Tap "Generate"
7. Verify report loads
8. Tap "Export" and select PDF
9. Verify PDF downloads
10. Repeat for CSV export

**Expected Results:**
- Report generation completes within 5 seconds
- Exports work correctly
- Report history is maintained
- Scheduled reports execute on time

---

### 9. Monitoring Agents

**Test Cases:**
- [ ] User can add monitoring agent
- [ ] Agent types display correctly
- [ ] Agent status updates in real-time
- [ ] Agent logs are viewable
- [ ] Agent can be restarted
- [ ] Agent can be removed
- [ ] Agent heartbeat is tracked

**Steps:**
1. Navigate to Settings > Monitoring Agents
2. Tap "+ Add Agent"
3. Select agent type (Raspberry Pi)
4. Copy configuration
5. Deploy agent (simulated)
6. Verify agent appears online
7. View agent logs
8. Restart agent
9. Verify status updates
10. Remove agent

**Expected Results:**
- Agent setup is straightforward
- Status updates are real-time
- Logs are accessible
- Management operations work

---

### 10. Settings & Preferences

**Test Cases:**
- [ ] User can change theme (light/dark)
- [ ] User can update profile
- [ ] User can change password
- [ ] Notification preferences save
- [ ] Privacy settings work
- [ ] Data export works
- [ ] Settings persist after restart

**Steps:**
1. Navigate to Settings tab
2. Toggle dark mode
3. Verify theme changes
4. Update profile information
5. Verify changes save
6. Change notification preferences
7. Close and reopen app
8. Verify settings persist

**Expected Results:**
- Theme changes immediately
- Settings save successfully
- Preferences persist
- All features work as expected

---

## Performance Testing

### Load Testing
- [ ] Dashboard loads with 100+ networks
- [ ] Device list handles 1000+ devices
- [ ] Search completes within 2 seconds
- [ ] Alerts load within 1 second
- [ ] Reports generate within 10 seconds

### Memory Testing
- [ ] App memory usage stays under 200MB
- [ ] No memory leaks after 1 hour usage
- [ ] Cache is properly managed
- [ ] Offline data doesn't exceed 50MB

### Network Testing
- [ ] App works on 3G connection
- [ ] App works on WiFi
- [ ] Graceful degradation on slow network
- [ ] Automatic retry on failed requests
- [ ] Offline mode works properly

---

## Accessibility Testing

### VoiceOver (iOS) / TalkBack (Android)
- [ ] All buttons are accessible
- [ ] Text is readable
- [ ] Navigation is logical
- [ ] Gestures work correctly
- [ ] Contrast ratios meet standards

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] All interactive elements are reachable

---

## Browser Compatibility Testing

### Web Preview
- [ ] Dashboard displays correctly
- [ ] All features work in Chrome
- [ ] All features work in Safari
- [ ] All features work in Firefox
- [ ] Responsive design works on tablet

---

## Error Handling Testing

### Network Errors
- [ ] App handles 404 errors gracefully
- [ ] App handles 500 errors gracefully
- [ ] App handles timeout errors
- [ ] Retry mechanism works
- [ ] Error messages are clear

### Validation Errors
- [ ] Empty fields show validation errors
- [ ] Invalid email shows error
- [ ] Invalid IP address shows error
- [ ] Duplicate names show error
- [ ] Error messages are helpful

### Edge Cases
- [ ] App handles very long names
- [ ] App handles special characters
- [ ] App handles rapid clicks
- [ ] App handles concurrent requests
- [ ] App handles large file uploads

---

## Security Testing

### Authentication
- [ ] Tokens are securely stored
- [ ] Tokens expire correctly
- [ ] Session hijacking is prevented
- [ ] CSRF protection works
- [ ] XSS attacks are prevented

### Authorization
- [ ] Viewers cannot edit networks
- [ ] Editors cannot manage members
- [ ] Admins have full access
- [ ] Cross-workspace access is blocked
- [ ] Data isolation is maintained

### Data Protection
- [ ] Sensitive data is encrypted
- [ ] HTTPS is enforced
- [ ] Passwords are hashed
- [ ] API keys are not exposed
- [ ] Logs don't contain sensitive data

---

## Regression Testing

### Before Each Release
- [ ] All previous tests pass
- [ ] No new bugs introduced
- [ ] Performance hasn't degraded
- [ ] UI is consistent
- [ ] Navigation works correctly

---

## Test Report Template

```
Test Date: [DATE]
Tester: [NAME]
Build Version: [VERSION]
Platform: [iOS/Android/Web]

Summary:
- Total Tests: [NUMBER]
- Passed: [NUMBER]
- Failed: [NUMBER]
- Blocked: [NUMBER]

Issues Found:
1. [Issue Description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to Reproduce: [STEPS]
   - Expected Result: [RESULT]
   - Actual Result: [RESULT]

Recommendations:
- [RECOMMENDATION]

Sign-off: [SIGNATURE]
```

---

## Continuous Testing

### Automated Tests
```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

### Manual Testing Schedule
- **Daily:** Smoke tests on new builds
- **Weekly:** Full feature testing
- **Monthly:** Performance and security testing
- **Before Release:** Comprehensive regression testing

---

## Known Issues & Workarounds

### Issue 1: WebSocket Connection Timeout
**Workaround:** Manually refresh the app

### Issue 2: Large File Upload Fails
**Workaround:** Split file into smaller chunks

### Issue 3: Offline Sync Delays
**Workaround:** Manually trigger sync

---

## Support & Escalation

For test failures or issues:
1. Reproduce the issue
2. Document steps to reproduce
3. Collect logs and screenshots
4. Report to development team
5. Track resolution

