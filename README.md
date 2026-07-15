Kavach.ai🛡️
On-device privacy scanner for content creators 📷— catch what you're about to expose before you post it.

🚨 Problem
Every day, creators and social media users accidentally share sensitive information in photos and screenshots:
✌️ Fingerprints visible in hand gestures
🪪 ID cards or official documents
📝 Sticky notes containing passwords or Wi-Fi credentials
💻 Laptop and monitor screens
📧 Emails, phone numbers, and personal information
📋 Whiteboards with confidential notes


💡 Solution
KAVACH.ai performs 100% local, offline analysis before a photo is shared.

The app alerts users to potential privacy risks and lets them decide whether to:
🔄 Reupload a safer image
✅ Post anyway
The final decision always stays with the user.
The scan pipeline combines two on-device model types:

1. Text Risk Detection
Using on-device OCR, KAVACH.ai extracts visible text and detects sensitive information using pattern matching.
Detected patterns include:
Aadhaar numbers
PAN numbers
Phone numbers
Email addresses
Passwords
Wi-Fi credentials


2.Other sensitive keywords Visual risk detection (ViT-based image classification):

Detects non-text privacy risks such as screens, monitors🖥️, ID cards🪪, documents📊, and sticky notes📝 present in an image🏞️.

Uses a Vision Transformer (ViT) model running entirely locally in the browser via Hugging Face's transformers.js for object classification.
Performs on-device inference, ensuring images never leave the user's device and preserving privacy.

Leverages a Gemma-based model to provide contextual understanding of the scene and identify potential privacy risks based on what is visible in the frame.

Combines object detection with contextual reasoning to flag sensitive content that traditional OCR-based scanning may miss.
The user sees clear, plain-language warnings (e.g. "Possible screen visible in photo") and chooses to Reupload or Post anyway — the decision stays with them, but they're never caught unaware.


🔒 Why On-Device?
Privacy tools should never compromise privacy.
KAVACH.ai ensures that:
🔐 Images never leave the device
🌐 Works completely offline after the initial model download
⚡ No network latency
💰 No API keys or per-request costs
🛡️ Privacy-first by designPrivacy by design: the whole point of a privacy scanner defeats itself if it uploads your photo to a server to check it. Every model here runs locally.
Fast iteration: no network latency between "select photo" and "see risk."

Current status (hackathon prototype)
✅ On-device OCR + regex-based sensitive text detection
✅ ViT-based visual object/label risk detection (screens, ID cards, sticky notes)
✅ Review UI with Reupload / Post Anyway flow
✅ Fully offline, no cloud API calls
🔜 Gesture-specific fingerprint exposure detection (victory-sign hand landmark analysis)
🔜 Friendlier risk-label mapping for a more polished user-facing vocabulary


Tech stack:
React + Hugging Face transformers.js (Gemma + ViT models, running client-side)
On-device OCR and pattern-matching risk engine
No backend, no cloud inference APIs


Team:
Built in a 5-day hackathon sprint by [Krishna Pandey and Asti Bajaj].

