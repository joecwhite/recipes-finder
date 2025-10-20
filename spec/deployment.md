# Deployment Checklist

## Overview

This document outlines the complete deployment checklist that **MUST** be followed for every deployment of the Recipe Finder application. Each step must be completed and verified before proceeding to the next phase.

**IMPORTANT**: Never skip steps. If any step fails, stop the deployment process, fix the issue, and restart from the beginning.

---

## Pre-Deployment Checklist

### Phase 1: Code Quality Verification

- [ ] **1.1 Git Status Check**
  ```bash
  git status
  ```
  - Verify: Working directory is clean (no uncommitted changes)
  - Verify: On the correct branch (`main` or `develop`)
  - If uncommitted changes exist, commit or stash them before proceeding

- [ ] **1.2 Pull Latest Changes**
  ```bash
  git pull origin main
  ```
  - Verify: Local branch is up to date with remote
  - Resolve any merge conflicts if they exist

- [ ] **1.3 TypeScript Type Check**
  ```bash
  npm run type-check
  ```
  - Verify: No TypeScript errors
  - Expected output: "Found 0 errors"
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **1.4 Linting Check**
  ```bash
  npm run lint -- --max-warnings 0
  ```
  - Verify: No linting errors or warnings
  - Fix any issues with: `npm run lint:fix`
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **1.5 Code Formatting Check**
  ```bash
  npm run format:check
  ```
  - Verify: All files are properly formatted
  - Fix formatting with: `npm run format`
  - **Status**: ⬜ PASS / ⬜ FAIL

---

### Phase 2: Testing

- [ ] **2.1 Unit Tests**
  ```bash
  npm run test:unit
  ```
  - Verify: All unit tests pass
  - Verify: No test failures or errors
  - Review test output for any warnings
  - **Tests Passed**: _____ / _____
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **2.2 Integration Tests**
  ```bash
  npm run test:integration
  ```
  - Verify: All integration tests pass
  - Verify: Database operations work correctly
  - Verify: API integrations function properly
  - **Tests Passed**: _____ / _____
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **2.3 Code Coverage Check**
  ```bash
  npm run test:coverage
  ```
  - Verify: Code coverage meets minimum thresholds:
    - Lines: ≥ 80%
    - Functions: ≥ 80%
    - Branches: ≥ 75%
    - Statements: ≥ 80%
  - **Coverage Results**:
    - Lines: _____%
    - Functions: _____%
    - Branches: _____%
    - Statements: _____%
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **2.4 End-to-End Tests** (If applicable)
  ```bash
  npm run test:e2e
  ```
  - Verify: All E2E tests pass
  - Verify: User workflows complete successfully
  - **Tests Passed**: _____ / _____
  - **Status**: ⬜ PASS / ⬜ FAIL

---

### Phase 3: Build Verification

- [ ] **3.1 Clean Previous Builds**
  ```bash
  rm -rf dist/ build/
  ```
  - Verify: Old build artifacts removed
  - **Status**: ⬜ DONE

- [ ] **3.2 Production Build**
  ```bash
  npm run build
  ```
  - Verify: Build completes without errors
  - Verify: Build completes without warnings
  - Check build output size is reasonable
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **3.3 Build Output Verification**
  ```bash
  ls -lh dist/
  ```
  - Verify: `dist/` directory exists
  - Verify: Frontend assets compiled (HTML, CSS, JS)
  - Verify: Backend files compiled (JS from TS)
  - **Status**: ⬜ PASS / ⬜ FAIL

---

### Phase 4: Environment & Configuration

- [ ] **4.1 Environment Variables Check**
  ```bash
  cat .env
  ```
  - Verify: `ANTHROPIC_API_KEY` is present and valid
  - Verify: `NODE_ENV` is set correctly
  - Verify: `PORT` is configured
  - Verify: No placeholder values (no `xxx`, `TODO`, etc.)
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **4.2 Dependencies Check**
  ```bash
  npm audit
  ```
  - Verify: No critical or high severity vulnerabilities
  - Fix vulnerabilities with: `npm audit fix`
  - Document any unfixable vulnerabilities
  - **Critical Vulnerabilities**: _____
  - **High Vulnerabilities**: _____
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **4.3 Dependency Installation Verification**
  ```bash
  rm -rf node_modules/
  npm ci
  ```
  - Verify: Clean install completes successfully
  - Verify: All dependencies installed without errors
  - **Status**: ⬜ PASS / ⬜ FAIL

---

### Phase 5: Application Smoke Tests

