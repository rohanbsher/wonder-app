# Wonder - A Journey into Philosophy

> *"The unexamined life is not worth living." - Socrates*

Wonder is a daily philosophical journey that presents profound questions to expand consciousness and deepen understanding of existence. Inspired by Steve Jobs' philosophy of simplicity and crafted with obsessive attention to detail.

## ✨ Features

### 🌅 Daily Wonder
- **30 Profound Questions**: Carefully curated philosophical questions that challenge perception
- **Morning Ritual**: Smart notifications that learn your optimal contemplation time
- **Thought Capture**: Private journaling to record your insights (500 character limit forces clarity)
- **Streak Tracking**: Build a habit of daily philosophical reflection

### 🚀 Three Majestic Journeys

#### ⏰ **The Nature of Time**
*Where past meets future*
- Is time an illusion?
- Can the present moment be measured?
- Does the future already exist?

#### 🌌 **The Question of God**
*Beyond belief itself*
- Can something come from nothing?
- Is consciousness fundamental?
- What existed before existence?

#### 🧠 **The Mystery of Consciousness**
*The universe aware of itself*
- When does awareness begin?
- Can machines truly think?
- Is reality a simulation?

### 🎨 Design Philosophy
- **Typography**: Custom fonts (Playfair Display, Inter, Lora)
- **Animations**: Breathing effects creating a living interface
- **Spacing**: Perfect 8px grid system
- **Colors**: Dark theme optimized for contemplation
- **Privacy-First**: All data stays on your device

## 🛠 Tech Stack

- **Framework**: Expo SDK 54 (React Native for Web)
- **Navigation**: React Navigation v7
- **State Management**: Local AsyncStorage
- **Animations**: Custom hooks with Animated API
- **Typography**: Google Fonts via Expo
- **Deployment**: Vercel (static hosting)

## 📱 Installation

### Prerequisites
- Node.js 20+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/wonder-app.git
cd wonder-app

# Install dependencies
npm install

# Run on web
npm run web

# Run on iOS (requires Mac)
npm run ios

# Run on Android
npm run android
```

### Production Build

```bash
# Build for web deployment
npm run build

# Test production build locally
npm run serve
```

## 🏗 Project Structure

```
wonder-app/
├── components/          # Reusable UI components
│   ├── AnimatedJourneyCard.js
│   ├── ThoughtCapture.js
│   ├── ErrorBoundary.js
│   └── LoadingScreen.js
├── screens/            # Main app screens
│   ├── MajesticJourneyScreen.js
│   ├── DepthScreen.js
│   ├── DailyScreen.js
│   └── OnboardingScreen.js
├── styles/             # Design system
│   ├── typography.js   # Font system
│   └── spacing.js      # Grid system
├── services/           # Core services
│   ├── DataService.js  # Storage abstraction
│   └── MorningRitual.js # Notifications
├── hooks/              # Custom React hooks
│   └── useAnimations.js
├── questions.json      # 30 daily questions
└── journeys.json       # Journey content
```

## 🎯 Design Principles

Following Steve Jobs' philosophy:
1. **Simplicity**: One question per day, not ten
2. **Focus**: Remove all distractions
3. **Polish**: Every pixel matters
4. **Privacy**: Your thoughts belong to you
5. **Delight**: Subtle animations bring joy

## 🚀 Deployment

The app is optimized for static hosting on Vercel:

```bash
# Deploy with Vercel CLI
vercel --prod

# Or connect GitHub repo to Vercel
# Build settings:
# - Framework: Other
# - Build Command: npm run build
# - Output Directory: dist
```

## 📊 Features Roadmap

- [x] Daily philosophical questions
- [x] Three journey paths
- [x] Thought capture
- [x] Progress tracking
- [x] Custom typography
- [x] Animation system
- [ ] Sound design
- [ ] Haptic feedback
- [ ] PWA support
- [ ] Widget support
- [ ] Community features (optional)

## 🤝 Contributing

Wonder is a journey best taken together. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingIdea`)
3. Commit your changes (`git commit -m 'Add some AmazingIdea'`)
4. Push to the branch (`git push origin feature/AmazingIdea`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by great philosophers throughout history
- Built with React Native and Expo
- Typography from Google Fonts
- Deployed on Vercel

## 💭 Final Thought

*"Wonder is the beginning of wisdom." - Socrates*

Start your philosophical journey today. Every profound question brings you closer to understanding the nature of existence itself.

---

**🌟 Live Demo**: https://wonder-app.vercel.app

**📱 GitHub**: https://github.com/rohanbsher/wonder-app

Built with ❤️ and philosophical curiosity