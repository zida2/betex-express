# 🧪 Testing Instructions - Phase 1

**Date:** June 4, 2026

---

## 🚀 Démarrage Rapide

### Backend
```bash
cd backend
npm install
npm start
# Serveur sur http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start
# App sur http://localhost:3000
```

---

## ✅ Test Checklist - Erreurs & Notifications

### 1. Toast Notifications

#### Test 1.1: Success Message
```
1. Go to http://localhost:3000/admin/packages
2. Create a new package and submit
3. Should see green "Colis créé avec succès" toast
✓ Toast appears top-right
✓ Auto-dismisses after 4s
✓ Has checkmark icon
```

#### Test 1.2: Error Message
```
1. Go to http://localhost:3000/login
2. Enter invalid email (test)
3. Should see error toast
✓ Toast is red/error color
✓ Has error icon
✓ Displays error message
```

#### Test 1.3: Warning Message
```
1. Fill form with incomplete data
2. Try to submit
3. Should see warning toast
✓ Yellow warning color
✓ Warning icon
✓ Message explains issue
```

#### Test 1.4: Info Message (API)
```
1. Trigger any info action
2. Should see blue info toast
✓ Blue info color
✓ Info icon (ℹ)
✓ Message displayed
```

### 2. Error Boundary

#### Test 2.1: Global Error Catch
```
1. Force an error in browser console:
   throw new Error('Test error');
2. Should see Error Boundary UI
✓ Error page displays
✓ Shows error icon
✓ French message "Une erreur s'est produite"
✓ "Réessayer" button visible
✓ "Retour à l'accueil" button visible
```

#### Test 2.2: Error Details (Dev Mode)
```
1. Trigger error again (npm start in dev mode)
2. Should see details section
✓ "Détails de l'erreur" expandable
✓ Stack trace visible when expanded
✓ Component stack visible
```

#### Test 2.3: Error Recovery
```
1. Click "Réessayer" button
2. Should return to previous state
✓ Error boundary resets
✓ App continues to work
✓ No page refresh needed
```

---

## ✅ Test Checklist - Loading States

### 3. LoadingSpinner

#### Test 3.1: Small Spinner
```
1. Go to admin/packages
2. Initially page should show spinner
✓ Spinner appears centered
✓ Size is small (30px)
✓ Has "Chargement..." text
✓ Animation rotates smoothly
```

#### Test 3.2: Medium Spinner
```
1. Trigger another page load
2. Should show medium spinner (50px)
✓ Spinner visible
✓ Proper size
✓ Loading text shows
```

#### Test 3.3: Large Spinner
```
1. Create new custom element with large spinner
2. Should display large version (80px)
✓ Large size visible
✓ All animations work
```

#### Test 3.4: Color Variants
```
1. Test spinner with different colors
✓ Primary (blue) - default
✓ Success (green) - optional
✓ Error (red) - on error
✓ Warning (orange) - on warning
```

### 4. SkeletonLoader

#### Test 4.1: Card Skeleton
```
1. Render SkeletonLoader type="card"
2. Should show:
✓ Placeholder header
✓ Multiple content lines
✓ Footer placeholder
✓ Wave animation
✓ 3 skeletons by default
```

#### Test 4.2: List Skeleton
```
1. Render SkeletonLoader type="list"
2. Should show:
✓ Avatar circle
✓ Info lines
✓ Multiple rows
✓ Wave animation
```

#### Test 4.3: Table Skeleton
```
1. Render SkeletonLoader type="table"
2. Should show:
✓ Multiple rows
✓ 4 columns
✓ Cell placeholders
✓ Animated wave
```

#### Test 4.4: Form Skeleton
```
1. Render SkeletonLoader type="form"
2. Should show:
✓ Label placeholders
✓ Input placeholders
✓ Button placeholder
✓ Wave animation
```

---

## ✅ Test Checklist - Validation

### 5. Form Validation

#### Test 5.1: Email Validation
```
1. Go to login page
2. Try invalid emails:
   - "test" → error "Email invalide"
   - "test@" → error
   - "test@domain" → accepted
3. Try valid emails:
   - "user@domain.com" → accepted
✓ Validation works in real-time
✓ Error messages display
✓ Form prevents submission
```

