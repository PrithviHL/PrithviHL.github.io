// All site content lives here. Edit this file to update the portfolio.

export const PROFILE = {
  name: "Prithvi",
  short: "Prithvi",
  headline:
    "Prev ML Engineer @ Aventusoft // taught AI to catch missing heartbeats | MS AI @ UF | Prev SWE @ Huron // kept Salesforce from breaking | Next up: building products people can trust",
  roles: [
    "Software Engineer",
    "AI/ML Engineer",
    "LLM systems builder",
    "Medical AI engineer",
    "RAG & evaluation nerd",
  ],
  status: "Open to full-time Software Engineer and AI/ML Engineer roles · open to relocation",
  about: [
    "I build production-minded AI systems: retrieval and LLM applications, evaluation and observability tooling, and deep learning for medical signals and images.",
    "Most recently I was a Machine Learning Engineer Intern at Aventusoft, shipping ECG deep learning models for arrhythmia classification and PQRST fiducial detection, exported to TensorFlow Lite and deployed on AWS SageMaker.",
    "Before that I automated 120+ Salesforce test workflows as a software engineer in test. Turns out debugging humans is harder than debugging code.",
    "Right now I'm building LeaveNow, a real-time bus planner for Gainesville RTS with live GPS and one-transfer routing.",
  ],
  stats: [
    { value: 94, suffix: "%", label: "accuracy detecting heart conditions" },
    { value: 120, suffix: "+", label: "Salesforce test workflows automated" },
    { value: 4, suffix: "", label: "live apps you can try today" },
  ],
  links: {
    linkedin: "https://www.linkedin.com/in/prithvihl/",
    github: "https://github.com/PrithviHL",
    email: "mailto:prithvihlnew@gmail.com",
    instagram: "https://instagram.com/prithvi_gowda_001",
  },
};

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "llm", label: "LLM & RAG" },
  { id: "medical", label: "Medical AI" },
  { id: "systems", label: "Systems & Edge" },
];

