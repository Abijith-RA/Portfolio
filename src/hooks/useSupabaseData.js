import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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
    phone: raw.phone || raw.mobile || raw.phone_number || raw.contact_number || '',
    github: raw.github || raw.github_url || '',
    linkedin: raw.linkedin || raw.linkedin_url || '',
    kaggle: raw.kaggle || raw.kaggle_url || '',
    scholar: raw.scholar || raw.scholar_url || raw.google_scholar || '',
    twitter: raw.twitter || raw.twitter_url || raw.x || '',
    stats: Array.isArray(stats) ? stats : []
  };
}

function extractSortYear(item) {
  if (!item) return 0;
  
  const allText = `${item.end_year || ''} ${item.start_year || ''} ${item.duration || ''} ${item.period || ''} ${item.years || ''} ${item.degree || ''} ${item.role || ''}`.toLowerCase();
  const isPresent = allText.includes('present') || allText.includes('current') || allText.includes('ongoing') || allText.includes('now') || allText.includes('enrolled');

  const years = allText.match(/\d{4}/g);
  let maxYear = 0;
  if (years && years.length > 0) {
    maxYear = Math.max(...years.map(Number));
  }

  if (isPresent) {
    return maxYear > 0 ? maxYear + 10000 : 19999;
  }

  if (maxYear > 0) {
    return maxYear;
  }

  const numericId = Number(item.id);
  if (!isNaN(numericId) && numericId > 0) return numericId;

  return 0;
}

function standardizeProjectType(val) {
  if (!val || typeof val !== 'string') return 'Personal Project';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('college') || lower.includes('academic') || lower.includes('university') || lower.includes('degree') || lower.includes('school')) {
    return 'College Project';
  }
  if (lower.includes('company') || lower.includes('work') || lower.includes('corporate') || lower.includes('industry') || lower.includes('client') || lower.includes('job') || lower.includes('professional')) {
    return 'Company Project';
  }
  if (lower.includes('research') || lower.includes('lab') || lower.includes('paper')) {
    return 'Research Project';
  }
  if (lower.includes('personal') || lower.includes('self')) {
    return 'Personal Project';
  }

  return trimmed.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function normalizeProjects(list) {
  if (!Array.isArray(list)) return [];
  const normalized = list.map(item => {
    let tech_stack = item.tech_stack || item.technologies || item.tags || [];
    if (typeof tech_stack === 'string') {
      try {
        const parsed = JSON.parse(tech_stack);
        tech_stack = Array.isArray(parsed) ? parsed : tech_stack.split(',').map(s => s.trim());
      } catch {
        tech_stack = tech_stack.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    const rawType = item.project_type || item.projecttype || item.type || item.status || item.project_status || item.context || item.institution || item.company || item.organization || item.what_is_do || '';
    const stdType = standardizeProjectType(rawType);
    return {
      ...item,
      title: item.title || item.name || item.projectname || item.project_name || '',
      description: item.description || item.summary || item.details || '',
      category: item.category || item.tag || 'Project',
      project_type: stdType,
      status: item.status || stdType,
      start_year: item.start_year || item.year || '',
      tech_stack: Array.isArray(tech_stack) ? tech_stack : [],
      github: item.github || item.github_url || item.repo_url || item.source_url || '',
      link: item.link || item.demo_url || item.live_url || item.url || '',
      image_url: item.image_url || item.image || item.cover_image || ''
    };
  });

  return normalized.sort((a, b) => {
    const yearA = extractSortYear(a);
    const yearB = extractSortYear(b);
    if (yearB !== yearA) return yearB - yearA;
    return (b.id || 0) - (a.id || 0);
  });
}

function normalizeSkills(list) {
  if (!Array.isArray(list)) return [];
  return list.map(skill => ({
    ...skill,
    name: skill.name || skill.title || skill.skill_name || '',
    category: skill.category || skill.group || 'General',
    proficiency: Number(skill.proficiency || skill.level || skill.percentage || 90)
  }));
}

function normalizeExperience(list) {
  if (!Array.isArray(list)) return [];
  const normalized = list.map(exp => ({
    ...exp,
    role: exp.role || exp.title || exp.position || '',
    company: exp.company || exp.organization || exp.employer || '',
    duration: exp.duration || exp.period || exp.years || '',
    location: exp.location || exp.place || '',
    description: exp.description || exp.details || ''
  }));

  return normalized.sort((a, b) => {
    const yearA = extractSortYear(a);
    const yearB = extractSortYear(b);
    if (yearB !== yearA) return yearB - yearA;
    return (b.id || 0) - (a.id || 0);
  });
}

function normalizeEducation(list) {
  if (!Array.isArray(list)) return [];
  const normalized = list.map(item => ({
    ...item,
    degree: item.degree || item.title || item.qualification || '',
    institution: item.institution || item.school || item.university || '',
    field_of_study: item.field_of_study || item.major || item.field || '',
    start_year: item.start_year || item.start_date || '',
    end_year: item.end_year || item.end_date || '',
    description: item.description || item.details || ''
  }));

  return normalized.sort((a, b) => {
    const yearA = extractSortYear(a);
    const yearB = extractSortYear(b);
    if (yearB !== yearA) return yearB - yearA;
    return (b.id || 0) - (a.id || 0);
  });
}

const CACHE_KEY = 'portfolio_supabase_cache_v2';

function getCachedData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore cache read errors
  }
  return null;
}

