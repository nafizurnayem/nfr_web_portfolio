/**
 * Static project data — extracted from backend/app/db/seed.py so the frontend
 * can render without a running FastAPI backend.
 */

import type { Project } from "../api";

// Synthetic timestamps so the type contract is satisfied.  The seed script
// doesn't persist real dates either; these just need to be valid ISO strings
// ordered roughly by "most-interesting-first".
const ts = (offset: number) => {
  const d = new Date("2025-06-01T00:00:00Z");
  d.setDate(d.getDate() - offset);
  return d.toISOString();
};

export const STATIC_PROJECTS: Project[] = [
  // ── Image Processing & Computer Vision ─────────────────────────────
  {
    id: 1,
    slug: "potato-disease-classification-cnn",
    title: "Potato Disease Classification (Custom CNN)",
    summary:
      "A custom CNN trained from scratch to classify potato-leaf diseases. Built for the CVPR coursework.",
    description:
      "## What it does\nLook at a photo of a potato leaf and tell you whether the plant is **healthy** or has a disease such as *early blight* or *late blight*. Think of it as a digital plant doctor — instead of waiting for an agricultural expert, a farmer can get a fast first opinion from a phone photo.\n\n## Why I built it\nCrop diseases cost farmers huge amounts of yield every season, especially in Bangladesh where access to specialists is limited. A small AI model that runs on a laptop or phone can flag problems early, before they spread across a field.\n\n## How it works\n1. The user provides a clear photo of a potato leaf.\n2. The image is fed into a *Convolutional Neural Network* (CNN) — a kind of AI built specifically for images — that I designed and trained from scratch.\n3. The CNN looks for visual patterns linked to each disease: color spots, leaf-edge curling, texture changes.\n4. It outputs the most likely class together with a **confidence score** so you know how sure the model is.\n\n## Key features\n- Custom CNN architecture (built layer by layer, not a copy of a pretrained model)\n- Trained on the public PlantVillage potato-leaf dataset\n- Image augmentation pipeline (rotations, flips, color jitter) so the model is robust to real-world photos\n- Per-class accuracy breakdown so I know exactly where it struggles\n\n## What I learned\n- How to size a CNN's depth, width, and dropout for a small academic dataset.\n- Why class imbalance matters and how to handle it with a weighted loss.\n- How to read training/validation curves to spot overfitting early.",
    category: "Image Processing & Computer Vision",
    tech_stack: "Python, TensorFlow / Keras, NumPy, Matplotlib, Jupyter",
    github_url:
      "https://github.com/nafizurnayem/Potato-Disease-Classification-using-Custom-CNN",
    live_url: null,
    image_url: "/projects/potato-disease-chart.webp",
    image_credit: "Reference chart — Agricultural Research Center, 2022",
    status: "published",
    featured: true,
    tags: ["cnn", "computer-vision", "deep-learning", "agriculture", "cvpr"],
    created_at: ts(0),
    updated_at: ts(0),
  },
  {
    id: 2,
    slug: "images-to-pdf-converter",
    title: "Images → PDF Converter",
    summary:
      "Lightweight Python utility that bundles a folder of images into a single PDF file.",
    description:
      "## What it does\nTakes a folder full of images — phone photos, scanned pages, screenshots — and stitches them together into one neat PDF, in the order you choose.\n\n## Why I built it\nI kept needing to send *one PDF* of multiple scanned pages: handwritten notes, ID copies, assignments. Free online converters either had file-size limits or stamped watermarks on the output. So I made a tool that runs **fully offline** on my own machine.\n\n## How it works\n1. Point the script at a folder.\n2. It reads every image, fixes the orientation (so phone photos aren't sideways), and resizes if needed.\n3. It writes them into a single PDF in the order you choose — alphabetical or by modified date.\n\n## Key features\n- Pure Python — no Java, no Adobe, no internet connection needed\n- Handles JPG, PNG, WEBP, BMP\n- Auto-rotates based on EXIF metadata\n- Configurable page size (A4, Letter, or fit-to-image)\n\n## Try it\nClone the repo, run the script, point it at any folder of images. That's it.",
    category: "Image Processing & Computer Vision",
    tech_stack: "Python, Pillow",
    github_url: "https://github.com/nafizurnayem/images-to-pdf-converter",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: true,
    tags: ["python", "image-processing", "tools", "pdf"],
    created_at: ts(1),
    updated_at: ts(1),
  },
  {
    id: 3,
    slug: "smart-lamp-document-scanner",
    title: "Smart Lamp Document Scanner",
    summary:
      "A desk lamp that scans paper. OpenCV cleans the page, an LLM reads and corrects it, and you get a searchable PDF or Word file.",
    description:
      "## What it does\nTurns an ordinary desk lamp into a document scanner. You put a page under the lamp, it takes a picture, straightens and cleans the image, reads the text, and gives you back a proper **PDF or Word file** you can search, download, and share.\n\n## Why I built it\nPhone scanner apps produce skewed, shadowed, hard-to-read scans and lock your files behind a subscription. A fixed overhead camera has none of those problems: the page is always flat, always the same distance away, always lit the same way. That makes the image-processing step far more reliable.\n\n## How it works\n1. A camera mounted in the lamp captures the page.\n2. An **OpenCV preprocessing pipeline** finds the paper, corrects the perspective so the page is square, removes shadows, and boosts contrast until the text is crisp.\n3. The cleaned image goes to the **Gemini API**, which reads the text and fixes recognition mistakes using the surrounding context — so `rn` doesn't come back as `m`.\n4. The result is exported as PDF or Word and stored locally on the Raspberry Pi.\n5. A web dashboard lets you process, browse, download, and share everything from any device on the network.\n\n## Key features\n- Overhead-camera capture with automatic page detection and perspective correction\n- Shadow removal and adaptive thresholding tuned for printed text\n- LLM-assisted reading, so context fixes what raw character recognition gets wrong\n- PDF and Word export\n- Runs entirely on a Raspberry Pi, with files kept on the device\n- Wi-Fi setup flow, so the lamp can be configured without a keyboard\n- MediaPipe hand-landmark detection for touch-free page-turn triggering\n\n## What I learned\n- Good preprocessing beats a bigger model. Fixing the image first made the reading step dramatically more accurate.\n- Raspberry Pi OS pins specific library builds; matching Python and OpenCV versions to the board saved days of debugging.\n- Giving a language model the surrounding sentence is the cheapest accuracy win in a text pipeline.",
    category: "Image Processing & Computer Vision",
    tech_stack:
      "Python, OpenCV, Gemini API, MediaPipe, Raspberry Pi, Flask, PDF/DOCX export",
    github_url: "https://github.com/nafizurnayem/Smart_Lamp_System",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: true,
    tags: [
      "opencv",
      "image-processing",
      "llm",
      "raspberry-pi",
      "ocr",
      "gemini",
    ],
    created_at: ts(2),
    updated_at: ts(2),
  },
  // ── AI/ML Research ─────────────────────────────────────────────────
  {
    id: 4,
    slug: "model-testing-lab",
    title: "Model Testing Lab",
    summary:
      "Notebook collection for evaluating and comparing ML / DL models on benchmark tasks.",
    description:
      "## What it does\nA growing notebook collection where I try different machine-learning and deep-learning models on the same benchmark tasks and compare them side by side. Think of it as a personal lab notebook for AI experiments.\n\n## Why I built it\nResearch papers always claim *their* model is the best. Reality: it depends on the dataset, the metric, even the random seed. Having a reproducible playground where I can plug a new model in and see how it actually performs against my own baselines saves me from blindly trusting numbers in papers.\n\n## How it works\nEach notebook follows the same template:\n- A dataset loader\n- A baseline model (something simple and well-understood)\n- The candidate model I'm evaluating\n- A shared training/evaluation loop with the same epochs, batch size, and seed for both\n\nResults land in a comparison table so I can spot real improvements vs. random noise.\n\n## Key features\n- Reusable training/eval boilerplate\n- Side-by-side accuracy, F1 score, and training time\n- Saves figures to disk so I can drop them straight into reports\n- Each notebook is self-contained and runs on Google Colab",
    category: "AI/ML Research",
    tech_stack: "Python, PyTorch, scikit-learn, Jupyter",
    github_url: "https://github.com/nafizurnayem/Testing_Models",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: ["ml", "research", "jupyter", "experiments"],
    created_at: ts(3),
    updated_at: ts(3),
  },
  {
    id: 5,
    slug: "school-result-gpa-engine",
    title: "School Result Processing & GPA Engine",
    summary:
      "A rules engine that reads a school marks file, computes every student's GPA, and shows the exact rule trace behind each grade.",
    description:
      "## What it does\nReads a school's raw marks file and works out each student's per-subject grade points, **GPA**, and letter grade. Crucially, it also prints a *rule trace* for every student — a line-by-line explanation of which rule fired and why — plus three checking lists for the school office.\n\n## Why I built it\nBuilt for a hackathon problem (P08). Grading rules in real schools are full of edge cases: optional subjects, fail conditions that override an otherwise good average, subjects that only count partially. A spreadsheet hides all of that. If a parent asks *why* their child got that grade, someone needs an answer, and \"the spreadsheet said so\" is not one.\n\n## How it works\n1. Load a marks file (or fall back to a seeded 60-student cohort so the app always works).\n2. For every student and subject, apply the grading rules in order, recording each decision as it is made.\n3. Combine subject grade points into a GPA under the documented rules, including the override cases.\n4. Render everything in a **Streamlit** dashboard: results, the per-student trace, and the office lists.\n\n## Key features\n- Every grade comes with a readable trace of the rules that produced it\n- **17 rule tests** covering every documented trap in the specification\n- Runs headless (`python engine.py`) or as a dashboard (`streamlit run app.py`)\n- Works with no data file loaded, using its own seeded cohort\n- Three generated office-checking lists for manual verification\n\n## What I learned\n- A rules engine that can explain itself is worth far more than one that is merely correct.\n- Writing the tests directly from the specification's edge cases caught bugs before the UI existed.\n- Making the app work with zero input is the difference between a demo that runs and one that doesn't.",
    category: "AI/ML Research",
    tech_stack: "Python, Streamlit, Pandas, rule-engine design, unit tests",
    github_url: "https://github.com/nafizurnayem/lsh26-t001-p08",
    live_url: "https://lsh26-t001-p08.streamlit.app/",
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: [
      "python",
      "streamlit",
      "data-engineering",
      "rules-engine",
      "hackathon",
    ],
    created_at: ts(4),
    updated_at: ts(4),
  },
  // ── IoT & Robotics ─────────────────────────────────────────────────
  {
    id: 6,
    slug: "esp32-smart-home-automation",
    title: "ESP32 Smart Home Automation",
    summary:
      "ESP32 + ESP RainMaker home automation: Google Home control, IR remote, manual switches, DHT11 telemetry.",
    description:
      "## What it does\nTurns ordinary home appliances — lights, fans — into **smart devices** you can control with your voice (\"Hey Google, turn off the bedroom fan\"), an IR remote, the regular wall switch, or your phone. It also shows live room temperature and humidity in an app.\n\n## Why I built it\nCommercial smart-home gear is expensive and locks you into one ecosystem. With a ~$5 ESP32 chip and a few relays, I built the same thing for a fraction of the cost — fully under my control and without giving up the regular wall switch.\n\n## How it works\n1. The ESP32 is wired to relays that physically switch the appliance circuits on and off.\n2. It runs the *ESP RainMaker* SDK, which connects to the cloud and exposes the device to Google Home.\n3. A DHT11 sensor reads temperature and humidity every few seconds and publishes them.\n4. Wall switches and an IR remote are read through GPIO pins for offline / no-internet control.\n5. All four control paths — voice, app, remote, wall switch — stay in sync.\n\n## Key features\n- **Works without internet.** Wall switch and IR remote always work, even if Wi-Fi is down.\n- Voice control via Google Assistant\n- Live temperature & humidity in the RainMaker app\n- Failure-safe: if Wi-Fi drops mid-action, the device still responds to the wall switch\n\n## What I learned\n- How to debounce physical switches in firmware so a single press doesn't fire twice.\n- The trade-offs between cloud-only smart devices and local-control hybrids.\n- Powering everything safely — handling AC mains relays from a 3.3V microcontroller.",
    category: "IoT & Robotics",
    tech_stack: "C++, Arduino IDE, ESP32, ESP RainMaker, DHT11",
    github_url:
      "https://github.com/nafizurnayem/ESP32-Smart-Home-Automation",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: true,
    tags: ["iot", "esp32", "smart-home", "embedded", "arduino"],
    created_at: ts(5),
    updated_at: ts(5),
  },
  {
    id: 7,
    slug: "remote-pc-power-on",
    title: "Remote PC Power-On",
    summary:
      "Power on a desktop PC remotely from anywhere using a small client + Wake-on-LAN.",
    description:
      "## What it does\nLets you turn on your home desktop **from anywhere in the world** — your phone, a laptop on Wi-Fi at a café — without leaving the PC running 24/7.\n\n## Why I built it\nI sometimes need to reach my home machine while travelling, but leaving a desktop powered on all the time wastes electricity and is noisy. The standard *Wake-on-LAN* trick only works on the same network as the PC. I extended that idea so it works over the internet too.\n\n## How it works\n1. A small **always-on** device (a router or Raspberry Pi) on my home LAN listens for a request.\n2. From anywhere on the internet, I send a small encrypted command to that listener.\n3. The listener fires a *magic Wake-on-LAN packet* at the desktop's MAC address.\n4. The desktop turns on within seconds. I can then SSH or remote-desktop in.\n\n## Key features\n- Wakes a fully-off desktop from any internet connection\n- **Encrypted** command channel — nobody else can wake my machine\n- Tiny resident program — barely uses any power on the listener device\n- Cross-platform listener (works on Windows, Linux, and the Pi)",
    category: "IoT & Robotics",
    tech_stack: "C++, Wake-on-LAN, Networking",
    github_url:
      "https://github.com/nafizurnayem/Power_On_PC-remotely-from-anywhere",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: ["networking", "cpp", "automation", "wake-on-lan"],
    created_at: ts(6),
    updated_at: ts(6),
  },
  {
    id: 8,
    slug: "agrobot-autonomous-farming",
    title: "AgroBot — Autonomous Farming Operator",
    summary:
      "A driveable farm robot with a live ESP32-CAM video feed, controlled from a browser, built toward autonomous field work.",
    description:
      "## What it does\nA small agricultural robot you drive from a web page while watching a **live video feed** from its onboard camera. It is built for remote farm tasks — checking a field, reaching a plot you can't easily walk to, and eventually watering and navigating on its own.\n\n## Why I built it\nWalking a field to check on crops takes time, and in heat or rain it is genuinely unpleasant. A cheap robot that streams video and takes commands over Wi-Fi turns a physical trip into a browser tab. I designed it in phases so it works usefully today while leaving room for the autonomy features.\n\n## How it works\n1. An **ESP32** runs the drive motors and serves the control web interface.\n2. An **ESP32-CAM** streams live video into the same page.\n3. The robot joins your Wi-Fi, or hosts its own hotspot when there is no network in the field.\n4. A connection watchdog auto-stops the motors if the link drops, so it cannot drive away unattended.\n\n## Key features\n- Browser-based remote control — no app to install\n- Live ESP32-CAM video stream\n- Dual network mode: joins Wi-Fi, or falls back to its own hotspot\n- Connection monitoring with automatic safety stop\n- Modular payload bay for sensors and a water pump\n\n## What's next\n- DHT11 temperature and humidity monitoring\n- Soil-moisture sensing\n- Ultrasonic obstacle detection\n- Automated watering with tank-level monitoring\n- GPS-assisted navigation and field mapping",
    category: "IoT & Robotics",
    tech_stack:
      "ESP32, ESP32-CAM, C++, Arduino framework, Wi-Fi / HTTP streaming, motor drivers",
    github_url:
      "https://github.com/nafizurnayem/Agribot-Autonomous_Farming_Operator",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: true,
    tags: ["robotics", "esp32", "esp32-cam", "agriculture", "embedded"],
    created_at: ts(7),
    updated_at: ts(7),
  },
  {
    id: 9,
    slug: "pico-assistant-pc-control",
    title: "Pico Assistant — Desk & Remote PC Control",
    summary:
      "An ESP32-S3 desk device with a touchscreen that wakes, monitors, and shuts down a Windows PC — plus a Flutter app and Home Assistant control over TLS MQTT.",
    description:
      "## What it does\nA small device that sits on your desk with a **3.2-inch touchscreen**, showing live stats from your PC — temperatures, load, network speed. Tap it to wake the machine, or to shut it down cleanly. The same controls work from a phone app and from Home Assistant, anywhere in the world.\n\n## Why I built it\nI wanted the PC's state visible without opening a monitoring app, and I wanted to wake it from outside the house without leaving anything insecure. Wake-on-LAN alone gets you the wake but nothing else — no status, no clean shutdown, no encryption. So I built the full loop.\n\n## How it works\n1. A **Windows service** collects hardware telemetry and publishes it to an MQTT broker over **TLS**.\n2. The **ESP32-S3** subscribes to that feed and draws it on the ILI9341 display; touch input sends commands back.\n3. Wake-on-LAN runs locally from the ESP32, so the PC can be off and still woken.\n4. Shutdown is a *graceful* command handled by the Windows service, not a power cut.\n5. A **Flutter** app and **Home Assistant** integration subscribe to the same versioned topic namespace.\n\n## Key features\n- Live hardware telemetry on a physical desk display\n- Local Wake-on-LAN plus remote wake via MQTT\n- Graceful shutdown, not a forced power-off\n- TLS-encrypted MQTT with separate credentials per client\n- Encrypted **BLE provisioning** for first-time Wi-Fi setup\n- A versioned message contract (`pcbot/v1/...`) with its own tests, so clients can be upgraded independently\n- Five coordinated components: firmware, Windows service, mobile app, Home Assistant deployment, and the shared contract\n\n## What I learned\n- Versioning the message contract from day one made every later change safe.\n- Separate broker credentials per device turns one leaked key into a contained problem.\n- On an ESP32-S3, the display and the network stack fight over timing; splitting them across cores fixed the stutter.",
    category: "IoT & Robotics",
    tech_stack:
      "ESP32-S3, ILI9341 TFT, PlatformIO, C++, C# / .NET service, Flutter, MQTT over TLS, Home Assistant, BLE",
    github_url: "https://github.com/nafizurnayem/Mini_PC_Assistant",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: true,
    tags: [
      "esp32-s3",
      "mqtt",
      "flutter",
      "dotnet",
      "home-assistant",
      "embedded",
      "tls",
    ],
    created_at: ts(8),
    updated_at: ts(8),
  },
  {
    id: 10,
    slug: "smart-solar-power-management",
    title: "Smart Solar Power Management",
    summary:
      "A low-cost ESP32 system that lets a solar owner share surplus power with neighbours at a rate and limit they set from a web app.",
    description:
      "## What it does\nManages a home solar system so that **surplus power is shared instead of wasted**. If your panels make 2 kW and you only need 1 kW, the other 1 kW can go to a neighbour — metered, priced, and capped by rules you set in a web app.\n\n## Why I built it\nMost rooftop solar setups generate more than the household uses at midday, and that extra energy simply disappears. In places without a feed-in tariff there is no way to sell it back. A small local sharing system turns wasted generation into something useful, and makes the arrangement transparent enough that neighbours will actually agree to it.\n\n## How it works\n1. Current and voltage sensors measure generation and consumption in real time.\n2. An **ESP32** reads those measurements, shows them on a local display, and hosts the web interface.\n3. The **prosumer** (the solar owner) sets the sharing rate, price, and usage limits from the web app.\n4. The **consumer** draws shared power within those limits, with power and cost tracked live.\n\n## Key features\n- Two clear roles — prosumer and consumer — with different permissions\n- Live power measurement on a local display and in the browser\n- Configurable rate, price, and hard usage limits\n- Real-time cost tracking so neither side has to trust the other's arithmetic\n- Built from low-cost, widely available parts — a working microgrid demo without microgrid hardware\n\n## What I learned\n- Reading current accurately on a budget sensor needs calibration and averaging; raw readings are noisy.\n- A shared resource only works socially if both sides can see the same numbers.\n- Enforcing the limit in firmware, not in the web app, is what makes the cap real.",
    category: "IoT & Robotics",
    tech_stack:
      "ESP32, C++, current/voltage sensors, OLED display, embedded web server",
    github_url:
      "https://github.com/nafizurnayem/Smart_Solar_Power_Management-low-cost",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: ["esp32", "solar", "energy", "iot", "embedded"],
    created_at: ts(9),
    updated_at: ts(9),
  },
  // ── Full-Stack Web ─────────────────────────────────────────────────
  {
    id: 11,
    slug: "evershop-ecommerce",
    title: "EverShop — E-Commerce Platform",
    summary:
      "Full e-commerce platform with admin panel, payment integration, and real-time features. Live demo on Vercel.",
    description:
      "## What it does\nA complete online store: product catalog, search, shopping cart, checkout with payment, plus a back-office **admin panel** where the shop owner can manage inventory and watch orders come in live.\n\n## Why I built it\nMost \"build a Next.js store\" tutorials skip the parts that actually matter for a real shop: payment integration, real-time admin dashboards, error handling. I wanted a project that wasn't just a UI mock — it had to actually work end-to-end.\n\n## How it works\n- **Storefront**: customers browse products, add items to a cart, check out.\n- **Payments**: an integrated payment gateway processes the transaction.\n- **Admin panel**: the shop owner logs in, manages products, watches new orders appear in real time.\n- **Real-time updates**: when stock or orders change, all open browsers update instantly without a page refresh.\n\n## Key features\n- **TypeScript end-to-end** — catches a lot of bugs before deployment\n- Live admin dashboard with real-time order notifications\n- Payment integration that handles success, failure, and refunds gracefully\n- Deployed to Vercel and reachable on the internet today\n\n## Try it\nThere's a [live demo](https://e-commerce-website-ever-shop.vercel.app) you can browse without signing up. Source on [GitHub](https://github.com/nafizurnayem/E_Commerce_Website-EverShop-).",
    category: "Full-Stack Web",
    tech_stack: "TypeScript, Next.js, React, Vercel",
    github_url:
      "https://github.com/nafizurnayem/E_Commerce_Website-EverShop-",
    live_url: "https://e-commerce-website-ever-shop.vercel.app",
    image_url: null,
    image_credit: null,
    status: "published",
    featured: true,
    tags: ["ecommerce", "typescript", "fullstack", "nextjs", "vercel"],
    created_at: ts(10),
    updated_at: ts(10),
  },
  {
    id: 12,
    slug: "naf-portfolio-website",
    title: "Earlier Portfolio Site",
    summary:
      "Earlier iteration of my personal portfolio (Jupyter-driven). Kept for reference before the current rebuild.",
    description:
      "## What it is\nAn earlier version of my personal portfolio website, built using Jupyter Notebooks and plain HTML.\n\n## Why it's still around\nI kept this repo as a reference point. Looking back at it shows how my web work has evolved — from notebook-driven static pages to the current site you're on, which uses Next.js, FastAPI, and a proper component architecture.\n\n## What I learned moving on from it\n- Notebook-driven static sites are great for quick prototyping but painful to maintain.\n- Once a site grows past a few pages, a real component architecture saves a lot of pain.\n- Splitting frontend (Next.js) from backend (FastAPI) makes both sides easier to evolve.",
    category: "Full-Stack Web",
    tech_stack: "Jupyter Notebook, HTML, CSS",
    github_url: "https://github.com/nafizurnayem/naf-portfolio-website",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: ["portfolio", "personal"],
    created_at: ts(11),
    updated_at: ts(11),
  },
  {
    id: 13,
    slug: "pharmashelf-expiry-audit",
    title: "PharmaShelf — Pharmacy Expiry Auditing",
    summary:
      "An end-to-end pharmacy inventory system that catches expiring medicine before it is dispensed, with a REST API, a React app, and a live analytics dashboard.",
    description:
      "## What it does\nAudits a pharmacy's shelves and flags medicine that is **expired or close to expiring** — before it reaches a patient. It also organises what should be sent back to the supplier, so the pharmacy recovers value instead of binning stock.\n\n## Why I built it\nBuilt for a hackathon problem (P02). Dispensing expired medicine is a genuine safety failure, and manual shelf checks miss things — there are thousands of boxes and the dates are printed small. The waste side matters too: stock that expires unnoticed is money a small pharmacy cannot afford to lose.\n\n## How it works\n1. A **Node.js + Express 5 + TypeScript** REST API holds inventory, batches, and expiry rules.\n2. A **React 19 + Vite + Tailwind** web app is what pharmacy staff actually use day to day.\n3. A **Streamlit** dashboard sits alongside for real-time analytics — trends, risk exposure, and return value.\n4. The whole system is validated against a benchmark dataset of 20 official test cases.\n\n## Key features\n- Three integrated applications in one repository: API, web app, and analytics dashboard\n- Expiry risk tiers, not a single flat cutoff — near-expiry stock is caught while it can still be returned\n- Supplier-return workflow to recover value from stock that would otherwise be waste\n- Typed end to end, so the API contract and the frontend cannot silently drift apart\n- Verified against a 20-case benchmark dataset\n\n## What I learned\n- Sharing TypeScript types between the API and the frontend removed a whole class of integration bugs.\n- Streamlit is the fastest way to add a serious analytics view to an existing product.\n- Benchmark cases written before the code turned \"it seems to work\" into a number.",
    category: "Full-Stack Web",
    tech_stack:
      "Node.js, Express 5, TypeScript, React 19, Vite, Tailwind CSS, Python, Streamlit",
    github_url: "https://github.com/nafizurnayem/lsh26-t001-p02",
    live_url: "https://lsh26-t001-p02.vercel.app/",
    image_url: null,
    image_credit: null,
    status: "published",
    featured: true,
    tags: [
      "typescript",
      "react",
      "express",
      "streamlit",
      "healthcare",
      "hackathon",
    ],
    created_at: ts(12),
    updated_at: ts(12),
  },
  {
    id: 14,
    slug: "microjob-campus-marketplace",
    title: "Microjob — Campus Freelance Marketplace",
    summary:
      "A marketplace where university students sell small services to each other — post a job, hire a classmate, get paid.",
    description:
      "## What it does\nA freelance marketplace scoped to a single campus. Students **offer small services** — design work, tutoring, proofreading, small builds — and other students hire them. Post a job, browse offers, agree terms, get paid.\n\n## Why I built it\nThe skills already exist on campus, but there is no place to find them. People ask in group chats and it gets lost. General freelance sites are the wrong fit: the fees are high, the competition is global, and nobody hires an unknown first-year. Restricting the marketplace to one campus solves the trust problem, because buyer and seller share a university.\n\n## How it works\n1. Students register and build a profile with the services they offer.\n2. Buyers browse or post a job describing what they need.\n3. Sellers respond, terms are agreed, and the job is tracked to completion.\n4. Completed work feeds back into a public profile, so reputation accumulates.\n\n## Key features\n- Dual roles — every user can both buy and sell\n- Service listings with categories and search\n- Job posting with responses and negotiation\n- Order tracking from agreement to completion\n- Profile and reputation built from finished jobs\n\n## What I learned\n- A marketplace's hardest problem is the cold start, not the code — the campus constraint is what makes it viable.\n- Modelling one account that can act as both buyer and seller is much simpler than two account types.\n- Server-side validation on every state change is essential when money and reputation are involved.",
    category: "Full-Stack Web",
    tech_stack: "PHP, MySQL, JavaScript, HTML5, CSS3",
    github_url:
      "https://github.com/nafizurnayem/Microjob-Campus-Freelance-Marketplace",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: ["php", "mysql", "marketplace", "full-stack", "web"],
    created_at: ts(13),
    updated_at: ts(13),
  },
  // ── Academic / Coursework ──────────────────────────────────────────
  {
    id: 15,
    slug: "restaurant-management-system",
    title: "Restaurant Management System",
    summary:
      "A desktop application for running a restaurant — orders, menu, stock, staff, and sales reports — built in C# with role-based access.",
    description:
      "## What it does\nRuns the daily operations of a restaurant from one desktop application: taking **orders**, managing the **menu**, tracking **stock**, handling **staff accounts**, and generating **sales reports**.\n\n## Why I built it\nCoursework for a C# module, but I built it as a system a small restaurant could genuinely use rather than a demo with three buttons. The interesting part was the role split — an admin and a waiter should not see the same screen, and the software should enforce that rather than rely on trust.\n\n## How it works\n1. Users log in and are routed to the dashboard matching their role.\n2. **Staff** take orders, add items to a cart, and register customers.\n3. **Admins** additionally manage users, the menu, stock, and reports.\n4. Everything is persisted to a **SQL Server** database, so orders and stock survive a restart.\n\n## Key features\n- Authentication with two distinct roles (Admin, Staff)\n- Separate dashboards — staff never see admin controls\n- Order placement, cart, and full order history\n- Menu management (add and remove food items)\n- Stock and inventory status tracking\n- Customer registration\n- Sales reporting\n\n## What I learned\n- Enforcing permissions at the data layer, not just by hiding buttons, is what actually makes roles mean something.\n- Windows Forms is unfashionable but forces you to think carefully about state and event ordering.\n- Designing the database schema before the screens saved a large rewrite later.",
    category: "Academic / Coursework",
    tech_stack: "C#, .NET Framework, Windows Forms, Microsoft SQL Server",
    github_url:
      "https://github.com/nafizurnayem/Restaurant-Management-System",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: ["csharp", "dotnet", "winforms", "sql-server", "aiub"],
    created_at: ts(14),
    updated_at: ts(14),
  },
  {
    id: 16,
    slug: "webtech-coursework",
    title: "Web Technologies Coursework",
    summary:
      "Coursework from the AIUB Web Technologies module — server-rendered pages, forms, and database work in PHP.",
    description:
      "## What it is\nThe complete set of work from AIUB's **Web Technologies** module (Summer 2025-26): the exercises, the assignments, and the final project, all in one repository.\n\n## Why it's here\nIt is where the server-side fundamentals came from. Before any framework, this is how you learn what a form submission actually is, how a session persists between requests, and why user input is never safe.\n\n## What it covers\n- Semantic HTML5 structure and CSS layout\n- Form handling and server-side validation in **PHP**\n- Sessions, cookies, and authentication flow\n- Database-backed pages with create, read, update, and delete operations\n- Client-side interaction with plain JavaScript, no framework\n\n## What I learned\n- Writing the request/response cycle by hand makes every framework afterwards obvious.\n- Validating on the client is a convenience; validating on the server is the actual check.\n- Plain JavaScript is enough for far more than people assume.",
    category: "Academic / Coursework",
    tech_stack: "PHP, MySQL, HTML5, CSS3, JavaScript",
    github_url: "https://github.com/nafizurnayem/Webtech-Summer-2025-26",
    live_url: null,
    image_url: null,
    image_credit: null,
    status: "published",
    featured: false,
    tags: ["php", "web", "academic", "aiub"],
    created_at: ts(15),
    updated_at: ts(15),
  },
];