#### Test 5.2: Password Validation
```
1. Password field
2. Try short password:
   - "12345" → error "6 caractères minimum"
3. Try valid password:
   - "password123" → accepted
✓ Length validation works
✓ Error message shows
✓ Cannot submit with invalid
```

#### Test 5.3: Phone Validation
```
1. Phone field (optional)
2. Try invalid:
   - "abc" → error
   - "123" → error (too short)
3. Try valid:
   - "+33612345678" → accepted
   - "(555) 123-4567" → accepted
✓ Format validation works
✓ Error messages display
```

#### Test 5.4: Address Validation
```
1. Address fields
2. Try too short:
   - "Main" → error "5 caractères minimum"
3. Try valid:
   - "123 Main Street" → accepted
✓ Length validation works
✓ Max length enforced
✓ Error displays properly
```

#### Test 5.5: Package Form Validation
```
1. Go to create package
2. Try submit empty form
3. Should see errors for all required fields:
✓ Sender name error
✓ Sender address error
✓ Receiver info errors
✓ Package type error
✓ Prices error
✓ Weight error
✓ No submission allowed
```

#### Test 5.6: Coordinates Validation
```
1. Location picker
2. Try invalid coordinates
3. Try valid:
   - Latitude: 48.8566 (Paris)
   - Longitude: 2.3522
✓ Validation works
✓ Map updates
✓ Can submit form
```

---

## ✅ Test Checklist - API & Networking

### 6. API Retry Logic

#### Test 6.1: Transient Network Error
```
1. Start server and app
2. Stop backend server (kill process)
3. Try API action (load packages, etc)
4. Wait 2-3 seconds
5. Restart backend
6. Should complete successfully
✓ Retry happens automatically
✓ Toast shows error briefly then success
✓ Data loads after retry
✓ No user action needed
```

#### Test 6.2: Request Deduplication
```
1. Rapid click on "Load Packages" multiple times
2. Check Network tab in DevTools
3. Should see only ONE request
✓ Multiple rapid requests deduplicated
✓ Only one API call made
✓ Response shared for both requests
✓ Saves bandwidth
```

#### Test 6.3: Request Abort
```
1. Load packages page
2. Immediately navigate to another page
3. Previous request should abort
✓ No network errors in console
✓ Request shows as "cancelled"
✓ Memory properly cleaned
```

#### Test 6.4: 401 Unauthorized
```
1. Delete token from localStorage:
   localStorage.removeItem('token')
2. Try any API action
3. Should be redirected to login
✓ 401 handled properly
✓ Redirect to /login
✓ Token cleared
✓ No infinite loop
```

---

## ✅ Test Checklist - Custom Hooks

### 7. usePackages Hook

#### Test 7.1: Load Packages
```
1. Component using usePackages
2. useEffect should trigger loadPackages
✓ packages array populated
✓ loading changes false
✓ No error state
✓ Data displays in UI
```

#### Test 7.2: Create Package
```
1. Open create package form
2. Fill valid data
3. Click create
4. Call createPackage() hook
✓ Loading shows spinner
✓ Success toast appears
✓ Package added to list
✓ Form clears
```

#### Test 7.3: Validation Error
```
1. Open form with invalid data
2. Try to submit
3. Hook validates with schema
✓ Validation fails
✓ Error toast shows first error
✓ Form not submitted
✓ Package not created
```

#### Test 7.4: Update Package
```
1. Edit existing package
2. Change fields
3. Call updatePackage()
✓ API called with PUT
✓ List updated
✓ Success toast shows
✓ UI reflects changes
```

#### Test 7.5: Delete Package
```
1. Find package in list
2. Delete it
3. Call deletePackage()
✓ Package removed from list
✓ Success toast appears
✓ API called DELETE
✓ UI updates immediately
```

