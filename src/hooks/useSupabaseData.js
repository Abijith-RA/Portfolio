import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Fallback demo data to ensure UI is never blank if database is offline or unconfigured
const FALLBACK_PROFILE = {
  name: "Alex Mercer",
  title: "AI / ML Systems Engineer",
  bio: "Architecting high-throughput deep learning pipelines, generative AI models, and real-time computer vision applications.",
  location: "San Francisco, CA",
  email: "alex.mercer@example.com",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  twitter: "https://x.com",
  stats: [
    { label: "Models Deployed", value: "25+" },
    { label: "Research Papers", value: "8" },
    { label: "GitHub Stars", value: "1.2k" },
    { label: "Years Exp.", value: "6+" }
  ]
};

const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: "NeuroVision AI - Real-Time Tracking Engine",
    description: "Distributed computer vision framework achieving 120 FPS object detection & tracking using custom TensorRT optimization.",
    category: "Computer Vision",
    status: "Production",
    tech_stack: ["PyTorch", "TensorRT", "CUDA", "OpenCV", "Python"],
    github: "https://github.com",
    link: "https://example.com",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "OmniLLM Agentic RAG Platform",
    description: "Enterprise RAG pipeline with hybrid vector/keyword search, dynamic prompt routing, and low-latency response generation.",
    category: "Generative AI & LLMs",
    status: "Active",
    tech_stack: ["LangChain", "LlamaIndex", "VectorDB", "FastAPI", "React"],
    github: "https://github.com",
    link: "https://example.com",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop"
  }
];

const FALLBACK_SKILLS = [
  { id: 1, name: "PyTorch & TensorFlow", category: "Core AI / ML Frameworks", proficiency: 95 },
  { id: 2, name: "LLMs & RAG Architectures", category: "Core AI / ML Frameworks", proficiency: 92 },
  { id: 3, name: "CUDA & TensorRT Acceleration", category: "Core AI / ML Frameworks", proficiency: 88 },
  { id: 4, name: "FastAPI & Distributed Systems", category: "Cloud & Infrastructure", proficiency: 90 },
  { id: 5, name: "Docker & Kubernetes", category: "Cloud & Infrastructure", proficiency: 85 },
  { id: 6, name: "Python & C++ Engine", category: "Languages & Tools", proficiency: 96 }
];

const FALLBACK_EXPERIENCE = [
  {
    id: 1,
    role: "Senior AI Systems Engineer",
    company: "Neural Scale Tech",
    duration: "2023 - Present",
    location: "San Francisco, CA",
    description: "Led optimization of LLM inference engines, reducing latency by 45% across production microservices."
  },
  {
    id: 2,
    role: "Machine Learning Researcher",
    company: "DeepVision Labs",
    duration: "2021 - 2023",
    location: "Boston, MA",
    description: "Developed real-time video analytics algorithms deployed to over 50,000 edge devices worldwide."
  }
];

const FALLBACK_EDUCATION = [
  {
    id: 1,
    institution: "Stanford University",
    degree: "Master of Science",
    field_of_study: "Computer Science (Artificial Intelligence)",
    start_year: "2019",
    end_year: "2021",
    description: "Specialized in Deep Learning, Computer Vision, and Autonomous AI Agents. Published research on efficient Transformer attention."
  },
  {
    id: 2,
    institution: "University of California, Berkeley",
    degree: "Bachelor of Science",
    field_of_study: "Electrical Engineering & Computer Sciences",
    start_year: "2015",
    end_year: "2019",
    description: "Graduated with High Honors. Focused on Distributed Systems, Algorithms, and Machine Learning Fundamentals."
  }
];

