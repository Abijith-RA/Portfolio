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

    if (!isSupabaseConfigured() || !supabase) {
      setErrorDetails("Supabase credentials unconfigured.");
      setIsLiveDatabase(false);
      setData({ profile: null, projects: [], skills: [], experience: [], education: [] });
      setLoading(false);
      return;
    }

    try {
      let profileData = null;

      const profileRes = await supabase.from('profile').select('*').limit(1);
      if (profileRes.error) {
        const profilesRes = await supabase.from('profiles').select('*').limit(1);
        if (!profilesRes.error && profilesRes.data && profilesRes.data.length > 0) {
          profileData = profilesRes.data[0];
        }
      } else if (profileRes.data && profileRes.data.length > 0) {
        profileData = profileRes.data[0];
      }

      const [projectsRes, skillsRes, experienceRes, educationRes] = await Promise.all([
        supabase.from('projects').select('*').order('id', { ascending: true }),
        supabase.from('skills').select('*').order('id', { ascending: true }),
        supabase.from('experience').select('*').order('id', { ascending: true }),
        supabase.from('education').select('*').order('id', { ascending: true })
      ]);

      const normProfile = normalizeProfile(profileData);
      const normProjects = normalizeProjects(projectsRes.data);
      const normSkills = normalizeSkills(skillsRes.data);
      const normExperience = normalizeExperience(experienceRes.data);
      const normEducation = normalizeEducation(educationRes.data);

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
      setData({ profile: null, projects: [], skills: [], experience: [], education: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const submitContactMessage = async (formData) => {
    if (isSupabaseConfigured() && supabase) {
      const { data: result, error: submitErr } = await supabase
        .from('contact_messages')
        .insert([formData]);
      if (submitErr) throw submitErr;
      return result;
    }
    return { success: true };
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