#### Test 7.6: Load More / Pagination
```
1. Load packages (default 20)
2. Scroll to bottom
3. Call loadMore()
✓ Next page loads
✓ Items appended to list
✓ No duplicates
✓ hasMore flag updates
```

#### Test 7.7: Error Handling
```
1. Mock API error
2. Call any hook method
✓ Error state set
✓ Error toast shown
✓ retry() available
✓ User can retry
```

### 8. useDrivers Hook

#### Test 8.1: Load Drivers
```
1. useEffect triggers
2. Drivers should load
✓ drivers array populated
✓ All driver data present
✓ No loading state persists
```

#### Test 8.2: Get Available Driver
```
1. Call getAvailableDriver(lat, lng, ...)
2. Should calculate distances
✓ Returns closest available driver
✓ Uses Haversine formula
✓ Filters by status="available"
✓ Sorted by distance
```

#### Test 8.3: Distance Calculation
```
1. Get driver at known location
2. Calculate distance to package
3. Verify math:
   - Paris to Lyon ≈ 463 km
   - Should return reasonable value
✓ Distance calculation accurate
✓ Returns in km
✓ Haversine formula correct
```

---

## ✅ Test Checklist - Form Field Component

### 9. FormField Component

#### Test 9.1: Text Input
```
1. Render FormField type="text"
2. Type text
✓ Value updates
✓ onChange triggered
✓ No errors initially
```

#### Test 9.2: Error Display
```
1. Render with error="Email invalide"
2. Should show:
✓ Red border
✓ Error text with warning icon
✓ Proper styling
```

#### Test 9.3: Select Input
```
1. Render FormField type="select"
2. Pass options
3. Select value
✓ Dropdown appears
✓ Options visible
✓ Value updates
```

#### Test 9.4: Textarea
```
1. Render FormField type="textarea"
2. Type multi-line text
✓ Textarea appears
✓ Grows with content
✓ Value updates
```

#### Test 9.5: Required Field
```
1. Render with required={true}
2. Should show:
✓ Red asterisk (*)
✓ Label indicates required
✓ Browser validation (if HTML5)
```

#### Test 9.6: Help Text
```
1. Render with help="Some help"
2. When no error:
✓ Help text shows in gray
✓ Below input field
3. When error:
✓ Help text hidden
✓ Error shows instead
```

---

## ✅ Test Checklist - Integration

### 10. Full Integration Test

#### Test 10.1: Login Flow
```
1. Go to http://localhost:3000/login
2. Enter admin@betex.com / admin123
3. Click submit
✓ Loading spinner shows
✓ Request happens
✓ Redirect to /admin/dashboard
✓ User logged in
✓ Token in localStorage
```

#### Test 10.2: Create & Assign Package
```
1. Go to /admin/packages
2. Click "New Package"
3. Fill form completely
4. Click "Create"
✓ Form validates
✓ Loading spinner shows
✓ Success toast shows
✓ Package appears in list
✓ Can assign driver
```

#### Test 10.3: Error Recovery
```
1. Stop backend
2. Try create package
3. Should show error toast
4. Start backend
5. Form can be resubmitted
✓ Error handled gracefully
✓ Toast notifies user
✓ User can retry
✓ Works after retry
```

#### Test 10.4: Multiple Operations
```
1. Create multiple packages
2. Update one
3. Delete one
4. Refresh page
✓ All operations work
✓ Toast notifications for each
✓ List stays consistent
✓ No state conflicts
```

---

## 🔍 DevTools Testing

### Console Checks
```javascript
// Should not have errors
console.log(window.localStorage.getItem('token'));
// Shows: token_value or null

// Check toast provider
console.log(document.querySelector('.toast-container'));
// Should show toast container element

// Check error boundary
console.log(document.querySelector('.error-boundary-container'));
// Initially null, shows only on error
```

### Network Tab
```
1. Open DevTools → Network
2. Load packages
3. Should see:
   - GET /api/v1/packages
   - Status 200
   - Response time < 1s
   - No duplicates
4. If API down:
   - Retry request visible
   - Eventually succeeds or fails gracefully
```