- [ ] **5.1 Start Production Server**
  ```bash
  npm start
  ```
  - Verify: Server starts without errors
  - Verify: Server listens on correct port (default: 3000)
  - Check logs for startup errors
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **5.2 Health Check**
  ```bash
  curl http://localhost:3000/health
  ```
  - Verify: Health endpoint returns 200 OK
  - Verify: Response indicates healthy status
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **5.3 Claude API Connection Test**
  - Open application in browser: `http://localhost:3000`
  - Send a test query: "simple chicken recipe"
  - Verify: Claude API responds successfully
  - Verify: Recipe is returned and displayed
  - Verify: No API errors in console or logs
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **5.4 Recipe Search Functionality**
  - Test protein priority toggle
  - Test fiber priority toggle
  - Test servings selector (try 1, 4, and 8 servings)
  - Verify: All search configurations work correctly
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **5.5 Chat Interface Functionality**
  - Send multiple chat messages
  - Test follow-up questions
  - Test recipe refinement ("make it vegetarian")
  - Verify: Conversation context maintained
  - **Status**: ⬜ PASS / ⬜ FAIL

- [ ] **5.6 Error Handling Test**
  - Test with invalid query (empty string)
  - Test with extreme servings (0, 100)
  - Verify: Graceful error messages displayed
  - Verify: Application doesn't crash
  - **Status**: ⬜ PASS / ⬜ FAIL

---

## 🛑 MANUAL REVIEW CHECKPOINT

### Phase 6: Developer Review & Sign-Off

**STOP**: Before proceeding with deployment, the developer must manually review and approve the following:

- [ ] **6.1 Review Test Results**
  - Read through all test output
  - Investigate any warnings or unusual behavior
  - Confirm test coverage is adequate
  - **Reviewer**: ___________________
  - **Date**: ___________________
  - **Notes**:
    ```



    ```

- [ ] **6.2 Review Build Output**
  - Check build logs for warnings
  - Verify bundle sizes are acceptable
  - Confirm no unexpected dependencies included
  - **Build Size**: _____ MB
  - **Reviewer**: ___________________
  - **Notes**:
    ```



    ```

- [ ] **6.3 Review Application Functionality**
  - Test the application manually in browser
  - Verify UI looks correct (no layout issues)
  - Test all critical user workflows:
    - [ ] Recipe search with protein priority
    - [ ] Recipe search with fiber priority
    - [ ] Serving size adjustments
    - [ ] Chat interactions
    - [ ] Recipe display formatting
  - **Reviewer**: ___________________
  - **Notes**:
    ```



    ```

- [ ] **6.4 Review Logs & Console**
  - Check browser console for errors
  - Check server logs for warnings
  - Verify no unexpected API errors
  - Check Claude API usage/costs
  - **Any Issues Found?**: ⬜ YES / ⬜ NO
  - **Notes**:
    ```



    ```

- [ ] **6.5 Performance Check**
  - Test recipe search response time (target: < 10 seconds)
  - Test chat response time (target: < 2 seconds)
  - Check memory usage
  - Verify no memory leaks during extended use
  - **Average Search Time**: _____ seconds
  - **Average Chat Time**: _____ seconds
  - **Status**: ⬜ ACCEPTABLE / ⬜ NEEDS IMPROVEMENT

- [ ] **6.6 Documentation Review**
  - Verify README is up to date
  - Confirm setup instructions are accurate
  - Check that any new features are documented
  - **Status**: ⬜ COMPLETE / ⬜ NEEDS UPDATE

---

### Phase 7: Pre-Deployment Approval

- [ ] **7.1 Final Approval Decision**

  **I have reviewed all test results, build outputs, and manual testing.**
  **I confirm the application is ready for deployment.**

  - **Approver Name**: ___________________
  - **Date**: ___________________
  - **Time**: ___________________
  - **Signature**: ___________________

  **Decision**: ⬜ APPROVED FOR DEPLOYMENT / ⬜ REJECTED - NEEDS FIXES

  **If rejected, list issues to fix**:
  ```
  1.
  2.
  3.
  ```

---

## Deployment Execution

### Phase 8: Deployment Steps (After Approval)

- [ ] **8.1 Create Git Tag**
  ```bash
  git tag -a v1.0.0 -m "Release version 1.0.0"
  git push origin v1.0.0
  ```
  - **Version**: v_____
  - **Status**: ⬜ DONE