export const PROJECTS = [
  {
    id: "leavenow",
    title: "LeaveNow",
    category: "systems",
    accent: "#ff9f43",
    tagline: "The right bus. The simpler trip.",
    summary:
      "Gainesville RTS planning across 972 stops, with direct/transfer trips and local OpenStreetMap walking routes.",
    details:
      "Search a Gainesville address, place or stop, or use device location. Official GTFS timetables power direct and one-transfer trips, with three distinct departure choices and the best selected first. Live GPS and boarding ETAs appear only when the required RTS data is available. Local A* routes access, transfer and final walks over a bundled OSM pedestrian graph, with crossing/stair allowances and clearly labelled fallback estimates. No paid walking API is required. An earlier, pre-OSM 60-search benchmark returned journeys for 49 cases with one transfer versus 16 direct-only; local routing measured 7.4 ms median and 31.3 ms p95 on an Apple M4 Pro with Node 24. Those historical results cover one service-date sample, exclude HTTP, UI and live provider calls, and do not measure the current OSM-enabled version.",
    highlights: [
      "27 routes, 3,321 GTFS trip definitions and 89,517 stop-time records",
      "Direct-first recommendations; redundant transfer variants grouped",
      "Live bus choices verify boarding-to-destination stop order",
      "Published route shapes, live GPS and clear Live / Scheduled labels",
      "Address search, device location and Leave now / Depart at / Arrive by",
      "Combined stop/address autocomplete, with current location below the origin",
      "Local OSM A*: 171,202 vertices; conservative walking and connection checks",
      "94 rollout tests passed; deployed walking check verified on Render",
      "Google sign-in, server-only RTS key, Docker deployment and Kubernetes CI",
    ],
    metrics: [
      { value: "3.1×", label: "pre-OSM sample availability (49/60 vs 16/60)" },
      { value: "31.3 ms", label: "pre-OSM local p95 · 60 searches" },
      { value: "972", label: "stops across 27 RTS routes" },
    ],
    stack: ["Python", "Streamlit", "Node.js", "GTFS", "BusTime v3", "OpenStreetMap", "A*", "Docker", "Render"],
    flow: ["Gainesville GTFS + BusTime", "Private Node API", "Local OSM walking A*", "Rank direct / transfer trips", "Verify live bus direction", "Streamlit route map"],
    links: {
      evaluation: "https://github.com/PrithviHL/LeaveNow-Real-Time-Bus-Location-Tracking-and-Smart-Departure-Prediction/blob/feature/streamlit-containers/benchmarks/routing/README.md",
      demo: "https://leavenow-prithvihl.onrender.com",
      code: "https://github.com/PrithviHL/LeaveNow-Real-Time-Bus-Location-Tracking-and-Smart-Departure-Prediction/tree/feature/streamlit-containers",
    },
  },
  {
    id: "codeatlas",
    title: "CodeAtlas",
    category: "llm",
    accent: "#19c48a",
    tagline: "Ask a codebase. Check the source.",
    summary:
      "AST-aware Q&A over public GitHub repositories, with complete function/class evidence and commit-pinned citations.",
    details:
      "Import a public repository, ask a question and inspect the full matching function or class. The hosted TypeScript app combines AST-aware chunks, BM25 and hashed vectors with Groq answers and an explicit evidence fallback. Google OAuth protects temporary browser workspaces. Real semantic embeddings and Qdrant remain in a separate local LangGraph engine.",
    note:
      "The 16.2% gain measures AST + BM25 lexical retrieval against fixed-line chunks. The full web evidence path scored 0.260 MRR@10, below the 0.393 baseline. Exact-source recovery is not AI answer accuracy; latency is local and excludes HTTP and LLM generation.",
    highlights: [
      "281/291 exact source-body and line-span recoveries, checked with separate Python and TypeScript parsers",
      "5,000 CodeSearchNet-derived test queries across five languages; 1,000 code candidates per language",
      "Lexical component ablation: MRR@10 0.393 → 0.457 (+16.2%)",
      "Complete named declarations, commit-pinned links and clear excerpt fallbacks",
      "53 web + 10 engine tests passed; reproducible protocol and per-query results published",
    ],
    metrics: [
      { value: "96.6%", label: "exact-source recovery · 291 lookups" },
      { value: "+16.2%", label: "lexical MRR@10 · 5,000 queries" },
      { value: "3.6 ms", label: "local retrieval p95 · no HTTP / LLM" },
    ],
    stack: ["TypeScript", "Tree-sitter", "BM25", "Groq", "LangGraph (local)", "Qdrant (local)", "Render"],
    flow: ["Public GitHub repo", "AST source snapshot", "Rank + resolve declaration", "Groq or evidence fallback", "Commit-pinned source"],
    links: {
      demo: "https://codeatlas-rag.onrender.com",
      code: "https://github.com/PrithviHL/rag-over-codebase/tree/feature/render-public-app",
      evaluation: "https://github.com/PrithviHL/rag-over-codebase/blob/feature/render-public-app/code/ts/benchmarks/web-evaluation/README.md",
    },
  },
  {
    id: "spanscope",
    title: "Spanscope",
    category: "llm",
    accent: "#4c8dff",
    tagline: "Live observability for LLM apps",
    summary:
      "Ingests OpenTelemetry GenAI traces and shows latency, errors and cost per model in real time, with a one-click incident simulator.",
    details:
      "A self-hosted dashboard for teams running LLM features. Any OpenTelemetry SDK can send traces to it; it validates and prices every call, then serves a live overview, a trace explorer and per-model comparisons. Storage is pluggable: an in-memory ring buffer for the free demo, or ClickHouse, where the analytics run as SQL. CI checks both backends return identical numbers.",
    highlights: [
      "OTLP/HTTP JSON ingest with validation and per-IP rate limiting",
      "Load-tested on one Node process: 52,700 spans/s into ClickHouse, 436,000 in memory, 0 dropped",
      "ClickHouse storage with day partitions, TTL, SQL percentiles and 3.8× compression",
      "Safety evaluators (toxicity, faithfulness, PII) benchmarked on 860 held-out human-labelled tweets: toxicity F1 0.02 → 0.52 at 88% precision",
      "58 TypeScript + 15 Python tests in CI, with parity tests against a real ClickHouse",
    ],
    metrics: [
      { value: "52.7k", label: "spans/s into ClickHouse" },
      { value: "436k", label: "spans/s in memory" },
      { value: "88%", label: "precision of toxicity flags, 860 unseen tweets" },
    ],
    stack: ["TypeScript", "Hono", "ClickHouse", "OpenTelemetry", "Python", "Docker", "GitHub Actions"],
    flow: ["LLM app + OTel SDK", "/v1/traces ingest", "Validate & price", "Memory or ClickHouse", "Live dashboard"],
    links: {
      demo: "https://spanscope-llm-observability-dashboard.onrender.com/",
      code: "https://github.com/PrithviHL/Spanscope-LLM-observability-dashboard",
      evaluation: "https://github.com/PrithviHL/Spanscope-LLM-observability-dashboard#performance-and-accuracy",
    },
  },
  {
    id: "tinyml",
    title: "SayWatt",
    category: "systems",
    accent: "#ff5c8a",
    tagline: "Say it. It switches. Offline voice control on a $5 chip",
    note: "I know this isn't a complex or a really cool project, but it is a simple solution for an offline command system that you can incorporate in your house to turn off lights, open and close blinds and similar actions without an internet connection.",
    summary:
      "Offline voice commands for the home: 26 spoken commands recognised on a $5 ESP32 to switch lights, open blinds and more, with no internet.",
    details:
      "A 28-class keyword model (26 commands plus noise and unknown) runs entirely on the ESP32, listening continuously through an INMP441 I²S microphone and showing results on an SH1106 OLED. It was trained in Edge Impulse on Google's Speech Commands dataset plus synthetic voices for “turn on”, “turn off”, “open” and “close”. The live demo runs the same C++ (MFCC, TensorFlow Lite Micro kernels, int8 model) compiled to WebAssembly, so your audio never leaves your device.",
    highlights: [
      "26 commands: lights (on/off, brightness 1–9), blinds, robot moves, yes/no",
      "11,200-clip dataset: Google Speech Commands + 2,368 synthetic clips from 30 voices, speaker-disjoint split",
      "0% false triggers on background noise; 92% precision when it acts (44% confidence threshold)",
      "Firmware 461 KB flash (35%) and 31 KB RAM; ~12 ms per inference (Edge Impulse estimate)",
      "Same model in the browser: 119 KB of WebAssembly, ~8 ms per word",
    ],
    metrics: [
      { value: "74%", label: "accuracy, 28 classes, unseen speakers" },
      { value: "92%", label: "precision when it acts" },
      { value: "0%", label: "false triggers on background noise" },
    ],
    stack: ["C++", "Edge Impulse", "TensorFlow Lite Micro", "ESP32", "Python", "WebAssembly", "Docker"],
    flow: ["INMP441 mic", "250 ms slices", "MFCC 13×66", "int8 CNN, 28 classes", "Light · blinds · OLED"],
    links: {
      demo: "voice/",
      video: "https://drive.google.com/drive/folders/1DJyjVCoRY8r977VBq4hr7fjYT17MtLwN?usp=sharing",
      code: "https://github.com/PrithviHL/SayWatt-Real-Time-Voice-Command-Recognition-on-ESP32",
      evaluation: "https://github.com/PrithviHL/SayWatt-Real-Time-Voice-Command-Recognition-on-ESP32#how-well-it-works",
    },
  },
  {
    id: "beatnet",
    title: "BeatNet ECG Pipeline",
    category: "medical",
    accent: "#ff5c8a",
    tagline: "AI that catches missing heartbeats",
    summary:
      "Fiducial detection and arrhythmia classification on single-lead 30-second ECG, built with Aventusoft through UF's IPPD program.",
    details:
      "An industry-sponsored pipeline that locates the P, Q, R, S and T points of every heartbeat and classifies arrhythmias from a single ECG lead. The work spanned a 1D U-Net for fiducials, CNN-LSTM classifiers and a transformer-based ECG foundation model, with models exported to TensorFlow Lite and deployed on AWS SageMaker.",
    highlights: [
      "PQRST fiducial detection with a 1D U-Net",
      "Arrhythmia classification with CNN-LSTM and an ECG foundation model",
      "Trained and evaluated on MIT-BIH",
      "Exported to TensorFlow Lite; deployed on AWS SageMaker",
    ],
    metrics: [
      { value: "94%", label: "detection accuracy" },
      { value: "30 s", label: "single-lead ECG" },
      { value: "PQRST", label: "fiducials located" },
    ],
    stack: ["PyTorch", "TensorFlow Lite", "1D U-Net", "ECG-FM", "MIT-BIH", "SageMaker"],
    flow: ["Single-lead ECG", "Filter & segment", "1D U-Net fiducials", "Arrhythmia classifier", "TFLite · SageMaker"],
    links: {},
  },
  {
    id: "mri",
    title: "MRI Super-Resolution",
    category: "medical",
    accent: "#b9a8ff",
    tagline: "Sharper scans from multiple images",
    summary:
      "A residual CNN with attention that reconstructs higher-resolution MRI from multiple low-resolution images, with a Gradio demo.",
    details:
      "Trains a residual convolutional network with attention on UF's HiPerGator supercomputer to fuse multiple low-resolution MRI slices into one sharper image, evaluated with PSNR and SSIM and wrapped in an interactive Gradio demo.",
    highlights: [
      "Residual CNN with attention for multi-image fusion",
      "Trained on UF HiPerGator GPUs",
      "Interactive Gradio demo for side-by-side comparison",
    ],
    metrics: [
      { value: "25.15 dB", label: "PSNR" },
      { value: "0.70", label: "SSIM" },
      { value: "GPU", label: "HiPerGator training" },
    ],
    stack: ["PyTorch", "Gradio", "HiPerGator"],
    flow: ["Low-res MRI set", "Residual blocks", "Attention fusion", "Upsampling", "High-res scan"],
    links: {},
  },
  {
    id: "vqa",
    title: "Multimodal Medical VQA",
    category: "medical",
    accent: "#2fe0a0",
    tagline: "Answering questions about radiology images",
    summary:
      "Three image–text fusion architectures for visual question answering on VQA-RAD, written up as an IEEE-format paper.",
    details:
      "Compares three novel ways to fuse radiology images with clinical questions. Adaptive Modality Weighting, which learns how much to trust each modality per question, gave the best accuracy.",
    highlights: [
      "Three novel image–text fusion architectures",
      "Adaptive Modality Weighting learns per-question modality trust",
      "IEEE-format paper",
    ],
    metrics: [
      { value: "62.41%", label: "accuracy (from 60.82%)" },
      { value: "3", label: "fusion architectures" },
      { value: "VQA-RAD", label: "benchmark" },
    ],
    stack: ["PyTorch", "Transformers"],
    flow: ["Radiology image", "Vision encoder", "Question encoder", "Adaptive fusion", "Answer"],
    links: {},
  },
  {
    id: "mesh",
    title: "Point in 3D Mesh",
    category: "systems",
    accent: "#ffcc4d",
    tagline: "Is this point inside the shape?",
    summary:
      "Robust point containment for triangle meshes, accelerated with a bounding volume hierarchy in C++17.",
    details:
      "Casts rays from the query point and counts triangle crossings with the Möller–Trumbore test, voting across three random directions to survive rays that graze edges. A generalized winding number fallback handles meshes with holes, and a median-split BVH makes queries fast.",
    highlights: [
      "Ray casting with Möller–Trumbore and 3-ray voting",
      "Generalized winding number for meshes with holes",
      "Median-split BVH acceleration",
    ],
    metrics: [
      { value: "95×", label: "faster with BVH" },
      { value: "40,000", label: "test points" },
      { value: "100%", label: "agreement with ground truth" },
    ],
    stack: ["C++17", "BVH", "Computational geometry"],
    flow: ["Query point", "BVH traversal", "Ray–triangle tests", "Parity vote", "Inside / outside"],
    links: { code: "https://github.com/PrithviHL/point-in-3D-mesh" },
  },
  {
    id: "reward",
    title: "Reward Signal Evaluation",
    category: "llm",
    accent: "#9085e9",
    tagline: "Can you trust your reward model?",
    summary:
      "A framework that benchmarks preference and reward models and surfaces label-quality issues in their training data.",
    details:
      "Evaluates reward and preference models side by side and flags suspicious labels in preference datasets, so problems in the training signal are visible before they shape a model.",
    highlights: [
      "Benchmarks multiple reward / preference models",
      "Flags label-quality issues in training data",
      "Built on Hugging Face models and datasets",
    ],
    metrics: [
      { value: "RLHF", label: "signal auditing" },
      { value: "multi", label: "model comparison" },
      { value: "label", label: "quality checks" },
    ],
    stack: ["Python", "PyTorch", "Hugging Face"],
    flow: ["Preference data", "Reward models", "Agreement analysis", "Label checks", "Report"],
    links: {},
  },
];

