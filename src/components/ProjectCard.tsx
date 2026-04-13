import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { Repo } from '../hooks/useGitHubRepos';

interface ProjectCardProps {
    repo: Repo;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=400";

const GithubIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
        <path d="M9 18c-4.5 1.5-5-2.5-7-3" />
    </svg>
);

export function ProjectCard({ repo }: ProjectCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="h-full"
        >
            <div className="h-full flex flex-col overflow-hidden rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-colors duration-300">
                <div className="w-full h-48 overflow-hidden bg-slate-800 relative">
                    <img
                        src={repo.thumbnail || FALLBACK_IMAGE}
                        alt={`Thumbnail de ${repo.name}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                <div className="flex flex-col flex-grow p-6">
                    <h3 className="text-xl font-bold text-white truncate">
                        {repo.name}
                    </h3>
                    <p className="text-slate-400 line-clamp-2 mt-2 min-h-[40px]">
                        {repo.description}
                    </p>
                </div>

                <div className="mt-auto flex gap-4 p-6 pt-0">
                    <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <GithubIcon className="w-4 h-4 mr-2" />
                        Repositório
                    </a>
                    {repo.homepage && (
                        <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors ml-auto"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Deploy
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}