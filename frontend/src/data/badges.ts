import {
    Mic,
    MessageSquare,
    Clock,
    Zap,
    TrendingUp,
    Award,
    Smile,
    Eye,
    UserCheck,
    Brain,
    Lightbulb,
    CheckCircle,
    Activity,
    Star,
    Shield
} from 'lucide-react';

export type BadgeCategory = 'communication' | 'body_language' | 'answer_quality' | 'time_flow' | 'progress' | 'achievement';

export interface BadgeDefinition {
    id: string;
    name: string;
    category: BadgeCategory;
    icon: any;
    description: string; // For internal use or tooltip
    criteria: string;
    colors: {
        bg: string;
        text: string;
        border: string;
        icon: string;
        darkBg: string;
        darkText: string;
        darkBorder: string;
    };
}

export const BADGES: Record<string, BadgeDefinition> = {
    // Communication Badges
    'clear_communicator': {
        id: 'clear_communicator',
        name: 'Clear Communicator',
        category: 'communication',
        icon: Mic,
        description: 'High speech clarity, low noise',
        criteria: 'High speech clarity, low noise',
        colors: {
            bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500',
            darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-200', darkBorder: 'dark:border-red-800/50'
        }
    },
    'filler_free': {
        id: 'filler_free',
        name: 'Filler-Free Speaker',
        category: 'communication',
        icon: MessageSquare,
        description: 'Minimal "um, uh, like" usage',
        criteria: 'Minimal usage of filler words',
        colors: {
            bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500',
            darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-200', darkBorder: 'dark:border-orange-800/50'
        }
    },
    'concise_answerer': {
        id: 'concise_answerer',
        name: 'Concise Answerer',
        category: 'communication',
        icon: Clock,
        description: 'Answers within optimal time',
        criteria: 'Answers within optimal time',
        colors: {
            bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500',
            darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-200', darkBorder: 'dark:border-green-800/50'
        }
    },
    'fluent_speaker': {
        id: 'fluent_speaker',
        name: 'Fluent Speaker',
        category: 'communication',
        icon: Activity,
        description: 'Smooth flow, minimal pauses',
        criteria: 'Smooth flow, minimal pauses',
        colors: {
            bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', icon: 'text-cyan-500',
            darkBg: 'dark:bg-cyan-900/30', darkText: 'dark:text-cyan-200', darkBorder: 'dark:border-cyan-800/50'
        }
    },

    // Body Language & Presence
    'eye_contact_pro': {
        id: 'eye_contact_pro',
        name: 'Eye Contact Pro',
        category: 'body_language',
        icon: Eye,
        description: 'Consistent eye contact',
        criteria: 'Consistent eye contact',
        colors: {
            bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500',
            darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-200', darkBorder: 'dark:border-amber-800/50'
        }
    },
    'confident_posture': {
        id: 'confident_posture',
        name: 'Confident Posture',
        category: 'body_language',
        icon: UserCheck,
        description: 'Upright, stable posture',
        criteria: 'Upright, stable posture',
        colors: {
            bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'text-indigo-500',
            darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-200', darkBorder: 'dark:border-indigo-800/50'
        }
    },
    'calm_under_pressure': {
        id: 'calm_under_pressure',
        name: 'Calm Under Pressure',
        category: 'body_language',
        icon: CheckCircle,
        description: 'Low stress indicators',
        criteria: 'Low stress indicators',
        colors: {
            bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', icon: 'text-teal-500',
            darkBg: 'dark:bg-teal-900/30', darkText: 'dark:text-teal-200', darkBorder: 'dark:border-teal-800/50'
        }
    },
    'positive_expression': {
        id: 'positive_expression',
        name: 'Positive Expression',
        category: 'body_language',
        icon: Smile,
        description: 'Balanced facial expressions',
        criteria: 'Balanced facial expressions',
        colors: {
            bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-500',
            darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-200', darkBorder: 'dark:border-emerald-800/50'
        }
    },
    'steady_presence': {
        id: 'steady_presence',
        name: 'Steady Presence',
        category: 'body_language',
        icon: UserCheck,
        description: 'Minimal nervous movements',
        criteria: 'Minimal nervous movements',
        colors: {
            bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-500',
            darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-200', darkBorder: 'dark:border-purple-800/50'
        }
    },

    // Answer Quality
    'star_method_master': {
        id: 'star_method_master',
        name: 'STAR Method Master',
        category: 'answer_quality',
        icon: Star,
        description: 'Structured answers',
        criteria: 'Structured answers',
        colors: {
            bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500',
            darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-200', darkBorder: 'dark:border-blue-800/50'
        }
    },
    'role_relevant_thinker': {
        id: 'role_relevant_thinker',
        name: 'Role-Relevant Thinker',
        category: 'answer_quality',
        icon: Brain,
        description: 'Answers aligned with job role',
        criteria: 'Answers aligned with job role',
        colors: {
            bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', icon: 'text-lime-500',
            darkBg: 'dark:bg-lime-900/30', darkText: 'dark:text-lime-200', darkBorder: 'dark:border-lime-800/50'
        }
    },
    'problem_solver': {
        id: 'problem_solver',
        name: 'Problem Solver',
        category: 'answer_quality',
        icon: Lightbulb,
        description: 'Logical reasoning shown',
        criteria: 'Logical reasoning shown',
        colors: {
            bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'text-indigo-500',
            darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-200', darkBorder: 'dark:border-indigo-800/50'
        }
    },
    'example_driven': {
        id: 'example_driven',
        name: 'Example Driven',
        category: 'answer_quality',
        icon: CheckCircle,
        description: 'Uses real-life examples',
        criteria: 'Uses real-life examples',
        colors: {
            bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-500',
            darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-200', darkBorder: 'dark:border-emerald-800/50'
        }
    },
    'depth_achiever': {
        id: 'depth_achiever',
        name: 'Depth Achiever',
        category: 'answer_quality',
        icon: TrendingUp,
        description: 'Goes beyond surface answers',
        criteria: 'Goes beyond surface answers',
        colors: {
            bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', icon: 'text-violet-500',
            darkBg: 'dark:bg-violet-900/30', darkText: 'dark:text-violet-200', darkBorder: 'dark:border-violet-800/50'
        }
    },

    // Time & Flow
    'well_paced_speaker': {
        id: 'well_paced_speaker',
        name: 'Well-Paced Speaker',
        category: 'time_flow',
        icon: Clock,
        description: 'Balanced speaking speed',
        criteria: 'Balanced speaking speed',
        colors: {
            bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500',
            darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-200', darkBorder: 'dark:border-green-800/50'
        }
    },
    'quick_thinker': {
        id: 'quick_thinker',
        name: 'Quick Thinker',
        category: 'time_flow',
        icon: Zap,
        description: 'Fast but accurate responses',
        criteria: 'Fast but accurate responses',
        colors: {
            bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', icon: 'text-sky-500',
            darkBg: 'dark:bg-sky-900/30', darkText: 'dark:text-sky-200', darkBorder: 'dark:border-sky-800/50'
        }
    },
    'smooth_transitions': {
        id: 'smooth_transitions',
        name: 'Smooth Transitions',
        category: 'time_flow',
        icon: Activity,
        description: 'Logical flow between points',
        criteria: 'Logical flow between points',
        colors: {
            bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', icon: 'text-fuchsia-500',
            darkBg: 'dark:bg-fuchsia-900/30', darkText: 'dark:text-fuchsia-200', darkBorder: 'dark:border-fuchsia-800/50'
        }
    },

    // Progress & Improvement
    'confidence_builder': {
        id: 'confidence_builder',
        name: 'Confidence Builder',
        category: 'progress',
        icon: TrendingUp,
        description: 'Confidence improved over sessions',
        criteria: 'Confidence improved over sessions',
        colors: {
            bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500',
            darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-200', darkBorder: 'dark:border-blue-800/50'
        }
    },
    'rapid_improver': {
        id: 'rapid_improver',
        name: 'Rapid Improver',
        category: 'progress',
        icon: Zap,
        description: 'Major score increase',
        criteria: 'Major score increase',
        colors: {
            bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500',
            darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-200', darkBorder: 'dark:border-orange-800/50'
        }
    },
    'consistency_champ': {
        id: 'consistency_champ',
        name: 'Consistency Champ',
        category: 'progress',
        icon: CheckCircle,
        description: 'Stable performance',
        criteria: 'Stable performance',
        colors: {
            bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500',
            darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-200', darkBorder: 'dark:border-green-800/50'
        }
    },
    'practice_streak': {
        id: 'practice_streak',
        name: 'Practice Streak',
        category: 'progress',
        icon: Activity,
        description: 'Multiple interviews completed',
        criteria: 'Multiple interviews completed',
        colors: {
            bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-500',
            darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-200', darkBorder: 'dark:border-purple-800/50'
        }
    },
    'comeback_performer': {
        id: 'comeback_performer',
        name: 'Comeback Performer',
        category: 'progress',
        icon: TrendingUp,
        description: 'Recovered after weak start',
        criteria: 'Recovered after weak start',
        colors: {
            bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', icon: 'text-pink-500',
            darkBg: 'dark:bg-pink-900/30', darkText: 'dark:text-pink-200', darkBorder: 'dark:border-pink-800/50'
        }
    },

    // Special Achievements
    'interview_ready': {
        id: 'interview_ready',
        name: 'Interview Ready',
        category: 'achievement',
        icon: Award,
        description: 'Overall score above threshold',
        criteria: 'Overall score above threshold',
        colors: {
            bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500',
            darkBg: 'dark:bg-yellow-900/30', darkText: 'dark:text-yellow-200', darkBorder: 'dark:border-yellow-800/50'
        }
    },
    'top_10_percent': {
        id: 'top_10_percent',
        name: 'Top 10% Performer',
        category: 'achievement',
        icon: Star,
        description: 'Compared to platform average',
        criteria: 'Compared to platform average',
        colors: {
            bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-500',
            darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-200', darkBorder: 'dark:border-purple-800/50'
        }
    },
    'mock_interview_ace': {
        id: 'mock_interview_ace',
        name: 'Mock Interview Ace',
        category: 'achievement',
        icon: Award,
        description: 'Excellent across all metrics',
        criteria: 'Excellent across all metrics',
        colors: {
            bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'text-indigo-500',
            darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-200', darkBorder: 'dark:border-indigo-800/50'
        }
    },
    'stress_slayer': {
        id: 'stress_slayer',
        name: 'Stress Slayer',
        category: 'achievement',
        icon: Shield,
        description: 'Maintained calm in tough questions',
        criteria: 'Maintained calm in tough questions',
        colors: {
            bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500',
            darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-200', darkBorder: 'dark:border-red-800/50'
        }
    },
    'first_attempt_star': {
        id: 'first_attempt_star',
        name: 'First Attempt Star',
        category: 'achievement',
        icon: Star,
        description: 'Great performance in first session',
        criteria: 'Great performance in first session',
        colors: {
            bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500',
            darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-200', darkBorder: 'dark:border-amber-800/50'
        }
    }
};
