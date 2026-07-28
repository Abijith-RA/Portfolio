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

function normalizeProjects(list) {
  if (!Array.isArray(list)) return [];
  return list.map(item => {
    let tech_stack = item.tech_stack || item.technologies || item.tags || [];
    if (typeof tech_stack === 'string') {
      try {
        const parsed = JSON.parse(tech_stack);
        tech_stack = Array.isArray(parsed) ? parsed : tech_stack.split(',').map(s => s.trim());
      } catch {
        tech_stack = tech_stack.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return {
      ...item,
      title: item.title || item.name || '',
      description: item.description || item.summary || '',
      category: item.category || item.tag || 'Project',
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
    proficiency: Number(skill.proficiency || skill.level || skill.percentage || 90)
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
  return list.map(item => ({
    ...item,
    degree: item.degree || item.title || item.qualification || '',
    institution: item.institution || item.school || item.university || '',
    field_of_study: item.field_of_study || item.major || item.field || '',
    start_year: item.start_year || item.start_date || '',
    end_year: item.end_year || item.end_date || '',
    description: item.description || item.details || ''
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

    if (!isSupabaseConfigured() || !supabase) {
      setErrorDetails("Supabase credentials unconfigured.");
      setIsLiveDatabase(false);
      setData({
        profile: null,
        projects: [],
        skills: [],
        experience: [],
        education: []
      });
      setLoading(false);
      return;
    }

    try {
      // Execute all Supabase queries concurrently using Promise.allSettled for maximum resilience in Brave & Adblock browsers
      const results = await Promise.allSettled([
        supabase.from('profile').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('experience').select('*'),
        supabase.from('education').select('*')
      ]);

      const [profileRes, projectsRes, skillsRes, experienceRes, educationRes] = results;

      if (profileRes.status === 'fulfilled' && profileRes.value?.error) {
        console.warn("⚠️ [Supabase Profile Table Error]:", profileRes.value.error);
      }
      if (projectsRes.status === 'fulfilled' && projectsRes.value?.error) {
        console.warn("⚠️ [Supabase Projects Table Error]:", projectsRes.value.error);
      }
      if (skillsRes.status === 'fulfilled' && skillsRes.value?.error) {
        console.warn("⚠️ [Supabase Skills Table Error]:", skillsRes.value.error);
      }
      if (experienceRes.status === 'fulfilled' && experienceRes.value?.error) {
        console.warn("⚠️ [Supabase Experience Table Error]:", experienceRes.value.error);
      }

      let rawProfile = null;
      if (profileRes.status === 'fulfilled' && Array.isArray(profileRes.value?.data) && profileRes.value.data.length > 0) {
        // Take the latest profile row
        const rows = profileRes.value.data;
        rawProfile = rows[rows.length - 1];
      } else {
        // Fallback check for 'profiles' table if 'profile' is empty or errored
        try {
          const profilesRes = await supabase.from('profiles').select('*');
          if (profilesRes.data && profilesRes.data.length > 0) {
            rawProfile = profilesRes.data[profilesRes.data.length - 1];
          }
        } catch {
          // ignore error
        }
      }

      // Raw Projects with fallback check for 'project' table
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

      // Raw Skills with fallback check for 'skill' table
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

      // Raw Experience with fallback checks across all common experience table names
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

      console.log("📊 [Supabase Live Data Loaded]", {
        rawProfileReceived: rawProfile,
        profile: normProfile,
        projectsCount: normProjects.length,
        skillsCount: normSkills.length,
        experienceCount: normExperience.length,
        educationCount: normEducation.length
      });

      setIsLiveDatabase(true);

      setData({
        profile: normProfile,
        projects: normProjects,
        skills: normSkills,
        experience: normExperience,
        education: normEducation
      });
    } catch (err) {
      console.error("Supabase fetch exception:", err);
      setIsLiveDatabase(false);
      setErrorDetails(err.message || "Failed to query Supabase.");
      setData({
        profile: null,
        projects: [],
        skills: [],
        experience: [],
        education: []
      });
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