// Helper normalizers to safely format raw database output regardless of exact schema variations
function normalizeProfile(raw) {
  if (!raw) return null;
  let stats = raw.stats;
  if (typeof stats === 'string') {
    try {
      stats = JSON.parse(stats);
    } catch {
      stats = [];
    }
  }
  return {
    ...raw,
    name: raw.name || raw.full_name || raw.display_name || '',
    title: raw.title || raw.role || raw.headline || raw.job_title || '',
    bio: raw.bio || raw.about || raw.description || raw.summary || '',
    location: raw.location || raw.address || raw.city || '',
    email: raw.email || raw.contact_email || '',
    github: raw.github || raw.github_url || '',
    linkedin: raw.linkedin || raw.linkedin_url || '',
    kaggle: raw.kaggle || raw.kaggle_url || '',
    scholar: raw.scholar || raw.scholar_url || raw.google_scholar || '',
    twitter: raw.twitter || raw.twitter_url || raw.x || '',
    stats: Array.isArray(stats) ? stats : []
  };
}

function normalizeProjects(list) {
  if (!Array.isArray(list)) return [];
  return list.map(item => {
    let tech_stack = item.tech_stack || item.technologies || item.tags || [];
    if (typeof tech_stack === 'string') {
      try {
        const parsed = JSON.parse(tech_stack);
        tech_stack = Array.isArray(parsed) ? parsed : tech_stack.split(',').map(s => s.trim());
      } catch {
        tech_stack = tech_stack.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return {
      ...item,
      title: item.title || item.name || '',
      description: item.description || item.summary || '',
      category: item.category || item.tag || 'AI / ML Project',
      tech_stack: Array.isArray(tech_stack) ? tech_stack : [],
      github: item.github || item.github_url || item.repo_url || item.source_url || '',
      link: item.link || item.demo_url || item.live_url || item.url || '',
      image_url: item.image_url || item.image || item.cover_image || ''
    };
  });
}

function normalizeSkills(list) {
  if (!Array.isArray(list)) return [];
  return list.map(skill => ({
    ...skill,
    name: skill.name || skill.title || skill.skill_name || '',
    category: skill.category || skill.group || 'General',
    proficiency: Number(skill.proficiency || skill.level || skill.percentage || 80)
  }));
}

function normalizeExperience(list) {
  if (!Array.isArray(list)) return [];
  return list.map(exp => ({
    ...exp,
    role: exp.role || exp.title || exp.position || '',
    company: exp.company || exp.organization || exp.employer || '',
    duration: exp.duration || exp.period || exp.years || '',
    location: exp.location || exp.place || '',
    description: exp.description || exp.details || ''
  }));
}

function normalizeEducation(list) {
  if (!Array.isArray(list)) return [];
  return list.map(edu => ({
    ...edu,
    institution: edu.institution || edu.school || edu.university || edu.college || '',
    degree: edu.degree || edu.qualification || edu.title || '',
    field_of_study: edu.field_of_study || edu.field || edu.major || edu.specialization || '',
    start_year: edu.start_year || edu.start_date || edu.from_year || '',
    end_year: edu.end_year || edu.end_date || edu.to_year || edu.graduation_year || '',
    description: edu.description || edu.details || edu.notes || ''
  }));
}

export function useSupabaseData() {
  const [data, setData] = useState({
    profile: null,
    projects: [],
    skills: [],
    experience: [],
    education: []
  });
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isLiveDatabase, setIsLiveDatabase] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setErrorDetails(null);

    // If Supabase credentials are missing or default placeholders
    if (!isSupabaseConfigured() || !supabase) {
      const msg = "Supabase API credentials missing or default placeholders in .env file (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).";
      console.warn("Supabase Config Warning:", msg);
      setIsLiveDatabase(false);
      setErrorDetails(msg);
      setData({
        profile: FALLBACK_PROFILE,
        projects: FALLBACK_PROJECTS,
        skills: FALLBACK_SKILLS,
        experience: FALLBACK_EXPERIENCE,
        education: FALLBACK_EDUCATION
      });
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch profile table with .limit(1) to avoid PGRST116 multiple-row errors
      let profileData = null;
      let profileErr = null;

      const profileRes = await supabase.from('profile').select('*').limit(1);
      if (profileRes.error) {
        profileErr = profileRes.error;
        console.warn("Supabase fetch 'profile' error:", profileRes.error);
        // Try plural table name 'profiles' as fallback
        const profilesRes = await supabase.from('profiles').select('*').limit(1);
        if (!profilesRes.error && profilesRes.data && profilesRes.data.length > 0) {
          profileData = profilesRes.data[0];
          profileErr = null;
        }
      } else if (profileRes.data && profileRes.data.length > 0) {
        profileData = profileRes.data[0];
      }

      // 2. Fetch projects, skills, experience, and education
      const [projectsRes, skillsRes, experienceRes, educationRes] = await Promise.all([
        supabase.from('projects').select('*').order('id', { ascending: true }),
        supabase.from('skills').select('*').order('id', { ascending: true }),
        supabase.from('experience').select('*').order('id', { ascending: true }),
        supabase.from('education').select('*').order('id', { ascending: true })
      ]);

      const errorsList = [];
      if (profileErr) errorsList.push(`'profile' table: ${profileErr.message} (Code ${profileErr.code || 'UNKNOWN'})`);
      if (projectsRes.error) errorsList.push(`'projects' table: ${projectsRes.error.message}`);
      if (skillsRes.error) errorsList.push(`'skills' table: ${skillsRes.error.message}`);
      if (experienceRes.error) errorsList.push(`'experience' table: ${experienceRes.error.message}`);
      if (educationRes.error && educationRes.error.code !== 'PGRST116') {
        // Log education query status gracefully if table exists
        console.info("Supabase 'education' query info:", educationRes.error.message);
      }

      // Normalize all retrieved data
      const normProfile = normalizeProfile(profileData);
      const normProjects = normalizeProjects(projectsRes.data);
      const normSkills = normalizeSkills(skillsRes.data);
      const normExperience = normalizeExperience(experienceRes.data);
      const normEducation = normalizeEducation(educationRes.data);

      const hasLiveData = Boolean(normProfile || normProjects.length > 0 || normSkills.length > 0 || normExperience.length > 0 || normEducation.length > 0);

      setIsLiveDatabase(hasLiveData && errorsList.length === 0);
      setErrorDetails(errorsList.length > 0 ? errorsList.join(' | ') : null);

      setData({
        profile: normProfile || (hasLiveData ? null : FALLBACK_PROFILE),
        projects: normProjects.length > 0 ? normProjects : (hasLiveData ? [] : FALLBACK_PROJECTS),
        skills: normSkills.length > 0 ? normSkills : (hasLiveData ? [] : FALLBACK_SKILLS),
        experience: normExperience.length > 0 ? normExperience : (hasLiveData ? [] : FALLBACK_EXPERIENCE),
        education: normEducation.length > 0 ? normEducation : (hasLiveData ? [] : FALLBACK_EDUCATION)
      });
    } catch (err) {
      console.error("Supabase fetch exception:", err);
      setIsLiveDatabase(false);
      setErrorDetails(err.message || "Failed to query Supabase.");
      setData({
        profile: FALLBACK_PROFILE,
        projects: FALLBACK_PROJECTS,
        skills: FALLBACK_SKILLS,
        experience: FALLBACK_EXPERIENCE,
        education: FALLBACK_EDUCATION
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handler function to submit contact messages to Supabase
  const submitContactMessage = async (formData) => {
    if (isSupabaseConfigured() && supabase) {
      const { data: result, error: submitErr } = await supabase
        .from('contact_messages')
        .insert([formData]);
      if (submitErr) {
        console.error("Contact submission error:", submitErr);
        throw submitErr;
      }
      return result;
    } else {
      await new Promise(res => setTimeout(res, 800));
      return { success: true };
    }
  };

  return {
    profile: data.profile,
    projects: data.projects,
    skills: data.skills,
    experience: data.experience,
    education: data.education,
    loading,
    errorDetails,
    isLiveDatabase,
    refreshData: fetchAllData,
    submitContactMessage
  };
}

