# SignKYC — Bank Official Console (V-CIP Assist View)

> **Accessibility Workstation for Indian Sign Language (ISL) Video KYC Onboarding**

---

## 📌 Executive Summary

**SignKYC** is an official-facing banking workstation prototype built to facilitate real-time Video-CIP (V-CIP) onboarding for deaf and hard-of-hearing customers who communicate using **Indian Sign Language (ISL)**. 

During a live video session, the customer interacts naturally through sign language on their screen. On the bank officer's side, this **V-CIP Assist Console** translates ISL gestures into real-time English captions, assesses gesture confidence, and guides the officer through human-in-the-loop field verification and structured step-by-step progress tracking.

---

## 🎯 Core Pitch & Workflow Loop

The application centers directly around the essential core workflow loop:

1. **Video Panel (`VideoPanel.tsx`):**
   * Real-time 30 FPS video feed (webcam or simulated video).
   * 21-point hand topology tracking canvas overlay (1.5px vector skeleton lines and 3px joint dots) providing clear visual feedback of gesture detection.
   * Liveness code prompt display during verification steps.
   * Dual-tile video capability for seamless transfer to a certified ISL interpreter.

2. **Live Caption Box + Confidence Meter (`AIAssistPanel.tsx`):**
   * Real-time translation box displaying English text derived from ISL gesture syntax.
   * Confidence meter indicating AI certainty levels:
     * 🟢 **High Confidence (>85%):** Fast-track officer verification.
     * 🟠 **Moderate Confidence (60–85%):** Prompt for officer review or request re-sign.
     * 🔴 **Low Confidence (<60%):** Triggers recommendation to transfer the session to a certified human interpreter.

3. **Human-in-the-Loop Active Field Card:**
   * **Confirm:** Allows the bank official to inspect and lock in verified field values with a single click.
   * **Edit:** Provides manual entry for edge cases or custom spellings.
   * **Request Re-sign:** Sends a non-intrusive prompt to the customer's call view when a sign is blurry or partially out of frame.

4. **Confidence-Driven Escalation / Call Transfer:**
   * When gesture confidence drops or upon official request, bridges a certified human ISL interpreter into a secondary video tile without dropping the primary customer call.

5. **KYC Progress Strip (`KYCProgressStrip.tsx`):**
   * A clean 7-step checklist tracking required onboarding milestones (Identity Document, Name Record Match, Address Verification, Photo Match, Liveness Code, Video Consent, and Final Approval).

6. **Design System & Workstation UX:**
   * High-contrast light workstation layout designed for bank officers (`#F9FAFB` base, `#FFFFFF` cards, `#E5E7EB` borders) built for clarity, speed, and zero visual clutter.

---

## 🚀 Interactive Demo States

Use the **Demo State Switcher** in the top bar to test live scenario flows:
* **1. Normal Field:** High-confidence name and address gesture recognition.
* **2. Liveness Step:** Prompts a 4-digit gesture sequence and highlights matching digits in real time.
* **3. Escalated:** Simulates low gesture confidence, triggering the option to bridge a certified human interpreter (`Ananya M. #INT-104`).
* **4. Session Complete:** Shows a 100% confirmed KYC checklist ready for officer submission.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS (Utilitarian Light Theme)
* **Icons:** Lucide React
* **Build System:** Vite & esbuild