### Performance
```
1. Open DevTools → Performance
2. Record page load
3. Measure:
   - Time to interactive (TTI)
   - Largest contentful paint (LCP)
   - Cumulative layout shift (CLS)
4. Should be:
   - TTI < 3s
   - LCP < 2.5s
   - CLS < 0.1
```

---

## 📱 Responsive Testing

### Mobile (375px)
```
1. Resize to 375px width
2. Test components:
✓ Toast stacks properly
✓ Spinner centered
✓ Form fields full width
✓ Buttons clickable
✓ No horizontal scroll
```

### Tablet (768px)
```
1. Resize to 768px width
2. Test layout:
✓ Components responsive
✓ Multi-column works
✓ Touch targets >= 44px
✓ Readable text
```

### Desktop (1920px)
```
1. Resize to 1920px width
2. Test layout:
✓ Content centered
✓ Not overly wide
✓ Sidebars visible
✓ All features work
```

---

## 🎨 Visual Testing

### Colors
```
✓ Primary blue: #667eea
✓ Success green: #27ae60
✓ Error red: #e74c3c
✓ Warning orange: #f39c12
✓ Info blue: #3498db
✓ All visible and accessible
```

### Animations
```
✓ Spinner rotates smoothly
✓ Toast slides in/out
✓ Skeleton waves animate
✓ Error boundary appears smoothly
✓ No jank or stuttering
```

### Typography
```
✓ Labels: 14px, weight 600
✓ Body: 14px, weight 400
✓ Headings: 24px, weight 600
✓ Error text: 13px, color red
✓ All readable and accessible
```

---

## ✅ Accessibility Testing

### Screen Reader
```
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate form:
✓ Labels associated with inputs
✓ Error messages announced
✓ Buttons labeled
✓ Toasts announced
```

### Keyboard Navigation
```
1. Use Tab to navigate
✓ Logical tab order
✓ Focus visible
✓ Can access all buttons
✓ Can use forms
✓ No keyboard traps
```

### Color Contrast
```
1. Check contrast ratios:
✓ Text on background: 4.5:1 min
✓ Large text: 3:1 min
✓ Icons: adequate contrast
✓ Pass WCAG AA standard
```

---

## 📋 Final Checklist

### Before Deploy
- [ ] All toast types tested
- [ ] Error boundary works
- [ ] Loading spinners display
- [ ] Skeletons animate
- [ ] Form validation works
- [ ] API retry logic works
- [ ] Custom hooks work
- [ ] Responsive design works
- [ ] Accessibility passes
- [ ] No console errors
- [ ] Network tab clean
- [ ] Performance acceptable

### Ready for Production
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Tested with real backend
- [ ] Tested on multiple browsers
- [ ] Mobile tested
- [ ] Performance optimized

---

## 🐛 Debugging Tips

### Toast Not Appearing
```javascript
// Check if ToastProvider is mounted
const element = document.querySelector('.toast-container');
console.log('Toast container exists:', !!element);

// Check latest toast
const toasts = document.querySelectorAll('.toast');
console.log('Toast count:', toasts.length);
```

### Error Boundary Not Catching
```javascript
// Verify ErrorBoundary is in tree
// In React DevTools: should see ErrorBoundary wrapper
// Make sure no try-catch blocks prevent error propagation
```

### Loading Spinner Not Visible
```javascript
// Check loading state
console.log('Loading:', loading); // Should be true

// Check for CSS issues
console.log(document.querySelector('.spinner')); // Should exist
```

### Form Validation Not Working
```javascript
// Check validation schemas
import { packageSchema } from './utils/validation';
const result = await packageSchema.parseAsync(data);

// Check form submission
console.log('Form data:', formData);
```

---

## 🚀 Conclusion

This testing guide covers all major features added in Phase 1:
- ✅ Error Handling
- ✅ Loading States
- ✅ Notifications
- ✅ Form Validation
- ✅ API Resilience
- ✅ Custom Hooks
- ✅ Components
- ✅ Integration

**All tests should pass before proceeding to Phase 2.**

---

*Generated: June 4, 2026*  
*For Frontend Phase 1: Stabilité*
