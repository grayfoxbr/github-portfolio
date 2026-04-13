import { useState, useEffect } from 'react';
import { extractFirstImageFromMarkdown, decodeBase64 } from '../lib/utils';

export interface Repo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    updated_at: string;
    homepage: string | null;
    thumbnail: string | null;
}

// Mudei para v5 para destruir as imagens corrompidas do armazenamento do seu navegador
const CACHE_KEY = '@portfolio:github-repos-starred-v5';
const CACHE_SIG_KEY = '@portfolio:github-repos-sig-v5';

export function useGitHubRepos(username: string) {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    setRepos(JSON.parse(cachedData).data);
                    setLoading(false);
                }

                const headers = { Accept: 'application/vnd.github.v3+json' };
                const reposRes = await fetch(`https://api.github.com/users/${username}/starred?per_page=100`, { headers });

                if (!reposRes.ok) {
                    throw new Error('Falha ao buscar repositórios favoritados.');
                }

                const reposData = await reposRes.json();

                const validRepos = reposData.filter((repo: any) => {
                    return repo.owner.login.toLowerCase() === username.toLowerCase() && !repo.fork;
                });

                const newRepoSignatures = validRepos.map((r: any) => `${r.id}-${r.updated_at}`).join(',');
                const cachedSignatures = localStorage.getItem(CACHE_SIG_KEY);

                if (cachedData && cachedSignatures === newRepoSignatures) {
                    return;
                }

                const reposWithImages = await Promise.all(
                    validRepos.map(async (repo: any): Promise<Repo> => {
                        let thumbnail = null;
                        try {
                            const readmeRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, { headers });
                            if (readmeRes.ok) {
                                const readmeData = await readmeRes.json();
                                const decodedReadme = decodeBase64(readmeData.content);
                                thumbnail = extractFirstImageFromMarkdown(
                                    decodedReadme,
                                    username,
                                    repo.name,
                                    repo.default_branch
                                );
                            }
                        } catch (err) {
                            // Ignora repositórios sem readme
                        }

                        return {
                            id: repo.id,
                            name: repo.name,
                            description: repo.description || "Sem descrição disponível.",
                            html_url: repo.html_url,
                            updated_at: repo.updated_at,
                            homepage: repo.homepage,
                            thumbnail,
                        };
                    })
                );

                const sortedRepos = reposWithImages.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

                localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sortedRepos }));
                localStorage.setItem(CACHE_SIG_KEY, newRepoSignatures);
                setRepos(sortedRepos);

            } catch (err: any) {
                if (repos.length === 0) {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        if (username) fetchRepos();
    }, [username]);

    return { repos, loading, error };
}