function setCachedData(payload) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore cache write errors
  }
}

export function useSupabaseData() {
  const [data, setData] = useState(() => {
    const cached = getCachedData();
    if (cached) return cached;
    return {
      profile: null,
      projects: [],
      skills: [],
      experience: [],
      education: []
    };
  });

  const [loading, setLoading] = useState(() => {
    return !getCachedData();
  });
  const [errorDetails, setErrorDetails] = useState(null);
  const [isLiveDatabase, setIsLiveDatabase] = useState(false);

  const fetchAllData = useCallback(async () => {
    const hasCache = !!getCachedData();
    if (!hasCache) {
      setLoading(true);
    }
    setErrorDetails(null);

    if (!isSupabaseConfigured() || !supabase) {
      setErrorDetails("Supabase credentials unconfigured.");
      setIsLiveDatabase(false);
      setLoading(false);
      return;
    }

    try {
      // Execute all Supabase queries concurrently using Promise.allSettled for maximum resilience
      const results = await Promise.allSettled([
        supabase.from('profile').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('experience').select('*'),
        supabase.from('education').select('*')
      ]);

      const [profileRes, projectsRes, skillsRes, experienceRes, educationRes] = results;

      let rawProfile = null;
      if (profileRes.status === 'fulfilled' && Array.isArray(profileRes.value?.data) && profileRes.value.data.length > 0) {
        const rows = profileRes.value.data;
        rawProfile = rows[rows.length - 1];
      } else {
        try {
          const profilesRes = await supabase.from('profiles').select('*');
          if (profilesRes.data && profilesRes.data.length > 0) {
            rawProfile = profilesRes.data[profilesRes.data.length - 1];
          }
        } catch {
          // ignore error
        }
      }

      let rawProjects = projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value?.data) ? projectsRes.value.data : [];
      if (rawProjects.length === 0) {
        try {
          const singularProj = await supabase.from('project').select('*');
          if (singularProj.data && singularProj.data.length > 0) {
            rawProjects = singularProj.data;
          }
        } catch {
          // ignore
        }
      }

      let rawSkills = skillsRes.status === 'fulfilled' && Array.isArray(skillsRes.value?.data) ? skillsRes.value.data : [];
      if (rawSkills.length === 0) {
        try {
          const singularSkill = await supabase.from('skill').select('*');
          if (singularSkill.data && singularSkill.data.length > 0) {
            rawSkills = singularSkill.data;
          }
        } catch {
          // ignore
        }
      }

      let rawExperience = experienceRes.status === 'fulfilled' && Array.isArray(experienceRes.value?.data) ? experienceRes.value.data : [];
      if (rawExperience.length === 0) {
        const altTables = ['experiences', 'work_experience', 'work_experiences', 'job_experience', 'work_history', 'experience_history', 'user_experience', 'experience_list'];
        for (const tbl of altTables) {
          try {
            const expRes = await supabase.from(tbl).select('*');
            if (expRes.data && expRes.data.length > 0) {
              rawExperience = expRes.data;
              break;
            }
          } catch {
            // ignore
          }
        }
      }

      const rawEducation = educationRes.status === 'fulfilled' && Array.isArray(educationRes.value?.data) ? educationRes.value.data : [];

      const normProfile = normalizeProfile(rawProfile);
      const normProjects = normalizeProjects(rawProjects);
      const normSkills = normalizeSkills(rawSkills);
      const normExperience = normalizeExperience(rawExperience);
      const normEducation = normalizeEducation(rawEducation);

      const freshData = {
        profile: normProfile,
        projects: normProjects,
        skills: normSkills,
        experience: normExperience,
        education: normEducation
      };

      setCachedData(freshData);
      setData(freshData);
      setIsLiveDatabase(true);
    } catch (err) {
      console.error("Supabase fetch exception:", err);
      setErrorDetails(err.message || "Failed to query Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const submitContactMessage = async (formData) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: result, error: submitErr } = await supabase
          .from('contact_messages')
          .insert([formData]);
        if (submitErr) throw submitErr;
        return result;
      } catch (err) {
        console.error("Contact message submission error:", err);
        throw err;
      }
    }
    throw new Error("Supabase is unconfigured or unavailable on this build.");
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