- [ ] **8.2 Backup Current Deployment** (if updating existing)
  ```bash
  cp -r dist/ dist.backup.$(date +%Y%m%d_%H%M%S)
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
  ```
  - **Backup Location**: ___________________
  - **Status**: ⬜ DONE

- [ ] **8.3 Stop Current Application** (if updating existing)
  ```bash
  # Stop the running process (e.g., pm2 stop, kill process, etc.)
  ```
  - **Status**: ⬜ DONE

- [ ] **8.4 Deploy New Build**
  ```bash
  # Copy new build files to deployment location
  # Update environment variables if needed
  ```
  - **Status**: ⬜ DONE

- [ ] **8.5 Start Application**
  ```bash
  npm start
  ```
  - Verify: Application starts successfully
  - Verify: No startup errors in logs
  - **Status**: ⬜ DONE

- [ ] **8.6 Post-Deployment Smoke Test**
  - Open application in browser
  - Perform one complete recipe search
  - Verify: Everything works as expected
  - **Status**: ⬜ PASS / ⬜ FAIL

---

## Post-Deployment Verification

### Phase 9: Post-Deployment Checks

- [ ] **9.1 Monitor Application Logs** (first 15 minutes)
  ```bash
  tail -f logs/application.log
  ```
  - Watch for errors or warnings
  - Verify: No unexpected errors
  - **Status**: ⬜ STABLE / ⬜ ISSUES DETECTED

- [ ] **9.2 Monitor Claude API Usage**
  - Check Anthropic console for API calls
  - Verify: API calls are successful
  - Verify: Costs are within expected range
  - **API Calls**: _____
  - **Cost**: $_____
  - **Status**: ⬜ NORMAL / ⬜ INVESTIGATE

- [ ] **9.3 Test Core Functionality** (Post-Deployment)
  - Perform 3-5 recipe searches
  - Test different configurations
  - Verify: All features work correctly
  - **Status**: ⬜ ALL WORKING / ⬜ ISSUES FOUND

- [ ] **9.4 Performance Monitoring** (first hour)
  - Monitor response times
  - Check memory usage
  - Watch CPU usage
  - **Performance**: ⬜ NORMAL / ⬜ DEGRADED

---

## Rollback Procedure (If Needed)

### Phase 10: Emergency Rollback

**If critical issues are discovered post-deployment:**

- [ ] **10.1 Stop Current Application**
  ```bash
  # Stop the running process
  ```

- [ ] **10.2 Restore Previous Version**
  ```bash
  rm -rf dist/
  cp -r dist.backup.YYYYMMDD_HHMMSS/ dist/
  cp .env.backup.YYYYMMDD_HHMMSS .env
  ```

- [ ] **10.3 Restart Application**
  ```bash
  npm start
  ```

- [ ] **10.4 Verify Rollback Successful**
  - Test application functionality
  - Verify previous version is working

- [ ] **10.5 Document Rollback**
  - **Reason for Rollback**: ___________________
  - **Issues Encountered**:
    ```


    ```
  - **Rollback Time**: ___________________

---

## Deployment Log

### Deployment History

| Date | Version | Approver | Status | Notes |
|------|---------|----------|--------|-------|
|      |         |          |        |       |
|      |         |          |        |       |
|      |         |          |        |       |

---

## Quick Reference Commands

```bash
# Full pre-deployment test suite
npm run type-check && \
npm run lint -- --max-warnings 0 && \
npm run format:check && \
npm run test:coverage && \
npm run build

# Health check
curl http://localhost:3000/health

# View logs
tail -f logs/application.log

# Check running processes
ps aux | grep node

# Monitor system resources
top -o cpu
```

---

## Important Notes

1. **Never Skip Steps**: Each step exists for a reason. Skipping steps can lead to production issues.

2. **Document Everything**: Use the checkboxes and notes sections to document your deployment process.

3. **When in Doubt, Don't Deploy**: If something doesn't feel right, investigate before proceeding.

4. **Keep Backups**: Always maintain backups before deploying updates.

5. **Monitor After Deployment**: The first hour after deployment is critical. Stay alert.

6. **Communication**: If this is a team project, communicate deployment status to team members.

---

## Deployment Approval Stamp

**This deployment checklist was completed on:**

- **Date**: ___________________
- **Deployment Version**: ___________________
- **Deployed By**: ___________________
- **Final Status**: ⬜ SUCCESSFUL / ⬜ ROLLED BACK / ⬜ FAILED

**Final Sign-Off**: ___________________

---

**END OF DEPLOYMENT CHECKLIST**

*Keep this document updated as the deployment process evolves.*
