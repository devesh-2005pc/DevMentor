const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

const githubHeaders = () => ({
  Accept: 'application/vnd.github.v3+json',
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  }),
});

/**
 * Fetch GitHub user profile
 */
const getUserProfile = async (username) => {
  const { data } = await axios.get(`${GITHUB_API}/users/${username}`, {
    headers: githubHeaders(),
  });
  return data;
};

/**
 * Fetch user's public repositories
 */
const getUserRepos = async (username) => {
  const { data } = await axios.get(
    `${GITHUB_API}/users/${username}/repos?sort=updated&per_page=50`,
    { headers: githubHeaders() }
  );
  return data;
};

/**
 * Fetch commit activity for a repo
 */
const getRepoCommitActivity = async (username, repo) => {
  try {
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${username}/${repo}/stats/commit_activity`,
      { headers: githubHeaders() }
    );
    return data || [];
  } catch {
    return [];
  }
};

/**
 * Calculate language breakdown across all repos
 */
const getLanguageStats = async (username, repos) => {
  const langMap = {};

  const languagePromises = repos.slice(0, 20).map(async (repo) => {
    try {
      const { data } = await axios.get(
        `${GITHUB_API}/repos/${username}/${repo.name}/languages`,
        { headers: githubHeaders() }
      );
      Object.entries(data).forEach(([lang, bytes]) => {
        langMap[lang] = (langMap[lang] || 0) + bytes;
      });
    } catch {
      // Skip repos with no language data
    }
  });

  await Promise.allSettled(languagePromises);

  // Convert to percentages
  const total = Object.values(langMap).reduce((a, b) => a + b, 0);
  const percentages = {};
  Object.entries(langMap).forEach(([lang, bytes]) => {
    percentages[lang] = Math.round((bytes / total) * 100);
  });

  return percentages;
};

/**
 * Fetch events for contribution heatmap approximation
 */
const getUserEvents = async (username) => {
  try {
    const { data } = await axios.get(
      `${GITHUB_API}/users/${username}/events/public?per_page=100`,
      { headers: githubHeaders() }
    );
    return data;
  } catch {
    return [];
  }
};

/**
 * Build complete GitHub stats object
 */
const buildGithubStats = async (username) => {
  const [profile, repos] = await Promise.all([
    getUserProfile(username),
    getUserRepos(username),
  ]);

  const languageStats = await getLanguageStats(username, repos);

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  const formattedRepos = repos.map((r) => ({
    name: r.name,
    description: r.description || '',
    language: r.language || 'Unknown',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    updatedAt: r.updated_at,
    url: r.html_url,
    topics: r.topics || [],
  }));

  return {
    profileData: {
      avatarUrl: profile.avatar_url,
      bio: profile.bio || '',
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      company: profile.company || '',
      location: profile.location || '',
      blog: profile.blog || '',
      createdAt: profile.created_at,
    },
    repositories: formattedRepos,
    languageStats,
    totalStars,
    totalForks,
    totalCommits: repos.length * 15, // approximate
    // Pass these for AI insight generation
    username,
  };
};

module.exports = {
  getUserProfile,
  getUserRepos,
  getLanguageStats,
  getUserEvents,
  buildGithubStats,
};
