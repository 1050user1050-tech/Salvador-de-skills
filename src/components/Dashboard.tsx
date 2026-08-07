import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  Folder,
  Tag,
  Github,
  ExternalLink,
  Plus,
  FileCode,
  Trash2,
  Layers,
  ArrowRight,
  ImageIcon,
  Filter,
  CheckCircle2
} from "lucide-react";
import { FileTreeNode, Skill } from "../types/skill";
import { ACCENT_COLORS } from "../utils/accentColors";

interface DashboardProps {
  tree: FileTreeNode[];
  accentColor: keyof typeof ACCENT_COLORS;
  onSelectSkill: (skill: Skill, relativePath: string) => void;
  onOpenNewSkillModal: () => void;
  onDeleteSkill: (relativePath: string, displayName?: string) => void;
}

interface FlattenedSkill {
  skill: Skill;
  relativePath: string;
  categoryFolder: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tree,
  accentColor,
  onSelectSkill,
  onOpenNewSkillModal,
  onDeleteSkill,
}) => {
  const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Flatten the recursive tree into a list of skills
  const allSkills = useMemo(() => {
    const list: FlattenedSkill[] = [];

    const traverse = (nodes: FileTreeNode[], currentFolder: string) => {
      for (const node of nodes) {
        if (node.type === "file" && node.data) {
          list.push({
            skill: node.data,
            relativePath: node.relativePath,
            categoryFolder: currentFolder || "Geral"
          });
        } else if (node.type === "folder" && node.children) {
          traverse(node.children, currentFolder ? `${currentFolder}/${node.name}` : node.name);
        }
      }
    };

    traverse(tree, "");
    return list;
  }, [tree]);

  // Extract all unique categories and tags
  const categories = useMemo(() => {
    const set = new Set<string>();
    allSkills.forEach((s) => {
      if (s.categoryFolder) set.add(s.categoryFolder);
    });
    return Array.from(set).sort();
  }, [allSkills]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    allSkills.forEach((s) => {
      if (s.skill.tags) {
        s.skill.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [allSkills]);

  // Filter skills based on search, category, and tag
  const filteredSkills = useMemo(() => {
    return allSkills.filter(({ skill, categoryFolder }) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        skill.titulo.toLowerCase().includes(query) ||
        skill.descricao.toLowerCase().includes(query) ||
        (skill.tags && skill.tags.some((t) => t.toLowerCase().includes(query))) ||
        categoryFolder.toLowerCase().includes(query);

      const matchesCategory = !selectedCategory || categoryFolder === selectedCategory;
      const matchesTag = !selectedTag || (skill.tags && skill.tags.includes(selectedTag));

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [allSkills, search, selectedCategory, selectedTag]);

  // Total metrics
  const totalGithubCount = useMemo(
    () => allSkills.filter((s) => Boolean(s.skill.link_github?.trim())).length,
    [allSkills]
  );

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient Gradient Background Decoration */}
        <div className={`absolute -right-12 -bottom-12 w-64 h-64 rounded-full opacity-10 ${accent.primaryBg} blur-3xl pointer-events-none`} />

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Repositório de Inteligência & Prompts</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard Geral de Skills
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Gerencie, visualize e edite todos os seus prompts e skills cadastrados no repositório. Estruturados de forma modular em pastas e versionados localmente.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onOpenNewSkillModal}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold text-white ${accent.primaryBg} hover:opacity-90 transition flex items-center gap-2 shadow-md cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            <span>Nova Skill</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className={`p-3 rounded-xl ${accent.badgeBg} ${accent.primaryText}`}>
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Total de Skills
            </p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
              {allSkills.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Categorias / Pastas
            </p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
              {categories.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Com Repositório Git
            </p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
              {totalGithubCount}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Tags Registradas
            </p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
              {allTags.length}
            </p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, descrição, tags ou pastas..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="">Todas as Categorias ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  📁 {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag Quick Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Tags:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition ${
                selectedTag === null
                  ? `${accent.primaryBg} text-white`
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Todas
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition ${
                  selectedTag === tag
                    ? `${accent.primaryBg} text-white`
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <FileCode className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Nenhuma skill encontrada
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedCategory || selectedTag
              ? "Tente ajustar os termos da busca ou limpar os filtros."
              : "Você ainda não possui nenhuma skill cadastrada no sistema."}
          </p>
          {(search || selectedCategory || selectedTag) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(({ skill, relativePath, categoryFolder }) => {
            const latestVersion =
              skill.versoes && skill.versoes.length > 0
                ? skill.versoes[skill.versoes.length - 1].versao
                : "v1.0";

            return (
              <div
                key={skill.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Version */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Folder className="w-3 h-3 text-slate-400" />
                      {categoryFolder}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                      {latestVersion}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                      {skill.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[36px]">
                      {skill.descricao || "Sem descrição cadastrada."}
                    </p>
                  </div>

                  {/* GitHub Link (if present) */}
                  {skill.link_github && (
                    <div>
                      <a
                        href={skill.link_github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition underline truncate max-w-full"
                        title={skill.link_github}
                      >
                        <Github className="w-3 h-3 shrink-0 text-slate-700 dark:text-slate-300" />
                        <span className="truncate">{skill.link_github}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                      </a>
                    </div>
                  )}

                  {/* Tags */}
                  {skill.tags && skill.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {skill.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    {skill.assets && skill.assets.length > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <ImageIcon className="w-3 h-3 text-indigo-500" />
                        {skill.assets.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSkill(relativePath, skill.titulo);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                      title="Excluir Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onSelectSkill(skill, relativePath)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white ${accent.primaryBg} hover:opacity-90 transition flex items-center gap-1 cursor-pointer shadow-2xs`}
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
