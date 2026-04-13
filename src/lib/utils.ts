import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function decodeBase64(content: string): string {
    try {
        const cleanBase64 = content.replace(/\n/g, '');
        return decodeURIComponent(escape(window.atob(cleanBase64)));
    } catch (error) {
        console.error("Erro ao decodificar o README:", error);
        return "";
    }
}

export function extractFirstImageFromMarkdown(
    markdown: string,
    username: string,
    repoName: string,
    branch: string
): string | null {
    const markdownRegex = /!\[.*?\]\((.*?)\)/g;
    const htmlRegex = /<img.*?src=["'](.*?)["']/g;

    const images: string[] = [];
    let match;

    while ((match = markdownRegex.exec(markdown)) !== null) {
        if (match[1]) images.push(match[1]);
    }
    while ((match = htmlRegex.exec(markdown)) !== null) {
        if (match[1]) images.push(match[1]);
    }

    if (images.length === 0) return null;

    const firstGif = images.find(url => url.toLowerCase().includes('.gif'));
    let targetUrl = firstGif || images[0];
    targetUrl = targetUrl.trim();

    // CORREÇÃO 1: Se for um link absoluto do GitHub apontando para a página (blob), 
    // convertemos para a rota raw (ficheiro puro).
    if (targetUrl.includes('github.com') && targetUrl.includes('/blob/')) {
        targetUrl = targetUrl.replace('/blob/', '/raw/');
    }

    // CORREÇÃO 2: Se for um link relativo (ex: ./img/meu-gif.gif)
    if (!targetUrl.startsWith('http') && !targetUrl.startsWith('data:')) {
        targetUrl = targetUrl.replace(/^\.\//, ''); // Remove ./ inicial
        targetUrl = targetUrl.replace(/^\//, '');   // Remove barra inicial

        // Em vez de raw.githubusercontent, usamos github.com/.../raw/...
        // Isto resolve nativamente ficheiros pesados ou alojados com Git LFS!
        targetUrl = `https://github.com/${username}/${repoName}/raw/${branch}/${targetUrl}`;
    }

    return targetUrl;
}