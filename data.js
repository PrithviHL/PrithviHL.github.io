// All site content lives here. Edit this file to update the portfolio.

export const PROFILE = {
  name: "Prithvi Halagere Lokesha",
  short: "Prithvi",
  headline:
    "Prev ML Engineer @ Aventusoft // taught AI to catch missing heartbeats | MS AI @ UF | Prev SWE @ Huron // kept Salesforce from breaking | Next up: building products people can trust",
  roles: [
    "AI/ML Engineer",
    "LLM systems builder",
    "Medical AI engineer",
    "RAG & evaluation nerd",
  ],
  status: "Open to full-time ML / AI / Software Engineer roles · open to relocation",
  about: [
    "I build production-minded AI systems: retrieval and LLM applications, evaluation and observability tooling, and deep learning for medical signals and images.",
    "Most recently I was a Machine Learning Engineer Intern at Aventusoft, shipping ECG deep learning models for arrhythmia classification and PQRST fiducial detection, exported to TensorFlow Lite and deployed on AWS SageMaker.",
    "Before that I automated 120+ Salesforce test workflows as a software engineer in test. Turns out debugging humans is harder than debugging code.",
  ],
  stats: [
    { value: 94, suffix: "%", label: "accuracy detecting heart conditions" },
    { value: 120, suffix: "+", label: "Salesforce test workflows automated" },
    { value: 3, suffix: "", label: "live apps you can try today" },
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
      "Optional ClickHouse storage with day partitions, TTL and SQL percentiles",
      "Stateless Sign in with GitHub and personal ingest keys (off on the demo)",
      "Dependency-free front end: SVG charts, command palette, live stream",
    ],
    metrics: [
      { value: "58", label: "automated tests" },
      { value: "3.8×", label: "ClickHouse compression" },
      { value: "5 s", label: "live refresh" },
    ],
    stack: ["TypeScript", "Hono", "ClickHouse", "OpenTelemetry", "Docker", "Render"],
    flow: ["LLM app + OTel SDK", "/v1/traces ingest", "Validate & price", "Memory or ClickHouse", "Live dashboard"],
    links: {
      demo: "https://spanscope-llm-observability-dashboard.onrender.com/",
      code: "https://github.com/PrithviHL/Spanscope-LLM-observability-dashboard",
    },
  },
  {
    id: "codeatlas",
    title: "CodeAtlas",
    category: "llm",
    accent: "#19c48a",
    tagline: "Ask questions about any codebase",
    summary:
      "Natural-language Q&A over public GitHub repositories, with generated explanations and citations pinned to the exact commit.",
    details:
      "Import a public repository and ask how it works. Answers come with expandable source excerpts and GitHub links pinned to the indexed revision, so every claim is checkable. The optional engine adds LangGraph orchestration, AST-aware chunking, BM25F with real embeddings in Qdrant, cross-encoder reranking and signed incremental webhook updates.",
    highlights: [
      "Commit-pinned citations for every answer",
      "Hybrid retrieval: BM25F + embeddings + cross-encoder reranking",
      "Google OAuth, isolated temporary workspaces per browser",
      "Evidence-only fallback when the LLM provider is unavailable",
    ],
    metrics: [
      { value: "AST", label: "aware chunking" },
      { value: "2-stage", label: "retrieve + rerank" },
      { value: "Commit", label: "pinned citations" },
    ],
    stack: ["TypeScript", "LangGraph", "Groq", "Qdrant", "BM25F", "Render"],
    flow: ["GitHub repo", "AST-aware chunks", "BM25F + embeddings", "Cross-encoder rerank", "Cited answer"],
    links: {
      demo: "https://codeatlas-rag.onrender.com",
      code: "https://github.com/PrithviHL/rag-over-codebase",
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
    id: "leavenow",
    title: "LeaveNow",
    category: "systems",
    accent: "#ff9f43",
    tagline: "Your next bus, figured out",
    summary:
      "A Rochester RTS trip planner that combines published timetables with live predictions, including journeys with one transfer.",
    details:
      "Pick a start and destination and LeaveNow tells you when to leave. It plans direct journeys and trips with one transfer from the official GTFS schedules, adds walking estimates and connection buffers, and labels every time as live, scheduled or both, with timelines and maps. Credentials stay server-side behind a private API inside the Docker service.",
    highlights: [
      "Leave now, depart at and arrive by planning",
      "Direct and one-transfer journeys from official GTFS data",
      "Live / scheduled source labels on every time",
      "Google sign-in; private Node API inside one Docker service",
    ],
    metrics: [
      { value: "≤1", label: "transfer routing" },
      { value: "3", label: "trip modes" },
      { value: "GTFS", label: "official schedules" },
    ],
    stack: ["Python", "Streamlit", "Node.js", "GTFS", "Docker", "Render"],
    flow: ["RTS GTFS + live feed", "Private Node API", "Routing engine", "Streamlit UI", "When to leave"],
    links: {
      demo: "https://leavenow-prithvihl.onrender.com",
      code: "https://github.com/PrithviHL/LeaveNow-Real-Time-Bus-Location-Tracking-and-Smart-Departure-Prediction",
    },
  },
  {
    id: "codesearch",
    title: "Cross-Repo Semantic Code Search",
    category: "llm",
    accent: "#7fb2ff",
    tagline: "Search that understands code",
    summary:
      "Hybrid retrieval across multiple codebases using a code knowledge graph, sparse and dense search, and reranking.",
    details:
      "Builds a Neo4j knowledge graph of code entities across repositories, then combines BM25F and dense retrieval with cross-encoder reranking to find the right function or file for a natural-language query.",
    highlights: [
      "Neo4j code knowledge graph across repositories",
      "BM25F + dense retrieval fused, then cross-encoder reranked",
      "Served through a FastAPI search API",
    ],
    metrics: [
      { value: "0.83", label: "MRR@10 (from 0.61)" },
      { value: "+36%", label: "ranking quality" },
      { value: "multi", label: "repository index" },
    ],
    stack: ["Python", "Neo4j", "Transformers", "FastAPI"],
    flow: ["Repositories", "Code knowledge graph", "BM25F + dense", "Cross-encoder", "Ranked results"],
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
    id: "tinyml",
    title: "TinyML Voice on ESP32",
    category: "systems",
    accent: "#ff5c8a",
    tagline: "Speech recognition on a $5 chip",
    summary:
      "On-device voice command recognition on an ESP32 microcontroller, with the result shown live on an OLED screen.",
    details:
      "A model trained in Edge Impulse on one-second, 16 kHz audio clips runs entirely on the ESP32. An INMP441 microphone streams audio over I²S, and the predicted command appears in real time on a 128×64 SH1106 OLED display.",
    highlights: [
      "Fully on-device inference, no cloud round trip",
      "I²S microphone streaming at 16 kHz",
      "Real-time OLED readout with U8g2",
    ],
    metrics: [
      { value: "16 kHz", label: "audio sampling" },
      { value: "1 s", label: "inference window" },
      { value: "0", label: "cloud calls" },
    ],
    stack: ["C++", "Edge Impulse", "TinyML", "ESP32", "I²S"],
    flow: ["INMP441 mic", "1 s audio window", "Edge Impulse model", "ESP32 inference", "OLED readout"],
    links: {
      video: "https://drive.google.com/drive/folders/1DJyjVCoRY8r977VBq4hr7fjYT17MtLwN?usp=sharing",
      code: "https://github.com/PrithviHL/Real-Time-Voice-Command-Recognition-on-ESP32",
    },
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
    title: "Machine Learning Engineer",
    org: "YBI Foundation, Delhi",
    text: "Applied machine learning engineering in Delhi.",
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
