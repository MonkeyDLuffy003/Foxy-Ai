export interface ClientSpec {
  client_ref?: string;
  type: 'chatbot' | 'app';
  features: string[];
  platform: string[];
  constraints: string[];
}

export interface MatchResult {
  status: 'matched' | 'needs_custom_build';
  template_id: string | null;
  template_name: string | null;
  confidence: number;
  matched_keywords: string[];
  reason?: string;
  free_tier_limits?: string;
}

export interface BuildSummary {
  mode: 'matched_template' | 'skeleton_only';
  template_id?: string | null;
  files_created: number;
  file_list?: string[];
  build_path: string;
}

export interface ReviewState {
  status: 'pending' | 'approved' | 'rejected' | 'needs_rework';
  notes: string;
  approved_by: string | null;
  timestamp: string | null;
}

export interface Lead {
  id: string;
  timestamp: string;
  client_ref: string;
  raw_brief: string;
  spec: ClientSpec;
  match: MatchResult;
  build_path: string;
  build_summary: BuildSummary;
  review: ReviewState;
}

export interface Template {
  id: string;
  name: string;
  type: 'chatbot' | 'app';
  platforms: string[];
  keywords: string[];
  features: string[];
  free_tier_limits: string;
  repo_url: string;
  starter_files: Record<string, string>;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  lead_id: string;
  action: string;
  pipeline_steps?: {
    intake?: string;
    match?: string;
    build?: string;
    report?: string;
    stop?: string;
  };
  operator?: string;
  notes?: string;
}

export interface ServerState {
  leads: Lead[];
  templates: Template[];
  history: HistoryItem[];
  buildDirs: string[];
  hasGeminiKey: boolean;
  hasTelegramToken: boolean;
  hasTelegramChat: boolean;
}
