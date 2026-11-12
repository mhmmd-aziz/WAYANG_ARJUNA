# CLAUDE.md
# WAYANG INTERACTIVE – Hand Gesture Computer Vision

## 1. Project Overview

Build an interactive educational application that allows children to control and animate traditional Indonesian wayang puppets using real-time hand gestures through a webcam.

The application uses Computer Vision and Hand Landmark Detection to translate hand movements into puppet movements on the screen.

The main goal is to introduce Indonesian traditional wayang culture to elementary school students through interactive learning, motion-based interaction, and gamification.

The application must feel:
- Interactive and engaging.
- Educational but fun for elementary school students.
- Visually modern and polished.
- Responsive with smooth animations.
- Easy to understand without technical knowledge.

## 2. Core Concept

The application has two main learning modes:

### A. Learning / Demonstration Mode

This mode introduces children to the basic movements of wayang.

Workflow:
1. Children select a wayang character.
2. The application introduces the character and its cultural background.
3. A demonstration instructor appears on screen.
4. The instructor demonstrates how to move the puppet using hand gestures.
5. The webcam detects the child's hand.
6. The application displays detected hand landmarks.
7. The puppet follows the child's hand movements in real-time.
8. The application provides feedback when the child performs the movement correctly.

The system should guide children step by step.

### B. Gamification Mode

After completing the learning and demonstration stage, children can access five progressive challenge levels.

Each level introduces a different movement challenge.

## 3. Technology Stack

Use the following technologies:

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

### Computer Vision
- MediaPipe Tasks Vision
- Hand Landmarker
- WebRTC / Browser getUserMedia API
- HTML Canvas API

### Animation
- Canvas 2D or SVG
- Framer Motion for interface animations
- Custom puppet skeletal animation system

IMPORTANT:
Do not use YOLO for this project.

The primary computer vision approach must use MediaPipe Hand Landmarker because the application needs to detect hand landmarks and track finger positions in real-time.

## 4. Hand Landmark Detection

Use MediaPipe Hand Landmarker to detect 21 hand landmarks.

The system should track:
- Wrist.
- Thumb joints and tip.
- Index finger joints and tip.
- Middle finger joints and tip.
- Ring finger joints and tip.
- Pinky finger joints and tip.

Important landmarks:
- 0: Wrist
- 4: Thumb tip
- 8: Index finger tip
- 12: Middle finger tip
- 16: Ring finger tip
- 20: Pinky tip

Convert normalized landmark coordinates into screen coordinates.

Use smoothing techniques to prevent jitter:
- Exponential Moving Average.
- Landmark interpolation.
- Movement threshold.
- Frame-based animation updates.

The application should maintain a stable frame rate and minimize latency.

## 5. Gesture Recognition

Implement a gesture recognition module.

Initial gestures:

| Gesture | Function |
|---|---|
| Open Palm | Activate / control puppet |
| Closed Fist | Stop puppet movement |
| Index Finger Up | Move puppet upward |
| Hand Moving Left | Move puppet left |
| Hand Moving Right | Move puppet right |
| Hand Moving Down | Move puppet downward |
| Pinch Gesture | Grab or activate puppet control |

Gesture recognition must be based on landmark positions and distances, not image classification.

Create a modular gesture detection system so additional gestures can be added later.

## 6. Puppet Movement System

This is the most important feature.

The wayang must not simply follow the cursor.

Create a puppet movement system that simulates the movement of a traditional wayang puppet.

Each puppet should have:
- Head.
- Body.
- Left arm.
- Right arm.
- Left hand.
- Legs.
- Main movement pivot.

Use a skeletal or joint-based animation structure.

### Movement Mapping

Map hand landmarks to puppet movements:

- Wrist movement controls the puppet's main position.
- Index finger movement controls the primary puppet direction.
- Hand rotation controls puppet rotation.
- Pinch gesture activates grabbing or special movements.
- Finger bending can trigger specific puppet animations.

The puppet should have:
- Smooth transitions.
- Natural movement.
- Configurable movement limits.
- Idle animation.
- Interactive reactions.

Use inverse kinematics if necessary for more natural joint movement.

## 7. Five Gamification Levels

Create five progressive levels.

### LEVEL 1 – Kenalan dengan Wayang
Difficulty: Beginner

Objective:
- Learn how the system detects hands.
- Move the puppet left and right.
- Move the puppet up and down.

Reward:
- First Wayang Badge.

### LEVEL 2 – Gerakan Tangan
Difficulty: Easy

Objective:
- Practice open palm.
- Practice closed fist.
- Practice index finger movement.
- Match gestures with instructions.

Reward:
- Gesture Master Badge.

### LEVEL 3 – Kendalikan Wayang
Difficulty: Medium

Objective:
- Move the puppet through specific positions.
- Follow directional instructions.
- Control puppet movement accurately.

Reward:
- Puppet Controller Badge.

### LEVEL 4 – Ikuti Cerita
Difficulty: Advanced

Objective:
- Follow a short traditional wayang story.
- Perform specific movements based on the story.
- Interact with other characters or objects.

Reward:
- Storyteller Badge.

### LEVEL 5 – Dalang Cilik
Difficulty: Challenge

Objective:
- Perform a complete sequence of puppet movements.
- Combine different hand gestures.
- Control the puppet independently.
- Complete a short interactive wayang performance.

Reward:
- Dalang Cilik Trophy.

## 8. UI/UX Design

Design a modern educational interface for elementary school children.