export const JOURNEY = [
  {
    when: "2025 – 2026",
    title: "AI/ML Engineer Intern",
    org: "Aventusoft",
    text: "Shipped ECG deep learning for arrhythmia classification and PQRST detection: 1D U-Net, CNN-LSTM and an ECG foundation model, deployed with TensorFlow Lite and AWS SageMaker.",
  },
  {
    when: "2024 – 2026",
    title: "M.S. Artificial Intelligence Systems",
    org: "University of Florida",
    text: "Medical imaging, multimodal learning, LLM systems and evaluation; IPPD industry project with Aventusoft.",
  },
  {
    when: "2023 – 2024",
    title: "Software Engineer in Test",
    org: "Huron Consulting Group",
    text: "Automated 120+ Salesforce test workflows and kept releases from breaking.",
  },
  {
    when: "2022 – 2023",
    title: "Machine Learning Engineer Intern",
    org: "YBI Foundation, Delhi",
    text: "Machine learning engineering internship.",
  },
  {
    when: "2019 – 2023",
    title: "B.E. Information Science and Engineering",
    org: "Visvesvaraya Technological University, Bengaluru",
    text: "Undergraduate degree in information science and engineering.",
  },
];

export const SKILLS = [
  "Python", "PyTorch", "TensorFlow", "TypeScript", "RAG", "LangGraph", "LLM evals",
  "OpenTelemetry", "ClickHouse", "Hugging Face", "Transformers", "AWS", "SageMaker",
  "Bedrock", "Docker", "Kubernetes", "FastAPI", "React", "Next.js", "Neo4j", "Qdrant",
  "PostgreSQL", "Redis", "Kafka", "Spark", "MLflow", "Airflow", "CUDA", "TF Lite",
  "C++", "ESP32", "Gradio", "scikit-learn", "XGBoost", "Claude API", "GitHub Actions",
];

export const CERTIFICATIONS = [
  "AWS Certified Solutions Architect",
  "Google Cloud Generative AI Leader",
  "AWS Bedrock Agents",
  "NVIDIA DLI: Generative AI with Diffusion Models",
];