Design direction:
- Modern educational game aesthetic.
- Traditional Indonesian cultural elements.
- Warm colors inspired by wayang kulit.
- Clean layouts.
- Rounded cards.
- Large buttons.
- Clear typography.
- Friendly illustrations.
- Smooth micro-interactions.

Avoid:
- Overly complicated interfaces.
- Excessive gradients.
- Excessive glowing effects.
- Too many decorative elements.
- Small text and complicated navigation.

Suggested colors:
- Primary: Deep brown.
- Secondary: Warm gold.
- Background: Cream / ivory.
- Accent: Terracotta.
- Text: Dark charcoal.

## 9. Main Application Pages

Build the following pages:

1. Landing Page
   - Introduction to interactive wayang.
   - Start Learning button.
   - Cultural introduction.
   - Featured wayang characters.

2. Character Selection
   - Display available wayang characters.
   - Character descriptions.
   - Preview character animations.

3. Learning Dashboard
   - Learning progress.
   - Five level progression.
   - Achievement badges.

4. Hand Detection Studio
   - Webcam preview.
   - Real-time hand landmark visualization.
   - Detection status.
   - Gesture identification.
   - Puppet animation preview.

5. Tutorial Mode
   - Instructor demonstration.
   - Step-by-step movement instructions.
   - Practice area.
   - Feedback system.

6. Gamification Challenge
   - Challenge objectives.
   - Countdown timer when needed.
   - Score.
   - Progress indicator.
   - Success and failure feedback.

7. Result Page
   - Final score.
   - Accuracy.
   - Completed challenges.
   - Rewards and achievements.

## 10. Computer Vision Architecture

Separate the application into independent modules.

Suggested architecture:

src/
├── components/
│   ├── ui/
│   ├── camera/
│   ├── hand-tracking/
│   ├── puppet/
│   └── game/
│
├── computer-vision/
│   ├── handLandmarker.ts
│   ├── handDetection.ts
│   ├── gestureRecognition.ts
│   ├── landmarkSmoothing.ts
│   └── coordinateMapping.ts
│
├── puppet-engine/
│   ├── PuppetController.ts
│   ├── PuppetSkeleton.ts
│   ├── PuppetAnimation.ts
│   └── PuppetMovement.ts
│
├── game/
│   ├── levelManager.ts
│   ├── challengeManager.ts
│   ├── scoreManager.ts
│   └── achievementManager.ts
│
├── hooks/
│   ├── useCamera.ts
│   ├── useHandTracking.ts
│   └── useGesture.ts
│
├── pages/
├── assets/
├── types/
└── utils/

## 11. Performance Requirements

The application should:
- Run directly in a modern browser.
- Use webcam input.
- Process hand landmarks in real-time.
- Avoid unnecessary React re-renders.
- Use requestAnimationFrame for animation loops.
- Smooth landmark coordinates.
- Handle camera permission errors.
- Handle cases where no hand is detected.
- Support different screen resolutions.
- Work on standard laptops and desktop computers.

Target performance:
- Aim for 25–30 FPS or higher.
- Minimize visual tracking delay.
- Maintain stable puppet movement.

## 12. Educational Feedback

The application must provide feedback that children can easily understand.

Examples:

- "Hebat! Tangan kamu berhasil terdeteksi!"
- "Ayo gerakkan tangan ke kanan!"
- "Bagus! Wayang berhasil bergerak!"
- "Coba angkat jari telunjuk kamu!"
- "Luar biasa! Kamu berhasil menyelesaikan tantangan!"

Use animations and audio feedback where appropriate.

## 13. Development Priorities

Implement the application in the following order:

PHASE 1:
- Initialize React + TypeScript + Vite.
- Configure Tailwind CSS.
- Build the main interface.
- Create character selection.

PHASE 2:
- Implement webcam access.
- Integrate MediaPipe Hand Landmarker.
- Display 21 hand landmarks.
- Implement landmark visualization.

PHASE 3:
- Implement gesture recognition.
- Implement coordinate mapping.
- Create the puppet movement engine.
- Make the puppet respond to hand movements.

PHASE 4:
- Create the learning and demonstration mode.
- Implement guided tutorials.
- Add movement feedback.

PHASE 5:
- Implement all five gamification levels.
- Add score and achievement systems.
- Add progress tracking.

PHASE 6:
- Optimize performance.
- Improve animations.
- Test different lighting conditions.
- Test different hand positions and camera angles.
- Refine the user experience.

## 14. Important Development Rules

1. Prioritize a working real-time hand tracking system before implementing complex game features.
2. Do not create fake hand tracking using static animations.
3. Do not simulate webcam detection.
4. The puppet must respond to actual MediaPipe landmarks.
5. Keep computer vision logic separate from UI logic.
6. Use TypeScript types consistently.
7. Build reusable components.
8. Avoid unnecessary dependencies.
9. Ensure responsive layouts.
10. Write clean and maintainable code.
11. Do not implement all features in one huge component.
12. Test every major feature before moving to the next phase.

## 15. First Development Task

Start by building a functional MVP.

The first milestone must include:

- A clean application interface.
- Webcam activation.
- Real-time MediaPipe hand detection.
- Visualization of all 21 landmarks.
- Open palm and closed fist recognition.
- A simple 2D wayang character.
- Real-time puppet movement following the detected hand.

Do not proceed to the five gamification levels until this core interaction works reliably.

The ultimate goal is to create an interactive digital wayang learning experience where children can become little puppeteers (Dalang Cilik) using their own hands.